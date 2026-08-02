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
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
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

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

interface DashboardScreenProps {
  route: { params?: { userName?: string } };
  navigation: {
    navigate: (screen: string, params?: any) => void;
    [key: string]: any;
  };
}

export default function DashboardScreen({ route, navigation }: DashboardScreenProps) {
  const { colors, isDark } = useTheme();
  const styles = makeStyles(colors);

  const { userName: contextName, stocks, stocksLoading, stocksError, scamAlerts, unreadCount } = useAppContext();

  const rawName = route?.params?.userName || contextName || 'User';
  const firstName = rawName.trim().split(' ')[0];

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (stocksError) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.errorText}>{stocksError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — greeting + profile, with a bell for notifications */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileHeaderRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textMain} />
            {unreadCount > 0 && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        {/* MARKET PULSE */}
        {pulse && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Market Pulse</Text>
                <Text style={styles.cardSubtitle}>Ghana Stock Exchange today</Text>
              </View>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.livePillText}>{pulse.total} listed</Text>
              </View>
            </View>

            <View style={styles.breadthRow}>
              <Text style={[styles.breadthLabel, { color: colors.success }]}>
                {pulse.advancers} up
              </Text>
              <Text style={styles.breadthLabel}>{pulse.unchanged} flat</Text>
              <Text style={[styles.breadthLabel, { color: colors.error }]}>
                {pulse.decliners} down
              </Text>
            </View>
            <View style={styles.breadthBar}>
              <View style={[styles.breadthSeg, { flex: pulse.advancers || 0.01, backgroundColor: colors.success }]} />
              <View style={[styles.breadthSeg, { flex: pulse.unchanged || 0.01, backgroundColor: colors.border }]} />
              <View style={[styles.breadthSeg, { flex: pulse.decliners || 0.01, backgroundColor: colors.error }]} />
            </View>

            <View style={styles.moversRow}>
              <TouchableOpacity style={styles.moverCell} onPress={() => openStock(pulse.topGainer)} activeOpacity={0.7}>
                <Text style={styles.moverLabel}>TOP GAINER</Text>
                <Text style={styles.moverSymbol}>{pulse.topGainer.symbol}</Text>
                <Text style={[styles.moverChange, { color: colors.success }]}>
                  ↑ {pulse.topGainer.priceChangePercentage.toFixed(2)}%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.moverCell} onPress={() => openStock(pulse.topLoser)} activeOpacity={0.7}>
                <Text style={styles.moverLabel}>TOP LOSER</Text>
                <Text style={styles.moverSymbol}>{pulse.topLoser.symbol}</Text>
                <Text style={[styles.moverChange, { color: colors.error }]}>
                  ↓ {Math.abs(pulse.topLoser.priceChangePercentage).toFixed(2)}%
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.moverCell} onPress={() => openStock(pulse.mostActive)} activeOpacity={0.7}>
                <Text style={styles.moverLabel}>MOST TRADED</Text>
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
            <Text style={styles.seeAll}>See all ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {trending.length > 0 ? (
            trending.map((stock, idx) => {
              const positive = stock.priceChangePercentage >= 0;
              const color = positive ? colors.success : colors.error;
              return (
                <TouchableOpacity
                  key={stock.symbol}
                  style={[styles.stockRow, idx < trending.length - 1 && styles.stockRowBorder]}
                  activeOpacity={0.7}
                  onPress={() => openStock(stock)}
                >
                  <View style={[styles.stockLogo, { backgroundColor: stock.logoColor || colors.primary }]}>
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
            <Ionicons name="warning-outline" size={20} color={colors.error} />
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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    scroll: { flex: 1 },
    scrollContent: { padding: SIZES.padding, paddingTop: 60, paddingBottom: 40 },
    loadingContainer: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    errorText: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    greeting: { fontSize: 12, color: c.textSecondary, fontWeight: '600', marginBottom: 1 },
    userName: { fontSize: 19, fontWeight: 'bold', color: c.textMain },
    bellButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bellDot: {
      position: 'absolute',
      top: 10,
      right: 11,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.error,
      borderWidth: 1.5,
      borderColor: c.surface,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: c.textMain, marginBottom: 2 },
    cardSubtitle: { fontSize: 11, color: c.textSecondary },
    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: c.primary + '14',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary },
    livePillText: { fontSize: 11, color: c.primary, fontWeight: '600', fontVariant: ['tabular-nums'] },
    breadthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    breadthLabel: { fontSize: 11, fontWeight: '600', color: c.textSecondary, fontVariant: ['tabular-nums'] },
    breadthBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 18 },
    breadthSeg: { height: 6 },
    moversRow: { flexDirection: 'row', gap: 8 },
    moverCell: {
      flex: 1,
      backgroundColor: c.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
    },
    moverLabel: { fontSize: 9, color: c.textSecondary, marginBottom: 6, letterSpacing: 0.5, fontWeight: '700' },
    moverSymbol: { fontSize: 14, fontWeight: '700', color: c.textMain, marginBottom: 3 },
    moverChange: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
    moverVolume: { fontSize: 12, fontWeight: '600', color: c.textSecondary, fontVariant: ['tabular-nums'] },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: c.textMain, letterSpacing: -0.3 },
    seeAll: { fontSize: 13, color: c.primary, fontWeight: '600' },
    stockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
    stockRowBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    stockLogo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    stockInitials: { color: '#fff', fontSize: 11, fontWeight: '700' },
    stockInfo: { flex: 1, minWidth: 0 },
    stockName: { fontSize: 13, fontWeight: '600', color: c.textMain, marginBottom: 2 },
    stockTicker: { fontSize: 11, color: c.textSecondary, fontVariant: ['tabular-nums'] },
    stockPriceCol: { alignItems: 'flex-end', marginRight: 6 },
    stockPrice: { fontSize: 13, fontWeight: '700', color: c.textMain, marginBottom: 2, fontVariant: ['tabular-nums'] },
    stockChange: { fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
    emptyRow: { fontSize: 13, color: c.textSecondary, textAlign: 'center', paddingVertical: 16 },
    scamAlert: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: c.surface,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: c.error,
      padding: 16,
      marginBottom: 12,
      gap: 10,
    },
    scamText: { flex: 1 },
    scamLabel: { fontSize: 12, fontWeight: '700', color: c.error, marginBottom: 4, letterSpacing: 0.5 },
    scamMessage: { fontSize: 12, color: c.textSecondary, lineHeight: 18 },
  });