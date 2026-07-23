// utils/registerForPushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, LogBox } from 'react-native';

// This warning is a known, harmless side effect of importing expo-notifications
// on Android inside Expo Go (SDK 53+). It fires automatically on import and is
// purely informational - it does not affect the rest of the app.
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// Controls how notifications behave while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Requests permission and returns an Expo push token, or null if unavailable.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Expo Go on Android (SDK 53+) no longer supports remote push notifications.
  // Attempting it anyway triggers a loud internal console.error from
  // expo-notifications, so we detect this case and bail out quietly first.
  const isExpoGo = Constants?.appOwnership === 'expo';
  if (isExpoGo && Platform.OS === 'android') {
    console.log(
      'Skipping push token registration: Expo Go on Android does not support remote push notifications. ' +
      'A development build is required for real push delivery on Android.'
    );
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted.');
    return null;
  }

  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data;
  } catch (err: any) {
    console.log('Error getting push token:', err.message);
    return null;
  }
}