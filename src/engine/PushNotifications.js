import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';
import { backendConfigured, callAccountApi } from './BackendClient';

if (Platform.OS === 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
    }),
  });
}

const installationKey = '@cogniscan_push_installation';

export async function registerTrainingReminder(uid) {
  if (Platform.OS !== 'android') throw new Error('Firebase reminders are available on configured Android builds.');
  await Notifications.setNotificationChannelAsync('training', {
    name: 'Training reminders', importance: Notifications.AndroidImportance.DEFAULT,
  });
  const permissions = await Notifications.requestPermissionsAsync();
  if (!permissions.granted) throw new Error('Allow notifications in device settings to enable reminders.');
  const token = await Notifications.getDevicePushTokenAsync();
  let installation = await AsyncStorage.getItem(installationKey);
  if (!installation) {
    installation = Crypto.randomUUID();
    await AsyncStorage.setItem(installationKey, installation);
  }
  await callAccountApi(uid, `/api/reminders/${installation}`, {
    method: 'PUT',
    body: { token: token.data, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' },
  });
}

export async function removeReminderRegistration(uid) {
  if (!backendConfigured || Platform.OS !== 'android') return;
  const installation = await AsyncStorage.getItem(installationKey);
  if (!installation) return;
  await callAccountApi(uid, `/api/reminders/${installation}`, { method: 'DELETE' });
}
