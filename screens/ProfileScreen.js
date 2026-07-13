import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../theme';

export default function ProfileScreen({ onLogout }) {

  const handleLogout = async () => {
    try {
      // Remove saved login
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userName');

      console.log("USER LOGGED OUT");

      // Tell App.js to refresh authentication
      if (onLogout) {
        await onLogout();
      }

    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>My Profile</Text>
      <Text style={styles.subText}>Manage your StockLens credentials</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 40
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: SIZES.radius,
    width: '100%',
    maxWidth: 260,
    alignItems: 'center'
  },
  logoutText: {
    color: COLORS.textMain,
    fontSize: 16,
    fontWeight: '600'
  }
});