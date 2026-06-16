import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme'; // 👈 Importing your new style guide

export default function DashboardScreen({ route, navigation }) {
  const rawName = route?.params?.userName || 'User';

  const MAX_LENGTH = 8;
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
        <Ionicons 
          name="person-circle" 
          size={36} 
          color={COLORS.primary} 
          style={style.profileAvatar} 
        />
        
        <View style={style.nameAndChevronRow}>
          <Text style={style.userName}>{formattedName}</Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={COLORS.textSecondary} 
            style={style.chevron} 
          />
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    padding: SIZES.padding, 
    paddingTop: 60 
  },
  profileHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    marginBottom: 40, 
  },
  profileAvatar: { 
    marginRight: 8 
  },
  nameAndChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: { 
    color: COLORS.textMain, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  chevron: { 
    marginLeft: 4 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  statCard: { 
    backgroundColor: COLORS.surface, 
    padding: SIZES.padding, 
    borderRadius: 12, // Keeping slightly rounder for cards as per your original design
    width: '48%', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  statLabel: { 
    color: COLORS.textSecondary, 
    fontSize: 11, 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  statValue: { 
    color: COLORS.primary, 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
});