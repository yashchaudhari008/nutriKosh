import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  height: { type: Number },
  proteinGoal: { type: Number, default: 85 },
  calorieGoal: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
