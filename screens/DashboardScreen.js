import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ route, navigation }) {
  const rawName = route?.params?.userName || 'User';

  const MAX_LENGTH = 12;
  const formattedName = rawName.length > MAX_LENGTH 
    ? `${rawName.slice(0, MAX_LENGTH)}...` 
    : rawName;

  return (
    <View style={style.container}>
      
      {/* 👤 SEAMLESS, BORDERLESS PROFILE ITEM */}
      <TouchableOpacity 
        style={style.profileHeaderRow}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.6}
      >
        <Ionicons name="person-circle" size={36} color="#3478F6" style={style.profileAvatar} />
        
        <View style={style.nameAndChevronRow}>
          <Text style={style.userName}>{formattedName}</Text>
          {/* Chevron positioned right next to the text string */}
          <Ionicons name="chevron-forward" size={16} color="#7E8494" style={style.chevron} />
        </View>
      </TouchableOpacity>

      {/* 📊 QUICK STATS CARDS */}
      <View style={style.statsRow}>
        <View style={style.statCard}>
          <Text style={style.statLabel}>Total Stock</Text>
          <Text style={style.statValue}>1,240</Text>
        </View>
        <View style={style.statCard}>
          <Text style={style.statLabel}>Today's Sales</Text>
          <Text style={style.statValue}>GH₵ 450</Text>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#11141A', padding: 20, paddingTop: 50 },
  profileHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', // 👈 Stops the clickable area from stretching across the entire screen
    marginBottom: 40, 
  },
  profileAvatar: { marginRight: 8 },
  nameAndChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  chevron: { marginLeft: 4 }, // 👈 Keeps the chevron closely following the text letters
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  statCard: { backgroundColor: '#1C212D', padding: 20, borderRadius: 12, width: '48%', borderWidth: 1, borderColor: '#2A3245' },
  statLabel: { color: '#7E8494', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' },
  statValue: { color: '#3478F6', fontSize: 20, fontWeight: 'bold' },
});