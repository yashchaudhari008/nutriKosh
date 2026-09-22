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
  const [allEntries, setAllEntries] = useState([]);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        // Read from IndexedDB first
        const localEntries = await getWeightEntries(user?._id);
        setAllEntries(localEntries);
        setEntries(localEntries);
        setLoading(false);

        // Pull from server in background
        if (navigator.onLine) {
          try {
            const today = todayISO();
            await pullServerDataAndMerge(user?._id, token, today);
            const mergedEntries = await getWeightEntries(user?._id);
            setAllEntries(mergedEntries);
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

  function sampleEntries(ents, maxPoints = 10) {
    if (ents.length <= maxPoints) return ents;
    const step = Math.floor(ents.length / maxPoints);
    return ents.filter((_, idx) => idx % step === 0 || idx === ents.length - 1);
  }

  useEffect(() => {
    if (range === "all") {
      setEntries(sampleEntries(allEntries, 10));
    } else {
      setEntries(allEntries);
    }
  }, [range, allEntries]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Weight log</h1>
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            Back
          </Link>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRange("month")}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              range === "month"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setRange("all")}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              range === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Lifetime
          </button>
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
          <div className="flex gap-2">
            <input
              required
              type="number"
              min="0"
              step="any"
              placeholder="kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-24 rounded-md border px-3 py-2 text-sm"
            />
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
