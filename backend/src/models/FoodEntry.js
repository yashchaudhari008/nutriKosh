import mongoose from "mongoose";

const foodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  loggedAt: { type: Date, default: Date.now },
  foodName: { type: String, required: true },
  source: { type: String, enum: ["manual", "usda", "off", "admin", "myFoods", "llm"], required: true },
  foodId: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  protein: { type: Number, required: true },
  calories: { type: Number, required: true },
  carbs: { type: Number },
  fat: { type: Number },
});

foodEntrySchema.index({ userId: 1, date: 1 });

export default mongoose.model("FoodEntry", foodEntrySchema);
