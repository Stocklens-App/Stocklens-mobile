import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import PulseScreen from './screens/PulseScreen';
import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';
import IndexDetailScreen from './screens/IndexDetailScreen';

import { AppProvider } from './context/AppContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/* ---------------- TABS ---------------- */
function MainTabs({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3478F6',
        tabBarInactiveTintColor: '#7E8494',
        tabBarStyle: {
          backgroundColor: '#1C212D',
          borderTopColor: '#2A3245',
          paddingBottom: 5,
        },
        headerStyle: {
          backgroundColor: '#11141A',
        },
        headerTitleStyle: { color: '#FFF' },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Pulse"
        component={PulseScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

     <Tab.Screen
  name="Profile"
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person" size={size} color={color} />
    ),
  }}
>
  {(props) => (
    <ProfileScreen
      {...props}
      onLogout={onLogout}
    />
  )}
</Tab.Screen>
    </Tab.Navigator>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

const checkAuth = async () => {
  try {
    const savedToken = await AsyncStorage.getItem('token');
    setToken(savedToken);
  } catch (err) {
    console.log('Auth check error:', err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  checkAuth();
}, []);

  if (loading) return null;

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
  <Stack.Screen name="MainTabs">
    {(props) => (
      <MainTabs
        {...props}
        onLogout={checkAuth}
      />
    )}
  </Stack.Screen>
) : (
            <>
              <Stack.Screen name="Login">
  {(props) => (
    <LoginScreen
      {...props}
      onLoginSuccess={checkAuth}
    />
  )}
</Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}

          <Stack.Screen name="IndexDetail" component={IndexDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}