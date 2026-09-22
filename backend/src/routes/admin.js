import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Placeholder to verify the admin gate end-to-end; food CRUD lands in Phase 3.
router.get("/ping", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true });
});

export default router;
