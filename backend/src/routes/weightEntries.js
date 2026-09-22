import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createWeightEntry,
  listWeightEntries,
  updateWeightEntry,
  deleteWeightEntry,
} from "../controllers/weightEntryController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listWeightEntries);
router.post("/", createWeightEntry);
router.patch("/:id", updateWeightEntry);
router.delete("/:id", deleteWeightEntry);

export default router;
