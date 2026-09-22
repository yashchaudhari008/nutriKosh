import { verifySessionToken } from "../utils/jwt.js";
import User from "../models/User.js";

const DEV_MODE = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev-user";

export async function requireAuth(req, res, next) {
  // Dev bypass: if NODE_ENV=development and x-dev-user header is set, use mock user
  if (DEV_MODE && req.headers["x-dev-user"]) {
    // Create/use a mock user object for local dev testing without Mongo
    req.user = {
      _id: DEV_USER_ID,
      name: "Dev User",
      email: "dev@example.com",
      proteinGoal: 85,
    };
    return next();
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing session token" });
  }

  try {
    const payload = verifySessionToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session token" });
  }
}
