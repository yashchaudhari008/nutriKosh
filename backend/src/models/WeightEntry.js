import mongoose from "mongoose";

const weightEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  weight: { type: Number, required: true },
  loggedAt: { type: Date, default: Date.now },
  note: { type: String },
});

weightEntrySchema.index({ userId: 1, date: 1 });

export default mongoose.model("WeightEntry", weightEntrySchema);
