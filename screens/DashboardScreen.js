import React from 'react';
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
import { useAppContext } from '../context/AppContext';

// --- Sparkline Component (Teammate Feature) ---
// Maps home tab's trending stock shape to what StockDetail expects
const toStockDetailFormat = (trending) => ({
  id: null,
  symbol: trending.ticker,
  name: trending.companyName,
  currentPrice: trending.currentPrice,
  priceChangePercentage: trending.priceChangePercent,
  logoColor: trending.logoColor,
  sector: trending.sector,
  history: trending.sparklineData,
  verifiedBrokers: [],
});

const Sparkline = ({ data, color, width = 60, height = 30 }) => {
  if (!data || data.length === 0) return null;
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
  // Blends name formatting logic seamlessly
  const displayName = rawName.length > 12 ? `${rawName.slice(0, 12)}...` : rawName;
  
  const { marketIndices, trendingStocks, scamAlerts, loading, error, unreadCount } = useAppContext();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary || '#3478F6'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textSecondary || '#7E8494'} />
        <Text style={styles.errorText}>{error}</Text>
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
        {/* 👤 SEAMLESS PROFILE & HEADER ITEMS COMBINED */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileHeaderRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle" size={36} color={COLORS.primary || '#3478F6'} style={styles.profileAvatar} />
            <View style={styles.nameAndChevronRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary || '#7E8494'} style={styles.chevron} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={20} color={COLORS.textMain || '#FFF'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.textMain || '#FFF'} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
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
            {marketIndices.map((index) => {
              const color = index.positive ? COLORS.success : COLORS.error;
              return (
                <TouchableOpacity
                  key={index.symbol}
                  style={styles.indexCard}
                  onPress={() => navigation.navigate('IndexDetail', { index })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flagEmoji}>{index.flag}</Text>
                  <Text style={styles.indexName}>{index.name}</Text>
                  <Text style={styles.indexPrice}>{index.price.toLocaleString()}</Text>
                  <Text style={[styles.indexChange, { color }]}>
                    {index.positive ? '↑' : '↓'} {index.changeValue}
                  </Text>
                  <Text style={[styles.indexPercent, { color }]}>({index.changePercent}%)</Text>
                  <View style={{ marginTop: 2 }}>
                    <Sparkline data={index.sparklineData} color={color} width={86} height={28} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TRENDING TODAY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending today</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invest')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {trendingStocks.slice(0, 5).map((stock, idx) => {
            const color = stock.positive ? COLORS.success : COLORS.error;
            return (
              <TouchableOpacity
                key={stock.ticker}
                style={[styles.stockRow, idx < 4 && styles.stockRowBorder]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('StockDetail', { stock: toStockDetailFormat(stock) })}
              >
                <View style={[styles.stockLogo, { backgroundColor: stock.logoColor }]}>
                  <Text style={styles.stockInitials}>{stock.initials}</Text>
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>{stock.companyName}</Text>
                  <Text style={styles.stockTicker}>{stock.ticker} • GSE</Text>
                </View>
                <View style={styles.stockPriceCol}>
                  <Text style={styles.stockPrice}>GHS {stock.currentPrice.toFixed(2)}</Text>
                  <Text style={[styles.stockChange, { color }]}>
                    {stock.positive ? '+' : ''}{stock.priceChangePercent}%
                  </Text>
                </View>
                <Sparkline data={stock.sparklineData} color={color} width={56} height={28} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SCAM ALERTS */}
        {scamAlerts.map((alert, idx) => (
          <TouchableOpacity key={idx} style={styles.scamAlert} activeOpacity={0.8}>
            <View style={styles.scamLeft}>
              <Ionicons name="warning-outline" size={20} color={COLORS.error} />
              <View style={styles.scamText}>
                <Text style={styles.scamLabel}>SCAM ALERT</Text>
                <Text style={styles.scamMessage}>{alert}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary || '#7E8494'} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },
  scroll: { flex: 1 },
  scrollContent: { padding: SIZES.padding || 16, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: COLORS.background || '#11141A', alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: COLORS.textSecondary || '#7E8494', textAlign: 'center', paddingHorizontal: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileAvatar: { marginRight: 0 },
  nameAndChevronRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chevron: { marginLeft: 0 },
  userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain || '#FFF' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { position: 'relative', width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface || '#1C212D', borderWidth: 1, borderColor: COLORS.border || '#2A3245', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: COLORS.success, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  card: { backgroundColor: COLORS.surface || '#1C212D', borderRadius: 16, borderWidth: 1, borderColor: COLORS.border || '#2A3245', padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  cardSubtitle: { fontSize: 11, color: COLORS.textSecondary || '#7E8494' },
  todayLabel: { fontSize: 12, color: COLORS.textSecondary || '#7E8494' },

  indicesRow: { gap: 10 },
  indexCard: { backgroundColor: COLORS.background || '#11141A', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border || '#2A3245', padding: 12, width: 110 },
  flagEmoji: { fontSize: 22, marginBottom: 6 },
  indexName: { fontSize: 10, color: COLORS.textSecondary || '#7E8494', marginBottom: 4 },
  indexPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  indexChange: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  indexPercent: { fontSize: 10, marginBottom: 8 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain || '#FFF' },
  seeAll: { fontSize: 13, color: COLORS.primary || '#3478F6', fontWeight: '500' },

  stockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  stockRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border || '#2A3245' },
  stockLogo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stockInitials: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 13, fontWeight: '600', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  stockTicker: { fontSize: 11, color: COLORS.textSecondary || '#7E8494' },
  stockPriceCol: { alignItems: 'flex-end', marginRight: 6 },
  stockPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain || '#FFF', marginBottom: 2 },
  stockChange: { fontSize: 11, fontWeight: '600' },

  scamAlert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface || '#1C212D', borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.error, padding: 16, marginBottom: 12 },
  scamLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  scamText: { flex: 1 },
  scamLabel: { fontSize: 12, fontWeight: '700', color: COLORS.error, marginBottom: 4, letterSpacing: 0.5 },
  scamMessage: { fontSize: 12, color: COLORS.textSecondary || '#7E8494', lineHeight: 18 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  statCard: { backgroundColor: COLORS.surface || '#1C212D', padding: SIZES.padding || 16, borderRadius: 12, width: '48%', borderWidth: 1, borderColor: COLORS.border || '#2A3245' },
  statLabel: { color: COLORS.textSecondary || '#7E8494', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' },
  statValue: { color: COLORS.primary || '#3478F6', fontSize: 20, fontWeight: 'bold' }
});