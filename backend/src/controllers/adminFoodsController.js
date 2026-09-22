import AdminFood from "../models/AdminFood.js";

export async function createAdminFood(req, res) {
  const { foodName, quantity, unit, protein, calories, carbs, fat, overridesFoodId } = req.body;
  const food = await AdminFood.create({
    foodName,
    quantity,
    unit,
    protein,
    calories,
    carbs,
    fat,
    overridesFoodId: overridesFoodId || null,
    addedBy: req.user._id,
  });
  res.status(201).json(food);
}

export async function listAdminFoods(req, res) {
  const foods = await AdminFood.find().sort({ createdAt: -1 }).populate("addedBy", "name email");
  res.json(foods);
}

export async function updateAdminFood(req, res) {
  const { foodName, quantity, unit, protein, calories, carbs, fat, overridesFoodId } = req.body;
  const updates = {};
  if (foodName !== undefined) updates.foodName = foodName;
  if (quantity !== undefined) updates.quantity = quantity;
  if (unit !== undefined) updates.unit = unit;
  if (protein !== undefined) updates.protein = protein;
  if (calories !== undefined) updates.calories = calories;
  if (carbs !== undefined) updates.carbs = carbs;
  if (fat !== undefined) updates.fat = fat;
  if (overridesFoodId !== undefined) updates.overridesFoodId = overridesFoodId || null;
  updates.updatedAt = new Date();

  const food = await AdminFood.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!food) return res.status(404).json({ error: "Food not found" });
  res.json(food);
}

export async function deleteAdminFood(req, res) {
  const food = await AdminFood.findByIdAndDelete(req.params.id);
  if (!food) return res.status(404).json({ error: "Food not found" });
  res.status(204).end();
}
