import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import our new screens (We will paste code into these next!)
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 🗺️ THIS HANDLES THE 4 MAIN TABS + THE TOP PROFILE BUTTON
// 🗺️ UPDATED MAIN TABS CONFIGURATION
function MainTabNavigator({ navigation, route }) {
  // Grab the userName passed from LoginScreen safely
  const userName = route?.params?.userName || 'User';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3478F6',
        tabBarInactiveTintColor: '#7E8494',
        tabBarStyle: { backgroundColor: '#1C212D', borderTopColor: '#2A3245', paddingBottom: 5 },
        headerStyle: { backgroundColor: '#11141A', borderBottomColor: '#2A3245', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { color: '#FFF', fontWeight: 'bold' },
        headerTitleAlign: 'center', // 🎯 FORCES THE NAME TO THE EXACT MIDDLE OF THE HEADER
      }}
    >
      {/* 1️⃣ HOME TAB (WITH PROFILE BUTTON ONLY HERE) */}
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        initialParams={{ userName: userName }} // Pass the user name down to the dashboard
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerShown : false,
          // 👤 PROFILE BUTTON SITUATED ONLY ON THE HOME CORNER
          headerRight: () => (
            <TouchableOpacity 
              style={{ paddingRight: 16 }} 
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle" size={28} color="#3478F6" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 2️⃣ INVEST TAB */}
      <Tab.Screen 
        name="Invest" 
        component={DashboardScreen} // Temporary placeholder
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
          headerRight: null, // Ensures profile is stripped completely
        }}
      />

      {/* 3️⃣ PULSE TAB */}
      <Tab.Screen 
        name="Pulse" 
        component={DashboardScreen} // Temporary placeholder
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
          headerRight: null,
        }}
      />

      {/* 4️⃣ LEARN TAB */}
      <Tab.Screen 
        name="Learn" 
        component={DashboardScreen} // Temporary placeholder
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
          headerRight: null,
        }}
      />
    </Tab.Navigator>
  );
}

// 🚦 GLOBAL ROUTING CONTROLLER
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth Flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main Application Flow */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Dedicated Profile Stack Screen */}
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#11141A', borderBottomColor: '#2A3245' },
            headerTitleStyle: { color: '#FFF' },
            headerTintColor: '#3478F6'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}