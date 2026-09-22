import FoodEntry from "../models/FoodEntry.js";

export async function createFoodEntry(req, res) {
  const { date, foodName, quantity, unit, protein, calories, carbs, fat } = req.body;
  const entry = await FoodEntry.create({
    userId: req.user._id,
    date,
    foodName,
    source: "manual",
    quantity,
    unit,
    protein,
    calories,
    carbs,
    fat,
  });
  res.status(201).json(entry);
}

export async function listFoodEntries(req, res) {
  const { date } = req.query;
  const filter = { userId: req.user._id };
  if (date) filter.date = date;
  const entries = await FoodEntry.find(filter).sort({ loggedAt: -1 });
  res.json(entries);
}

export async function updateFoodEntry(req, res) {
  const { quantity, unit, protein, calories, carbs, fat, foodName } = req.body;
  const updates = {};
  if (foodName !== undefined) updates.foodName = foodName;
  if (quantity !== undefined) updates.quantity = quantity;
  if (unit !== undefined) updates.unit = unit;
  if (protein !== undefined) updates.protein = protein;
  if (calories !== undefined) updates.calories = calories;
  if (carbs !== undefined) updates.carbs = carbs;
  if (fat !== undefined) updates.fat = fat;

  const entry = await FoodEntry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true }
  );
  if (!entry) return res.status(404).json({ error: "Food entry not found" });
  res.json(entry);
}

export async function deleteFoodEntry(req, res) {
  const entry = await FoodEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ error: "Food entry not found" });
  res.status(204).end();
}

export async function getFoodEntrySummary(req, res) {
  const { range = "week" } = req.query;
  const days = range === "month" ? 30 : 7;
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const sinceDate = since.toISOString().slice(0, 10);

  const entries = await FoodEntry.find({ userId: req.user._id, date: { $gte: sinceDate } });

  const totalsByDate = {};
  for (const entry of entries) {
    if (!totalsByDate[entry.date]) {
      totalsByDate[entry.date] = { date: entry.date, protein: 0, calories: 0 };
    }
    totalsByDate[entry.date].protein += entry.protein;
    totalsByDate[entry.date].calories += entry.calories;
  }

  res.json(Object.values(totalsByDate).sort((a, b) => a.date.localeCompare(b.date)));
}
