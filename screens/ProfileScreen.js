import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { COLORS, SIZES } from '../theme';

export default function ProfileScreen({ onLogout }) {
const handleLogout = () => {
  if (onLogout) {
    onLogout();
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