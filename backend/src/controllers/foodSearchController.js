import AdminFood from "../models/AdminFood.js";
import MyFood from "../models/MyFood.js";
import FoodCache from "../models/FoodCache.js";
import { searchOpenFoodFacts, searchUSDA } from "../utils/foodAPIs.js";

export async function searchFoods(req, res) {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const userId = req.user._id;
    const results = [];
    const seenIds = new Set();

    // 1. Admin foods (custom entries)
    const adminFoods = await AdminFood.find({
      $text: { $search: q },
    })
      .limit(5)
      .lean();

    adminFoods.forEach((food) => {
      results.push({
        _id: food._id,
        foodId: food._id.toString(),
        foodName: food.foodName,
        source: "admin",
        quantity: food.quantity,
        unit: food.unit,
        protein: food.protein,
        calories: food.calories,
        carbs: food.carbs,
        fat: food.fat,
      });
      seenIds.add(food.foodName.toLowerCase());
    });

    // 2. User's saved foods
    const myFoods = await MyFood.find({
      userId,
      foodName: { $regex: q, $options: "i" },
    })
      .limit(5)
      .lean();

    myFoods.forEach((food) => {
      if (!seenIds.has(food.foodName.toLowerCase())) {
        results.push({
          _id: food._id,
          foodId: food._id.toString(),
          foodName: food.foodName,
          source: "myFoods",
          quantity: food.quantity,
          unit: food.unit,
          protein: food.protein,
          calories: food.calories,
          carbs: food.carbs,
          fat: food.fat,
        });
        seenIds.add(food.foodName.toLowerCase());
      }
    });

    // 3. Food cache (previously fetched external results)
    const cached = await FoodCache.find({
      $text: { $search: q },
    })
      .limit(5)
      .lean();

    const overrides = await AdminFood.find({ overridesFoodId: { $ne: null } }).lean();
    const overrideMap = new Map();
    overrides.forEach((o) => {
      overrideMap.set(o.overridesFoodId, o);
    });

    cached.forEach((food) => {
      if (!seenIds.has(food.foodName.toLowerCase())) {
        const override = overrideMap.get(food.foodId);
        const result = {
          _id: food._id,
          foodId: food.foodId,
          foodName: food.foodName,
          source: food.source,
          quantity: override?.quantity || food.quantity,
          unit: override?.unit || food.unit,
          protein: override?.protein || food.protein,
          calories: override?.calories || food.calories,
          carbs: override?.carbs || food.carbs,
          fat: override?.fat || food.fat,
        };
        results.push(result);
        seenIds.add(food.foodName.toLowerCase());
      }
    });

    // 4 & 5. Live APIs (if results are sparse)
    if (results.length < 5) {
      const [offResults, usdaResults] = await Promise.all([
        searchOpenFoodFacts(q),
        searchUSDA(q, process.env.USDA_API_KEY),
      ]);

      for (const food of [...offResults, ...usdaResults]) {
        if (results.length >= 10) break;
        // Skip foods with all zero nutrition values (incomplete data)
        if (food.protein === 0 && food.calories === 0 && food.carbs === 0 && food.fat === 0) {
          continue;
        }
        if (!seenIds.has(food.foodName.toLowerCase())) {
          const override = overrideMap.get(food.foodId);

          // Cache the result
          await FoodCache.updateOne(
            { foodId: food.foodId },
            {
              $set: {
                foodId: food.foodId,
                foodName: food.foodName,
                source: food.source,
                quantity: food.quantity,
                unit: food.unit,
                protein: food.protein,
                calories: food.calories,
                carbs: food.carbs,
                fat: food.fat,
                cachedAt: new Date(),
              },
            },
            { upsert: true }
          );

          results.push({
            foodId: food.foodId,
            foodName: food.foodName,
            source: food.source,
            quantity: override?.quantity || food.quantity,
            unit: override?.unit || food.unit,
            protein: override?.protein || food.protein,
            calories: override?.calories || food.calories,
            carbs: override?.carbs || food.carbs,
            fat: override?.fat || food.fat,
          });
          seenIds.add(food.foodName.toLowerCase());
        }
      }
    }

    res.json(results.slice(0, 10));
  } catch (err) {
    console.error("Food search error:", err);
    res.status(500).json({ error: "Food search failed" });
  }
}
