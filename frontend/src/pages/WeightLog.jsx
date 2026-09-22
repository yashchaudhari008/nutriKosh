import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";
import { todayISO } from "../lib/date";

export default function WeightLog() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/weight-entries?range=month", { token })
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const entry = await apiFetch("/api/weight-entries", {
        method: "POST",
        token,
        body: { date: todayISO(), weight: Number(weight), note: note || undefined },
      });
      setEntries((prev) => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
      setWeight("");
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

        <form onSubmit={handleSubmit} className="flex gap-2 rounded-lg border bg-white p-4 shadow-sm">
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
                <li key={entry._id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{entry.weight} kg</p>
                    <p className="text-xs text-slate-400">
                      {entry.date}
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
