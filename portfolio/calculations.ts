// portfolio/calculations.ts
//
// Pure functions that turn stored lots + dividends + live stock prices into
// display-ready positions and portfolio totals. No React, no side effects —
// so this is unit-testable and the math is auditable.

import { calculateFees, FEES } from '../constants/fees';
import type { PortfolioLot, PortfolioDividend, Stock } from '../types';

export interface Position {
  ticker: string;
  companyName: string;
  logoColor?: string;
  lotCount: number;
  totalShares: number;
  avgBuyPrice: number;      // weighted average price paid per share
  costBasis: number;        // total paid IN, including buy-side fees
  currentPrice: number;     // live price (falls back to avgBuyPrice if unknown)
  priceAvailable: boolean;  // false when the stock isn't in the live list
  marketValue: number;      // shares × current price
  unrealizedPL: number;     // marketValue − costBasis
  unrealizedPLPct: number;
  dividendsReceived: number;
  totalReturn: number;      // unrealizedPL + dividends
  totalReturnPct: number;
  breakEvenPrice: number;   // sell price that nets back exactly costBasis, after sell fees
  allocationPct: number;    // share of total market value (filled once totals are known)
}

export interface PortfolioSummary {
  positions: Position[];
  totalCostBasis: number;
  totalMarketValue: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPct: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPct: number;
}

const pct = (part: number, whole: number): number =>
  whole === 0 ? 0 : (part / whole) * 100;

/**
 * The all-in fee rate as a fraction of trade value, derived from your fees.ts.
 * calculateFees(1, rate).total is exactly commission·(1+VAT) + GSE + CSD + SEC.
 */
function feeRate(commissionRate: number): number {
  return calculateFees(1, commissionRate).total;
}

/**
 * Break-even sell price for a position.
 *   net proceeds = P·S·(1 − feeRate) must equal costBasis
 *   => P = costBasis / (S · (1 − feeRate))
 * This is the price you must sell at just to recover everything you put in,
 * including the fees on BOTH the original buy and the eventual sell.
 */
function breakEven(costBasis: number, totalShares: number, commissionRate: number): number {
  if (totalShares <= 0) return 0;
  const denom = totalShares * (1 - feeRate(commissionRate));
  return denom <= 0 ? 0 : costBasis / denom;
}

export function buildPortfolio(
  lots: PortfolioLot[],
  dividends: PortfolioDividend[],
  stocks: Stock[],
  sellCommissionRate: number = FEES.BROKERAGE_COMMISSION
): PortfolioSummary {
  // Fast lookups by ticker (uppercased to match how the backend stores them).
  const priceByTicker = new Map<string, Stock>();
  for (const s of stocks) {
    if (s.symbol) priceByTicker.set(s.symbol.toUpperCase(), s);
  }

  const dividendsByTicker = new Map<string, number>();
  for (const d of dividends) {
    const key = d.ticker.toUpperCase();
    dividendsByTicker.set(key, (dividendsByTicker.get(key) ?? 0) + d.amount);
  }

  // Group lots by ticker into positions.
  const lotsByTicker = new Map<string, PortfolioLot[]>();
  for (const lot of lots) {
    const key = lot.ticker.toUpperCase();
    const arr = lotsByTicker.get(key) ?? [];
    arr.push(lot);
    lotsByTicker.set(key, arr);
  }

  const positions: Position[] = [];

  for (const [ticker, group] of lotsByTicker) {
    const totalShares = group.reduce((n, l) => n + l.shares, 0);
    const grossBuyCost = group.reduce((n, l) => n + l.shares * l.buyPrice, 0);
    const totalBuyFees = group.reduce((n, l) => n + l.buyFees, 0);
    const costBasis = grossBuyCost + totalBuyFees;
    const avgBuyPrice = totalShares > 0 ? grossBuyCost / totalShares : 0;

    const stock = priceByTicker.get(ticker);
    const priceAvailable = !!stock && typeof stock.currentPrice === 'number';
    const currentPrice = priceAvailable ? stock!.currentPrice : avgBuyPrice;

    const marketValue = totalShares * currentPrice;
    const unrealizedPL = marketValue - costBasis;
    const dividendsReceived = dividendsByTicker.get(ticker) ?? 0;
    const totalReturn = unrealizedPL + dividendsReceived;

    positions.push({
      ticker,
      companyName: stock?.name ?? group[0].companyName ?? ticker,
      logoColor: stock?.logoColor,
      lotCount: group.length,
      totalShares,
      avgBuyPrice,
      costBasis,
      currentPrice,
      priceAvailable,
      marketValue,
      unrealizedPL,
      unrealizedPLPct: pct(unrealizedPL, costBasis),
      dividendsReceived,
      totalReturn,
      totalReturnPct: pct(totalReturn, costBasis),
      breakEvenPrice: breakEven(costBasis, totalShares, sellCommissionRate),
      allocationPct: 0, // set below once we know the grand total
    });
  }

  // Portfolio totals.
  const totalCostBasis = positions.reduce((n, p) => n + p.costBasis, 0);
  const totalMarketValue = positions.reduce((n, p) => n + p.marketValue, 0);
  const totalUnrealizedPL = totalMarketValue - totalCostBasis;
  const totalDividends = dividends.reduce((n, d) => n + d.amount, 0);
  const totalReturn = totalUnrealizedPL + totalDividends;

  // Fill allocation now that the denominator exists, and sort biggest-first.
  for (const p of positions) {
    p.allocationPct = pct(p.marketValue, totalMarketValue);
  }
  positions.sort((a, b) => b.marketValue - a.marketValue);

  return {
    positions,
    totalCostBasis,
    totalMarketValue,
    totalUnrealizedPL,
    totalUnrealizedPLPct: pct(totalUnrealizedPL, totalCostBasis),
    totalDividends,
    totalReturn,
    totalReturnPct: pct(totalReturn, totalCostBasis),
  };
}