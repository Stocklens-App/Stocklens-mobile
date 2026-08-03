// components/SellLotModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { calculateFees, COMMISSION_OPTIONS } from '../constants/fees';
import type { PortfolioLot } from '../types';

const money = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const [w, d] = Math.abs(n).toFixed(2).split('.');
  return `${sign}₵${w.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${d}`;
};

type Props = {
  visible: boolean;
  lot: PortfolioLot | null;
  remaining: number;       // shares still held in this lot
  currentPrice: number | null;
  onClose: () => void;
};

export default function SellLotModal({ visible, lot, remaining, currentPrice, onClose }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { addSale } = useAppContext();

  const [sharesStr, setSharesStr] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(COMMISSION_OPTIONS[0].value);
  const [submitting, setSubmitting] = useState(false);

  // Reset each time it opens for a lot.
  React.useEffect(() => {
    if (visible && lot) {
      setSharesStr(String(remaining));
      setPriceStr(currentPrice != null ? currentPrice.toFixed(2) : '');
      setCommissionRate(COMMISSION_OPTIONS[0].value);
      setSubmitting(false);
    }
  }, [visible, lot, remaining, currentPrice]);

  const sharesNum = parseFloat(sharesStr) || 0;
  const priceNum = parseFloat(priceStr) || 0;
  const saleValue = sharesNum * priceNum;
  const fees = saleValue > 0 ? calculateFees(saleValue, commissionRate) : null;
  const netProceeds = saleValue - (fees?.total ?? 0);

  const overSell = sharesNum > remaining;
  const canSubmit =
    !!lot && sharesNum > 0 && !overSell && priceNum > 0 && !submitting;

  const submit = async () => {
    if (!lot) return;
    if (sharesNum <= 0) { Alert.alert('Check shares', 'Enter how many shares to sell.'); return; }
    if (overSell) { Alert.alert('Too many shares', `You only have ${remaining} left in this holding.`); return; }
    if (priceNum <= 0) { Alert.alert('Check price', 'Enter the price you sold at.'); return; }
    setSubmitting(true);
    try {
      await addSale({
        lotId: lot.id,
        sharesSold: sharesNum,
        salePrice: priceNum,
        saleFees: fees ? Number(fees.total.toFixed(2)) : 0,
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.response?.data?.message || e?.message || 'Could not record the sale.');
      setSubmitting(false);
    }
  };

  const costPerShare = lot && lot.shares > 0
    ? (lot.shares * lot.buyPrice + lot.buyFees) / lot.shares
    : 0;
  const realizedPreview = fees ? netProceeds - costPerShare * sharesNum : 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.handleRow}>
            <Text style={styles.title}>Sell {lot?.ticker ?? ''}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.available}>{remaining} share{remaining === 1 ? '' : 's'} available in this holding</Text>

          <Text style={styles.label}>Shares to sell</Text>
          <TextInput
            style={[styles.input, overSell && styles.inputError]}
            keyboardType="numeric" value={sharesStr} onChangeText={setSharesStr}
            placeholder="0" placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity onPress={() => setSharesStr(String(remaining))}>
            <Text style={styles.useAll}>Sell all {remaining}</Text>
          </TouchableOpacity>
          {overSell && <Text style={styles.errText}>You only have {remaining} shares here.</Text>}

          <Text style={styles.label}>Sale price per share (₵)</Text>
          <TextInput
            style={styles.input} keyboardType="numeric" value={priceStr} onChangeText={setPriceStr}
            placeholder="0.00" placeholderTextColor={colors.textSecondary}
          />
          {currentPrice != null && (
            <TouchableOpacity onPress={() => setPriceStr(currentPrice.toFixed(2))}>
              <Text style={styles.useAll}>Use today’s price (₵{currentPrice.toFixed(2)})</Text>
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

          {fees && !overSell && (
            <View style={styles.box}>
              <View style={styles.line}><Text style={styles.lineLabel}>Sale value</Text><Text style={styles.lineVal}>{money(saleValue)}</Text></View>
              <View style={styles.line}><Text style={styles.lineLabel}>Sell fees</Text><Text style={styles.lineVal}>-{money(fees.total)}</Text></View>
              <View style={styles.line}><Text style={styles.lineLabel}>Net proceeds</Text><Text style={styles.lineVal}>{money(netProceeds)}</Text></View>
              <View style={[styles.line, styles.totalLine]}>
                <Text style={styles.totalLabel}>Realized {realizedPreview >= 0 ? 'gain' : 'loss'}</Text>
                <Text style={[styles.totalVal, { color: realizedPreview >= 0 ? colors.success : colors.error }]}>
                  {money(realizedPreview)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={[styles.submit, !canSubmit && styles.submitDisabled]}
            onPress={submit} disabled={!canSubmit} activeOpacity={0.8}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Record sale</Text>}
          </TouchableOpacity>
          <View style={{ height: 12 }} />
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: SIZES.padding, paddingTop: 16, paddingBottom: 20 },
    handleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    title: { color: c.textMain, fontSize: 19, fontWeight: '700' },
    available: { color: c.textSecondary, fontSize: 13, marginBottom: 4 },
    label: { color: c.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
    input: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: c.textMain, fontSize: 16, fontVariant: ['tabular-nums'] },
    inputError: { borderColor: c.error },
    useAll: { color: c.primary, fontSize: 13, marginTop: 8 },
    errText: { color: c.error, fontSize: 12, marginTop: 6 },
    pillRow: { flexDirection: 'row', gap: 8 },
    pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    pillActive: { backgroundColor: c.primary, borderColor: c.primary },
    pillText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    pillTextActive: { color: '#FFFFFF' },
    box: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 14, marginTop: 20 },
    line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    lineLabel: { color: c.textSecondary, fontSize: 13 },
    lineVal: { color: c.textMain, fontSize: 14, fontVariant: ['tabular-nums'] },
    totalLine: { borderTopWidth: 1, borderTopColor: c.border, marginTop: 6, paddingTop: 10 },
    totalLabel: { color: c.textMain, fontSize: 15, fontWeight: '700' },
    totalVal: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
    submit: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });