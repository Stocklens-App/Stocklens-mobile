import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Image, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
export default function TabsLayout() {

  const router = useRouter();

 const { colors, darkMode } = useTheme();

  return (
    <Tabs
  key={darkMode ? 'dark' : 'light'}
  screenOptions={{
tabBarActiveTintColor: colors.primary,
       tabBarInactiveTintColor: colors.textSecondary,
               tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
       headerStyle: {
  backgroundColor: colors.red,
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 1,
        borderBottomColor: colors.border,
        },
       headerTintColor: colors.textMain,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        // 👤 Global top-left profile avatar button configuration
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={{ marginLeft: 16 }}
            activeOpacity={0.7}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
             backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
             borderColor: colors.primary
            }}>
              <Ionicons name="person" size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pulse"
        options={{
          title: 'Pulse',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      {/* 🙈 Hide the profile screen from the bottom tab bar visibility */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}