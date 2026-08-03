// components/AddHoldingModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { calculateFees, COMMISSION_OPTIONS } from '../constants/fees';
import type { Stock } from '../types';

const money = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const [w, d] = Math.abs(n).toFixed(2).split('.');
  return `${sign}₵${w.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
};

type Props = { visible: boolean; onClose: () => void };

export default function AddHoldingModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { stocks, addLot } = useAppContext();

  const [selected, setSelected] = useState<Stock | null>(null);
  const [query, setQuery] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(COMMISSION_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSelected(null); setQuery(''); setShares(''); setBuyPrice('');
    setCommissionRate(COMMISSION_OPTIONS[0].value); setSubmitting(false);
  };
  const close = () => { reset(); onClose(); };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q === ''
      ? stocks
      : stocks.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [stocks, query]);

  const pick = (s: Stock) => {
    setSelected(s);
    setBuyPrice(s.currentPrice != null ? s.currentPrice.toFixed(2) : '');
    setQuery('');
  };

  const sharesNum = parseFloat(shares) || 0;
  const priceNum = parseFloat(buyPrice) || 0;
  const tradeValue = sharesNum * priceNum;
  const fees = tradeValue > 0 ? calculateFees(tradeValue, commissionRate) : null;
  const totalCost = tradeValue + (fees?.total ?? 0);
  const canSubmit = !!selected && sharesNum > 0 && priceNum > 0 && !submitting;

  const submit = async () => {
    if (!selected) return;
    if (sharesNum <= 0) { Alert.alert('Check shares', 'Enter how many shares you bought.'); return; }
    if (priceNum <= 0) { Alert.alert('Check price', 'Enter the price you paid per share.'); return; }
    setSubmitting(true);
    try {
      await addLot({
        ticker: selected.symbol,
        companyName: selected.name,
        shares: sharesNum,
        buyPrice: priceNum,
        buyFees: fees ? Number(fees.total.toFixed(2)) : 0,
      });
      close();
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.response?.data?.message || e?.message || 'Could not add holding.');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handleRow}>
            <Text style={styles.sheetTitle}>{selected ? 'Add holding' : 'Choose a stock'}</Text>
            <TouchableOpacity onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {!selected ? (
            <>
              <View style={styles.search}>
                <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or symbol"
                  placeholderTextColor={colors.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                />
              </View>
              <FlatList
                data={results}
                keyExtractor={(s) => s.id.toString()}
                keyboardShouldPersistTaps="handled"
                style={{ marginTop: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.pickRow} onPress={() => pick(item)} activeOpacity={0.6}>
                    <View style={[styles.logo, { backgroundColor: item.logoColor || colors.surface }]}>
                      <Text style={styles.logoText}>{item.symbol.slice(0, 3)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.pickTicker}>{item.symbol}</Text>
                      <Text style={styles.pickName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text style={styles.pickPrice}>₵{item.currentPrice?.toFixed(2)}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No stocks match your search.</Text>}
              />
            </>
          ) : (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.selectedChip} onPress={() => setSelected(null)} activeOpacity={0.7}>
                  <View style={[styles.logo, { backgroundColor: selected.logoColor || colors.surface }]}>
                    <Text style={styles.logoText}>{selected.symbol.slice(0, 3)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.pickTicker}>{selected.symbol}</Text>
                    <Text style={styles.pickName} numberOfLines={1}>{selected.name}</Text>
                  </View>
                  <Text style={styles.changeStock}>Change</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Shares</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={shares}
                  onChangeText={setShares} placeholder="e.g. 100" placeholderTextColor={colors.textSecondary} />

                <Text style={styles.label}>Price paid per share (₵)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={buyPrice}
                  onChangeText={setBuyPrice} placeholder="0.00" placeholderTextColor={colors.textSecondary} />
                <Text style={styles.hint}>
                  Defaults to today’s price. Change it if you bought earlier at a different price.
                </Text>
                {selected.currentPrice != null && (
                  <TouchableOpacity onPress={() => setBuyPrice(selected.currentPrice.toFixed(2))}>
                    <Text style={styles.useLive}>Use today’s price (₵{selected.currentPrice.toFixed(2)})</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.label}>Broker commission</Text>
                <View style={styles.pillRow}>
                  {COMMISSION_OPTIONS.map((opt) => {
                    const active = opt.value === commissionRate;
                    return (
                      <TouchableOpacity key={opt.value} onPress={() => setCommissionRate(opt.value)}
                        style={[styles.pill, active && styles.pillActive]} activeOpacity={0.7}>
                        <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {fees && (
                  <View style={styles.feeBox}>
                    <View style={styles.feeLine}>
                      <Text style={styles.feeLabel}>Shares × price</Text><Text style={styles.feeVal}>{money(tradeValue)}</Text>
                    </View>
                    <View style={styles.feeLine}>
                      <Text style={styles.feeLabel}>Commission + VAT</Text><Text style={styles.feeVal}>{money(fees.commission + fees.vat)}</Text>
                    </View>
                    <View style={styles.feeLine}>
                      <Text style={styles.feeLabel}>GSE + CSD + SEC levies</Text><Text style={styles.feeVal}>{money(fees.gseLevy + fees.csdLevy + fees.secLevy)}</Text>
                    </View>
                    <View style={[styles.feeLine, styles.feeTotalLine]}>
                      <Text style={styles.feeTotalLabel}>Total cost</Text><Text style={styles.feeTotalVal}>{money(totalCost)}</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity style={[styles.submit, !canSubmit && styles.submitDisabled]}
                  onPress={submit} disabled={!canSubmit} activeOpacity={0.8}>
                  {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Add to portfolio</Text>}
                </TouchableOpacity>
                <View style={{ height: 24 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: SIZES.padding, paddingTop: 16, maxHeight: '88%',
    },
    handleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sheetTitle: { color: c.textMain, fontSize: 20, fontWeight: '700' },
    search: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
      borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    },
    searchInput: { flex: 1, color: c.textMain, fontSize: 15, padding: 0 },
    pickRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
    logo: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
    pickTicker: { color: c.textMain, fontSize: 16, fontWeight: '700' },
    pickName: { color: c.textSecondary, fontSize: 13, marginTop: 1 },
    pickPrice: { color: c.textMain, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
    empty: { color: c.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 30 },
    selectedChip: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
      borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 12, marginBottom: 6,
    },
    changeStock: { color: c.primary, fontSize: 13, fontWeight: '600' },
    label: { color: c.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
    input: {
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12, color: c.textMain, fontSize: 16, fontVariant: ['tabular-nums'],
    },
    hint: { color: c.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 17 },
    useLive: { color: c.primary, fontSize: 13, marginTop: 8 },
    pillRow: { flexDirection: 'row', gap: 8 },
    pill: {
      paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
    },
    pillActive: { backgroundColor: c.primary, borderColor: c.primary },
    pillText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    pillTextActive: { color: '#FFFFFF' },
    feeBox: {
      backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
      borderRadius: 14, padding: 14, marginTop: 20,
    },
    feeLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    feeLabel: { color: c.textSecondary, fontSize: 13 },
    feeVal: { color: c.textMain, fontSize: 14, fontVariant: ['tabular-nums'] },
    feeTotalLine: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 6, paddingTop: 10 },
    feeTotalLabel: { color: c.textMain, fontSize: 15, fontWeight: '700' },
    feeTotalVal: { color: c.textMain, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
    submit: {
      backgroundColor: c.primary, borderRadius: 12, paddingVertical: 15,
      alignItems: 'center', justifyContent: 'center', marginTop: 24,
    },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });