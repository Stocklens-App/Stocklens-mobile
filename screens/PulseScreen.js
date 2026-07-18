// screens/PulseScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';

import { COLORS, SIZES } from '../theme';
import { useAppData } from '../context/AppContext';
import { getPriceHistory } from '../data/priceHistory';
import { simulate } from '../logic/simulation';

const MODES = [
  { key: 'backtest', label: 'If I had invested' },
  { key: 'forecast', label: 'If I invest now' },
];

const PERIODS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const fmt = (n) => {
  const x = isFinite(n) ? n : 0;
  const [whole, dec] = Math.abs(x).toFixed(2).split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (x < 0 ? '-₵' : '₵') + withCommas + '.' + dec;
};

function buildPath(points, w, h, pad) {
  const values = points.map((p) => p.value);
  if (values.length < 2) return { line: '', area: '', firstY: h / 2 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1);
  const pts = values.map((v, i) => [
    pad + i * stepX,
    pad + (1 - (v - min) / range) * (h - pad * 2),
  ]);
  const line = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  return { line, area, firstY: pts[0][1] };
}

export default function PulseScreen() {
  // ── Stocks come prefetched from AppContext (shared with the Invest tab) ──
  const {
    stocks,
    stocksLoading,
    stocksError,
    refetchStocks: fetchStocks,
  } = useAppData();

  // ── Simulator state ──
  const [mode, setMode] = useState('backtest');
  const [query, setQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [amountText, setAmountText] = useState('');
  const [periodLabel, setPeriodLabel] = useState('1Y');

  // Pick the first stock once the list arrives.
  useEffect(() => {
    if (!selectedSymbol && stocks.length > 0) setSelectedSymbol(stocks[0].symbol);
  }, [stocks, selectedSymbol]);

  const stock = stocks.find((s) => s.symbol === selectedSymbol) || null;
  const amount = parseFloat(amountText);
  const months = (PERIODS.find((p) => p.label === periodLabel) || PERIODS[3]).months;

  // Filter the picker by name or symbol (doesn't change the current selection).
  const filteredStocks = stocks.filter((s) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.symbol || '').toLowerCase().includes(q) ||
      (s.name || '').toLowerCase().includes(q)
    );
  });

  const result = useMemo(() => {
    if (!stock || !amount || amount <= 0) return null;
    const series = getPriceHistory(stock);
    return simulate(mode, series, amount, months);
  }, [stock, amount, months, mode]);

  const isUp = result ? result.profit >= 0 : true;
  const accent = isUp ? COLORS.success : COLORS.error;
  const chart = result ? buildPath(result.series, 300, 120, 8) : null;

  // ── Loading / error gates ──
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
        <Text style={styles.centerText}>Couldn’t load stocks. Check your connection.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchStocks} activeOpacity={0.85}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

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
        {/* MODE TOGGLE */}
        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const active = m.key === mode;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeBtn, active && styles.modeBtnActive]}
                onPress={() => setMode(m.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.modeText, active && styles.modeTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* <Text style={styles.intro}>
          {mode === 'backtest'
            ? 'See how an investment would have grown, based on real price history.'
            : 'Estimate how an investment might grow, based on this stock’s past average.'}
        </Text> */}

        {/* PICK A STOCK */}
        {/* <Text style={styles.label}>Pick a stock</Text> */}


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
                    <Text style={styles.logoText}>{(s.symbol || '?').slice(0, 2)}</Text>
                  </View>
                  <Text style={[styles.pillSymbol, active && styles.pillSymbolActive]}>{s.symbol}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noMatch}>No stocks match “{query}”.</Text>
        )}

        {/* AMOUNT */}
        <Text style={styles.label}>How much would you invest?</Text>
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

        {/* PERIOD */}
        <Text style={styles.label}>{mode === 'backtest' ? 'Held for' : 'Hold for'}</Text>
        <View style={styles.chipRow}>
          {PERIODS.map((p) => {
            const active = p.label === periodLabel;
            return (
              <TouchableOpacity
                key={p.label}
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => setPeriodLabel(p.label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.periodText, active && styles.periodTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RESULT */}
        {result && stock ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              <Text style={styles.resultHeader}>
                {fmt(amount)} in {stock.name} · {mode === 'backtest' ? 'held' : 'over'} {periodLabel}
              </Text>
              {result.isEstimate && (
                <View style={styles.estimateTag}>
                  <Text style={styles.estimateTagText}>ESTIMATE</Text>
                </View>
              )}
            </View>

            <Svg width="100%" height={120} viewBox="0 0 300 120">
              <Defs>
                <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={accent} stopOpacity="0.28" />
                  <Stop offset="1" stopColor={accent} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Line
                x1="8" y1={chart.firstY} x2="292" y2={chart.firstY}
                stroke={COLORS.border} strokeWidth="1" strokeDasharray="4 4"
              />
              <Path d={chart.area} fill="url(#fill)" />
              <Path
                d={chart.line}
                stroke={accent}
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={result.isEstimate ? '6 5' : undefined}
              />
            </Svg>

            <Text style={styles.nowLabel}>
              {mode === 'backtest' ? 'Now worth' : 'Estimated value'}
            </Text>
            <Text style={styles.nowValue}>{fmt(result.endValue)}</Text>

            <View style={[styles.profitBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.profitText, { color: accent }]}>
                {isUp ? '▲' : '▼'} {fmt(result.profit)} ({result.returnPct >= 0 ? '+' : ''}
                {result.returnPct.toFixed(2)}%)
              </Text>
            </View>

            {mode === 'backtest' ? (
              <View style={styles.statsRow}>
                <Stat label="Shares" value={result.shares.toFixed(2)} />
                <Stat label="Avg / yr" value={`${(result.annualRate * 100).toFixed(1)}%`} />
                <Stat label="Return" value={`${result.returnPct.toFixed(1)}%`} />
              </View>
            ) : (
              <View style={styles.statsRow}>
                <Stat label="Low" value={fmt(result.band.low)} />
                <Stat label="Typical" value={fmt(result.band.typical)} />
                <Stat label="High" value={fmt(result.band.high)} />
              </View>
            )}

            {result.truncated && (
              <Text style={styles.warnNote}>
                Limited history available — this uses the earliest price we have.
              </Text>
            )}

            <Text style={styles.disclaimer}>
              {mode === 'backtest'
                ? 'Based on this stock’s actual price history. Past performance does not guarantee future results.'
                : 'This is an estimate, not a guarantee. It assumes the stock keeps growing at its past average rate — real returns will differ, and you can lose money.'}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Enter an amount to {mode === 'backtest' ? 'see how it would have performed' : 'see a projection'}.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 48 },

  center: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SIZES.padding },
  centerText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center' },
  retryBtn: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  modeRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius, padding: 4, marginBottom: 20,
  },
  modeBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: SIZES.radius - 2 },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: '#FFF' },

  intro: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24, lineHeight: 20 },
  label: { color: COLORS.textMain, fontSize: 15, fontWeight: '600', marginBottom: 12 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: SIZES.radius,
    paddingHorizontal: 12, marginBottom: 14,
  },
  searchIcon: { fontSize: 30, marginRight: 8 ,color: COLORS.textSecondary},
  searchInput: { flex: 1, color: COLORS.textMain, fontSize: 15, paddingVertical: 12 },
  searchClear: { color: COLORS.textSecondary, fontSize: 14, paddingHorizontal: 4 },
  noMatch: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 24, fontStyle: 'italic' },

  pillRow: { gap: 10, paddingRight: 8, marginBottom: 24 },
  stockPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: SIZES.radius, paddingVertical: 8, paddingHorizontal: 12, gap: 8,
  },
  stockPillActive: { borderColor: COLORS.primary },
  logo: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  pillSymbol: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  pillSymbolActive: { color: COLORS.textMain },

  amountBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: SIZES.radius, paddingHorizontal: 16, marginBottom: 12,
  },
  cedi: { color: COLORS.textSecondary, fontSize: 22, fontFamily: 'Georgia', marginRight: 6 },
  amountInput: { flex: 1, color: COLORS.textMain, fontSize: 22, fontFamily: 'Georgia', paddingVertical: 14 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickChip: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius, paddingVertical: 8, paddingHorizontal: 14,
  },
  quickChipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },

  periodChip: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1,
    borderColor: COLORS.border, borderRadius: SIZES.radius, paddingVertical: 12,
  },
  periodChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  periodTextActive: { color: '#FFF' },

  resultCard: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: SIZES.radius, padding: SIZES.padding, marginTop: 8,
  },
  resultHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultHeader: { color: COLORS.textSecondary, fontSize: 13, flex: 1, paddingRight: 8 },
  estimateTag: { backgroundColor: COLORS.primary + '22', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 7 },
  estimateTagText: { color: COLORS.primary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  nowLabel: { color: COLORS.textSecondary, fontSize: 13, marginTop: 12 },
  nowValue: { color: COLORS.textMain, fontSize: 34, fontFamily: 'Georgia', fontWeight: '700', marginTop: 2 },

  profitBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10, marginTop: 10 },
  profitText: { fontSize: 15, fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  stat: { flex: 1 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 },
  statValue: { color: COLORS.textMain, fontSize: 15, fontWeight: '600' },

  warnNote: { color: COLORS.textSecondary, fontSize: 11, marginTop: 14, fontStyle: 'italic' },
  disclaimer: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 16 },

  emptyState: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
    borderRadius: SIZES.radius, padding: 28, marginTop: 8, alignItems: 'center',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});