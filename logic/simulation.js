// logic/simulation.js
// Pure simulation logic for the Pulse tab. No React, no UI — just math.
// Both modes take a DATED series ([{date, price}], oldest → newest) and
// return the SAME result shape, so one renderer can draw either one.
//
// Result shape:
//   { mode, isEstimate, series: [{date, value}],
//     startValue, endValue, profit, returnPct,
//     shares,        // backtest only (null for forecast)
//     annualRate,    // decimal, 0.18 = 18%/yr
//     band }         // forecast only: { low, typical, high } end values

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const yearsBetween = (a, b) =>
  (new Date(b).getTime() - new Date(a).getTime()) / MS_PER_YEAR;

// Compound annual growth rate implied by a dated series.
export function historicalCAGR(series) {
  if (!series || series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  const years = yearsBetween(first.date, last.date);
  if (years <= 0 || first.price <= 0) return 0;
  return Math.pow(last.price / first.price, 1 / years) - 1;
}

// BACKTEST — "what WOULD have happened." Real prices, past → now.
export function runBacktest(series, amount, holdMonths) {
  if (!series || series.length < 2 || !amount || amount <= 0) return null;

  const last = series[series.length - 1]; // today
  const sell = new Date(last.date);
  const buyDate = new Date(sell.getFullYear(), sell.getMonth() - holdMonths, sell.getDate());

  let buyIdx = series.findIndex((p) => new Date(p.date) >= buyDate);
  if (buyIdx === -1) buyIdx = 0;

  const buyPrice = series[buyIdx].price;
  const sellPrice = last.price;
  if (buyPrice <= 0) return null;

  const shares = amount / buyPrice;
  const held = series.slice(buyIdx);

  const endValue = shares * sellPrice;
  const profit = endValue - amount;

  return {
    mode: 'backtest',
    isEstimate: false,
    series: held.map((p) => ({ date: p.date, value: shares * p.price })),
    startValue: amount,
    endValue,
    profit,
    returnPct: (profit / amount) * 100,
    shares,
    annualRate: historicalCAGR(held),
    band: null,
    // true when our data doesn't reach as far back as the requested window
    truncated: new Date(series[0].date) > buyDate,
  };
}

// FORECAST — "what MIGHT happen." An estimate, now → future.
// Grows the money at the stock's own historical rate, and shows a RANGE
// so it never reads as a promise.
export function runForecast(series, amount, holdMonths, options = {}) {
  if (!series || series.length < 2 || !amount || amount <= 0) return null;

  const base = historicalCAGR(series);
  const spread = options.spread ?? 0.08; // ±8 percentage points → a cone, not a point
  const rates = { low: base - spread, typical: base, high: base + spread };

  const years = holdMonths / 12;
  const project = (r) => amount * Math.pow(1 + r, years);
  const endValue = project(rates.typical);

  const last = series[series.length - 1];
  const start = new Date(last.date);
  const monthlyRate = Math.pow(1 + rates.typical, 1 / 12) - 1;
  const seriesOut = [];
  for (let m = 0; m <= holdMonths; m++) {
    const d = new Date(start.getFullYear(), start.getMonth() + m, 1);
    seriesOut.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
      value: amount * Math.pow(1 + monthlyRate, m),
    });
  }

  const profit = endValue - amount;
  return {
    mode: 'forecast',
    isEstimate: true,
    series: seriesOut,
    startValue: amount,
    endValue,
    profit,
    returnPct: (profit / amount) * 100,
    shares: null,
    annualRate: rates.typical,
    band: { low: project(rates.low), typical: endValue, high: project(rates.high) },
  };
}

// Convenience dispatcher.
export function simulate(mode, series, amount, holdMonths, options) {
  return mode === 'forecast'
    ? runForecast(series, amount, holdMonths, options)
    : runBacktest(series, amount, holdMonths);
}