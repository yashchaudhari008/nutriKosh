import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createFoodEntry,
  listFoodEntries,
  updateFoodEntry,
  deleteFoodEntry,
  getFoodEntrySummary,
} from "../controllers/foodEntryController.js";

const router = Router();

router.use(requireAuth);

router.get("/summary", getFoodEntrySummary);
router.get("/", listFoodEntries);
router.post("/", createFoodEntry);
router.patch("/:id", updateFoodEntry);
router.delete("/:id", deleteFoodEntry);

export default router;
