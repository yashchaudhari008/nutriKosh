import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  createAdminFood,
  listAdminFoods,
  updateAdminFood,
  deleteAdminFood,
} from "../controllers/adminFoodsController.js";

const router = Router();

router.use(requireAuth);

router.get("/ping", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

router.get("/foods", requireAdmin, listAdminFoods);
router.post("/foods", requireAdmin, createAdminFood);
router.patch("/foods/:id", requireAdmin, updateAdminFood);
router.delete("/foods/:id", requireAdmin, deleteAdminFood);

export default router;
