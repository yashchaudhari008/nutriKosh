export async function searchOpenFoodFacts(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).slice(0, 5).map((p) => ({
      foodId: p.code,
      foodName: p.product_name || "Unknown",
      source: "off",
      quantity: 100,
      unit: "g",
      protein: p.nutriments?.proteins_100g || 0,
      calories: p.nutriments?.["energy-kcal_100g"] || p.nutriments?.["energy_100g"] / 4.184 || 0,
      carbs: p.nutriments?.carbohydrates_100g,
      fat: p.nutriments?.fat_100g,
    }));
  } catch {
    return [];
  }
}

export async function searchUSDA(query, apiKey) {
  if (!apiKey) return [];
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${apiKey}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.foods || []).map((f) => {
      const nutrients = f.foodNutrients || [];
      const getByNutrientId = (id) => nutrients.find((n) => n.nutrientId === id)?.value || 0;
      return {
        foodId: f.fdcId,
        foodName: f.description,
        source: "usda",
        quantity: 100,
        unit: "g",
        protein: getByNutrientId(203),
        calories: getByNutrientId(208),
        carbs: getByNutrientId(205),
        fat: getByNutrientId(204),
      };
    });
  } catch {
    return [];
  }
}
