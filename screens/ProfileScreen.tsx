import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { SIZES, ThemeColors } from '../theme';
import { useTheme } from '../theme/ThemeContext';
// @ts-ignore - AppContext is still a plain JS module
import { useAppContext, api } from '../context/AppContext';

interface UserData {
  name?: string;
  email?: string;
  modulesCompleted?: number;
  streakDays?: number;
  portfolioValue?: number;
  portfolioReturnPct?: number;
}

type ProfileScreenProps = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const style = makeStyles(colors);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, notificationsEnabled, toggleNotifications, signOut } = useAppContext();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/api/users/profile')
      .then(({ data }: { data: UserData }) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Profile load error:', err.message);
        setLoading(false);
      });
  }, [token]);

  const totalModules = 80;
  const progressPercent = userData?.modulesCompleted
    ? (userData.modulesCompleted / totalModules) * 100
    : 0;

  if (loading) {
    return (
      <View style={[style.container, style.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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

        {/* Options Rows */}
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

        {/* Appearance — dark / light toggle */}
        <View style={style.actionRow}>
          <Text style={style.actionText}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#B8C2D0', true: colors.primary }}
            thumbColor={'#FFF'}
          />
        </View>

        <View style={style.actionRow}>
          <Text style={style.actionText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#B8C2D0', true: colors.primary }}
            thumbColor={'#FFF'}
          />
        </View>

        {/* Logout — clearing the token swaps the navigator back to the
            signed-out stack on its own, so there's no navigate call here. */}
        <TouchableOpacity
          style={style.logoutButton}
          onPress={signOut}
        >
          <Text style={style.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingHorizontal: SIZES.padding,
      paddingBottom: 40,
    },
    profileSection: {
      alignItems: 'center',
      marginVertical: 20,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 44,
      fontWeight: 'bold',
    },
    name: {
      color: c.textMain,
      fontSize: 24,
      fontWeight: 'bold',
    },
    username: {
      color: c.textSecondary,
      fontSize: 16,
      marginTop: 4,
    },
    email: {
      color: c.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: SIZES.radius,
      padding: 18,
      marginBottom: 16,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    cardMetricValue: {
      color: c.textMain,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subTextLabel: {
      color: c.textSecondary,
      fontSize: 12,
      marginTop: 2,
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: c.border,
      borderRadius: 3,
      marginVertical: 12,
    },
    progressBarFill: {
      height: 6,
      backgroundColor: c.primary,
      borderRadius: 3,
    },
    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    streakIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    streakText: {
      color: c.textMain,
      fontSize: 16,
      fontWeight: 'bold',
    },
    portfolioRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    portfolioValue: {
      color: c.textMain,
      fontSize: 24,
      fontWeight: 'bold',
    },
    portfolioReturn: {
      color: c.success,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },
    sparklineGraphic: {
      fontSize: 32,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: SIZES.radius,
      padding: 18,
      marginBottom: 12,
    },
    actionText: {
      color: c.textMain,
      fontSize: 16,
      fontWeight: '500',
    },
    chevron: {
      color: c.textSecondary,
      fontSize: 14,
    },
    logoutButton: {
      backgroundColor: c.error,
      paddingVertical: 14,
      borderRadius: SIZES.radius,
      width: '100%',
      alignItems: 'center',
      marginTop: 20,
    },
    logoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });