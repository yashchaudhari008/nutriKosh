import Admin from "../models/Admin.js";

export async function requireAdmin(req, res, next) {
  const admin = await Admin.findOne({ userId: req.user._id });
  if (!admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
