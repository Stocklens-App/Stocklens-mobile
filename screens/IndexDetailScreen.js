import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline } from 'react-native-svg';
import { COLORS, SIZES } from '../theme';

const INDEX_INFO = {
  GSE: {
    description: 'The Ghana Stock Exchange Composite Index tracks the performance of all listed companies on the Ghana Stock Exchange (GSE), the primary stock exchange in Ghana.',
    topStocks: [
      { ticker: 'MTN', name: 'MTN Ghana Ltd', price: 'GHS 1.75', change: '+2.34%', positive: true },
      { ticker: 'GCB', name: 'GCB Bank PLC', price: 'GHS 5.10', change: '-1.05%', positive: false },
      { ticker: 'SCB', name: 'Standard Chartered Bank', price: 'GHS 18.30', change: '+0.45%', positive: true },
      { ticker: 'EGH', name: 'Ecobank Ghana PLC', price: 'GHS 6.20', change: '0.00%', positive: true },
      { ticker: 'BOPP', name: 'Benso Oil Palm Plantation', price: 'GHS 21.50', change: '+4.85%', positive: true },
    ],
  },
  SPX: {
    description: 'The S&P 500 is a stock market index tracking the performance of 500 of the largest companies listed on stock exchanges in the United States.',
    topStocks: [
      { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.30', change: '+0.85%', positive: true },
      { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$415.20', change: '+1.20%', positive: true },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$175.50', change: '-0.30%', positive: false },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', price: '$185.10', change: '+0.60%', positive: true },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$875.40', change: '+2.10%', positive: true },
    ],
  },
  NDX: {
    description: 'The NASDAQ Composite Index includes almost all stocks listed on the NASDAQ stock exchange, heavily weighted towards technology companies.',
    topStocks: [
      { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.30', change: '+0.85%', positive: true },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$875.40', change: '+2.10%', positive: true },
      { ticker: 'META', name: 'Meta Platforms', price: '$480.20', change: '+1.50%', positive: true },
      { ticker: 'TSLA', name: 'Tesla Inc.', price: '$245.60', change: '-1.20%', positive: false },
      { ticker: 'AMZN', name: 'Amazon.com Inc.', price: '$185.10', change: '+0.60%', positive: true },
    ],
  },
  UKX: {
    description: 'The FTSE 100 Index is a share index of the 100 companies listed on the London Stock Exchange with the highest market capitalisation.',
    topStocks: [
      { ticker: 'SHEL', name: 'Shell PLC', price: '£28.50', change: '-0.40%', positive: false },
      { ticker: 'AZN', name: 'AstraZeneca PLC', price: '£115.20', change: '+0.80%', positive: true },
      { ticker: 'HSBA', name: 'HSBC Holdings', price: '£6.45', change: '-0.20%', positive: false },
      { ticker: 'ULVR', name: 'Unilever PLC', price: '£38.90', change: '+0.35%', positive: true },
      { ticker: 'BP', name: 'BP PLC', price: '£4.85', change: '-0.55%', positive: false },
    ],
  },
};

const LARGE_SPARKLINE = {
  GSE:  [28, 32, 30, 36, 35, 40, 38, 42, 41, 45, 43, 48, 46, 50, 51],
  SPX:  [20, 24, 22, 26, 25, 30, 28, 32, 35, 33, 36, 38, 40, 43, 45],
  NDX:  [15, 18, 17, 22, 20, 24, 26, 25, 28, 30, 29, 32, 35, 38, 40],
  UKX:  [42, 40, 41, 38, 36, 34, 35, 32, 30, 31, 28, 26, 24, 22, 20],
};

const LargeSparkline = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const width = 320;
  const height = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = i * stepX;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default function IndexDetailScreen({ route, navigation }) {
  const { index } = route.params;
  const color = index.positive ? COLORS.success : COLORS.error;
  const info = INDEX_INFO[index.symbol] || {};
  const topStocks = info.topStocks || [];
  const chartData = LARGE_SPARKLINE[index.symbol] || index.sparklineData;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{index.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* PRICE CARD */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.flag}>{index.flag}</Text>
            <View>
              <Text style={styles.symbol}>{index.symbol}</Text>
              <Text style={styles.indexName}>{index.name}</Text>
            </View>
          </View>

          <Text style={styles.price}>{index.price.toLocaleString()}</Text>

          <View style={styles.changeRow}>
            <View style={[styles.changeBadge, { backgroundColor: color + '22' }]}>
              <Ionicons
                name={index.positive ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={color}
              />
              <Text style={[styles.changeText, { color }]}>
                {index.changeValue} ({index.changePercent}%)
              </Text>
            </View>
            <Text style={styles.todayLabel}>Today</Text>
          </View>
        </View>

        {/* CHART */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance</Text>
          <View style={styles.chartWrapper}>
            <LargeSparkline data={chartData} color={color} />
          </View>
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>7 days ago</Text>
            <Text style={styles.chartLabel}>Today</Text>
          </View>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>{info.description}</Text>
        </View>

        {/* TOP STOCKS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Constituents</Text>
          {topStocks.map((stock, idx) => {
            const stockColor = stock.positive ? COLORS.success : COLORS.error;
            return (
              <View
                key={stock.ticker}
                style={[styles.stockRow, idx < topStocks.length - 1 && styles.stockRowBorder]}
              >
                <View style={styles.tickerBadge}>
                  <Text style={styles.tickerText}>{stock.ticker.slice(0, 3)}</Text>
                </View>
                <View style={styles.stockInfo}>
                  <Text style={styles.stockName}>{stock.name}</Text>
                  <Text style={styles.stockTicker}>{stock.ticker}</Text>
                </View>
                <View style={styles.stockPriceCol}>
                  <Text style={styles.stockPrice}>{stock.price}</Text>
                  <Text style={[styles.stockChange, { color: stockColor }]}>{stock.change}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.padding, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.padding, paddingTop: 54, paddingBottom: 16, backgroundColor: COLORS.background },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },

  priceCard: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  flag: { fontSize: 32 },
  symbol: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  indexName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  price: { fontSize: 36, fontWeight: 'bold', color: COLORS.textMain, marginBottom: 12 },
  changeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  changeText: { fontSize: 14, fontWeight: '600' },
  todayLabel: { fontSize: 12, color: COLORS.textSecondary },

  card: { backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 14 },

  chartWrapper: { alignItems: 'center', marginBottom: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabel: { fontSize: 11, color: COLORS.textSecondary },

  description: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  stockRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  stockRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tickerBadge: { width: 40, height: 40, borderRadius: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  tickerText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 13, fontWeight: '600', color: COLORS.textMain, marginBottom: 2 },
  stockTicker: { fontSize: 11, color: COLORS.textSecondary },
  stockPriceCol: { alignItems: 'flex-end' },
  stockPrice: { fontSize: 13, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  stockChange: { fontSize: 11, fontWeight: '600' },
});