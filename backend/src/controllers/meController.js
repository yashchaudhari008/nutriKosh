import Admin from "../models/Admin.js";
import User from "../models/User.js";

export async function getMe(req, res) {
  const admin = await Admin.findOne({ userId: req.user._id });
  res.json({ ...req.user.toObject(), isAdmin: Boolean(admin) });
}

export async function updateMe(req, res) {
  const { height, proteinGoal, calorieGoal } = req.body;
  const updates = {};
  if (height !== undefined) updates.height = height;
  if (proteinGoal !== undefined) updates.proteinGoal = proteinGoal;
  if (calorieGoal !== undefined) updates.calorieGoal = calorieGoal;

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
  res.json(user);
}
