// portfolio/calculations.ts
//
// Turns stored lots + sales + dividends + live prices into display-ready
// positions and totals. Pure and testable — no React, no side effects.

import { calculateFees, FEES } from '../constants/fees';
import type { PortfolioLot, PortfolioDividend, PortfolioSale, Stock } from '../types';

export interface Position {
  ticker: string;
  companyName: string;
  logoColor?: string;
  lotCount: number;         // active lots (with shares still held)
  totalShares: number;      // remaining (unsold) shares
  avgBuyPrice: number;      // weighted avg over remaining shares
  costBasis: number;        // cost of remaining shares, incl. proportional fees
  currentPrice: number;
  priceAvailable: boolean;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPct: number;
  realizedGain: number;     // locked-in profit from sales of this ticker
  dividendsReceived: number;
  totalReturn: number;      // unrealized + realized + dividends
  totalReturnPct: number;
  breakEvenPrice: number;
  allocationPct: number;
}

export interface PortfolioSummary {
  positions: Position[];
  totalCostBasis: number;      // active remaining cost basis
  totalMarketValue: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPct: number;
  totalRealizedGain: number;
  totalDividends: number;
  totalReturn: number;
  totalReturnPct: number;
}

const pct = (part: number, whole: number): number =>
  whole === 0 ? 0 : (part / whole) * 100;

/** Per-share cost of a lot, including a proportional slice of its buy fees. */
function costPerShare(lot: PortfolioLot): number {
  return lot.shares > 0 ? (lot.shares * lot.buyPrice + lot.buyFees) / lot.shares : 0;
}

/** All-in fee fraction from fees.ts, used for the break-even sell price. */
function feeRate(commissionRate: number): number {
  return calculateFees(1, commissionRate).total;
}

function breakEven(costBasis: number, shares: number, commissionRate: number): number {
  if (shares <= 0) return 0;
  const denom = shares * (1 - feeRate(commissionRate));
  return denom <= 0 ? 0 : costBasis / denom;
}

