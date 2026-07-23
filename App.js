import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
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
import { AppProvider, useAppContext } from './context/AppContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#11141A',
    card: '#1C212D',
    border: '#2A3245',
    primary: '#3478F6',
    text: '#FFFFFF',
  },
};

function MainTabNavigator({ route }) {
  const { userName: contextName } = useAppContext();
  const userName = route?.params?.userName || contextName || 'User';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3478F6',
        tabBarInactiveTintColor: '#7E8494',
        tabBarStyle: { backgroundColor: '#1C212D', borderTopColor: '#2A3245', paddingBottom: 5 },
        headerStyle: { backgroundColor: '#11141A', borderBottomColor: '#2A3245', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: '#FFF', fontWeight: 'bold' },
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
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Pulse"
        component={PulseScreen}
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { token, booting } = useAppContext();

  // Still reading the stored session — don't decide anything yet, or a
  // returning user sees the login screen flash before landing on Home.
  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#11141A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3478F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: '#11141A' },
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
              headerStyle: { backgroundColor: '#11141A', borderBottomColor: '#2A3245' },
              headerTitleStyle: { color: '#FFF' },
              headerTintColor: '#3478F6',
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

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer theme={AppTheme}>
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}