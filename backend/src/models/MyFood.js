import mongoose from "mongoose";

const myFoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  protein: { type: Number, required: true },
  calories: { type: Number, required: true },
  carbs: { type: Number },
  fat: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

myFoodSchema.index({ userId: 1, foodName: 1 });

export default mongoose.model("MyFood", myFoodSchema);
