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
import { api } from '../context/AppContext';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SIZES } from '../theme';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;

// Color palette for auto-generated broker logos
const BROKER_COLORS = ['#3478F6', '#FF4D4D', '#1C1C1E', '#9B59B6', '#F5A623', '#00C896'];

// How many brokers to show before the "show all" toggle
const BROKER_PREVIEW_COUNT = 4;

interface Broker {
  id: string | number;
  name: string;
  deepLink?: string | null;
  telephone?: string | null;
  address?: string | null;
}

interface Stock {
  symbol: string;
  name: string;
  sector?: string;
  currentPrice: number;
  priceChangePercentage: number;
  logoColor?: string;
  history?: number[];
  // Populated from the GSE feed once details load
  volume?: number | null;
  industry?: string | null;
  marketCap?: number | null;
  sharesOutstanding?: number | null;
  website?: string | null;
  companyEmail?: string | null;
  telephone?: string | null;
  address?: string | null;
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

// GHS 92,388,501,849 → "GHS 92.39B"
const formatCompact = (value?: number | null): string => {
  if (value === null || value === undefined) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `GHS ${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `GHS ${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `GHS ${(value / 1_000).toFixed(1)}K`;
  return `GHS ${value.toFixed(2)}`;
};

const formatCount = (value?: number | null): string => {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString();
};

export default function StockDetailScreen({ route, navigation }: StockDetailScreenProps) {
  const { stock: initialStock } = route!.params;
  const [stock, setStock] = useState<Stock>(initialStock);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [showAllBrokers, setShowAllBrokers] = useState(false);

  useEffect(() => {
    // Always fetch: the list screen only carries summary fields, and we need
    // company profile + brokers for this view.
    api.get(`/api/stocks/by-ticker/${initialStock.symbol}`)
      .then(({ data }) => {
        setStock({ ...initialStock, ...data });
        setBrokers(data.verifiedBrokers || []);
      })
      .catch(() => {
        // Keep the summary data we were handed; sections below degrade gracefully.
      });
  }, [initialStock.symbol]);

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

  const openUrl = async (url?: string | null): Promise<void> => {
    if (!url) return;
    const normalised = url.startsWith('http') || url.startsWith('tel:')
      ? url
      : `https://${url}`;
    try {
      const supported = await Linking.canOpenURL(normalised);
      if (supported) {
        await Linking.openURL(normalised);
      }
    } catch (err) {
      // silently fail
    }
  };

  // A broker either has its own site, or we send the user to the GSE register
  // where they can confirm the firm is licensed.
  const brokerAction = (broker: Broker) => {
    if (broker.deepLink) return { label: 'Visit broker', url: broker.deepLink };
    if (broker.telephone) return { label: broker.telephone, url: `tel:${broker.telephone.replace(/\s/g, '')}` };
    return { label: 'Verify on GSE register', url: 'https://gse.com.gh/licensed-dealing-members/' };
  };

  const visibleBrokers = showAllBrokers ? brokers : brokers.slice(0, BROKER_PREVIEW_COUNT);

  const hasCompanyInfo = stock.marketCap || stock.volume !== undefined || stock.industry;
  const hasContactInfo = stock.website || stock.telephone || stock.companyEmail || stock.address;

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
            {arrow} {isUp ? '+' : ''}{changeValue.toFixed(2)} ({isUp ? '+' : ''}{stock.priceChangePercentage.toFixed(1)}%) today
          </Text>
        </View>

        {/* Chart — only rendered when we actually have price history */}
        {chartData && (
          <View style={styles.chartCard}>
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
          </View>
        )}

        {/* Market data from the GSE feed */}
        {hasCompanyInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>MARKET DATA</Text>
            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Market cap</Text>
                <Text style={styles.statValue}>{formatCompact(stock.marketCap)}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Volume traded</Text>
                <Text style={styles.statValue}>{formatCount(stock.volume)}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Shares issued</Text>
                <Text style={styles.statValue}>{formatCount(stock.sharesOutstanding)}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Industry</Text>
                <Text style={styles.statValue} numberOfLines={2}>{stock.industry || '—'}</Text>
              </View>
            </View>
            <Text style={styles.sourceNote}>Source: Ghana Stock Exchange</Text>
          </View>
        )}

        {/* Official company contacts — lets a user verify who they're dealing with */}
        {hasContactInfo && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>OFFICIAL COMPANY DETAILS</Text>

            {stock.website ? (
              <TouchableOpacity style={styles.contactRow} onPress={() => openUrl(stock.website)} activeOpacity={0.6}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={[styles.contactValue, styles.contactLink]} numberOfLines={1}>{stock.website}</Text>
              </TouchableOpacity>
            ) : null}

            {stock.telephone ? (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => openUrl(`tel:${stock.telephone?.split(',')[0].replace(/\s/g, '')}`)}
                activeOpacity={0.6}
              >
                <Text style={styles.contactLabel}>Telephone</Text>
                <Text style={[styles.contactValue, styles.contactLink]} numberOfLines={1}>{stock.telephone}</Text>
              </TouchableOpacity>
            ) : null}

            {stock.companyEmail ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue} numberOfLines={1}>{stock.companyEmail}</Text>
              </View>
            ) : null}

            {stock.address ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue} numberOfLines={3}>{stock.address}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Scam protection card */}
        <View style={styles.protectionCard}>
          <View style={styles.protectionHeader}>
            <Text style={styles.protectionShield}>🛡</Text>
            <Text style={styles.protectionTitle}>SCAM PROTECTION</Text>
          </View>
          <Text style={styles.protectionBody}>
            Every broker below is a Licensed Dealing Member of the Ghana Stock Exchange.
            Never buy shares through anyone not on this list.
          </Text>
        </View>

        {/* Brokers section */}
        <View style={styles.brokersSection}>
          <Text style={styles.brokersCount}>
            {brokers?.length || 0} verified brokers
          </Text>

          {brokers && brokers.length > 0 ? (
            <>
              {visibleBrokers.map((broker) => {
                const action = brokerAction(broker);
                return (
                  <TouchableOpacity
                    key={broker.id}
                    style={styles.brokerRow}
                    onPress={() => openUrl(action.url)}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.brokerLogo, { backgroundColor: colorForBroker(broker.name) }]}>
                      <Text style={styles.brokerLogoText}>{initialsForBroker(broker.name)}</Text>
                    </View>

                    <View style={styles.brokerInfo}>
                      <Text style={styles.brokerName} numberOfLines={1}>{broker.name}</Text>
                      <View style={styles.brokerLicense}>
                        <Text style={styles.licenseCheck}>✓</Text>
                        <Text style={styles.licenseText} numberOfLines={1}>{action.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.externalIcon}>›</Text>
                  </TouchableOpacity>
                );
              })}

              {brokers.length > BROKER_PREVIEW_COUNT && (
                <TouchableOpacity
                  style={styles.showAllButton}
                  onPress={() => setShowAllBrokers(!showAllBrokers)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showAllText}>
                    {showAllBrokers
                      ? 'Show fewer'
                      : `Show all ${brokers.length} verified brokers`}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.registerNote}>
                Source: GSE Licensed Dealing Members register. Always confirm a broker's
                licence at gse.com.gh before sending money.
              </Text>
            </>
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
    marginBottom: 20,
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
    marginBottom: 20,
    alignItems: 'center',
  },

  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 14,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCell: {
    width: '50%',
    marginBottom: 14,
    paddingRight: 8,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 3,
  },
  statValue: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '600',
  },
  sourceNote: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  contactRow: {
    marginBottom: 12,
  },
  contactLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 3,
  },
  contactValue: {
    color: COLORS.textMain,
    fontSize: 13,
    lineHeight: 18,
  },
  contactLink: {
    color: COLORS.primary,
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
    minWidth: 0,
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
    flexShrink: 1,
  },
  externalIcon: {
    color: COLORS.textSecondary,
    fontSize: 22,
    fontWeight: '400',
  },
  showAllButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  showAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  registerNote: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 8,
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