import { createContext, useContext, useEffect, useState } from "react";
import { subscribeSyncStatus, initSyncListener } from "../lib/syncEngine";
import { useAuth } from "./useAuth";

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { token } = useAuth();
  const [syncStatus, setSyncStatus] = useState("synced");

  useEffect(() => {
    if (!token) return;

    const unsubscribe = subscribeSyncStatus(setSyncStatus);
    const cleanup = initSyncListener(token);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [token]);

  return <SyncContext.Provider value={syncStatus}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync must be used within SyncProvider");
  return context;
}
