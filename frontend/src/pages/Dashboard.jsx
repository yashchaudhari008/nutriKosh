import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip, Label } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";
import { todayISO } from "../lib/date";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/food-entries?date=${todayISO()}`, { token }).then(setEntries),
      apiFetch(`/api/weight-entries?range=week`, { token }).then(setWeightEntries),
    ])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

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
          <button
            onClick={logout}
            className="rounded-md border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-slate-500">Protein today</p>
              <p className="text-sm text-slate-500">
                {totalProtein}g / {proteinGoal || "—"}g
              </p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-slate-900" style={{ width: `${proteinPct}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-400">{totalCalories} kcal today</p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <p className="text-xs text-slate-500 mb-2">Weight</p>
            <p className="text-3xl font-semibold text-slate-900">
              {weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-1">kg</p>
            {weightEntries.length > 1 && (() => {
              const first = weightEntries[0].weight;
              const last = weightEntries[weightEntries.length - 1].weight;
              return (
                <>
                  <div className="w-full mt-4 flex justify-between text-xs text-slate-400 px-1 mb-1">
                    <span>{first.toFixed(1)}</span>
                    <span>{last.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightEntries} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                          }}
                          labelFormatter={() => ""}
                          formatter={(value) => [value.toFixed(1), "kg"]}
                          cursor={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#64748b"
                          strokeWidth={2}
                          dot={false}
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

        <div className="flex gap-2">
          <Link
            to="/food/add"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
          >
            + Add food
          </Link>
          <Link to="/weight" className="rounded-md border px-4 py-2 text-sm text-slate-700">
            Weight log
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
