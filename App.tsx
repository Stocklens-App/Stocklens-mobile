import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import VerifyOtpScreen from './screens/VerifyOtpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import StockDetailScreen from './screens/StockDetailScreen';
import PulseScreen from './screens/PulseScreen';
import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';
import IndexDetailScreen from './screens/IndexDetailScreen';
import AccountSettingsScreen from './screens/AccountSettingsScreen';
import MyPortfolioScreen from './screens/MyPortfolioScreen';
import NotificationsScreen from './screens/NotificationsScreen';
// @ts-ignore - AppContext is still a plain JS module
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { ThemeColors } from './theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface MainTabNavigatorProps {
  route?: {
    params?: {
      userName?: string;
      [key: string]: any;
    };
  };
}

function MainTabNavigator({ route }: MainTabNavigatorProps) {
  const { colors } = useTheme();
  const { userName: contextName } = useAppContext();
  const userName = route?.params?.userName || contextName || 'User';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: 5 },
        headerStyle: { backgroundColor: colors.background, borderBottomColor: colors.border, elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: colors.textMain, fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        initialParams={{ userName }}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pulse"
        component={PulseScreen}
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, booting } = useAppContext();
  const { colors } = useTheme();

  // Still reading the stored session — don't decide anything yet, or a
  // returning user sees the login screen flash before landing on Home.
  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: colors.background },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      {token ? (
        // ── Signed in ──
        <>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              headerStyle: { backgroundColor: colors.background, borderBottomColor: colors.border },
              headerTitleStyle: { color: colors.textMain },
              headerTintColor: colors.primary,
            }}
          />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="MyPortfolio" component={MyPortfolioScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="IndexDetail" component={IndexDetailScreen} options={{ title: 'Index Details' }} />
          <Stack.Screen name="StockDetail" component={StockDetailScreen} />
        </>
      ) : (
        // ── Signed out ──
        <>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ gestureEnabled: false, ...TransitionPresets.FadeFromBottomAndroid }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Builds the React Navigation theme from our palette so the nav container,
// card backgrounds, and default text all switch with the app theme.
const buildNavTheme = (colors: ThemeColors, isDark: boolean): Theme => {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.primary,
      text: colors.textMain,
    },
  };
};

// Lives inside ThemeProvider so it can read useTheme; App itself can't.
function ThemedApp() {
  const { colors, isDark } = useTheme();
  return (
    <NavigationContainer theme={buildNavTheme(colors, isDark)}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </ThemeProvider>
  );
}