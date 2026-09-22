import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";
import { todayISO, formatDateFull } from "../lib/date";
import { addWeightEntry, getWeightEntries } from "../lib/db";
import { pullServerDataAndMerge } from "../lib/syncEngine";

export default function WeightLog() {
  const { user, token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Read from IndexedDB first
        const localEntries = await getWeightEntries(user?._id);
        setEntries(localEntries);
        setLoading(false);

        // Pull from server in background
        if (navigator.onLine) {
          try {
            const today = todayISO();
            await pullServerDataAndMerge(user?._id, token, today);
            const mergedEntries = await getWeightEntries(user?._id);
            setEntries(mergedEntries);
          } catch (err) {
            console.error("Background sync failed:", err);
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      // Write to IndexedDB first (optimistic)
      const localId = await addWeightEntry({
        userId: "mock-user", // Will be replaced by actual userId when integrated
        date,
        weight: Number(weight),
        note: note || undefined,
      });

      // Optimistic UI update
      setEntries((prev) =>
        [
          ...prev,
          { localId, date, weight: Number(weight), note: note || undefined },
        ].sort((a, b) => a.date.localeCompare(b.date))
      );

      setWeight("");
      setDate(todayISO());
      setNote("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/api/weight-entries/${id}`, { method: "DELETE", token });
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Weight log</h1>
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Weight</label>
              <div className="flex gap-1 items-center">
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-20 rounded-md border px-3 py-2 text-sm"
                />
                <span className="text-sm text-slate-600">kg</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
              Log
            </button>
          </div>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="rounded-lg border bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No entries yet.</p>
          ) : (
            <ul className="divide-y">
              {[...entries].reverse().map((entry) => (
                <li key={entry._id || entry.localId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{entry.weight} kg</p>
                    <p className="text-xs text-slate-400">
                      {formatDateFull(entry.date)}
                      {entry.note ? ` · ${entry.note}` : ""}
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
    </div>
  );
}
