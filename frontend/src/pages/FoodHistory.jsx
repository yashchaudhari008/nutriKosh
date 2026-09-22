import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getFoodEntriesByDate } from "../lib/db";
import { pullServerDataAndMerge } from "../lib/syncEngine";
import { todayISO, formatDateFull } from "../lib/date";

export default function FoodHistory() {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState(todayISO());

  useEffect(() => {
    async function load() {
      try {
        const localEntries = await getFoodEntriesByDate(user?._id, dateFilter);
        setEntries(localEntries);
        setLoading(false);

        if (navigator.onLine) {
          try {
            await pullServerDataAndMerge(user?._id, token, dateFilter);
            const mergedEntries = await getFoodEntriesByDate(user?._id, dateFilter);
            setEntries(mergedEntries);
          } catch (err) {
            console.error("Sync failed:", err);
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
  }, [user?._id, token, dateFilter]);

  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  async function handleDelete(id) {
    try {
      // For now, just remove from UI
      // Real implementation would delete from API and IndexedDB
      setEntries((prev) => prev.filter((e) => e._id !== id && e.localId !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Food history</h1>
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            Back
          </Link>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <label className="block text-xs font-medium text-slate-500 mb-2">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="rounded-xl bg-slate-900 text-white p-4 shadow-sm">
            <p className="text-xs opacity-70 mb-1">Protein</p>
            <p className="text-2xl font-bold">{totalProtein}g</p>
          </div>
          <div className="rounded-xl bg-blue-900 text-white p-4 shadow-sm">
            <p className="text-xs opacity-70 mb-1">Calories</p>
            <p className="text-2xl font-bold">{totalCalories}</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="rounded-lg border bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No entries for this date.</p>
          ) : (
            <ul className="divide-y">
              {entries.map((entry) => (
                <li key={entry._id || entry.localId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{entry.foodName}</p>
                    <p className="text-xs text-slate-400">
                      {entry.quantity}
                      {entry.unit} · {entry.protein}g protein · {entry.calories} kcal
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry._id || entry.localId)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          to="/food/add"
          className="block rounded-md bg-slate-900 px-4 py-2 text-sm text-white text-center"
        >
          + Add food
        </Link>
      </div>
    </div>
  );
}
