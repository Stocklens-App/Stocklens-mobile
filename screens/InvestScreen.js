import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';

export default function InvestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Invest Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SIZES.padding },
  text: { color: COLORS.textMain, fontSize: 20, fontWeight: 'bold' },
});