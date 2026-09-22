import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { searchFoods } from "../controllers/foodSearchController.js";

const router = Router();

router.get("/", requireAuth, searchFoods);

export default router;
