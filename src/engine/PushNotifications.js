import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';
import { supabase } from './AccountStorage';

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
  const { error } = await supabase.from('cogniscan_reminder_devices').upsert({
    user_id: uid, installation, token: token.data,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  }, { onConflict: 'user_id,installation' });
  if (error) throw error;
}

export async function removeReminderRegistration(uid) {
  if (!supabase || Platform.OS !== 'android') return;
  const installation = await AsyncStorage.getItem(installationKey);
  if (!installation) return;
  const { error } = await supabase.from('cogniscan_reminder_devices').delete().eq('user_id', uid).eq('installation', installation);
  if (error) throw error;
}
