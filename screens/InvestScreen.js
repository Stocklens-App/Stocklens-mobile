// screens/InvestScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '../theme';
import { useAppContext } from '../context/AppContext';

export default function InvestScreen({ navigation }) {
  // Stocks are prefetched at app startup by AppContext — no fetch here.
  const {
    stocks,
    stocksLoading: loading,
    stocksError: error,
    refetchStocks: fetchStocks,
  } = useAppContext();

  const [query, setQuery] = useState('');

  const visibleStocks = stocks.filter((stock) => {
    const q = query.trim().toLowerCase();
    if (q === '') return true;
    return (
      stock.name.toLowerCase().includes(q) ||
      stock.symbol.toLowerCase().includes(q)
    );
  });

  const renderStock = ({ item }) => {
    const isUp = item.priceChangePercentage >= 0;
    const changeColor = isUp ? COLORS.success : COLORS.error;
    const arrow = isUp ? '▲' : '▼';

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.6}
        onPress={() => navigation.navigate('StockDetail', { stock: item })}
      >
        <View style={[styles.logoFallback, { backgroundColor: item.logoColor || COLORS.surface }]}>
          <Text style={styles.logoText}>{item.symbol.slice(0, 3)}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.ticker}>{item.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>
            ₵{item.currentPrice.toFixed(2)}
          </Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {arrow} {Math.abs(item.priceChangePercentage).toFixed(2)}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSkeletonRow = (_, index) => (
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
        {/* <Text style={styles.h1}>Invest</Text>
        <Text style={styles.subtitle}>
          Browse verified stocks on the GSE & global markets
        </Text> */}
        <View style={styles.loadingHeader}>
          <ActivityIndicator color={COLORS.primary} />
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
        {/* <Text style={styles.h1}>Invest</Text> */}
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠</Text>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchStocks}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Keeps your functional text update */}
      {/* <Text style={styles.h1}>Invest</Text> */}
      {/* <Text style={styles.subtitle}>
        Browse verified stocks on the GSE & global markets
      </Text> */}

      <View style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="   Search stocks"
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={visibleStocks}
        renderItem={renderStock}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>No stocks match your search.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  text: {
    color: COLORS.textMain || '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  h1: {
    color: COLORS.textMain,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 4,
  },
  searchIcon: {
    color: COLORS.textSecondary,
    fontSize: 30,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 18,
    padding: 0,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoFallback: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  ticker: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  name: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
    marginLeft: 12,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    color: COLORS.textMain,
    fontSize: 15,
    fontWeight: '600',
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  skeleton: {
    backgroundColor: COLORS.surface,
    opacity: 0.5,
  },
  skeletonLine: {
    height: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    opacity: 0.5,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  errorIcon: {
    fontSize: 48,
    color: COLORS.error,
    marginBottom: 12,
  },
  errorTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.textMain,
    fontSize: 14,
    fontWeight: '600',
  },
});