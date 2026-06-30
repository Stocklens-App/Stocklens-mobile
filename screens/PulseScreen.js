import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';

export default function PulseScreen() {
  return (
    <View style={styles.container}>
      {/* Keeps your functional text update */}
      <Text style={styles.text}>Pulse Analytics coming soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background || '#11141A', 
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