import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { COLORS, SIZES } from '../theme';

interface AboutScreenProps {
  navigation: {
    goBack: () => void;
    [key: string]: any;
  };
}

// Read straight from app.json so this never drifts from the released build.
const APP_VERSION: string = Constants.expoConfig?.version ?? '1.0.0';

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      /* No browser available — fail quietly rather than crashing the screen. */
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary || '#3478F6'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Ionicons name="trending-up" size={34} color={COLORS.textMain || '#FFF'} />
          </View>
          <Text style={styles.appName}>StockLens</Text>
          <Text style={styles.tagline}>The Ghana Stock Exchange, in plain language</Text>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </View>

        {/* What the app is for */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>WHAT STOCKLENS DOES</Text>
          <Text style={styles.body}>
            StockLens makes the Ghana Stock Exchange understandable to people investing for the
            first time. It shows live prices for every listed company, tells you what a given
            amount of money actually buys once broker commission and regulatory fees are taken
            out, and lets you track what you own in one place.
          </Text>
          <Text style={[styles.body, styles.bodySpaced]}>
            It also teaches as you go. Short lessons cover how shares work, how to read a price
            move, and how to recognise the scams that target new investors — because knowing
            what a fraudulent offer looks like matters more than any single stock pick.
          </Text>
        </View>

        {/* Disclaimer — the most important text on this screen */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHead}>
            <Ionicons name="alert-circle" size={17} color={COLORS.error || '#FF4D4D'} />
            <Text style={styles.disclaimerTitle}>Not financial advice</Text>
          </View>
          <Text style={styles.disclaimerBody}>
            StockLens is an information and education tool. Nothing in this app is a
            recommendation to buy or sell any security, and we are not licensed investment
            advisers.
          </Text>
          <Text style={[styles.disclaimerBody, styles.bodySpaced]}>
            Market data may be delayed or incomplete, and fee estimates are based on published
            rates that your broker may not match. The value of shares can fall as well as rise,
            and you may get back less than you put in. Always confirm figures with a licensed
            GSE dealing member before you trade.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => openLink('https://gse.com.gh')}
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>Ghana Stock Exchange</Text>
          <Ionicons name="open-outline" size={16} color={COLORS.textSecondary || '#7E8494'} />
        </TouchableOpacity>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} StockLens. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: SIZES.padding || 16,
    paddingBottom: 16,
  },
  backBtn: { width: 22 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain || '#FFF' },

  scrollContent: { paddingHorizontal: SIZES.padding || 16, paddingBottom: 40 },

  brandBlock: { alignItems: 'center', marginTop: 8, marginBottom: 26 },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary || '#3478F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    color: COLORS.textMain || '#FFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tagline: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
  versionPill: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
  },
  versionText: { color: COLORS.textSecondary || '#7E8494', fontSize: 11, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: SIZES.radius || 8,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  body: { color: COLORS.textMain || '#FFF', fontSize: 13.5, lineHeight: 21 },
  bodySpaced: { marginTop: 12 },

  disclaimerCard: {
    backgroundColor: 'rgba(255,77,77,0.09)',
    borderRadius: SIZES.radius || 8,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.38)',
    padding: 18,
    marginBottom: 14,
  },
  disclaimerHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  disclaimerTitle: {
    color: COLORS.error || '#FF4D4D',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },
  disclaimerBody: { color: COLORS.textMain || '#FFF', fontSize: 12.5, lineHeight: 19.5 },

  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: SIZES.radius || 8,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 16,
  },
  linkText: { color: COLORS.textMain || '#FFF', fontSize: 14, fontWeight: '500' },

  footer: {
    color: COLORS.textSecondary || '#7E8494',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
  },
});
