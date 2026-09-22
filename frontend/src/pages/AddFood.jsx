import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";
import { todayISO } from "../lib/date";
import { addFoodEntry } from "../lib/db";

const EMPTY_FORM = {
  foodName: "",
  quantity: "100",
  unit: "g",
  protein: "",
  calories: "",
  carbs: "",
  fat: "",
};

export default function AddFood() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("search");
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const results = await apiFetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`, {
        token,
      });
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function selectFood(food) {
    setForm({
      foodName: food.foodName,
      quantity: food.quantity.toString(),
      unit: food.unit,
      protein: food.protein.toString(),
      calories: food.calories.toString(),
      carbs: food.carbs?.toString() || "",
      fat: food.fat?.toString() || "",
    });
    setTab("manual");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // Write to IndexedDB first (optimistic)
      await addFoodEntry({
        userId: "mock-user", // Will be replaced by actual userId when integrated with auth context
        date: todayISO(),
        foodName: form.foodName,
        quantity: Number(form.quantity),
        unit: form.unit,
        protein: Number(form.protein),
        calories: Number(form.calories),
        carbs: form.carbs === "" ? undefined : Number(form.carbs),
        fat: form.fat === "" ? undefined : Number(form.fat),
        source: "manual",
      });
      // Sync engine will handle sending to API in background
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Add food</h1>
          <button onClick={() => navigate("/")} className="text-sm text-slate-500 hover:underline">
            Back
          </button>
        </div>

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab("search")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === "search"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === "manual"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Manual
          </button>
        </div>

        {tab === "search" && (
          <div className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {searching ? "…" : "Search"}
              </button>
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((food, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectFood(food)}
                    className="w-full text-left rounded-md border p-3 hover:bg-slate-50 transition"
                  >
                    <p className="text-sm font-medium">{food.foodName}</p>
                    <p className="text-xs text-slate-400">
                      {food.protein.toFixed(1)}g · {food.calories.toFixed(0)} kcal per {food.quantity}
                      {food.unit}
                      {food.source && ` · ${food.source.toUpperCase()}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <p className="text-sm text-slate-400">No foods found. Try manual entry.</p>
            )}
          </div>
        )}

        {tab === "manual" && (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-6 shadow-sm">
            <Field label="Food name">
              <input
                required
                value={form.foodName}
                onChange={(e) => update("foodName", e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantity">
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Unit">
                <select
                  value={form.unit}
                  onChange={(e) => update("unit", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="piece">piece</option>
                  <option value="cup">cup</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Protein (g)">
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form.protein}
                  onChange={(e) => update("protein", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Calories">
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form.calories}
                  onChange={(e) => update("calories", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Carbs (g, optional)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.carbs}
                  onChange={(e) => update("carbs", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Fat (g, optional)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.fat}
                  onChange={(e) => update("fat", e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </Field>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save entry"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-md border px-4 py-2 text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
