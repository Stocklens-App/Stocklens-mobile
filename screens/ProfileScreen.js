import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../theme'; // 👈 Centralized styling design tokens

export default function ProfileScreen({ navigation }) {
  return (
    <View style={style.container}>
      <Text style={style.titleText}>My Profile</Text>
      <Text style={style.subText}>Manage your StockLens credentials</Text>

      <TouchableOpacity 
        style={style.logoutButton} 
        onPress={() => navigation.replace('Login')}
      >
        <Text style={style.logoutText}>Log Out Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const style = StyleSheet.create({
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
    backgroundColor: COLORS.error, // 🔑 Linked to your system's error/danger highlight color
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