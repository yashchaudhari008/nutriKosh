import MyFood from "../models/MyFood.js";

export async function createMyFood(req, res) {
  const { foodName, quantity, unit, protein, calories, carbs, fat } = req.body;
  const food = await MyFood.create({
    userId: req.user._id,
    foodName,
    quantity,
    unit,
    protein,
    calories,
    carbs,
    fat,
  });
  res.status(201).json(food);
}

export async function listMyFoods(req, res) {
  const foods = await MyFood.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(foods);
}

export async function updateMyFood(req, res) {
  const { foodName, quantity, unit, protein, calories, carbs, fat } = req.body;
  const updates = {};
  if (foodName !== undefined) updates.foodName = foodName;
  if (quantity !== undefined) updates.quantity = quantity;
  if (unit !== undefined) updates.unit = unit;
  if (protein !== undefined) updates.protein = protein;
  if (calories !== undefined) updates.calories = calories;
  if (carbs !== undefined) updates.carbs = carbs;
  if (fat !== undefined) updates.fat = fat;

  const food = await MyFood.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true }
  );
  if (!food) return res.status(404).json({ error: "Food not found" });
  res.json(food);
}

export async function deleteMyFood(req, res) {
  const food = await MyFood.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!food) return res.status(404).json({ error: "Food not found" });
  res.status(204).end();
}
