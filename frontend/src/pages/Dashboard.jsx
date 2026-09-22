import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip, Label } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { useSync } from "../hooks/useSync";
import { apiFetch } from "../lib/apiClient";
import { todayISO, formatDateFull } from "../lib/date";
import { getFoodEntriesByDate, getWeightEntriesByDateRange } from "../lib/db";
import { pullServerDataAndMerge } from "../lib/syncEngine";
import SyncModal from "../components/SyncModal";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const syncStatus = useSync();
  const [entries, setEntries] = useState([]);
  const [lastSyncStatus, setLastSyncStatus] = useState(syncStatus);
  const [weightEntries, setWeightEntries] = useState([]);
  const [allWeightEntries, setAllWeightEntries] = useState([]);
  const [weightRange, setWeightRange] = useState("week");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [pendingEntries, setPendingEntries] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        // Read from IndexedDB first (instant)
        const today = todayISO();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const weekStart = sevenDaysAgo.toISOString().slice(0, 10);

        const localFood = await getFoodEntriesByDate(user?._id, today);
        let localWeight = await getWeightEntriesByDateRange(user?._id, weekStart, today);

        setEntries(localFood);
        setAllWeightEntries(localWeight);
        setLoading(false);

        // Pull from server in background
        if (navigator.onLine) {
          try {
            const serverData = await apiFetch(`/api/weight-entries?range=month`, { token });
            // Use server data if local is empty
            if (localWeight.length === 0 && serverData.length > 0) {
              setAllWeightEntries(serverData);
            }
          } catch (err) {
            console.error("Failed to fetch weight:", err);
          }
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    if (user?._id && token) {
      load();
    }
  }, [user?._id, token]);

  useEffect(() => {
    // Collect pending/syncing entries for modal
    const pending = [
      ...entries.filter(e => e.syncStatus === "pending" || e.syncStatus === "syncing").map(e => ({
        type: "food",
        name: e.foodName,
        date: e.date
      })),
      ...allWeightEntries.filter(e => e.syncStatus === "pending" || e.syncStatus === "syncing").map(e => ({
        type: "weight",
        weight: e.weight,
        date: e.date
      }))
    ];
    setPendingEntries(pending);
  }, [entries, allWeightEntries]);

  useEffect(() => {
    // Re-fetch entries when sync completes to show updated statuses
    if (syncStatus === "synced" && lastSyncStatus !== "synced") {
      const today = todayISO();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekStart = sevenDaysAgo.toISOString().slice(0, 10);

      Promise.all([
        getFoodEntriesByDate(user?._id, today),
        getWeightEntriesByDateRange(user?._id, weekStart, today)
      ]).then(([food, weight]) => {
        // Mark API entries as synced if they don't have syncStatus
        setEntries(food.map(e => ({ ...e, syncStatus: e.syncStatus || "synced" })));
        setAllWeightEntries(weight.map(e => ({ ...e, syncStatus: e.syncStatus || "synced" })));
      });
    }
    setLastSyncStatus(syncStatus);
  }, [syncStatus, user?._id]);

  function sampleEntries(ents, maxPoints = 10) {
    if (ents.length <= maxPoints) return ents;
    const step = Math.floor(ents.length / maxPoints);
    return ents.filter((_, idx) => idx % step === 0 || idx === ents.length - 1);
  }

  useEffect(() => {
    if (weightRange === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffDate = sevenDaysAgo.toISOString().slice(0, 10);
      setWeightEntries(allWeightEntries.filter((e) => e.date >= cutoffDate));
    } else if (weightRange === "lifetime") {
      setWeightEntries(sampleEntries(allWeightEntries, 10));
    } else {
      setWeightEntries(allWeightEntries);
    }
  }, [weightRange, allWeightEntries]);

  async function handleDelete(id) {
    try {
      await apiFetch(`/api/food-entries/${id}`, { method: "DELETE", token });
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const proteinGoal = user?.proteinGoal ?? 0;
  const proteinPct = proteinGoal ? Math.min(100, Math.round((totalProtein / proteinGoal) * 100)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Hi, {user?.name}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (syncStatus === "syncing" || pendingEntries.length > 0) && setShowSyncModal(true)}
              className={`text-xs font-medium px-2 py-1 rounded cursor-pointer ${
                syncStatus === "synced"
                  ? "bg-green-100 text-green-700"
                  : syncStatus === "syncing"
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-orange-100 text-orange-700"
              } ${(syncStatus !== "syncing" && pendingEntries.length === 0) ? "cursor-default" : ""}`}
            >
              {syncStatus === "synced" ? "✓ Synced" : syncStatus === "syncing" ? "⟳ Syncing" : "⊘ Offline"}
            </button>
            <button
              onClick={logout}
              className="rounded-md border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="rounded-xl bg-slate-900 text-white p-4 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs opacity-70 mb-2">Protein</p>
              <p className="text-3xl font-bold">{totalProtein}g</p>
              <p className="text-xs opacity-60 mt-1">of {proteinGoal || "—"}g</p>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div className="h-full bg-white" style={{ width: `${proteinPct}%` }} />
              </div>
              <p className="text-[11px] opacity-60 mt-2">{totalCalories} kcal</p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Weight</p>
                <p className="text-2xl font-bold text-slate-900">
                  {weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : "—"}
                </p>
                <p className="text-xs text-slate-400">kg</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setWeightRange("week")}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                    weightRange === "week"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  1W
                </button>
                <button
                  onClick={() => setWeightRange("month")}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                    weightRange === "month"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  1M
                </button>
                <button
                  onClick={() => setWeightRange("lifetime")}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                    weightRange === "lifetime"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
              </div>
            </div>
            {weightEntries.length >= 1 && (() => {
              const first = weightEntries[0].weight;
              const last = weightEntries[weightEntries.length - 1].weight;
              return (
                <>
                  <div className="w-full flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{first.toFixed(1)}</span>
                    <span>{last.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightEntries} margin={{ top: 5, right: 8, left: 8, bottom: 5 }}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                          labelFormatter={(value) => value || ""}
                          formatter={(value) => [value.toFixed(1), "kg"]}
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload?.[0]) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs">
                                  <p className="font-medium">{formatDateFull(data.date)}</p>
                                  <p className="text-slate-600">{data.weight.toFixed(1)} kg</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#64748b"
                          strokeWidth={2}
                          dot={{ fill: "#64748b", r: 3 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            to="/food/add"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          >
            + Add food
          </Link>
          <Link to="/weight" className="rounded-md border px-4 py-2 text-sm text-slate-700">
            Weight log
          </Link>
          <Link to="/history/food" className="rounded-md border px-4 py-2 text-sm text-slate-700">
            Food history
          </Link>
          <Link to="/insights/weight" className="rounded-md border px-4 py-2 text-sm text-slate-700">
            Insights
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="rounded-lg border bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No food logged today yet.</p>
          ) : (
            <ul className="divide-y">
              {entries.map((entry) => (
                <li key={entry._id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{entry.foodName}</p>
                    <p className="text-xs text-slate-400">
                      {entry.quantity}
                      {entry.unit} · {entry.protein}g protein · {entry.calories} kcal
                      {entry.syncStatus && entry.syncStatus !== "synced" && (
                        <span className={entry.syncStatus === "syncing" ? "text-blue-600" : "text-orange-600"}>
                          {" "}· {entry.syncStatus === "syncing" ? "⟳ syncing" : "⊘ pending"}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <SyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        pendingEntries={pendingEntries}
      />
    </div>
  );
}
