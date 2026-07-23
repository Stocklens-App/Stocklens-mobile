// screens/StockDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { IP_ADDRESS } from '../context/AppContext';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SIZES } from '../theme';

const TIMEFRAMES = ['1M', '1Y'] as const;
type Timeframe = typeof TIMEFRAMES[number];

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;

// Color palette for auto-generated broker logos
const BROKER_COLORS = ['#3478F6', '#FF4D4D', '#1C1C1E', '#9B59B6', '#F5A623', '#00C896'];

interface Broker {
  id: string | number;
  name: string;
  deepLink: string;
}

interface Stock {
  symbol: string;
  name: string;
  sector?: string;
  currentPrice: number;
  priceChangePercentage: number;
  logoColor?: string;
  history?: number[];
}

type StockDetailScreenProps = {
  route?: {
    params: {
      stock: Stock;
    };
  };
  navigation?: {
    goBack: () => void;
    [key: string]: any;
  };
};

// Simple hash to pick a color deterministically from a broker's name
const colorForBroker = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BROKER_COLORS[Math.abs(hash) % BROKER_COLORS.length];
};

// Extract 2-letter initials from broker name
const initialsForBroker = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function StockDetailScreen({ route, navigation }: StockDetailScreenProps) {
  const { stock } = route!.params;
  const [brokers, setBrokers] = useState<Broker[]>([]);

  useEffect(() => {
    // If brokers came pre-loaded (from Invest tab), skip fetching
    if (brokers && brokers.length > 0) return;

    // Otherwise, fetch fresh data using the ticker (symbol)
    axios.get(`http://${IP_ADDRESS}:8081/api/stocks/by-ticker/${stock.symbol}`)
      .then(response => {
        setBrokers(response.data.verifiedBrokers || []);
      })
      .catch(() => {
        // Silent fail - brokers section will show empty
      });
  }, [stock.symbol]);

  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1M');

  const isUp = stock.priceChangePercentage >= 0;
  const changeColor = isUp ? COLORS.success : COLORS.error;
  const arrow = isUp ? '↑' : '↓';

  // Change value in currency (approx from percentage and current price)
  const changeValue = (stock.currentPrice * stock.priceChangePercentage) / 100;

  const buildChartData = () => {
    const history = stock.history;
    if (!history || history.length < 2) return null;

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const padding = 8;

    const points = history.map((value, index) => {
      const x = (index / (history.length - 1)) * (CHART_WIDTH - padding * 2) + padding;
      const y = CHART_HEIGHT - padding - ((value - min) / range) * (CHART_HEIGHT - padding * 2);
      return { x, y };
    });

    const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = CHART_HEIGHT - padding;
    const areaPath = `M ${firstX},${points[0].y} ` +
                     points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') +
                     ` L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;

    return { linePoints, areaPath };
  };

  const chartData = buildChartData();

  const openBrokerLink = async (url: string): Promise<void> => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (err) {
      // silently fail
    }
  };

  const timeframeLabel = activeTimeframe === '1M' ? 'this month' : 'this year';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation!.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Text style={styles.starIcon}>☆</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Identity row: logo + symbol/name in a row */}
        <View style={styles.identityRow}>
          <View style={[styles.logo, { backgroundColor: stock.logoColor || COLORS.surface }]}>
            <Text style={styles.logoText}>{stock.symbol.slice(0, 3)}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.symbol}>{stock.symbol}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {stock.name}{stock.sector ? ` · ${stock.sector}` : ''}
            </Text>
          </View>
        </View>

        {/* Price + change subtitle */}
        <View style={styles.priceBlock}>
          <Text style={styles.price}>GHS {stock.currentPrice.toFixed(2)}</Text>
          <Text style={[styles.priceSubtitle, { color: changeColor }]}>
            {arrow} {isUp ? '+' : ''}{changeValue.toFixed(2)} ({isUp ? '+' : ''}{stock.priceChangePercentage.toFixed(1)}%) {timeframeLabel}
          </Text>
        </View>

        {/* Chart card */}
        <View style={styles.chartCard}>
          {chartData ? (
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={changeColor} stopOpacity="0.35" />
                  <Stop offset="1" stopColor={changeColor} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path d={chartData.areaPath} fill="url(#chartGradient)" />
              <Polyline
                points={chartData.linePoints}
                fill="none"
                stroke={changeColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <View style={styles.placeholderChart}>
              <Text style={styles.placeholderText}>Chart data unavailable</Text>
            </View>
          )}
        </View>

        {/* Timeframe chips: 1M and 1Y only */}
        <View style={styles.chipRow}>
          {TIMEFRAMES.map((tf) => {
            const active = activeTimeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveTimeframe(tf)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scam protection card */}
        <View style={styles.protectionCard}>
          <View style={styles.protectionHeader}>
            <Text style={styles.protectionShield}>🛡</Text>
            <Text style={styles.protectionTitle}>SCAM PROTECTION</Text>
          </View>
          <Text style={styles.protectionBody}>
            All brokers below are licensed by SEC Ghana.
          </Text>
        </View>

        {/* Brokers section */}
        <View style={styles.brokersSection}>
          <Text style={styles.brokersCount}>
            {brokers?.length || 0} verified brokers
          </Text>

          {brokers && brokers.length > 0 ? (
            brokers.map((broker, index) => {
              const isTopRated = index === 0;
              return (
                <TouchableOpacity
                  key={broker.id}
                  style={[styles.brokerRow, isTopRated && styles.brokerRowTop]}
                  onPress={() => openBrokerLink(broker.deepLink)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.brokerLogo, { backgroundColor: colorForBroker(broker.name) }]}>
                    <Text style={styles.brokerLogoText}>{initialsForBroker(broker.name)}</Text>
                  </View>

                  <View style={styles.brokerInfo}>
                    <Text style={styles.brokerName}>{broker.name}</Text>
                    <View style={styles.brokerLicense}>
                      <Text style={styles.licenseCheck}>✓</Text>
                      <Text style={styles.licenseText}>SEC Ghana licensed</Text>
                    </View>
                  </View>

                  {isTopRated ? (
                    <View style={styles.topBadge}>
                      <Text style={styles.topBadgeText}>TOP RATED</Text>
                    </View>
                  ) : (
                    <Text style={styles.externalIcon}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.brokersEmpty}>
              <Text style={styles.brokersEmptyText}>
                No verified brokers listed for this stock.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: 52,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: COLORS.textMain,
    fontSize: 26,
    lineHeight: 26,
    marginTop: -3,
  },
  starIcon: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  identityText: {
    flex: 1,
  },
  symbol: {
    color: COLORS.textMain,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  priceBlock: {
    marginBottom: 16,
  },
  price: {
    color: COLORS.textMain,
    fontSize: 44,
    fontWeight: '700',
    fontFamily: 'Georgia',
    letterSpacing: -1,
  },
  priceSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  placeholderChart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0B1220',
    fontWeight: '700',
  },
  protectionCard: {
    backgroundColor: 'rgba(33, 208, 122, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(33, 208, 122, 0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 22,
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  protectionShield: {
    fontSize: 14,
  },
  protectionTitle: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  protectionBody: {
    color: COLORS.textMain,
    fontSize: 13,
    lineHeight: 18,
  },
  brokersSection: {
    marginTop: 4,
  },
  brokersCount: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  brokerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 12,
  },
  brokerRowTop: {
    borderWidth: 1.5,
    borderColor: COLORS.success,
  },
  brokerLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brokerLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brokerInfo: {
    flex: 1,
  },
  brokerName: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
  },
  brokerLicense: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  licenseCheck: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },
  licenseText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  topBadge: {
    borderWidth: 1,
    borderColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  topBadgeText: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  externalIcon: {
    color: COLORS.textSecondary,
    fontSize: 22,
    fontWeight: '400',
  },
  brokersEmpty: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  brokersEmptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});