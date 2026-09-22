import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";
import { todayISO } from "../lib/date";

const EMPTY_FORM = {
  foodName: "",
  quantity: "",
  unit: "g",
  protein: "",
  calories: "",
  carbs: "",
  fat: "",
};

export default function AddFood() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch("/api/food-entries", {
        method: "POST",
        token,
        body: {
          date: todayISO(),
          foodName: form.foodName,
          quantity: Number(form.quantity),
          unit: form.unit,
          protein: Number(form.protein),
          calories: Number(form.calories),
          carbs: form.carbs === "" ? undefined : Number(form.carbs),
          fat: form.fat === "" ? undefined : Number(form.fat),
        },
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Add food</h1>
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
