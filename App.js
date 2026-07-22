import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PersonalDetailsScreen from './screens/PersonalDetailsScreen';
import BiometricScreen from './screens/BiometricScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SetPinScreen from './screens/SetPinScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import PinLockScreen from './screens/PinLockScreen';
import SecurityScreen from './screens/SecurityScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import InvestScreen from './screens/InvestScreen';
import StockDetailScreen from './screens/StockDetailScreen';
import PulseScreen from './screens/PulseScreen';
import LearnScreen from './screens/LearnScreen';
import ProfileScreen from './screens/ProfileScreen';
import IndexDetailScreen from './screens/IndexDetailScreen';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import NotificationScreen from './screens/NotificationScreen';
import { useTheme } from './context/ThemeContext';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


/* ---------------- TABS ---------------- */
function MainTabs({ onLogout }) {

  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
      tabBarActiveTintColor: colors.primary,
tabBarInactiveTintColor: colors.textSecondary,
tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    paddingBottom: 5,
},
       headerStyle: {
    backgroundColor: colors.background,
},
       headerTitleStyle: {
    color: colors.textMain,
},
        headerTitleAlign: 'center',
        tabBarItemStyle: {
  flex: 1,
},
      })}
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
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      /><Tab.Screen
  name="Profile"
  options={{
    tabBarButton: () => null,
    tabBarItemStyle: {
      display: 'none',
    },
    headerShown: false,
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
  const handleUnlock = () => {

  setPinRequired(false);

};

 const [loading, setLoading] = useState(true);
const [token, setToken] = useState(null);
const [pinRequired, setPinRequired] = useState(false);
const [biometricEnabled, setBiometricEnabled] = useState(false);
console.log("CURRENT TOKEN STATE:", token);

const checkAuth = async () => {

  try {

    const savedToken = await AsyncStorage.getItem('token');

    console.log("TOKEN FROM STORAGE:", savedToken);


    setToken(savedToken);



    if(savedToken){

      const savedPin = await AsyncStorage.getItem('appPin');

const biometric =
await AsyncStorage.getItem('biometricEnabled');

setBiometricEnabled(
biometric === "true"
);
      if(savedPin){

  if(biometric === "true"){

    await authenticateBiometric();

  }else{

    setPinRequired(true);

  }

}else{

  setPinRequired(false);

}

    }


  } catch(err){

    console.log(
      "Auth check error:",
      err
    );

  } finally {

    setLoading(false);

  }

};
const authenticateBiometric = async () => {

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock StockLens",
    fallbackLabel: "Use PIN"
  });

  if(result.success){

    setPinRequired(false);

  }else{

    // If biometric fails or is cancelled,
    // fall back to the PIN screen.
    setPinRequired(true);

  }

};

const handleLogout = async () => {
  try {

    console.log("STARTING LOGOUT");

    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userName');
    await AsyncStorage.removeItem('email');

    console.log("ALL USER DATA REMOVED");

    setToken(null);

    console.log("TOKEN STATE SET TO NULL");

  } catch (error) {
    console.log("LOGOUT ERROR:", error);
  }
};

  useEffect(() => {
    checkAuth();
  }, []);



  if (loading) return null;



  return (
   <AppProvider>

  <ThemeProvider>

    <NavigationContainer>
<Stack.Navigator
  key={token ? 'logged-in' : 'logged-out'}
  screenOptions={{ headerShown: false }}
>

{token ? (

  pinRequired ? (

    <Stack.Screen name="PinLock">
      {(props) => (
        <PinLockScreen
          {...props}
          onUnlock={handleUnlock}
        />
      )}
    </Stack.Screen>

  ) : (

    <Stack.Screen name="MainTabs">
      {(props) => (
        <MainTabs
          {...props}
          onLogout={handleLogout}
        />
      )}
    </Stack.Screen>

  )

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
    

    <Stack.Screen
      name="Register"
      component={RegisterScreen}
    />
  </>

)}


{/* PUT IT HERE */}
<Stack.Screen
  name="PersonalDetails"
  component={PersonalDetailsScreen}
/><Stack.Screen
  name="Security"
  component={SecurityScreen}
/><Stack.Screen
name="ChangePassword"
component={ChangePasswordScreen}
/>
<Stack.Screen
 name="SetPin"
 component={SetPinScreen}
/>
<Stack.Screen
 name="EditProfile"
 component={EditProfileScreen}
/>

<Stack.Screen
  name="IndexDetail"
  component={IndexDetailScreen}
/>
<Stack.Screen
 name="Biometric"
 component={BiometricScreen}
/>
<Stack.Screen
 name="Notifications"
 component={NotificationScreen}
/>
<Stack.Screen
  name="StockDetail"
  component={StockDetailScreen}
  options={{
    headerShown:false
  }}
/>


</Stack.Navigator>

      </NavigationContainer>

  </ThemeProvider>

</AppProvider>
  );
}