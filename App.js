import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
<<<<<<< Updated upstream
import { Ionicons } from '@expo/vector-icons';

=======
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 🎯 ALL UNIQUE SCREEN IMPORTS
>>>>>>> Stashed changes
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import PulseScreen from './screens/PulseScreen';
import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';
<<<<<<< Updated upstream
import IndexDetailScreen from './screens/IndexDetailScreen';
import { AppProvider } from './context/AppContext';
=======
import InvestScreen from './screens/InvestScreen'; 
import PulseScreen from './screens/PulseScreen';   
import LearnScreen from './screens/learnscreen';  
>>>>>>> Stashed changes

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

<<<<<<< Updated upstream
=======
// 🗺️ MAIN TABS CONFIGURATION
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        initialParams={{ userName }}
=======
      {/* 1️⃣ HOME TAB */}
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        initialParams={{ userName: userName }}
>>>>>>> Stashed changes
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
<<<<<<< Updated upstream
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
=======
          headerShown : false,
        }}
      />

      {/* 2️⃣ INVEST TAB */}
      <Tab.Screen 
        name="Invest" 
        component={InvestScreen} 
        options={{
          tabBarLabel: 'Invest',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
          headerRight: null,
        }}
      />

      {/* 3️⃣ PULSE TAB */}
      <Tab.Screen 
        name="Pulse" 
        component={PulseScreen} 
>>>>>>> Stashed changes
        options={{
          tabBarLabel: 'Pulse',
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics" size={size} color={color} />,
        }}
      />
<<<<<<< Updated upstream
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
=======

      {/* 4️⃣ LEARN TAB */}
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen} 
>>>>>>> Stashed changes
        options={{
          tabBarLabel: 'Learn',
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
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}