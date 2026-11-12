import { callAccountApi } from './BackendClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { gcm } from '@noble/ciphers/aes.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';

const mobile = Platform.OS !== 'web';
const secureOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
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
  let data;
  try {
    data = await callAccountApi(uid, '/api/progress');
  } catch (error) {
    if (cached && error.status !== 401) return cached;
    throw error;
  }
  if (cached?.pending) return { ...cached, conflict: cached.revision !== (data?.revision ?? 0) };
  return { state: data?.state ?? null, revision: data?.revision ?? 0, pending: false };
}

export async function saveAccount(uid, state, revision) {
  await writeCache(uid, { state, revision, pending: true });
  const { revision: next } = await callAccountApi(uid, '/api/progress', { method: 'PUT', body: { state, revision } });
  await writeCache(uid, { state, revision: next, pending: false }).catch(() => {});
  return next;
}

export async function eraseAccountData(uid) {
  await callAccountApi(uid, '/api/progress', { method: 'DELETE' });
  if (mobile) {
    await AsyncStorage.removeItem(storageName(uid));
    await SecureStore.deleteItemAsync(keyName(uid), secureOptions);
  }
}
