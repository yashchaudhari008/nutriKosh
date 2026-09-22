import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { getWeightEntriesByDateRange } from "../lib/db";
import { pullServerDataAndMerge } from "../lib/syncEngine";
import { todayISO, formatDateFull } from "../lib/date";

export default function WeightInsights() {
  const { user, token } = useAuth();
  const [allEntries, setAllEntries] = useState([]);
  const [range, setRange] = useState("week"); // week, month, 3month
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const today = todayISO();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const start = threeMonthsAgo.toISOString().slice(0, 10);

        const localEntries = await getWeightEntriesByDateRange(user?._id, start, today);
        setAllEntries(localEntries);
        setLoading(false);

        if (navigator.onLine) {
          try {
            await pullServerDataAndMerge(user?._id, token, today);
            const mergedEntries = await getWeightEntriesByDateRange(user?._id, start, today);
            setAllEntries(mergedEntries);
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
  }, [user?._id, token]);

  const getFilteredEntries = () => {
    const today = new Date();
    let startDate = new Date();

    if (range === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (range === "month") {
      startDate.setMonth(today.getMonth() - 1);
    } else if (range === "3month") {
      startDate.setMonth(today.getMonth() - 3);
    }

    const start = startDate.toISOString().slice(0, 10);
    return allEntries.filter((e) => e.date >= start);
  };

  const filteredEntries = getFilteredEntries();

  const stats = (() => {
    if (filteredEntries.length === 0) {
      return { avg: 0, min: 0, max: 0, change: 0 };
    }

    const weights = filteredEntries.map((e) => e.weight);
    const avg = (weights.reduce((sum, w) => sum + w, 0) / weights.length).toFixed(1);
    const min = Math.min(...weights).toFixed(1);
    const max = Math.max(...weights).toFixed(1);
    const first = weights[0];
    const last = weights[weights.length - 1];
    const change = (last - first).toFixed(1);

    return { avg, min, max, change };
  })();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Weight insights</h1>
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            Back
          </Link>
        </div>

        <div className="flex gap-2">
          {["week", "month", "3month"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs rounded font-medium transition ${
                range === r
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {r === "week" ? "1W" : r === "month" ? "1M" : "3M"}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No weight entries for this period.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div className="rounded-lg bg-white border p-3 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Average</p>
                <p className="text-2xl font-bold text-slate-900">{stats.avg}</p>
                <p className="text-xs text-slate-400">kg</p>
              </div>
              <div className="rounded-lg bg-white border p-3 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Change</p>
                <p className={`text-2xl font-bold ${stats.change < 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.change > 0 ? "+" : ""}{stats.change}
                </p>
                <p className="text-xs text-slate-400">kg</p>
              </div>
              <div className="rounded-lg bg-white border p-3 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Min</p>
                <p className="text-2xl font-bold text-slate-900">{stats.min}</p>
                <p className="text-xs text-slate-400">kg</p>
              </div>
              <div className="rounded-lg bg-white border p-3 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">Max</p>
                <p className="text-2xl font-bold text-slate-900">{stats.max}</p>
                <p className="text-xs text-slate-400">kg</p>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <p className="text-sm font-medium mb-3 text-slate-900">Trend</p>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={filteredEntries} margin={{ top: 5, right: 8, left: 8, bottom: 5 }}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [value.toFixed(1), "kg"]}
                      labelFormatter={(value) => formatDateFull(value) || ""}
                      cursor={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 3 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        <Link
          to="/weight"
          className="block rounded-md bg-slate-900 px-4 py-2 text-sm text-white text-center"
        >
          Log weight
        </Link>
      </div>
    </div>
  );
}
