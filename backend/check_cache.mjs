import mongoose from "mongoose";

const foodCacheSchema = new mongoose.Schema({}, { collection: "foodcaches", strict: false });
const FoodCache = mongoose.model("FoodCache", foodCacheSchema);

await mongoose.connect("mongodb+srv://admin:admin@main.64rzctb.mongodb.net/nutriKosh");
const items = await FoodCache.find({ foodName: { $regex: "RICE", $options: "i" } });
console.log(`Found ${items.length} rice items:`);
items.forEach(item => {
  console.log(`  - ${item.foodName}: P=${item.protein} Cal=${item.calories} C=${item.carbs}`);
});

// Try deleting
if (items.length > 0) {
  const result = await FoodCache.deleteMany({ foodName: { $regex: "RICE", $options: "i" } });
  console.log(`✓ Deleted ${result.deletedCount} items`);
}
process.exit(0);
