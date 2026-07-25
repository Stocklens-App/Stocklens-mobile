// constants/fees.ts
//
// Ghana Stock Exchange transaction fees.
// Source: SEC Ghana, CSD Ghana, and GSE fee schedule.
// Verified: July 2026. These rates change — the 2026 levies were revised in
// March 2026. Re-check against sec.gov.gh and csd.com.gh before each release.
//
// All values are fractions of the transaction value unless noted.

export const FEES = {
  // Charged by the broker. Ranges 1.5%–1.75% between brokers and is negotiable,
  // so this is the default the user can adjust.
  BROKERAGE_COMMISSION: 0.015, // 1.5%

  GSE_LEVY: 0.001, // 0.1%  — Ghana Stock Exchange
  CSD_LEVY: 0.0015, // 0.15% — Central Securities Depository (CSD's own published rate)
  SEC_LEVY: 0.00015, // 0.015% — Securities and Exchange Commission

  // VAT + associated levies, charged on the BROKERAGE COMMISSION only —
  // never on the whole trade.
  VAT_ON_COMMISSION: 0.219, // 21.9%
} as const;

// Broker commission options the user can choose from, since it varies by broker.
export const COMMISSION_OPTIONS = [
  { label: '1.5%', value: 0.015 },
  { label: '1.6%', value: 0.016 },
  { label: '1.75%', value: 0.0175 },
] as const;

export interface FeeBreakdown {
  commission: number;
  vat: number;
  gseLevy: number;
  csdLevy: number;
  secLevy: number;
  total: number;
}

/** Total fees on a single trade of the given cedi value. */
export function calculateFees(tradeValue: number, commissionRate: number): FeeBreakdown {
  const commission = tradeValue * commissionRate;
  const vat = commission * FEES.VAT_ON_COMMISSION;
  const gseLevy = tradeValue * FEES.GSE_LEVY;
  const csdLevy = tradeValue * FEES.CSD_LEVY;
  const secLevy = tradeValue * FEES.SEC_LEVY;

  return {
    commission,
    vat,
    gseLevy,
    csdLevy,
    secLevy,
    total: commission + vat + gseLevy + csdLevy + secLevy,
  };
}