import { getPendingEntries, markEntrySynced } from "./db";
import { apiFetch } from "./apiClient";

let syncInProgress = false;
let syncStatus = "synced"; // "synced", "syncing", "offline"
let syncListeners = [];

export function subscribeSyncStatus(callback) {
  syncListeners.push(callback);
  callback(syncStatus);
  return () => {
    syncListeners = syncListeners.filter((cb) => cb !== callback);
  };
}

function notifySyncStatus(status) {
  syncStatus = status;
  syncListeners.forEach((cb) => cb(status));
}

export async function syncPendingEntries(token) {
  if (syncInProgress) return;
  if (!navigator.onLine) {
    notifySyncStatus("offline");
    return;
  }

  syncInProgress = true;
  notifySyncStatus("syncing");

  try {
    const { foodEntries, weightEntries } = await getPendingEntries();

    // Sync food entries
    for (const entry of foodEntries) {
      try {
        const { localId, syncStatus, ...data } = entry;
        await apiFetch("/api/food-entries", {
          method: "POST",
          token,
          body: data,
        });
        await markEntrySynced("foodEntries", localId);
      } catch (err) {
        console.error("Failed to sync food entry:", err);
      }
    }

    // Sync weight entries
    for (const entry of weightEntries) {
      try {
        const { localId, syncStatus, ...data } = entry;
        await apiFetch("/api/weight-entries", {
          method: "POST",
          token,
          body: data,
        });
        await markEntrySynced("weightEntries", localId);
      } catch (err) {
        console.error("Failed to sync weight entry:", err);
      }
    }

    notifySyncStatus("synced");
  } catch (err) {
    console.error("Sync error:", err);
    notifySyncStatus("offline");
  } finally {
    syncInProgress = false;
  }
}

export function initSyncListener(token) {
  // Sync on page focus
  window.addEventListener("focus", () => syncPendingEntries(token));

  // Sync on online
  window.addEventListener("online", () => syncPendingEntries(token));

  // Periodic sync every 30 seconds
  const interval = setInterval(() => {
    if (navigator.onLine) {
      syncPendingEntries(token);
    }
  }, 30000);

  return () => {
    clearInterval(interval);
    window.removeEventListener("focus", () => syncPendingEntries(token));
    window.removeEventListener("online", () => syncPendingEntries(token));
  };
}

export function getSyncStatus() {
  return syncStatus;
}
