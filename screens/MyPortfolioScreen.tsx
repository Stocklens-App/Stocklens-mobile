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
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
// @ts-ignore - AppContext is still a plain JS module
import { useAppContext, api } from '../context/AppContext';

interface Holding {
  ticker: string;
  companyName: string;
  sector: string;
  logoColor: string;
  sparklineData: number[];
  currentPrice: number;
  priceChangePercent: number;
  quantity: number;
  avgBuyPrice: number;
  currentValue: number;
  costBasis: number;
  gainLossValue: number;
  gainLossPct: number;
}

interface PortfolioResponse {
  portfolioName: string;
  baseCurrency: string;
  preferredMarket: string;
  investmentGoal: string;
  riskLevel: string;
  visibility: string;
  alertsEnabled: boolean;
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalGainLossValue: number;
  totalGainLossPct: number;
}

interface MyPortfolioScreenProps {
  navigation: {
    goBack: () => void;
    [key: string]: any;
  };
}

export default function MyPortfolioScreen({ navigation }: MyPortfolioScreenProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const { currentUserEmail } = useAppContext();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editPortfolioModal, setEditPortfolioModal] = useState(false);
  const [portfolioName, setPortfolioName] = useState("");
  const [baseCurrency, setBaseCurrency] = useState("");
  const [preferredMarket, setPreferredMarket] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [ticker, setTicker] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [avgBuyPrice, setAvgBuyPrice] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchPortfolio = useCallback(() => {
    if (!currentUserEmail) {
      setLoading(false);
      return;
    }
    setError(null);
    api.get(`/api/portfolio?email=${encodeURIComponent(currentUserEmail)}`)
      .then(({ data }) => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Portfolio load error:", err.response?.status, err.message);
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
      await api.post('/api/portfolio', {
        email: currentUserEmail,
        ticker: ticker.trim().toUpperCase(),
        quantity: parseFloat(quantity),
        avgBuyPrice: parseFloat(avgBuyPrice),
      });
      Keyboard.dismiss();
      setModalVisible(false);
      resetForm();
      fetchPortfolio();
    } catch (err: any) {
      Alert.alert('Add failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHolding = (holdingTicker: string) => {
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
              await api.delete(
                `/api/portfolio?email=${encodeURIComponent(currentUserEmail ?? '')}&ticker=${encodeURIComponent(holdingTicker)}`
              );
              fetchPortfolio();
            } catch (err: any) {
              Alert.alert('Remove failed', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEditPortfolio = async () => {
    try {
      await api.put("/api/portfolio/settings", {
        userEmail: currentUserEmail,
        portfolioName: portfolio?.portfolioName,
        baseCurrency: portfolio?.baseCurrency,
        preferredMarket: portfolio?.preferredMarket,
        investmentGoal: portfolio?.investmentGoal,
        riskLevel: portfolio?.riskLevel,
        visibility: portfolio?.visibility,
        alertsEnabled: portfolio?.alertsEnabled,
      });
      Alert.alert("Success", "Portfolio updated.");
      fetchPortfolio();
    } catch (err) {
      Alert.alert("Error", "Could not update portfolio.");
    }
  };

  const handleDeletePortfolio = () => {
    Alert.alert(
      "Delete Portfolio",
      "Are you sure you want to delete this portfolio?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Delete portfolio API will go here");
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const holdings = portfolio?.holdings || [];
  const totalValue = portfolio?.totalValue || 0;
  const totalGainLossValue = portfolio?.totalGainLossValue || 0;
  const totalGainLossPct = portfolio?.totalGainLossPct || 0;
  const isPositive = totalGainLossValue >= 0;

  const portfolioDetails = [
    { title: "Portfolio Name", value: portfolio?.portfolioName || "Not set", icon: "briefcase-outline" },
    { title: "Base Currency", value: portfolio?.baseCurrency || "Not set", icon: "cash-outline" },
    { title: "Preferred Market", value: portfolio?.preferredMarket || "Not set", icon: "bar-chart-outline" },
    { title: "Investment Goal", value: portfolio?.investmentGoal || "Not set", icon: "trending-up-outline" },
    { title: "Risk Level", value: portfolio?.riskLevel || "Not set", icon: "speedometer-outline" },
    { title: "Portfolio Visibility", value: portfolio?.visibility || "Not set", icon: "lock-closed-outline" },
    { title: "Portfolio Alerts", value: portfolio?.alertsEnabled ? "Enabled" : "Disabled", icon: "notifications-outline" },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="chevron-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerIcon}>
          <Ionicons name="add" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.portfolioName}>
            {portfolio?.portfolioName || "My Portfolio"}
          </Text>
          <Text style={styles.summaryLabel}>TOTAL VALUE</Text>
          <Text style={styles.summaryValue}>GHS {totalValue.toFixed(2)}</Text>
          <View style={styles.gainBadge}>
            <Ionicons
              name={isPositive ? "trending-up" : "trending-down"}
              size={16}
              color={isPositive ? colors.success : colors.error}
            />
            <Text style={[styles.summaryChange, { color: isPositive ? colors.success : colors.error }]}>
              {isPositive ? '+' : ''}{totalGainLossPct.toFixed(2)}%{' Today'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Portfolio Details</Text>
          {portfolioDetails.map((item) => (
            <View key={item.title} style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <View style={styles.detailIcon}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.detailTitle}>{item.title}</Text>
                  <Text style={styles.detailValue}>{item.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!error && holdings.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="briefcase-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>You haven't added any holdings yet.</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyAddBtnText}>Add your first holding</Text>
            </TouchableOpacity>
          </View>
        )}

        {holdings.map((h) => {
          const isUp = h.gainLossValue >= 0;
          const color = isUp ? colors.success : colors.error;
          return (
            <View key={h.ticker} style={styles.holdingCard}>
              <View style={styles.holdingTopRow}>
                <View style={[styles.logo, { backgroundColor: h.logoColor || colors.primary }]}>
                  <Text style={styles.logoText}>{h.ticker.slice(0, 3)}</Text>
                </View>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingTicker}>{h.ticker}</Text>
                  <Text style={styles.holdingCompany} numberOfLines={1}>{h.companyName}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveHolding(h.ticker)} style={styles.removeBtn}>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Holding</Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Ticker Symbol</Text>
              <TextInput
                style={styles.input}
                value={ticker}
                onChangeText={setTicker}
                placeholder="e.g. MTNGH"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="e.g. 100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Average Buy Price (GHS)</Text>
              <TextInput
                style={styles.input}
                value={avgBuyPrice}
                onChangeText={setAvgBuyPrice}
                placeholder="e.g. 2.35"
                placeholderTextColor={colors.textSecondary}
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
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    center: { alignItems: 'center', justifyContent: 'center' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 56,
      paddingHorizontal: SIZES.padding,
      paddingBottom: 16,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: c.textMain },
    scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 40 },
    summaryCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
    },
    summaryLabel: { color: c.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    summaryValue: { color: c.textMain, fontSize: 32, fontWeight: '700', marginBottom: 6 },
    summaryChange: { fontSize: 14, fontWeight: '600' },
    portfolioName: {
      color: c.textMain,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 14,
    },
    gainBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: 'rgba(52,120,246,0.08)',
    },
    errorBox: { padding: 16, alignItems: 'center' },
    errorText: { color: c.textSecondary, fontSize: 14, textAlign: 'center' },
    emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyText: { color: c.textSecondary, fontSize: 14, textAlign: 'center' },
    emptyAddBtn: {
      marginTop: 8,
      backgroundColor: c.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },
    emptyAddBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    holdingCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 14,
    },
    holdingTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
    logo: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    holdingInfo: { flex: 1 },
    holdingTicker: { color: c.textMain, fontSize: 15, fontWeight: '700' },
    holdingCompany: { color: c.textSecondary, fontSize: 12, marginTop: 1 },
    removeBtn: { padding: 6 },
    holdingStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    statLabel: { color: c.textSecondary, fontSize: 11, marginBottom: 4 },
    statValue: { color: c.textMain, fontSize: 13, fontWeight: '600' },
    gainLossRow: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 },
    gainLossText: { fontSize: 13, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 36,
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: c.textMain, fontSize: 18, fontWeight: '700' },
    label: { color: c.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 12 },
    input: {
      backgroundColor: c.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: c.textMain,
      fontSize: 14,
    },
    primaryButton: {
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 20,
    },
    primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    buttonDisabled: { opacity: 0.6 },
    sectionContainer: { marginBottom: 20 },
    sectionTitle: { color: c.textMain, fontSize: 18, fontWeight: '700', marginBottom: 12 },
    detailRow: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(52,120,246,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailTitle: { color: c.textSecondary, fontSize: 12 },
    detailValue: { color: c.textMain, fontSize: 14, fontWeight: '600', marginTop: 2 },
  });