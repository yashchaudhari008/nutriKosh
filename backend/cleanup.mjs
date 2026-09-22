import mongoose from "mongoose";

const foodCacheSchema = new mongoose.Schema({}, { collection: "foodcaches", strict: false });
const FoodCache = mongoose.model("FoodCache", foodCacheSchema);

await mongoose.connect("mongodb+srv://admin:admin@main.64rzctb.mongodb.net/nutriKosh");
const result = await FoodCache.deleteMany({ foodName: /rice/i });
console.log(`✓ Deleted ${result.deletedCount} rice entries`);
process.exit(0);
