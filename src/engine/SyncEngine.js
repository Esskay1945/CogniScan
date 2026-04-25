import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AuditLogger } from './SecurityEngine';
import { isFirebaseConfigured, FirestoreSync } from './FirebaseBackend';

// ─── COGNISCAN SYNC ENGINE (PRODUCTION) ───
// Offline-first sync with Firebase Firestore backend
// Automatic conflict resolution + queue management

const SYNC_QUEUE_KEY = '@cogniscan_sync_queue';
const SYNC_META_KEY = '@cogniscan_sync_meta';

class SyncEngine {
  constructor() {
    this._queue = [];
    this._isOnline = true;
    this._isSyncing = false;
    this._lastSyncTimestamp = null;
    this._listeners = [];
    this._unsubscribe = null;
  }

  async initialize() {
    try {
      const queueRaw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (queueRaw) this._queue = JSON.parse(queueRaw);

      const metaRaw = await AsyncStorage.getItem(SYNC_META_KEY);
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        this._lastSyncTimestamp = meta.lastSync;
      }
    } catch (e) {
      console.warn('[Sync] Failed to restore queue:', e.message);
    }

    // Monitor network state
    try {
      this._unsubscribe = NetInfo.addEventListener(state => {
        const wasOffline = !this._isOnline;
        this._isOnline = state.isConnected && state.isInternetReachable !== false;
        
        if (wasOffline && this._isOnline && this._queue.length > 0) {
          this.flush();
        }
        this._notifyListeners({ type: 'CONNECTIVITY', online: this._isOnline });
      });
    } catch (e) {
      // NetInfo not available (some web environments)
      this._isOnline = true;
    }

    AuditLogger.log({
      type: 'SYNC_INIT',
      actor: 'system',
      resource: 'sync_engine',
      details: { queuedOps: this._queue.length, lastSync: this._lastSyncTimestamp, backendConfigured: isFirebaseConfigured() },
    });
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }

  // ──────────────────────────────────
  // QUEUE STATE UPDATE
  // ──────────────────────────────────

  async syncState(userId, updatedState) {
    const op = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: 'STATE_UPDATE',
      userId,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      payload: updatedState,
    };

    this._queue.push(op);
    await this._persistQueue();

    if (this._isOnline && !this._isSyncing) {
      this.flush();
    }

    return op.id;
  }

  // ──────────────────────────────────
  // FLUSH QUEUE TO BACKEND
  // ──────────────────────────────────

  async flush() {
    if (this._isSyncing || this._queue.length === 0 || !this._isOnline) return;
    if (!isFirebaseConfigured()) {
      // No backend — clear queue silently (local-only mode)
      this._queue = [];
      await this._persistQueue();
      return;
    }

    this._isSyncing = true;
    this._notifyListeners({ type: 'SYNC_START', pending: this._queue.length });

    const processed = [];

    for (const op of [...this._queue]) {
      try {
        const result = await FirestoreSync.saveState(op.userId, op.payload);
        if (result.success) {
          processed.push(op.id);
        } else {
          op.retryCount++;
          if (op.retryCount >= 5) {
            AuditLogger.log({
              type: 'SYNC_OP_FAILED',
              actor: op.userId,
              resource: op.type,
              details: { opId: op.id, error: result.error, retries: op.retryCount },
            });
            processed.push(op.id); // Discard after max retries
          }
        }
      } catch (e) {
        op.retryCount++;
        if (op.retryCount >= 5) processed.push(op.id);
      }
    }

    this._queue = this._queue.filter(op => !processed.includes(op.id));
    await this._persistQueue();

    this._lastSyncTimestamp = new Date().toISOString();
    await AsyncStorage.setItem(SYNC_META_KEY, JSON.stringify({ lastSync: this._lastSyncTimestamp }));

    this._isSyncing = false;
    this._notifyListeners({
      type: 'SYNC_COMPLETE',
      synced: processed.length,
      remaining: this._queue.length,
    });

    AuditLogger.log({
      type: 'SYNC_FLUSH',
      actor: 'system',
      resource: 'sync_engine',
      details: { synced: processed.length, remaining: this._queue.length },
    });
  }

  // ──────────────────────────────────
  // PULL + MERGE FROM SERVER
  // ──────────────────────────────────

  async pullAndMerge(userId, localState) {
    if (!isFirebaseConfigured() || !this._isOnline) return localState;
    
    try {
      const merged = await FirestoreSync.mergeState(userId, localState);
      AuditLogger.log({
        type: 'SYNC_PULL_MERGE',
        actor: userId,
        resource: 'state',
        details: { success: true },
      });
      return merged;
    } catch (e) {
      console.warn('[Sync] Pull+merge failed:', e.message);
      return localState;
    }
  }

  // ──────────────────────────────────
  // STATUS
  // ──────────────────────────────────

  getStatus() {
    return {
      online: this._isOnline,
      syncing: this._isSyncing,
      pendingOps: this._queue.length,
      lastSync: this._lastSyncTimestamp,
      backendConfigured: isFirebaseConfigured(),
    };
  }

  addListener(callback) {
    this._listeners.push(callback);
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  }

  _notifyListeners(event) {
    this._listeners.forEach(l => l(event));
  }

  async _persistQueue() {
    try {
      // Only persist last 50 queued ops to avoid storage bloat
      const toStore = this._queue.slice(-50);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(toStore));
    } catch (e) {}
  }
}

export const Sync = new SyncEngine();
