import mongoose from "mongoose";

const foodCacheSchema = new mongoose.Schema({
  foodId: { type: String, required: true, unique: true },
  foodName: { type: String, required: true },
  source: { type: String, enum: ["off", "usda"], required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  protein: { type: Number, required: true },
  calories: { type: Number, required: true },
  carbs: { type: Number },
  fat: { type: Number },
  cachedAt: { type: Date, default: Date.now },
});

foodCacheSchema.index({ foodName: "text" });

export default mongoose.model("FoodCache", foodCacheSchema);
