import mongoose from "mongoose";

const foodCacheSchema = new mongoose.Schema({}, { collection: "foodcaches", strict: false });
const FoodCache = mongoose.model("FoodCache", foodCacheSchema);

await mongoose.connect("mongodb+srv://admin:admin@main.64rzctb.mongodb.net/nutriKosh");

const zeros = await FoodCache.find({
  protein: 0,
  calories: 0,
  carbs: 0,
  fat: 0
});

console.log(`Found ${zeros.length} foods with all zero values:`);
zeros.slice(0, 20).forEach(f => {
  console.log(`  ${f.foodName} (${f.source}, ID: ${f.foodId})`);
});

if (zeros.length > 20) {
  console.log(`  ... and ${zeros.length - 20} more`);
}

process.exit(0);
