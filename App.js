import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import StockDetailScreen from './screens/StockDetailScreen';
import PulseScreen from './screens/PulseScreen';

import LearnScreen from './screens/LearnScreen'; // Note: Double check if 'learnScreen' or 'learnscreen' matches your folder

import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';
import IndexDetailScreen from './screens/IndexDetailScreen';
import { AppProvider } from './context/AppContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator({ navigation, route }) {
  const userName = route?.params?.userName || 'User';

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

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* Here is your IndexDetailScreen nested in the main stack */}
          <Stack.Screen 
            name="IndexDetail" 
            component={IndexDetailScreen} 

            options={{ headerShown: false, title: 'Index Details' }} 

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
          <Stack.Screen
            name="IndexDetail"
            component={IndexDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StockDetail"
            component={StockDetailScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}