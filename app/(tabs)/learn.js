import React from 'react';
import { View } from 'react-native';
// Uses explicit lowercase filename formatting match
import LearnScreen from '../../screens/learnscreen';

export default function LearnTabRoute() {
  return (
    <View style={{ flex: 1, backgroundColor: '#060D1A' }}>
      <LearnScreen />
    </View>
  );
}