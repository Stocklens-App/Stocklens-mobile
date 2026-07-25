// screens/PulseScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../theme';
import { useAppContext } from '../context/AppContext';
import { FEES, COMMISSION_OPTIONS, calculateFees } from '../constants/fees';
import type { Stock } from '../types';

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const fmt = (n: number): string => {
  const x = isFinite(n) ? n : 0;
  const [whole, dec] = Math.abs(x).toFixed(2).split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (x < 0 ? '-₵' : '₵') + withCommas + '.' + dec;
};

interface Calculation {
  shares: number;
  spentOnShares: number;
  buyFees: number;
  leftover: number;
  // Round-trip: what it costs to sell the same holding later
  sellFees: number;
  breakEvenPct: number;
}

export default function PulseScreen() {
  const { stocks, stocksLoading, stocksError, refetchStocks } = useAppContext();

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [amountText, setAmountText] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [commissionRate, setCommissionRate] = useState<number>(FEES.BROKERAGE_COMMISSION);

  // Only stocks with a real, positive price can be costed.
  const tradableStocks: Stock[] = useMemo(
    () => stocks.filter((s) => s.currentPrice > 0),
    [stocks]
  );

  useEffect(() => {
    if (tradableStocks.length === 0) return;
    const stillValid = tradableStocks.some((s) => s.symbol === selectedSymbol);
    if (!stillValid) setSelectedSymbol(tradableStocks[0].symbol);
  }, [tradableStocks, selectedSymbol]);

  const stock = tradableStocks.find((s) => s.symbol === selectedSymbol) || null;
  const amount = parseFloat(amountText);

  const filteredStocks = tradableStocks.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
  });

  const calc: Calculation | null = useMemo(() => {
    if (!stock || !amount || amount <= 0) return null;

    const price = stock.currentPrice;

    // Work out how many whole shares fit once buy-side fees are covered.
    // Fees scale with trade value, so solve iteratively: start from the naive
    // count, then trim until shares + their fees fit inside the budget.
    let shares = Math.floor(amount / price);
    while (shares > 0) {
      const tradeValue = shares * price;
      const fees = calculateFees(tradeValue, commissionRate).total;
      if (tradeValue + fees <= amount) break;
      shares -= 1;
    }

    if (shares === 0) {
      return {
        shares: 0,
        spentOnShares: 0,
        buyFees: 0,
        leftover: amount,
        sellFees: 0,
        breakEvenPct: 0,
      };
    }

    const spentOnShares = shares * price;
    const buyFees = calculateFees(spentOnShares, commissionRate).total;
    const leftover = amount - spentOnShares - buyFees;

    // Selling the same holding later incurs the same class of fees again.
    const sellFees = calculateFees(spentOnShares, commissionRate).total;

    // The price must rise enough to recover both buy and sell fees before
    // the position breaks even.
    const breakEvenPct = ((buyFees + sellFees) / spentOnShares) * 100;

    return { shares, spentOnShares, buyFees, leftover, sellFees, breakEvenPct };
  }, [stock, amount, commissionRate]);

  const feeRows = useMemo(() => {
    if (!calc || calc.shares === 0) return null;
    return calculateFees(calc.spentOnShares, commissionRate);
  }, [calc, commissionRate]);

  if (stocksLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.centerText}>Loading stocks…</Text>
      </View>
    );
  }

  if (stocksError) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Couldn't load stocks. Check your connection.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetchStocks} activeOpacity={0.85}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tradableStocks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>No stocks available right now.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>What your money actually buys</Text>
        <Text style={styles.subtitle}>
          See how many shares you can buy after real GSE fees — and what it takes to break even.
        </Text>

        {/* Search + pick a stock */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search stocks"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredStocks.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {filteredStocks.map((s) => {
              const active = s.symbol === selectedSymbol;
              return (
                <TouchableOpacity
                  key={s.symbol}
                  onPress={() => setSelectedSymbol(s.symbol)}
                  style={[styles.stockPill, active && styles.stockPillActive]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.logo, { backgroundColor: s.logoColor || COLORS.primary }]}>
                    <Text style={styles.logoText}>{s.symbol.slice(0, 2)}</Text>
                  </View>
                  <Text style={[styles.pillSymbol, active && styles.pillSymbolActive]}>{s.symbol}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noMatch}>No stocks match "{query}".</Text>
        )}

        {stock && (
          <Text style={styles.priceLine}>
            {stock.name} · <Text style={styles.priceValue}>₵{stock.currentPrice.toFixed(2)}</Text> per share
          </Text>
        )}

        {/* Amount */}
        <Text style={styles.label}>How much do you want to invest?</Text>
        <View style={styles.amountBox}>
          <Text style={styles.cedi}>₵</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => setAmountText(t.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.chipRow}>
          {QUICK_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.quickChip}
              onPress={() => setAmountText(String(amt))}
              activeOpacity={0.8}
            >
              <Text style={styles.quickChipText}>₵{amt.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Broker commission selector — it genuinely varies, so let the user match theirs */}
        <Text style={styles.label}>Your broker's commission</Text>
        <View style={styles.chipRow}>
          {COMMISSION_OPTIONS.map((opt) => {
            const active = opt.value === commissionRate;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[styles.commissionChip, active && styles.commissionChipActive]}
                onPress={() => setCommissionRate(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.commissionText, active && styles.commissionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Result */}
        {calc && stock ? (
          calc.shares === 0 ? (
            <View style={styles.resultCard}>
              <Text style={styles.notEnoughText}>
                {fmt(amount)} isn't enough to buy a single share of {stock.symbol} at{' '}
                {fmt(stock.currentPrice)} once fees are added. Try a larger amount or a
                lower-priced stock.
              </Text>
            </View>
          ) : (
            <View style={styles.resultCard}>
              <Text style={styles.resultLead}>With {fmt(amount)} you can buy</Text>
              <Text style={styles.sharesValue}>
                {calc.shares} {calc.shares === 1 ? 'share' : 'shares'}
              </Text>
              <Text style={styles.resultSub}>of {stock.name}</Text>

              {/* Fee breakdown */}
              {feeRows && (
                <View style={styles.breakdown}>
                  <Row label="Shares" value={fmt(calc.spentOnShares)} />
                  <Row label={`Broker commission`} value={fmt(feeRows.commission)} />
                  <Row label="VAT on commission" value={fmt(feeRows.vat)} />
                  <Row label="GSE levy" value={fmt(feeRows.gseLevy)} />
                  <Row label="CSD levy" value={fmt(feeRows.csdLevy)} />
                  <Row label="SEC levy" value={fmt(feeRows.secLevy)} />
                  <View style={styles.divider} />
                  <Row label="Total fees to buy" value={fmt(calc.buyFees)} strong />
                  <Row label="Cash left over" value={fmt(calc.leftover)} />
                </View>
              )}

              {/* Break-even — the thing beginners never see coming */}
              <View style={styles.breakEvenCard}>
                <Text style={styles.breakEvenTitle}>Before you make a profit</Text>
                <Text style={styles.breakEvenBody}>
                  Selling later costs another {fmt(calc.sellFees)} in fees. The price has to rise
                  about{' '}
                  <Text style={styles.breakEvenPct}>{calc.breakEvenPct.toFixed(1)}%</Text> just for
                  you to break even.
                </Text>
              </View>

              <Text style={styles.disclaimer}>
                Estimate only. Broker commission varies — confirm the exact rate with your licensed
                broker before trading. Fees verified July 2026.
              </Text>
            </View>
          )
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Enter an amount to see what it buys after fees.</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 48 },

  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  centerText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  title: { color: COLORS.textMain, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 22 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: { fontSize: 28, marginRight: 8, color: COLORS.textSecondary },
  searchInput: { flex: 1, color: COLORS.textMain, fontSize: 15, paddingVertical: 12 },
  searchClear: { color: COLORS.textSecondary, fontSize: 14, paddingHorizontal: 4 },
  noMatch: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 16, fontStyle: 'italic' },

  pillRow: { gap: 10, paddingRight: 8, marginBottom: 12 },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  stockPillActive: { borderColor: COLORS.primary },
  logo: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  pillSymbol: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  pillSymbolActive: { color: COLORS.textMain },

  priceLine: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 22 },
  priceValue: { color: COLORS.textMain, fontWeight: '700' },

  label: { color: COLORS.textMain, fontSize: 15, fontWeight: '600', marginBottom: 12 },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cedi: { color: COLORS.textSecondary, fontSize: 22, fontFamily: 'Georgia', marginRight: 6 },
  amountInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 22,
    fontFamily: 'Georgia',
    paddingVertical: 14,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },

  commissionChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    paddingVertical: 12,
  },
  commissionChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  commissionText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  commissionTextActive: { color: '#FFF' },

  resultCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: 4,
  },
  resultLead: { color: COLORS.textSecondary, fontSize: 13 },
  sharesValue: {
    color: COLORS.textMain,
    fontSize: 34,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginTop: 2,
  },
  resultSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  notEnoughText: { color: COLORS.textMain, fontSize: 15, lineHeight: 22 },

  breakdown: { marginTop: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { color: COLORS.textSecondary, fontSize: 13 },
  rowValue: { color: COLORS.textMain, fontSize: 13, fontWeight: '500' },
  rowStrong: { color: COLORS.textMain, fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  breakEvenCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  breakEvenTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  breakEvenBody: { color: COLORS.textMain, fontSize: 13, lineHeight: 20 },
  breakEvenPct: { color: COLORS.primary, fontWeight: '700' },

  disclaimer: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 18 },

  emptyState: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius,
    padding: 28,
    marginTop: 8,
    alignItems: 'center',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});