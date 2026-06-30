import 'react-native-gesture-handler';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// 🎯 ALL UNIQUE SCREEN IMPORTS
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import PulseScreen from './screens/PulseScreen';
import LearnScreen from './screens/learnscreen'; // Note: Double check if 'learnScreen' or 'learnscreen' matches your folder
import ProfileScreen from './screens/ProfileScreen';

// ⏪ PUT BACK: IndexDetailScreen & AppProvider
import IndexDetailScreen from './screens/IndexDetailScreen';
import { AppProvider } from './context/AppContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 🗺 MAIN TABS CONFIGURATION
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
      {/* 1️⃣ HOME TAB */}
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

      {/* 2️⃣ INVEST TAB */}
      <Tab.Screen
        name="Invest"
        component={InvestScreen}
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />

      {/* 3️⃣ PULSE TAB */}
      <Tab.Screen
        name="Pulse"
        component={PulseScreen}
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
        }}
      />

      {/* 4️⃣ LEARN TAB */}
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// 🌐 ROOT NAVIGATION (Where your extra screens like IndexDetail live)
export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* Here is your IndexDetailScreen nested in the main stack */}
          <Stack.Screen 
            name="IndexDetail" 
            component={IndexDetailScreen} 
            options={{ headerShown: true, title: 'Index Details' }} 
          />
          
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}