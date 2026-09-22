import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateMe } from "../controllers/meController.js";

const router = Router();

router.get("/", requireAuth, getMe);
router.patch("/", requireAuth, updateMe);

export default router;
