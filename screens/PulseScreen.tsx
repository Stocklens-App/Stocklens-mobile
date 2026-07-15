import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';

// 🔥 READY FOR FUTURE BACKEND CONNECTION
import api from '../context/axios';

type TimePeriod = '1M' | '6M' | '1Y' | '5Y';
type Stock = {
  id: number;
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  priceChangePercent: number;
  volatilityScore: number;
  logoColor: string;
  sparklineData: string;
};

export default function PulseScreen() {
 const [amount, setAmount] = useState<string>('5000');
const [period, setPeriod] = useState<TimePeriod>('1Y');

const [stocks, setStocks] = useState<Stock[]>([]);
const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

const gainPercent = selectedStock?.priceChangePercent ?? 0;
useEffect(() => {
  const fetchStocks = async () => {
    try {
      const response = await api.get('/api/stocks');

      setStocks(response.data);

      if (response.data.length > 0) {
        setSelectedStock(response.data[0]);
      }
    } catch (err) {
      console.log('Error fetching stocks:', err);
    }
  };

  fetchStocks();
}, []);
  const numericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const projectedGain = numericAmount * (gainPercent / 100);
  const totalValue = numericAmount + projectedGain;

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-GH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Simulator</Text>

          {/* Stock Dropdown Selector */}
          <TouchableOpacity style={styles.dropdownSelector} activeOpacity={0.8}>
            <View style={styles.dropdownLeft}>
              <Ionicons
                name="search-outline"
                size={20}
                color={COLORS.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownText}>MTN Ghana</Text>
            </View>
            <Ionicons name="chevron-down-outline" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Stock Info Badge */}
          <View style={styles.stockBadge}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.stockDetails}>
              <Text style={styles.stockTicker}>MTNGH</Text>
              <Text style={styles.stockSubText}>MTN Ghana · Telecoms</Text>
            </View>
          </View>

          {/* Section Indicator */}
          <View style={styles.sectionDividerRow}>
            <View style={styles.blueLine} />
            <Text style={styles.sectionLabel}>INVESTMENT SIMULATOR</Text>
          </View>

          {/* Amount Input */}
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>GHS</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) =>
                setAmount(text.replace(/[^0-9.]/g, ''))
              }
              placeholder="0"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {/* Time Period */}
          <Text style={styles.inputLabel}>Time period</Text>
          <View style={styles.chipRow}>
            {(['1M', '6M', '1Y', '5Y'] as TimePeriod[]).map((p) => {
              const isActive = period === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, isActive && styles.activeChip]}
                  onPress={() => setPeriod(p)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.activeChipText,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Outcome Card */}
          <View style={styles.outcomeCard}>
            <Text style={styles.cardSectionTitle}>PROJECTED OUTCOME</Text>

            <Text style={styles.cardSubText}>
              If you had invested GHS {amount || '0'} a year ago
            </Text>

            <Text style={styles.gainText}>
              + GHS {formatCurrency(projectedGain)}
            </Text>

            <Text style={styles.gainPercentage}>
              +{gainPercent.toFixed(1)}% gain
            </Text>

            <View style={styles.cardDivider} />

            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Today's value</Text>
              <Text style={styles.valueAmount}>
                GHS {formatCurrency(totalValue)}
              </Text>
            </View>
          </View>

          {/* Invest Button */}
          <TouchableOpacity style={styles.investButton} activeOpacity={0.8}>
            <Text style={styles.investButtonText}>Invest now </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.textMain}
            />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 24,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '500',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#11141A',
  },
  stockDetails: {
    marginLeft: 14,
  },
  stockTicker: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  stockSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  blueLine: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    height: 64,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: COLORS.textMain,
    fontSize: 22,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    height: 44,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeChipText: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  outcomeCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '33',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardSubText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  gainText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
  },
  gainPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  investButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  investButtonText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
});