import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
// Reaches out of stocklens-mobile and into your root screens folder
import LearnScreen from '../screens/LearnScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#060D1A' }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <LearnScreen />
      </View>
    </SafeAreaView>
  );
}