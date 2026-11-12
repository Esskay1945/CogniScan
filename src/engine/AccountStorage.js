import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const mobile = Platform.OS !== 'web';
const secureOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
const secureSession = {
  getItem: name => SecureStore.getItemAsync(name, secureOptions),
  setItem: (name, value) => SecureStore.setItemAsync(name, value, secureOptions),
  removeItem: name => SecureStore.deleteItemAsync(name, secureOptions),
};

export const supabase = url && key ? createClient(url, key, {
  auth: {
    ...(mobile ? { storage: secureSession, lock: processLock } : {}),
    persistSession: mobile,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
}) : null;

const table = 'cogniscan_user_state';
const storageName = uid => `@cogniscan_v3_${uid}`;
const keyName = uid => `cogniscan_v3_${uid}`;
const encode = value => Uint8Array.from(unescape(encodeURIComponent(value)), char => char.charCodeAt(0));
const decode = bytes => decodeURIComponent(Array.from(bytes, byte => '%' + byte.toString(16).padStart(2, '0')).join(''));

async function readCache(uid) {
  if (!mobile) return null;
  const encrypted = await AsyncStorage.getItem(storageName(uid));
  if (!encrypted) return null;
  const secret = await SecureStore.getItemAsync(keyName(uid), secureOptions);
  if (!secret) return null;
  const [nonce, payload] = encrypted.split(':');
  return JSON.parse(decode(gcm(hexToBytes(secret), hexToBytes(nonce), encode(uid)).decrypt(hexToBytes(payload))));
}

async function writeCache(uid, record) {
  if (!mobile) return;
  let secret = await SecureStore.getItemAsync(keyName(uid), secureOptions);
  if (!secret) {
    secret = bytesToHex(await Crypto.getRandomBytesAsync(32));
    await SecureStore.setItemAsync(keyName(uid), secret, secureOptions);
  }
  const nonce = await Crypto.getRandomBytesAsync(12);
  const payload = gcm(hexToBytes(secret), nonce, encode(uid)).encrypt(encode(JSON.stringify(record)));
  await AsyncStorage.setItem(storageName(uid), `${bytesToHex(nonce)}:${bytesToHex(payload)}`);
}

export async function loadAccount(uid) {
  let cached = null;
  try { cached = await readCache(uid); } catch { /* Cloud copy can recover a damaged cache. */ }
  const { data, error } = await supabase.from(table).select('state,revision').eq('user_id', uid).maybeSingle();
  if (error) {
    if (cached) return cached;
    throw error;
  }
  if (cached?.pending) return { ...cached, conflict: cached.revision !== (data?.revision ?? 0) };
  return { state: data?.state ?? null, revision: data?.revision ?? 0, pending: false };
}

export async function saveAccount(uid, state, revision) {
  await writeCache(uid, { state, revision, pending: true });
  const next = revision + 1;
  const query = revision === 0
    ? supabase.from(table).upsert({ user_id: uid, state, revision: next }, { onConflict: 'user_id', ignoreDuplicates: true })
    : supabase.from(table).update({ state, revision: next, updated_at: new Date().toISOString() }).eq('user_id', uid).eq('revision', revision);
  const { data, error } = await query.select('revision').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Your progress changed on another device. This device kept its local copy.');
  await writeCache(uid, { state, revision: next, pending: false }).catch(() => {});
  return next;
}

export async function eraseAccountData(uid) {
  const { error } = await supabase.rpc('erase_cogniscan_progress');
  if (error) throw error;
  if (mobile) {
    await AsyncStorage.removeItem(storageName(uid));
    await SecureStore.deleteItemAsync(keyName(uid), secureOptions);
  }
}
