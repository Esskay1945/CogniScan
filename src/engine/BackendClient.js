import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const mobile = Platform.OS !== 'web';
const configuredUrl = process.env.EXPO_PUBLIC_COGNISCAN_API_URL?.trim().replace(/\/+$/, '')
  || (!mobile ? globalThis.location?.origin : null);
const url = configuredUrl && (configuredUrl.startsWith('https://') || (__DEV__ && configuredUrl.startsWith('http://')))
  ? configuredUrl : null;
const sessionKey = 'cogniscan_neon_session';
const listeners = new Set();
let current = null;
let restoring = null;

export const backendConfigured = !!url;

async function updateSession(value) {
  if (mobile) {
    if (value) await SecureStore.setItemAsync(sessionKey, JSON.stringify(value), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    else await SecureStore.deleteItemAsync(sessionKey);
  }
  current = value;
  listeners.forEach(listener => listener(current));
}

async function request(path, { method = 'GET', body, token } = {}) {
  if (!url) throw new Error('CogniScan API setup is missing.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url + path, {
      method,
      credentials: 'omit',
      headers: {
        ...(mobile ? { Origin: url } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.message || 'CogniScan could not complete the request.');
      error.status = response.status;
      throw error;
    }
    return { data, token: response.headers.get('set-auth-token') };
  } finally {
    clearTimeout(timer);
  }
}

async function restoreSession() {
  if (!url || !mobile) return;
  try {
    const saved = JSON.parse(await SecureStore.getItemAsync(sessionKey) || 'null');
    if (!saved?.token || !saved.user?.id) return;
    try {
      const { data } = await request('/api/auth/get-session', { token: saved.token });
      await updateSession(data?.user?.id === saved.user.id ? saved : null);
    } catch (error) {
      if (!error.status || error.status >= 500) {
        current = saved;
        listeners.forEach(listener => listener(current));
      } else {
        await updateSession(null);
      }
    }
  } catch {
    current = null;
  }
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  restoring ??= restoreSession();
  restoring.finally(() => {
    if (listeners.has(listener)) listener(current);
  });
  return () => listeners.delete(listener);
}

async function authenticate(path, input) {
  const { data, token } = await request(path, { method: 'POST', body: input });
  if (!token || !data?.user?.id) return false;
  const { id, email, name } = data.user;
  await updateSession({ token, user: { id, email, name } });
  return true;
}

export const signIn = (email, password) => authenticate('/api/auth/sign-in/email', { email, password });
export const register = (name, email, password) => authenticate('/api/auth/sign-up/email', { name, email, password });

export async function signOut() {
  if (current) {
    try {
      await request('/api/auth/sign-out', { method: 'POST', token: current.token });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
  }
  await updateSession(null);
}

export async function callAccountApi(uid, path, options) {
  const session = current;
  if (!session || session.user.id !== uid) throw new Error('Sign in to continue.');
  try {
    return (await request(path, { ...options, token: session.token })).data;
  } catch (error) {
    if (error.status === 401 && current === session) await updateSession(null);
    throw error;
  }
}
