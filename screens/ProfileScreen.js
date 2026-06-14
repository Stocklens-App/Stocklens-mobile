import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

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
  container: { flex: 1, backgroundColor: '#11141A', padding: 20, justifyContent: 'center', alignItems: 'center' },
  titleText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subText: { color: '#7E8494', fontSize: 14, marginBottom: 40 },
  logoutButton: { backgroundColor: '#FF4D4D', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, width: '100%', maxWidth: 260, alignItems: 'center' },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});