export function buildPortfolio(
  lots: PortfolioLot[],
  dividends: PortfolioDividend[],
  stocks: Stock[],
  sales: PortfolioSale[] = [],
  sellCommissionRate: number = FEES.BROKERAGE_COMMISSION
): PortfolioSummary {
  const priceByTicker = new Map<string, Stock>();
  for (const s of stocks) if (s.symbol) priceByTicker.set(s.symbol.toUpperCase(), s);

  const lotById = new Map<number, PortfolioLot>();
  for (const l of lots) lotById.set(l.id, l);

  // Shares sold per lot.
  const soldByLot = new Map<number, number>();
  for (const sale of sales) {
    soldByLot.set(sale.lotId, (soldByLot.get(sale.lotId) ?? 0) + sale.sharesSold);
  }

  // Dividends per ticker.
  const divByTicker = new Map<string, number>();
  for (const d of dividends) {
    const k = d.ticker.toUpperCase();
    divByTicker.set(k, (divByTicker.get(k) ?? 0) + d.amount);
  }

  // Realized gain + realized cost basis per ticker.
  const realizedGainByTicker = new Map<string, number>();
  const realizedCostByTicker = new Map<string, number>();
  let totalRealizedGain = 0;
  for (const sale of sales) {
    const lot = lotById.get(sale.lotId);
    if (!lot) continue; // defensive: orphaned sale
    const cps = costPerShare(lot);
    const costOut = cps * sale.sharesSold;
    const proceeds = sale.salePrice * sale.sharesSold - sale.saleFees;
    const gain = proceeds - costOut;
    const k = lot.ticker.toUpperCase();
    realizedGainByTicker.set(k, (realizedGainByTicker.get(k) ?? 0) + gain);
    realizedCostByTicker.set(k, (realizedCostByTicker.get(k) ?? 0) + costOut);
    totalRealizedGain += gain;
  }

  // Active positions: aggregate remaining (unsold) shares per ticker.
  interface Acc {
    remainingShares: number;
    grossBuyRemaining: number; // buyPrice × remaining, for avg price
    costBasisRemaining: number; // costPerShare × remaining
    lotCount: number;
    companyName?: string;
  }
  const accByTicker = new Map<string, Acc>();

  for (const lot of lots) {
    const sold = soldByLot.get(lot.id) ?? 0;
    const remaining = lot.shares - sold;
    if (remaining <= 0) continue; // fully sold — no active shares
    const k = lot.ticker.toUpperCase();
    const cps = costPerShare(lot);
    const a = accByTicker.get(k) ?? {
      remainingShares: 0, grossBuyRemaining: 0, costBasisRemaining: 0, lotCount: 0,
      companyName: lot.companyName ?? undefined,
    };
    a.remainingShares += remaining;
    a.grossBuyRemaining += lot.buyPrice * remaining;
    a.costBasisRemaining += cps * remaining;
    a.lotCount += 1;
    accByTicker.set(k, a);
  }

  // Every ticker that has either active shares or realized history gets a row.
  const tickers = new Set<string>([...accByTicker.keys(), ...realizedGainByTicker.keys()]);
  const positions: Position[] = [];

  for (const ticker of tickers) {
    const a = accByTicker.get(ticker);
    const stock = priceByTicker.get(ticker);
    const totalShares = a?.remainingShares ?? 0;
    const costBasis = a?.costBasisRemaining ?? 0;
    const avgBuyPrice = totalShares > 0 ? (a!.grossBuyRemaining / totalShares) : 0;

    const priceAvailable = !!stock && typeof stock.currentPrice === 'number';
    const currentPrice = priceAvailable ? stock!.currentPrice : avgBuyPrice;
    const marketValue = totalShares * currentPrice;
    const unrealizedPL = totalShares > 0 ? marketValue - costBasis : 0;

    const realizedGain = realizedGainByTicker.get(ticker) ?? 0;
    const realizedCost = realizedCostByTicker.get(ticker) ?? 0;
    const dividendsReceived = divByTicker.get(ticker) ?? 0;
    const totalReturn = unrealizedPL + realizedGain + dividendsReceived;

    positions.push({
      ticker,
      companyName: stock?.name ?? a?.companyName ?? ticker,
      logoColor: stock?.logoColor,
      lotCount: a?.lotCount ?? 0,
      totalShares,
      avgBuyPrice,
      costBasis,
      currentPrice,
      priceAvailable,
      marketValue,
      unrealizedPL,
      unrealizedPLPct: pct(unrealizedPL, costBasis),
      realizedGain,
      dividendsReceived,
      totalReturn,
      totalReturnPct: pct(totalReturn, costBasis + realizedCost),
      breakEvenPrice: breakEven(costBasis, totalShares, sellCommissionRate),
      allocationPct: 0,
    });
  }

  const totalCostBasis = positions.reduce((n, p) => n + p.costBasis, 0);
  const totalMarketValue = positions.reduce((n, p) => n + p.marketValue, 0);
  const totalUnrealizedPL = positions.reduce((n, p) => n + p.unrealizedPL, 0);
  const totalDividends = dividends.reduce((n, d) => n + d.amount, 0);
  const totalReturn = totalUnrealizedPL + totalRealizedGain + totalDividends;
  const totalRealizedCost = [...realizedCostByTicker.values()].reduce((n, v) => n + v, 0);

  for (const p of positions) p.allocationPct = pct(p.marketValue, totalMarketValue);
  // Active first (by value), then fully-sold-but-realized rows.
  positions.sort((x, y) => y.marketValue - x.marketValue);

  return {
    positions,
    totalCostBasis,
    totalMarketValue,
    totalUnrealizedPL,
    totalUnrealizedPLPct: pct(totalUnrealizedPL, totalCostBasis),
    totalRealizedGain,
    totalDividends,
    totalReturn,
    totalReturnPct: pct(totalReturn, totalCostBasis + totalRealizedCost),
  };
}