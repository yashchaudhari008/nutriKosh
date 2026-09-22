import WeightEntry from "../models/WeightEntry.js";

export async function createWeightEntry(req, res) {
  const { date, weight, note } = req.body;
  const entry = await WeightEntry.create({ userId: req.user._id, date, weight, note });
  res.status(201).json(entry);
}

export async function listWeightEntries(req, res) {
  const { range = "month" } = req.query;
  const days = range === "week" ? 7 : range === "year" ? 365 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  const sinceDate = since.toISOString().slice(0, 10);

  const entries = await WeightEntry.find({ userId: req.user._id, date: { $gte: sinceDate } }).sort({
    date: 1,
  });
  res.json(entries);
}

export async function updateWeightEntry(req, res) {
  const { weight, note, date } = req.body;
  const updates = {};
  if (weight !== undefined) updates.weight = weight;
  if (note !== undefined) updates.note = note;
  if (date !== undefined) updates.date = date;

  const entry = await WeightEntry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true }
  );
  if (!entry) return res.status(404).json({ error: "Weight entry not found" });
  res.json(entry);
}

export async function deleteWeightEntry(req, res) {
  const entry = await WeightEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!entry) return res.status(404).json({ error: "Weight entry not found" });
  res.status(204).end();
}
