import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { COLORS, SIZES } from '../theme';
// @ts-ignore - AppContext is still a plain JS module
import { useAppContext } from '../context/AppContext';

interface Stock {
  id: number | string;
  symbol: string;
  name: string;
  sector?: string;
  currentPrice: number;
  priceChangePercentage: number;
  logoColor?: string;
  volume?: number | null;
  history?: number[];
}

interface SparklineProps {
  data?: number[];
  color: string;
  width?: number;
  height?: number;
}

const Sparkline = ({ data, color, width = 60, height = 30 }: SparklineProps) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const initialsFor = (symbol: string) => symbol.slice(0, 3).toUpperCase();

interface DashboardScreenProps {
  route: { params?: { userName?: string } };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    [key: string]: any;
  };
}

export default function DashboardScreen({ route, navigation }: DashboardScreenProps) {
  const { userName: contextName, stocks, stocksLoading, stocksError, scamAlerts } = useAppContext();

  const rawName = route?.params?.userName || contextName || 'User';
  const displayName = rawName.length > 12 ? `${rawName.slice(0, 12)}...` : rawName;

  // Everything below is derived from live GSE prices — no seeded index data.
  const pulse = useMemo(() => {
    const list: Stock[] = (stocks || []).filter((s: Stock) => s.currentPrice > 0);
    if (list.length === 0) return null;

    const byChange = [...list].sort(
      (a, b) => b.priceChangePercentage - a.priceChangePercentage
    );
    const byVolume = [...list].sort((a, b) => (b.volume || 0) - (a.volume || 0));

    return {
      topGainer: byChange[0],
      topLoser: byChange[byChange.length - 1],
      mostActive: byVolume[0],
      advancers: list.filter((s) => s.priceChangePercentage > 0).length,
      decliners: list.filter((s) => s.priceChangePercentage < 0).length,
      unchanged: list.filter((s) => s.priceChangePercentage === 0).length,
      total: list.length,
    };
  }, [stocks]);

  // "Trending" now means most actively traded today, by share volume.
  const trending: Stock[] = useMemo(() => {
    return [...(stocks || [])]
      .filter((s: Stock) => (s.volume || 0) > 0)
      .sort((a: Stock, b: Stock) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 5);
  }, [stocks]);

  const openStock = (stock: Stock) => navigation.navigate('StockDetail', { stock });

  if (stocksLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || '#3478F6'} />
      </View>
    );
  }

  if (stocksError) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textSecondary || '#7E8494'} />
        <Text style={styles.errorText}>{stocksError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background || '#11141A'} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileHeaderRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle" size={36} color={COLORS.primary || '#3478F6'} />
            <View style={styles.nameAndChevronRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary || '#7E8494'} />
            </View>
          </TouchableOpacity>
        </View>

        {/* MARKET PULSE — computed from today's live GSE prices */}
        {pulse && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Market Pulse</Text>
                <Text style={styles.cardSubtitle}>Ghana Stock Exchange today</Text>
              </View>
              <Text style={styles.todayLabel}>{pulse.total} listed</Text>
            </View>

            {/* Breadth bar: how much of the market moved which way */}
            <View style={styles.breadthRow}>
              <Text style={[styles.breadthLabel, { color: COLORS.success }]}>
                {pulse.advancers} up
              </Text>
              <Text style={styles.breadthLabel}>{pulse.unchanged} flat</Text>
              <Text style={[styles.breadthLabel, { color: COLORS.error }]}>
                {pulse.decliners} down
              </Text>
            </View>
            <View style={styles.breadthBar}>
              <View style={[styles.breadthSeg, { flex: pulse.advancers || 0.01, backgroundColor: COLORS.success }]} />
              <View style={[styles.breadthSeg, { flex: pulse.unchanged || 0.01, backgroundColor: COLORS.border }]} />
              <View style={[styles.breadthSeg, { flex: pulse.decliners || 0.01, backgroundColor: COLORS.error }]} />
            </View>

            {/* Movers */}
            <View style={styles.moversRow}>
              <TouchableOpacity
                style={styles.moverCell}
                onPress={() => openStock(pulse.topGainer)}
                activeOpacity={0.7}
              >
                <Text style={styles.moverLabel}>Top gainer</Text>
                <Text style={styles.moverSymbol}>{pulse.topGainer.symbol}</Text>
                <Text style={[styles.moverChange, { color: COLORS.success }]}>
                  ↑ {pulse.topGainer.priceChangePercentage.toFixed(2)}%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moverCell}
                onPress={() => openStock(pulse.topLoser)}
                activeOpacity={0.7}
              >
                <Text style={styles.moverLabel}>Top loser</Text>
                <Text style={styles.moverSymbol}>{pulse.topLoser.symbol}</Text>
                <Text style={[styles.moverChange, { color: COLORS.error }]}>
                  ↓ {Math.abs(pulse.topLoser.priceChangePercentage).toFixed(2)}%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moverCell}
                onPress={() => openStock(pulse.mostActive)}
                activeOpacity={0.7}
              >
                <Text style={styles.moverLabel}>Most traded</Text>
                <Text style={styles.moverSymbol}>{pulse.mostActive.symbol}</Text>
                <Text style={styles.moverVolume}>
                  {(pulse.mostActive.volume || 0).toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MOST ACTIVE TODAY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most active today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invest')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {trending.length > 0 ? (
            trending.map((stock, idx) => {
              const positive = stock.priceChangePercentage >= 0;
              const color = positive ? COLORS.success : COLORS.error;
              return (
                <TouchableOpacity
                  key={stock.symbol}
                  style={[styles.stockRow, idx < trending.length - 1 && styles.stockRowBorder]}
                  activeOpacity={0.7}
                  onPress={() => openStock(stock)}
                >
                  <View style={[styles.stockLogo, { backgroundColor: stock.logoColor || COLORS.primary }]}>
                    <Text style={styles.stockInitials}>{initialsFor(stock.symbol)}</Text>
                  </View>
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
                    <Text style={styles.stockTicker}>
                      {stock.symbol} • {(stock.volume || 0).toLocaleString()} traded
                    </Text>
                  </View>
                  <View style={styles.stockPriceCol}>
                    <Text style={styles.stockPrice}>GHS {stock.currentPrice.toFixed(2)}</Text>
                    <Text style={[styles.stockChange, { color }]}>
                      {positive ? '+' : ''}{stock.priceChangePercentage.toFixed(2)}%
                    </Text>
                  </View>
                  <Sparkline data={stock.history} color={color} width={56} height={28} />
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyRow}>No shares have traded yet today.</Text>
          )}
        </View>

        {/* SCAM ALERTS */}
        {scamAlerts?.map((alert: string, idx: number) => (
          <View key={idx} style={styles.scamAlert}>
            <Ionicons name="warning-outline" size={20} color={COLORS.error} />
            <View style={styles.scamText}>
              <Text style={styles.scamLabel}>SCAM ALERT</Text>
              <Text style={styles.scamMessage}>{alert}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },
  scroll: { flex: 1 },
  scrollContent: { padding: SIZES.padding || 16, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background || '#11141A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary || '#7E8494',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameAndChevronRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain || '#FFF' },

  card: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  cardSubtitle: { fontSize: 11, color: COLORS.textSecondary || '#7E8494' },
  todayLabel: { fontSize: 12, color: COLORS.textSecondary || '#7E8494' },

  breadthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breadthLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary || '#7E8494' },
  breadthBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 18 },
  breadthSeg: { height: 6 },

  moversRow: { flexDirection: 'row', gap: 8 },
  moverCell: {
    flex: 1,
    backgroundColor: COLORS.background || '#11141A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 12,
  },
  moverLabel: { fontSize: 10, color: COLORS.textSecondary || '#7E8494', marginBottom: 6 },
  moverSymbol: { fontSize: 14, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 3 },
  moverChange: { fontSize: 12, fontWeight: '600' },
  moverVolume: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary || '#7E8494' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain || '#FFF' },
  seeAll: { fontSize: 13, color: COLORS.primary || '#3478F6', fontWeight: '500' },

  stockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  stockRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border || '#2A3245' },
  stockLogo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stockInitials: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stockInfo: { flex: 1, minWidth: 0 },
  stockName: { fontSize: 13, fontWeight: '600', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  stockTicker: { fontSize: 11, color: COLORS.textSecondary || '#7E8494' },
  stockPriceCol: { alignItems: 'flex-end', marginRight: 6 },
  stockPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  stockChange: { fontSize: 11, fontWeight: '600' },
  emptyRow: { fontSize: 13, color: COLORS.textSecondary || '#7E8494', textAlign: 'center', paddingVertical: 16 },

  scamAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  scamText: { flex: 1 },
  scamLabel: { fontSize: 12, fontWeight: '700', color: COLORS.error, marginBottom: 4, letterSpacing: 0.5 },
  scamMessage: { fontSize: 12, color: COLORS.textSecondary || '#7E8494', lineHeight: 18 },
});