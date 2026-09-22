import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createMyFood,
  listMyFoods,
  updateMyFood,
  deleteMyFood,
} from "../controllers/myFoodsController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listMyFoods);
router.post("/", createMyFood);
router.patch("/:id", updateMyFood);
router.delete("/:id", deleteMyFood);

export default router;
