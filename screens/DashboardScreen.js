import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { COLORS, SIZES } from '../theme';

const MARKET_INDICES = [
  {
    id: 'gse',
    flag: '🇬🇭',
    name: 'GSE Composite',
    price: '4,238.50',
    change: '+51.20',
    percent: '1.22%',
    positive: true,
    data: [30, 35, 28, 40, 38, 45, 42, 51],
  },
  {
    id: 'sp500',
    flag: '🇺🇸',
    name: 'S&P 500',
    price: '5,437.91',
    change: '+45.23',
    percent: '0.84%',
    positive: true,
    data: [20, 25, 22, 30, 28, 35, 38, 45],
  },
  {
    id: 'nasdaq',
    flag: '🇺🇸',
    name: 'NASDAQ',
    price: '17,388.67',
    change: '+111.08',
    percent: '0.64%',
    positive: true,
    data: [15, 20, 18, 25, 30, 28, 35, 40],
  },
  {
    id: 'ftse',
    flag: '🇬🇧',
    name: 'FTSE 100',
    price: '8,262.15',
    change: '-25.14',
    percent: '0.30%',
    positive: false,
    data: [40, 35, 38, 30, 32, 28, 25, 20],
  },
];

const TRENDING_STOCKS = [
  {
    id: 'scb',
    initials: 'SCB',
    logoColor: COLORS.primary,
    name: 'StanChart Ghana',
    ticker: 'SCB • GSE',
    price: 'GHS 22.50',
    change: '+3.5%',
    positive: true,
    data: [10, 15, 12, 18, 20, 22, 21, 25],
  },
  {
    id: 'gcb',
    initials: 'GCB',
    logoColor: COLORS.error,
    name: 'GCB Bank',
    ticker: 'GCB • GSE',
    price: 'GHS 4.20',
    change: '-0.8%',
    positive: false,
    data: [25, 22, 24, 20, 18, 16, 15, 12],
  },
  {
    id: 'mtn',
    initials: 'MTN',
    logoColor: '#F5A623',
    name: 'MTN Ghana',
    ticker: 'MTNGH • GSE',
    price: 'GHS 1.85',
    change: '+1.2%',
    positive: true,
    data: [12, 14, 13, 15, 17, 16, 18, 19],
  },
];

const Sparkline = ({ data, color, width = 60, height = 30 }) => {
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

export default function DashboardScreen({ route, navigation }) {
  const rawName = route?.params?.userName || 'User';
  const displayName = rawName.length > 12 ? `${rawName.slice(0, 12)}...` : rawName;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileHeaderRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle" size={36} color={COLORS.primary} />
            <View style={styles.nameAndChevronRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={20} color={COLORS.textMain} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textMain} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* MARKET PULSE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Market Pulse</Text>
              <Text style={styles.cardSubtitle}>Global markets at a glance</Text>
            </View>
            <Text style={styles.todayLabel}>Today</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indicesRow}>
            {MARKET_INDICES.map((index) => {
              const color = index.positive ? COLORS.success : COLORS.error;
              return (
                <View key={index.id} style={styles.indexCard}>
                  <Text style={styles.flagEmoji}>{index.flag}</Text>
                  <Text style={styles.indexName}>{index.name}</Text>
                  <Text style={styles.indexPrice}>{index.price}</Text>
                  <Text style={[styles.indexChange, { color }]}>
                    {index.positive ? '↑' : '↓'} {index.change}
                  </Text>
                  <Text style={[styles.indexPercent, { color }]}>({index.percent})</Text>
                  <View style={{ marginTop: 2 }}>
                    <Sparkline data={index.data} color={color} width={86} height={28} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* TRENDING TODAY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending today</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {TRENDING_STOCKS.map((stock, idx) => {
            const color = stock.positive ? COLORS.success : COLORS.error;
            return (
              <TouchableOpacity
                key={stock.id}
                style={[styles.stockRow, idx < TRENDING_STOCKS.length - 1 && styles.stockRowBorder]}
                activeOpacity={0.7}
              >
                <View style={[styles.stockLogo, { backgroundColor: stock.logoColor }]}>
                  <Text style={styles.stockInitials}>{stock.initials}</Text>
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>{stock.name}</Text>
                  <Text style={styles.stockTicker}>{stock.ticker}</Text>
                </View>
                <View style={styles.stockPriceCol}>
                  <Text style={styles.stockPrice}>{stock.price}</Text>
                  <Text style={[styles.stockChange, { color }]}>{stock.change}</Text>
                </View>
                <Sparkline data={stock.data} color={color} width={56} height={28} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SCAM ALERT */}
        <TouchableOpacity style={styles.scamAlert} activeOpacity={0.8}>
          <View style={styles.scamLeft}>
            <Ionicons name="warning-outline" size={20} color={COLORS.error} />
            <View style={styles.scamText}>
              <Text style={styles.scamLabel}>SCAM ALERT</Text>
              <Text style={styles.scamMessage}>
                "XYZ Forex Ghana" is NOT licensed by SEC Ghana. Avoid.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: SIZES.padding, paddingTop: 54, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameAndChevronRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: { fontSize: 20, fontWeight: 'bold', color: COLORS.textMain },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { position: 'relative', width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: COLORS.success, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  card: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  cardSubtitle: { fontSize: 11, color: COLORS.textSecondary },
  todayLabel: { fontSize: 12, color: COLORS.textSecondary },

  indicesRow: { gap: 10 },
  indexCard: { backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12, width: 110 },
  flagEmoji: { fontSize: 22, marginBottom: 6 },
  indexName: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 },
  indexPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  indexChange: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  indexPercent: { fontSize: 10, marginBottom: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '500' },

  stockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  stockRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stockLogo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stockInitials: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 13, fontWeight: '600', color: COLORS.textMain, marginBottom: 2 },
  stockTicker: { fontSize: 11, color: COLORS.textSecondary },
  stockPriceCol: { alignItems: 'flex-end', marginRight: 6 },
  stockPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  stockChange: { fontSize: 11, fontWeight: '600' },

  scamAlert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.error, padding: 16 },
  scamLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  scamText: { flex: 1 },
  scamLabel: { fontSize: 12, fontWeight: '700', color: COLORS.error, marginBottom: 4, letterSpacing: 0.5 },
  scamMessage: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});