import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { useAppContext } from '../context/AppContext';
import { IP_ADDRESS } from '../context/AppContext';

export default function MyPortfolioScreen({ navigation }) {
  const { currentUserEmail } = useAppContext();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPortfolio = useCallback(() => {
    if (!currentUserEmail) {
      setLoading(false);
      return;
    }
    setError(null);
    fetch(`http://${IP_ADDRESS}:8081/api/portfolio?email=${encodeURIComponent(currentUserEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Portfolio load error:', err.message);
        setError('Could not load your portfolio.');
        setLoading(false);
      });
  }, [currentUserEmail]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const resetForm = () => {
    setTicker('');
    setQuantity('');
    setAvgBuyPrice('');
  };

  const handleAddHolding = async () => {
    if (!ticker.trim() || !quantity.trim() || !avgBuyPrice.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://${IP_ADDRESS}:8081/api/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUserEmail,
          ticker: ticker.trim().toUpperCase(),
          quantity: parseFloat(quantity),
          avgBuyPrice: parseFloat(avgBuyPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : 'Failed to add holding');
      }
      setModalVisible(false);
      resetForm();
      fetchPortfolio();
    } catch (err) {
      Alert.alert('Add failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHolding = (holdingTicker) => {
    Alert.alert(
      'Remove holding',
      `Remove ${holdingTicker} from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `http://${IP_ADDRESS}:8081/api/portfolio?email=${encodeURIComponent(currentUserEmail)}&ticker=${encodeURIComponent(holdingTicker)}`,
                { method: 'DELETE' }
              );
              const data = await res.json();
              if (!res.ok) {
                throw new Error(typeof data === 'string' ? data : 'Failed to remove holding');
              }
              fetchPortfolio();
            } catch (err) {
              Alert.alert('Remove failed', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary || '#3478F6'} />
      </View>
    );
  }

  const holdings = portfolio?.holdings || [];
  const totalValue = portfolio?.totalValue || 0;
  const totalGainLossValue = portfolio?.totalGainLossValue || 0;
  const totalGainLossPct = portfolio?.totalGainLossPct || 0;
  const isPositive = totalGainLossValue >= 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary || '#3478F6'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Portfolio</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={COLORS.primary || '#3478F6'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.summaryValue}>GHS {totalValue.toFixed(2)}</Text>
          <Text style={[styles.summaryChange, { color: isPositive ? COLORS.success : COLORS.error }]}>
            {isPositive ? '+' : ''}{totalGainLossValue.toFixed(2)} ({isPositive ? '+' : ''}{totalGainLossPct.toFixed(2)}%)
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!error && holdings.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={40} color={COLORS.textSecondary || '#7E8494'} />
            <Text style={styles.emptyText}>You haven't added any holdings yet.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyAddBtnText}>Add your first holding</Text>
            </TouchableOpacity>
          </View>
        )}

        {holdings.map((h) => {
          const isUp = h.gainLossValue >= 0;
          const color = isUp ? COLORS.success : COLORS.error;
          return (
            <View key={h.ticker} style={styles.holdingCard}>
              <View style={styles.holdingTopRow}>
                <View style={[styles.logo, { backgroundColor: h.logoColor || COLORS.primary || '#3478F6' }]}>
                  <Text style={styles.logoText}>{h.ticker.slice(0, 3)}</Text>
                </View>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingTicker}>{h.ticker}</Text>
                  <Text style={styles.holdingCompany} numberOfLines={1}>{h.companyName}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveHolding(h.ticker)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.error || '#E74C3C'} />
                </TouchableOpacity>
              </View>

              <View style={styles.holdingStatsRow}>
                <View>
                  <Text style={styles.statLabel}>Quantity</Text>
                  <Text style={styles.statValue}>{h.quantity}</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Avg. Buy Price</Text>
                  <Text style={styles.statValue}>GHS {h.avgBuyPrice.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>Current Value</Text>
                  <Text style={styles.statValue}>GHS {h.currentValue.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.gainLossRow}>
                <Text style={[styles.gainLossText, { color }]}>
                  {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{h.gainLossValue.toFixed(2)} ({isUp ? '+' : ''}{h.gainLossPct.toFixed(2)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Holding Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Holding</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary || '#7E8494'} />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Ticker Symbol</Text>
            <TextInput
              style={styles.input}
              value={ticker}
              onChangeText={setTicker}
              placeholder="e.g. MTNGH"
              placeholderTextColor={COLORS.textSecondary || '#7E8494'}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="e.g. 100"
              placeholderTextColor={COLORS.textSecondary || '#7E8494'}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Average Buy Price (GHS)</Text>
            <TextInput
              style={styles.input}
              value={avgBuyPrice}
              onChangeText={setAvgBuyPrice}
              placeholder="e.g. 2.35"
              placeholderTextColor={COLORS.textSecondary || '#7E8494'}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleAddHolding}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Add Holding</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: SIZES.padding || 16,
    paddingBottom: 16,
  },
  backBtn: { width: 32 },
  addBtn: { width: 32, alignItems: 'flex-end' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain || '#FFF' },
  scrollContent: { paddingHorizontal: SIZES.padding || 16, paddingBottom: 40 },

  summaryCard: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryLabel: { color: COLORS.textSecondary || '#7E8494', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  summaryValue: { color: COLORS.textMain || '#FFF', fontSize: 32, fontWeight: '700', marginBottom: 6 },
  summaryChange: { fontSize: 14, fontWeight: '600' },

  errorBox: { padding: 16, alignItems: 'center' },
  errorText: { color: COLORS.textSecondary || '#7E8494', fontSize: 14, textAlign: 'center' },

  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: COLORS.textSecondary || '#7E8494', fontSize: 14, textAlign: 'center' },
  emptyAddBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary || '#3478F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyAddBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  holdingCard: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 16,
    marginBottom: 14,
  },
  holdingTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  holdingInfo: { flex: 1 },
  holdingTicker: { color: COLORS.textMain || '#FFF', fontSize: 15, fontWeight: '700' },
  holdingCompany: { color: COLORS.textSecondary || '#7E8494', fontSize: 12, marginTop: 1 },
  removeBtn: { padding: 6 },

  holdingStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  statLabel: { color: COLORS.textSecondary || '#7E8494', fontSize: 11, marginBottom: 4 },
  statValue: { color: COLORS.textMain || '#FFF', fontSize: 13, fontWeight: '600' },

  gainLossRow: { borderTopWidth: 1, borderTopColor: COLORS.border || '#2A3245', paddingTop: 10 },
  gainLossText: { fontSize: 13, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: COLORS.textMain || '#FFF', fontSize: 18, fontWeight: '700' },
  label: { color: COLORS.textSecondary || '#7E8494', fontSize: 12, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.background || '#11141A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textMain || '#FFF',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#3478F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});