import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/apiClient";

const EMPTY_FORM = {
  foodName: "",
  quantity: "100",
  unit: "g",
  protein: "",
  calories: "",
  carbs: "",
  fat: "",
  overridesFoodId: "",
};

export default function AdminFoods() {
  const { token } = useAuth();
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/foods", { token })
      .then(setFoods)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        foodName: form.foodName,
        quantity: Number(form.quantity),
        unit: form.unit,
        protein: Number(form.protein),
        calories: Number(form.calories),
        carbs: form.carbs === "" ? undefined : Number(form.carbs),
        fat: form.fat === "" ? undefined : Number(form.fat),
        overridesFoodId: form.overridesFoodId || undefined,
      };

      if (editingId) {
        const updated = await apiFetch(`/api/admin/foods/${editingId}`, {
          method: "PATCH",
          token,
          body,
        });
        setFoods((prev) => prev.map((f) => (f._id === editingId ? updated : f)));
        setEditingId(null);
      } else {
        const created = await apiFetch("/api/admin/foods", {
          method: "POST",
          token,
          body,
        });
        setFoods((prev) => [created, ...prev]);
      }
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this food?")) return;
    try {
      await apiFetch(`/api/admin/foods/${id}`, { method: "DELETE", token });
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function editFood(food) {
    setForm({
      foodName: food.foodName,
      quantity: food.quantity.toString(),
      unit: food.unit,
      protein: food.protein.toString(),
      calories: food.calories.toString(),
      carbs: food.carbs?.toString() || "",
      fat: food.fat?.toString() || "",
      overridesFoodId: food.overridesFoodId || "",
    });
    setEditingId(food._id);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            {editingId ? "Edit Food" : "Add Custom Food"}
          </h2>

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

          <Field label="Override external food ID (optional)">
            <input
              type="text"
              placeholder="Leave blank for custom food"
              value={form.overridesFoodId}
              onChange={(e) => update("overridesFoodId", e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Update" : "Add food"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-md border px-4 py-2 text-sm text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-lg border bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-sm text-slate-400">Loading…</p>
          ) : foods.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No custom foods yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-right font-semibold">Protein</th>
                    <th className="px-4 py-2 text-right font-semibold">Calories</th>
                    <th className="px-4 py-2 text-right font-semibold">Type</th>
                    <th className="px-4 py-2 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food._id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">{food.foodName}</td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {food.protein.toFixed(1)}g
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {food.calories.toFixed(0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                            food.overridesFoodId
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {food.overridesFoodId ? "Override" : "Custom"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => editFood(food)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(food._id)}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
