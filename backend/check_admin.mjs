import mongoose from "mongoose";

const adminFoodSchema = new mongoose.Schema({}, { collection: "adminfoods", strict: false });
const AdminFood = mongoose.model("AdminFood", adminFoodSchema);

const myFoodSchema = new mongoose.Schema({}, { collection: "myfoods", strict: false });
const MyFood = mongoose.model("MyFood", myFoodSchema);

await mongoose.connect("mongodb+srv://admin:admin@main.64rzctb.mongodb.net/nutriKosh");

console.log("=== Admin Foods ===");
const admin = await AdminFood.find({ foodName: { $regex: "RICE", $options: "i" } });
admin.forEach(item => console.log(`  ${item.foodName}: P=${item.protein} Cal=${item.calories}`));

console.log("=== My Foods ===");
const my = await MyFood.find({ foodName: { $regex: "RICE", $options: "i" } });
my.forEach(item => console.log(`  ${item.foodName}: P=${item.protein} Cal=${item.calories}`));

process.exit(0);
