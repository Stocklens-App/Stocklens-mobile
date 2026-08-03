// components/AddDividendModal.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { useAppContext } from '../context/AppContext';

const todayISO = () => new Date().toISOString().slice(0, 10);
type Props = { visible: boolean; ticker: string | null; onClose: () => void };

export default function AddDividendModal({ visible, ticker, onClose }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { addDividend } = useAppContext();

  const [amount, setAmount] = useState('');
  const [perShare, setPerShare] = useState('');
  const [date, setDate] = useState(todayISO());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) { setAmount(''); setPerShare(''); setDate(todayISO()); setSubmitting(false); }
  }, [visible]);

  const amountNum = parseFloat(amount) || 0;

  const submit = async () => {
    if (!ticker) return;
    if (amountNum <= 0) { Alert.alert('Check amount', 'Enter the total dividend received.'); return; }
    const isoOk = /^\d{4}-\d{2}-\d{2}$/.test(date.trim());
    setSubmitting(true);
    try {
      await addDividend({
        ticker,
        amount: amountNum,
        perShare: perShare ? parseFloat(perShare) : undefined,
        paymentDate: isoOk ? date.trim() : todayISO(),
      });
      onClose();
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.response?.data?.message || e?.message || 'Could not log dividend.');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
          <View style={styles.handleRow}>
            <Text style={styles.title}>Log dividend{ticker ? ` · ${ticker}` : ''}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Total received (₵)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount}
            placeholder="0.00" placeholderTextColor={colors.textSecondary} />

          <Text style={styles.label}>Per share (₵) — optional</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={perShare} onChangeText={setPerShare}
            placeholder="e.g. 0.12" placeholderTextColor={colors.textSecondary} />

          <Text style={styles.label}>Payment date</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate}
            placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSecondary} autoCapitalize="none" />

          <TouchableOpacity style={[styles.submit, (amountNum <= 0 || submitting) && styles.submitDisabled]}
            onPress={submit} disabled={amountNum <= 0 || submitting} activeOpacity={0.8}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Save dividend</Text>}
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
    handleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { color: c.textMain, fontSize: 19, fontWeight: '700' },
    label: { color: c.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 6 },
    input: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: c.textMain, fontSize: 16, fontVariant: ['tabular-nums'] },
    submit: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
    submitDisabled: { opacity: 0.5 },
    submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  });
  