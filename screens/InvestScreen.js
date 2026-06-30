import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';

export default function InvestScreen() {
  return (
    <View style={styles.container}>
      {/* Keeps your functional text update */}
      <Text style={styles.text}>Invest Section Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background || '#0A111E', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: SIZES.padding || 16 
  },
  text: { 
    color: COLORS.textMain || '#FFF', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});