import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../theme'; 
import { useAppContext } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUserEmail, notificationsEnabled, toggleNotifications } = useAppContext();

  useEffect(() => {
  if (!currentUserEmail) {
    setLoading(false);
    return;
  }
  fetch(`http://10.148.37.167:8081/api/users/profile?email=${encodeURIComponent(currentUserEmail)}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      setUserData(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Backend Connection Error: ", err.message);
      setLoading(false);
    });
}, [currentUserEmail]);
  const totalModules = 80;
  const progressPercent = userData?.modulesCompleted 
    ? (userData.modulesCompleted / totalModules) * 100 
    : 0;

  return (
    <View style={style.container}>
      <ScrollView contentContainerStyle={style.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Identity Section */}
        <View style={style.profileSection}>
          <View style={style.avatar}>
            <Text style={style.avatarText}>{userData?.name ? userData.name[0] : 'U'}</Text>
          </View>
          <Text style={style.name}>{userData?.name}</Text>
          
          <Text style={style.email}>{userData?.email}</Text>
        </View>

        {/* Learning Progress Card */}
        <View style={style.card}>
          <View style={style.cardHeaderRow}>
            <Text style={style.cardTitle}>LEARNING PROGRESS</Text>
            <Text style={style.cardMetricValue}>{userData?.modulesCompleted} / {totalModules}</Text>
          </View>
          <Text style={style.subTextLabel}>Modules Completed</Text>
          
          <View style={style.progressBarTrack}>
            <View style={[style.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={style.streakRow}>
            <Text style={style.streakIcon}>📅🔥</Text>
            <View>
              <Text style={style.streakText}>{userData?.streakDays} Days</Text>
              <Text style={style.subTextLabel}>Current Streak</Text>
            </View>
          </View>
        </View>

        {/* Portfolio Summary Card */}
        <View style={style.card}>
          <Text style={style.cardTitle}>PORTFOLIO SUMMARY</Text>
          <View style={style.portfolioRow}>
            <View>
              <Text style={style.portfolioValue}>GHS {userData?.portfolioValue?.toFixed(2)}</Text>
              <Text style={style.portfolioReturn}>+{userData?.portfolioReturnPct}% ↗</Text>
            </View>
            <Text style={style.sparklineGraphic}>📈</Text>
          </View>
        </View>

        {/* Options Row Accordeons */}
        <TouchableOpacity
          style={style.actionRow}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Text style={style.actionText}>Account Settings ›</Text>
          <Text style={style.chevron}>∨</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.actionRow}
          onPress={() => navigation.navigate('MyPortfolio')}
        >
          <Text style={style.actionText}>My Portfolio</Text>
          <Text style={style.chevron}>∨</Text>
        </TouchableOpacity>

        <View style={style.actionRow}>
          <Text style={style.actionText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#263143', true: COLORS.primary || '#2F80ED' }}
            thumbColor={'#FFF'}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={style.logoutButton} 
          onPress={() => navigation.replace('Login')}
        >
          <Text style={style.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: { 
    paddingHorizontal: SIZES.padding || 20, 
    paddingBottom: 40 
  },
  profileSection: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: COLORS.primary || '#2F80ED', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  avatarText: { 
    color: COLORS.textMain, 
    fontSize: 44, 
    fontWeight: 'bold' 
  },
  name: { 
    color: COLORS.textMain, 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  username: { 
    color: COLORS.textSecondary, 
    fontSize: 16, 
    marginTop: 4 
  },
  email: { 
    color: COLORS.textSecondary, 
    fontSize: 14, 
    marginTop: 2 
  },
  card: { 
    backgroundColor: '#161C26', 
    borderRadius: SIZES.radius || 16, 
    padding: 18, 
    marginBottom: 16 
  },
  cardHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  cardTitle: { 
    color: COLORS.textSecondary, 
    fontSize: 12, 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
  cardMetricValue: { 
    color: COLORS.textMain, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  subTextLabel: { 
    color: '#56667A', 
    fontSize: 12, 
    marginTop: 2 
  },
  progressBarTrack: { 
    height: 6, 
    backgroundColor: '#263143', 
    borderRadius: 3, 
    marginVertical: 12 
  },
  progressBarFill: { 
    height: 6, 
    backgroundColor: COLORS.textMain, 
    borderRadius: 3 
  },
  streakRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8 
  },
  streakIcon: { 
    fontSize: 24, 
    marginRight: 12 
  },
  streakText: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  portfolioRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 8 
  },
  portfolioValue: { 
    color: COLORS.textMain, 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  portfolioReturn: { 
    color: '#27AE60', 
    fontSize: 14, 
    fontWeight: '600', 
    marginTop: 4 
  },
  sparklineGraphic: { 
    fontSize: 32 
  },
  actionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#161C26', 
    borderRadius: SIZES.radius || 16, 
    padding: 18, 
    marginBottom: 12 
  },
  actionText: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '500' 
  },
  chevron: { 
    color: '#56667A', 
    fontSize: 14 
  },
  logoutButton: { 
    backgroundColor: COLORS.error, 
    paddingVertical: 14, 
    borderRadius: SIZES.radius || 16, 
    width: '100%', 
    alignItems: 'center',
    marginTop: 20
  },
  logoutText: { 
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: '600' 
  }
});