// screens/InvestScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../context/AppContext';

type Stock = {
  id: number | string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChangePercentage: number;
  logoColor?: string;
};

type SortKey = 'name' | 'priceDesc' | 'gainers' | 'losers';

const SORT_OPTIONS: { key: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'name', label: 'Name (A–Z)', icon: 'text-outline' },
  { key: 'priceDesc', label: 'Price (high → low)', icon: 'cash-outline' },
  { key: 'gainers', label: 'Biggest gainers', icon: 'trending-up-outline' },
  { key: 'losers', label: 'Biggest losers', icon: 'trending-down-outline' },
];

type InvestScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function InvestScreen({ navigation }: InvestScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const {
    stocks,
    stocksLoading: loading,
    stocksError: error,
    refetchStocks: fetchStocks,
  } = useAppContext();

  const [query, setQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortMenuOpen, setSortMenuOpen] = useState<boolean>(false);

  const visibleStocks: Stock[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = stocks.filter((stock: Stock) =>
      q === '' ? true : stock.name.toLowerCase().includes(q) || stock.symbol.toLowerCase().includes(q)
    );
    const sorted = [...filtered];
    switch (sortKey) {
      case 'priceDesc':
        sorted.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'gainers':
        sorted.sort((a, b) => b.priceChangePercentage - a.priceChangePercentage);
        break;
      case 'losers':
        sorted.sort((a, b) => a.priceChangePercentage - b.priceChangePercentage);
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [stocks, query, sortKey]);

  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? '';

  const renderStock = ({ item }: { item: Stock }) => {
    const isUp = item.priceChangePercentage >= 0;
    const changeColor = isUp ? colors.success : colors.error;
    const arrow = isUp ? '▲' : '▼';

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onPress={() => navigation.navigate('StockDetail', { stock: item })}
      >
        <View style={[styles.logoFallback, { backgroundColor: item.logoColor || colors.surface }]}>
          <Text style={styles.logoText}>{item.symbol.slice(0, 3)}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.ticker}>{item.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>₵{item.currentPrice.toFixed(2)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {arrow} {Math.abs(item.priceChangePercentage).toFixed(2)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonRow = (_: unknown, index: number) => (
    <View key={index} style={styles.row}>
      <View style={[styles.logoFallback, styles.skeleton]} />
      <View style={styles.info}>
        <View style={[styles.skeletonLine, { width: '40%' }]} />
        <View style={[styles.skeletonLine, { width: '70%', marginTop: 6 }]} />
      </View>
      <View style={styles.priceBox}>
        <View style={[styles.skeletonLine, { width: 60 }]} />
        <View style={[styles.skeletonLine, { width: 40, marginTop: 6 }]} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingHeader}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading stocks...</Text>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((_, i) => renderSkeletonRow(_, i))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchStocks} activeOpacity={0.7}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search + sort */}
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortMenuOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Active sort caption */}
      <Text style={styles.sortCaption}>Sorted by {activeSortLabel.toLowerCase()}</Text>

      <FlatList
        data={visibleStocks}
        renderItem={renderStock}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>No stocks match your search.</Text>}
      />

      {/* Sort menu */}
      <Modal visible={sortMenuOpen} transparent animationType="fade" onRequestClose={() => setSortMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setSortMenuOpen(false)}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => {
              const active = opt.key === sortKey;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.menuRow}
                  onPress={() => { setSortKey(opt.key); setSortMenuOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={opt.icon} size={18} color={active ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{opt.label}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      paddingHorizontal: SIZES.padding,
      paddingTop: SIZES.padding,
    },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    search: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    searchInput: { flex: 1, color: c.textMain, fontSize: 15, padding: 0 },
    sortButton: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortCaption: {
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 10,
      marginBottom: 2,
    },
    listContent: { paddingTop: 8, paddingBottom: 24 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logoFallback: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
    info: { flex: 1, minWidth: 0 },
    ticker: { color: c.textMain, fontSize: 17, fontWeight: '700', marginLeft: 12 },
    name: { color: c.textSecondary, fontSize: 14, marginTop: 1, marginLeft: 12 },
    priceBox: { alignItems: 'flex-end' },
    price: { color: c.textMain, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
    change: { fontSize: 12, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
    empty: { color: c.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 40 },
    loadingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      gap: 10,
    },
    loadingText: { color: c.textSecondary, fontSize: 13 },
    skeleton: { backgroundColor: c.surface, opacity: 0.5 },
    skeletonLine: { height: 10, backgroundColor: c.surface, borderRadius: 3, opacity: 0.5 },
    errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    errorIcon: { fontSize: 48, color: c.error, marginBottom: 12 },
    errorTitle: { color: c.textMain, fontSize: 18, fontWeight: '600', marginBottom: 8 },
    errorMessage: { color: c.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    retryButton: { backgroundColor: c.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
    retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    menuOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    menuCard: {
      backgroundColor: c.surface,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: c.border,
      padding: 8,
    },
    menuTitle: {
      color: c.textSecondary,
      fontSize: 1,
      fontWeight: '700',
      letterSpacing: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: 10,
    },
    menuLabel: { color: c.textMain, fontSize: 15 },
    menuLabelActive: { color: c.primary, fontWeight: '600' },
  });