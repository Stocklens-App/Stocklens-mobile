// screens/PortfolioScreen.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, Alert, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { buildPortfolio, Position } from '../portfolio/calculations';
import AddHoldingModal from '../components/AddHoldingModal';
import AddDividendModal from '../components/AddDividendModal';
import SellLotModal from '../components/SellLotModal';
import type { PortfolioLot } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const money = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const [w, d] = Math.abs(n).toFixed(2).split('.');
  return `${sign}₵${w.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
};
const pctStr = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

type Nav = { navigate: (screen: string, params?: Record<string, unknown>) => void };

export default function PortfolioScreen({ navigation }: { navigation: Nav }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const {
    lots, dividends, sales, stocks, portfolioLoading, portfolioError,
    refetchPortfolio, deleteLot,
  } = useAppContext();

  const [addOpen, setAddOpen] = useState(false);
  const [divFor, setDivFor] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<{ lot: PortfolioLot; remaining: number; price: number | null } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const summary = useMemo(
    () => buildPortfolio(lots, dividends, stocks, sales),
    [lots, dividends, stocks, sales]
  );

  // Remaining shares per lot, from sales.
  const soldByLot = useMemo(() => {
    const m = new Map<number, number>();
    for (const s of sales) m.set(s.lotId, (m.get(s.lotId) ?? 0) + s.sharesSold);
    return m;
  }, [sales]);

  const priceFor = (ticker: string): number | null => {
    const s = stocks.find((st) => st.symbol.toUpperCase() === ticker.toUpperCase());
    return s && typeof s.currentPrice === 'number' ? s.currentPrice : null;
  };

  const onRefresh = async () => { setRefreshing(true); await refetchPortfolio(); setRefreshing(false); };

  const toggle = (ticker: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === ticker ? null : ticker));
  };

  const confirmDeleteLot = (id: number) => {
    Alert.alert('Remove this purchase?', 'This lot and any sales recorded against it will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteLot(id).catch(() => Alert.alert('Error', 'Could not remove. Try again.')) },
    ]);
  };

  const openStock = (ticker: string) => {
    const s = stocks.find((st) => st.symbol.toUpperCase() === ticker.toUpperCase());
    if (s) navigation.navigate('StockDetail', { stock: s });
  };

  if (portfolioLoading && lots.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.dim}>Loading your portfolio…</Text>
      </View>
    );
  }

  if (portfolioError && lots.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errIcon}>⚠</Text>
        <Text style={styles.errTitle}>Couldn’t load your portfolio</Text>
        <Text style={styles.dim}>{portfolioError}</Text>
        <TouchableOpacity style={styles.retry} onPress={refetchPortfolio} activeOpacity={0.7}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderPosition = ({ item }: { item: Position }) => {
    const isOpen = expanded === item.ticker;
    const plColor = item.unrealizedPL >= 0 ? colors.success : colors.error;
    const soldOut = item.totalShares <= 0;

    const posLots = lots
      .filter((l) => l.ticker.toUpperCase() === item.ticker)
      .map((l) => ({ lot: l, remaining: l.shares - (soldByLot.get(l.id) ?? 0) }))
      .filter((x) => x.remaining > 0)
      .sort((a, b) => b.lot.id - a.lot.id);

    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardHead} onPress={() => toggle(item.ticker)} activeOpacity={0.7}>
          <View style={[styles.logo, { backgroundColor: item.logoColor || colors.surface }]}>
            <Text style={styles.logoText}>{item.ticker.slice(0, 3)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.ticker}>{item.ticker}</Text>
            <Text style={styles.sub} numberOfLines={1}>
              {soldOut
                ? 'Sold out · realized only'
                : `${item.totalShares} share${item.totalShares === 1 ? '' : 's'} · avg ₵${item.avgBuyPrice.toFixed(2)}`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.value}>{soldOut ? money(item.realizedGain) : money(item.marketValue)}</Text>
            <Text style={[styles.change, { color: soldOut ? (item.realizedGain >= 0 ? colors.success : colors.error) : (item.priceAvailable ? plColor : colors.textSecondary) }]}>
              {soldOut ? 'realized' : (item.priceAvailable ? pctStr(item.unrealizedPLPct) : 'price n/a')}
            </Text>
          </View>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.detail}>
            {!soldOut && <Row c={colors} label="Current price" value={item.priceAvailable ? `₵${item.currentPrice.toFixed(2)}` : '—'} />}
            {!soldOut && <Row c={colors} label="Cost basis (incl. fees)" value={money(item.costBasis)} />}
            {!soldOut && <Row c={colors} label="Unrealized P/L" value={`${money(item.unrealizedPL)} (${pctStr(item.unrealizedPLPct)})`} valueColor={plColor} />}
            {!soldOut && <Row c={colors} label="Break-even price" value={`₵${item.breakEvenPrice.toFixed(2)}`} />}
            <Row c={colors} label="Realized gain" value={money(item.realizedGain)} valueColor={item.realizedGain >= 0 ? colors.success : colors.error} />
            <Row c={colors} label="Dividends received" value={money(item.dividendsReceived)} />
            <Row c={colors} label="Total return" value={`${money(item.totalReturn)} (${pctStr(item.totalReturnPct)})`} valueColor={item.totalReturn >= 0 ? colors.success : colors.error} />

            {posLots.length > 0 && (
              <>
                <View style={styles.lotsHead}><Text style={styles.lotsTitle}>Holdings</Text></View>
                {posLots.map(({ lot, remaining }) => (
                  <View key={lot.id} style={styles.lotRow}>
                    <Text style={styles.lotText}>{remaining} @ ₵{lot.buyPrice.toFixed(2)}</Text>
                    <View style={styles.lotActions}>
                      <TouchableOpacity
                        onPress={() => setSellTarget({ lot, remaining, price: priceFor(item.ticker) })}
                        style={styles.sellBtn} activeOpacity={0.7}>
                        <Text style={styles.sellText}>Sell</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => confirmDeleteLot(lot.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.action} onPress={() => setDivFor(item.ticker)} activeOpacity={0.7}>
                <Ionicons name="cash-outline" size={16} color={colors.primary} />
                <Text style={styles.actionText}>Log dividend</Text>
              </TouchableOpacity>
              {item.priceAvailable && !soldOut && (
                <TouchableOpacity style={styles.action} onPress={() => openStock(item.ticker)} activeOpacity={0.7}>
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={styles.actionText}>View stock</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const header = (
    <View>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Portfolio value</Text>
        <Text style={styles.summaryValue}>{money(summary.totalMarketValue)}</Text>
        <Text style={[styles.summaryPL, { color: summary.totalUnrealizedPL >= 0 ? colors.success : colors.error }]}>
          {money(summary.totalUnrealizedPL)} ({pctStr(summary.totalUnrealizedPLPct)}) unrealized
        </Text>
        <View style={styles.grid}>
          <Cell c={colors} label="Invested" value={money(summary.totalCostBasis)} />
          <Cell c={colors} label="Realized" value={money(summary.totalRealizedGain)}
            valueColor={summary.totalRealizedGain >= 0 ? colors.success : colors.error} />
          <Cell c={colors} label="Dividends" value={money(summary.totalDividends)} />
        </View>
        <View style={styles.totalReturnRow}>
          <Text style={styles.trLabel}>Total return</Text>
          <Text style={[styles.trVal, { color: summary.totalReturn >= 0 ? colors.success : colors.error }]}>
            {money(summary.totalReturn)} ({pctStr(summary.totalReturnPct)})
          </Text>
        </View>
      </View>

      {summary.positions.some((p) => p.marketValue > 0) && (
        <View style={styles.allocBar}>
          {summary.positions.filter((p) => p.marketValue > 0).map((p) => (
            <View key={p.ticker} style={{ flex: Math.max(p.allocationPct, 0.5), backgroundColor: p.logoColor || colors.primary }} />
          ))}
        </View>
      )}

      <View style={styles.listHeadRow}>
        <Text style={styles.listHead}>Holdings</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddOpen(true)} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={summary.positions}
        keyExtractor={(p) => p.ticker}
        renderItem={renderPosition}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="pie-chart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No holdings yet</Text>
            <Text style={styles.dim}>Add a stock you own to start tracking how it performs, fees and all.</Text>
            <TouchableOpacity style={styles.emptyAdd} onPress={() => setAddOpen(true)} activeOpacity={0.8}>
              <Text style={styles.emptyAddText}>Add your first holding</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <AddHoldingModal visible={addOpen} onClose={() => setAddOpen(false)} />
      <AddDividendModal visible={divFor !== null} ticker={divFor} onClose={() => setDivFor(null)} />
      <SellLotModal
        visible={sellTarget !== null}
        lot={sellTarget?.lot ?? null}
        remaining={sellTarget?.remaining ?? 0}
        currentPrice={sellTarget?.price ?? null}
        onClose={() => setSellTarget(null)}
      />
    </View>
  );
}

function Row({ c, label, value, valueColor }: { c: ThemeColors; label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ color: c.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: valueColor ?? c.textMain, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}

function Cell({ c, label, value, valueColor }: { c: ThemeColors; label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: c.textSecondary, fontSize: 12, marginBottom: 3 }}>{label}</Text>
      <Text style={{ color: valueColor ?? c.textMain, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingHorizontal: SIZES.padding },
    center: { flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 30 },
    dim: { color: c.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    errIcon: { fontSize: 44, color: c.error, marginBottom: 10 },
    errTitle: { color: c.textMain, fontSize: 17, fontWeight: '600' },
    retry: { backgroundColor: c.primary, paddingHorizontal: 26, paddingVertical: 11, borderRadius: 10, marginTop: 18 },
    retryText: { color: '#FFFFFF', fontWeight: '600' },
    summary: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 18, marginTop: SIZES.padding },
    summaryLabel: { color: c.textSecondary, fontSize: 13 },
    summaryValue: { color: c.textMain, fontSize: 32, fontWeight: '800', marginTop: 4, fontVariant: ['tabular-nums'] },
    summaryPL: { fontSize: 14, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
    grid: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 14 },
    totalReturnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12 },
    trLabel: { color: c.textMain, fontSize: 14, fontWeight: '700' },
    trVal: { fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
    allocBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 14, gap: 2 },
    listHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 6 },
    listHead: { color: c.textMain, fontSize: 18, fontWeight: '700' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, marginTop: 10, overflow: 'hidden' },
    cardHead: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    logo: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
    ticker: { color: c.textMain, fontSize: 16, fontWeight: '700' },
    sub: { color: c.textSecondary, fontSize: 13, marginTop: 1 },
    value: { color: c.textMain, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
    change: { fontSize: 13, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
    detail: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12 },
    lotsHead: { marginTop: 12, marginBottom: 4 },
    lotsTitle: { color: c.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    lotRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
    lotText: { color: c.textMain, fontSize: 13, fontVariant: ['tabular-nums'] },
    lotActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    sellBtn: { borderWidth: 1, borderColor: c.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
    sellText: { color: c.primary, fontSize: 13, fontWeight: '600' },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
    action: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    actionText: { color: c.primary, fontSize: 13, fontWeight: '600' },
    emptyBox: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 40 },
    emptyTitle: { color: c.textMain, fontSize: 18, fontWeight: '700', marginTop: 14 },
    emptyAdd: { backgroundColor: c.primary, paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12, marginTop: 20 },
    emptyAddText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  });