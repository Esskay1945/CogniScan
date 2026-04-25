// ─── COGNISCAN FIREBASE BACKEND ───
// Production backend: Auth + Firestore + Sync
// Replace placeholder config with your Firebase project credentials

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  memoryLocalCache,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ══════════════════════════════════════════════
// FIREBASE CONFIGURATION
// ══════════════════════════════════════════════

// TODO: Replace with your Firebase project config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDWpN0jcGOxAma10swciFOMykiMhP4tHj4",
  authDomain: "cogniscan-529f1.firebaseapp.com",
  projectId: "cogniscan-529f1",
  storageBucket: "cogniscan-529f1.firebasestorage.app",
  messagingSenderId: "823883729766",
  appId: "1:823883729766:web:9ed21f53f9d2cc87c016a7",
  measurementId: "G-PYD2ZVKXDC"
};

let app = null;
let auth = null;
let db = null;
let _isConfigured = false;

// ══════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════

export const initializeFirebase = (customConfig = null) => {
  const config = customConfig || FIREBASE_CONFIG;
  
  // Don't init with placeholder keys
  if (config.apiKey === 'YOUR_API_KEY') {
    console.warn('[Firebase] Not configured — running in local-only mode');
    return false;
  }

  if (getApps().length === 0) {
    app = initializeApp(config);
    
    // Initialize Auth with mobile persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });

    // Initialize Firestore with memory cache
    // Note: persistentLocalCache is not supported in Expo Go (no IndexedDB).
    // Use memoryLocalCache for dev. For production builds, switch to persistentLocalCache.
    db = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
    
    _isConfigured = true;
    return true;
  }
  
  _isConfigured = true;
  return true;
};

export const isFirebaseConfigured = () => _isConfigured;

// ══════════════════════════════════════════════
// AUTHENTICATION (Server-Side JWT via Firebase Auth)
// ══════════════════════════════════════════════

export const FirebaseAuth = {
  async signUp(email, password) {
    if (!_isConfigured) return { success: false, error: 'Firebase not configured' };
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      return {
        success: true,
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
        },
        token,
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async signIn(email, password) {
    if (!_isConfigured) return { success: false, error: 'Firebase not configured' };
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      return {
        success: true,
        user: {
          uid: credential.user.uid,
          email: credential.user.email,
        },
        token,
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async signOut() {
    if (!_isConfigured) return;
    await signOut(auth);
  },

  async getToken() {
    if (!_isConfigured || !auth?.currentUser) return null;
    return auth.currentUser.getIdToken(true); // Force refresh
  },

  getCurrentUser() {
    if (!_isConfigured) return null;
    return auth?.currentUser;
  },

  onAuthChange(callback) {
    if (!_isConfigured) return () => {};
    return onAuthStateChanged(auth, callback);
  },
};

// ══════════════════════════════════════════════
// FIRESTORE DATA SYNC
// ══════════════════════════════════════════════

export const FirestoreSync = {
  async saveState(userId, state) {
    if (!_isConfigured || !db) return { success: false };
    try {
      const ref = doc(db, 'users', userId);
      // Strip local-only fields
      const syncableState = { ...state };
      delete syncableState._syncVersion;
      delete syncableState._deviceId;
      
      await setDoc(ref, {
        ...syncableState,
        _lastModified: serverTimestamp(),
        _updatedBy: auth?.currentUser?.uid || 'local',
      }, { merge: true });
      
      return { success: true };
    } catch (e) {
      console.warn('[Firestore] Save failed:', e.message);
      return { success: false, error: e.message };
    }
  },

  async loadState(userId) {
    if (!_isConfigured || !db) return null;
    try {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data();
      }
      return null;
    } catch (e) {
      console.warn('[Firestore] Load failed:', e.message);
      return null;
    }
  },

  async mergeState(userId, localState) {
    if (!_isConfigured || !db) return localState;
    try {
      const serverState = await this.loadState(userId);
      if (!serverState) {
        // No server state — push local
        await this.saveState(userId, localState);
        return localState;
      }

      // Merge: combine game histories, keep latest timestamps
      const merged = { ...serverState };
      
      // Merge gameHistory (dedup by date)
      if (localState.gameHistory && serverState.gameHistory) {
        const serverDates = new Set(serverState.gameHistory.map(g => g.date));
        const newLocal = localState.gameHistory.filter(g => !serverDates.has(g.date));
        merged.gameHistory = [...serverState.gameHistory, ...newLocal];
      } else {
        merged.gameHistory = localState.gameHistory || serverState.gameHistory || [];
      }

      // Merge sessions (dedup by date)
      if (localState.sessions && serverState.sessions) {
        const serverSessionDates = new Set(serverState.sessions.map(s => s.date));
        const newSessions = localState.sessions.filter(s => !serverSessionDates.has(s.date));
        merged.sessions = [...serverState.sessions, ...newSessions];
      }

      // Take latest for scalar values
      const localTime = new Date(localState.lastSessionDate || 0).getTime();
      const serverTime = new Date(serverState.lastSessionDate || 0).getTime();
      if (localTime > serverTime) {
        merged.streak = localState.streak;
        merged.xp = localState.xp;
        merged.level = localState.level;
        merged.lastSessionDate = localState.lastSessionDate;
      }

      // Save merged state back
      await this.saveState(userId, merged);
      return merged;
    } catch (e) {
      console.warn('[Firestore] Merge failed:', e.message);
      return localState;
    }
  },
};
