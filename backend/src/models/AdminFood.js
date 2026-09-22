import mongoose from "mongoose";

const adminFoodSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  protein: { type: Number, required: true },
  calories: { type: Number, required: true },
  carbs: { type: Number },
  fat: { type: Number },
  overridesFoodId: { type: String, default: null },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

adminFoodSchema.index({ foodName: "text" });
adminFoodSchema.index({ overridesFoodId: 1 });

export default mongoose.model("AdminFood", adminFoodSchema);
