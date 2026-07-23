// data/priceHistory.ts
// Dated monthly price history for the Pulse simulator.
// Each point is { date: 'YYYY-MM-DD', price }, oldest → newest.
// The LAST point is "today". Keyed by ticker to match your /api/stocks list.
//
// Why dated instead of bare numbers: the simulator needs real time spacing
// to answer "held for 6 months" correctly and to compute an annual growth
// rate for the forecast. Array positions can't do that.

export interface PricePoint {
  date: string;
  price: number;
}

export interface StockLike {
  ticker?: string;
  symbol?: string;
  history?: number[];
  currentPrice?: number;
  [key: string]: any;
}

// Stamps monthly dates onto a list of prices, ending on the current month.
function buildMonthly(prices: number[]): PricePoint[] {
  const n = prices.length;
  const now = new Date();
  return prices.map((price, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    return { date, price };
  });
}

// 1. Authored series for your 10 live stocks (13 points = 12 months → today).
//    Keyed by TICKER. Each has its own little story so the demo looks alive.
export const PRICE_HISTORY: Record<string, PricePoint[]> = {
  // ⚠️ MTNG + GCB: I didn't have their current prices from the backend, so the
  //    last number in each is a placeholder — change it to match your DB if you
  //    ever show the raw share price. (It doesn't affect the profit math; see note.)
  MTNG:   buildMonthly([1.90, 1.98, 2.05, 2.02, 2.15, 2.28, 2.35, 2.30, 2.48, 2.55, 2.62, 2.70, 2.75]), // strong climb
  GCB:    buildMonthly([6.10, 6.05, 6.20, 6.35, 6.28, 6.45, 6.55, 6.50, 6.65, 6.72, 6.80, 6.85, 6.90]), // recovery

  EGH:    buildMonthly([8.60, 8.55, 8.48, 8.50, 8.38, 8.30, 8.22, 8.15, 8.08, 8.00, 7.95, 7.88, 7.85]), // gradual decline
  BOPP:   buildMonthly([18.50, 19.10, 19.80, 19.60, 20.40, 21.00, 20.75, 21.50, 21.90, 22.10, 22.30, 22.40, 22.50]), // steady up
  TOTAL:  buildMonthly([9.60, 9.55, 9.62, 9.48, 9.40, 9.45, 9.35, 9.30, 9.38, 9.28, 9.22, 9.25, 9.20]), // sideways, slight down
  SOGEGH: buildMonthly([1.05, 1.07, 1.08, 1.10, 1.12, 1.14, 1.17, 1.19, 1.21, 1.24, 1.26, 1.28, 1.30]), // slow steady rise
  GOIL:   buildMonthly([2.05, 2.00, 1.95, 2.02, 1.98, 1.90, 1.94, 1.88, 1.92, 1.86, 1.89, 1.84, 1.85]), // choppy, ends flat
  SCB:    buildMonthly([17.80, 18.20, 18.60, 18.40, 19.10, 19.60, 19.40, 20.10, 20.50, 20.80, 21.00, 21.25, 21.40]), // solid uptrend
  UNIL:   buildMonthly([7.60, 7.40, 7.75, 7.90, 7.70, 8.00, 8.20, 8.05, 8.30, 8.35, 8.45, 8.40, 8.50]), // volatile recovery
  EGL:    buildMonthly([3.45, 3.40, 3.42, 3.35, 3.28, 3.30, 3.22, 3.18, 3.20, 3.14, 3.12, 3.11, 3.10]), // mild decline
};

// 2. Fallback: build dated history for any stock we didn't hand-write,
//    from its existing bare sparkline + currentPrice.
export function generateFromBare(bareHistory: number[] = [], currentPrice?: number): PricePoint[] {
  const src =
    Array.isArray(bareHistory) && bareHistory.length >= 2
      ? [...bareHistory]
      : [currentPrice as number, currentPrice as number];
  if (currentPrice != null) src[src.length - 1] = currentPrice; // keep "today" consistent
  return buildMonthly(src);
}

// 3. The ONE function Pulse calls. Uses ticker OR symbol so it works whether
//    your DTO exposes `ticker` or maps it to `symbol`.
export function getPriceHistory(stock: StockLike): PricePoint[] {
  if (!stock) return [];
  const key = stock.ticker || stock.symbol;
  const authored = key ? PRICE_HISTORY[key] : undefined;
  if (authored && authored.length >= 2) return authored;
  return generateFromBare(stock.history, stock.currentPrice);
}