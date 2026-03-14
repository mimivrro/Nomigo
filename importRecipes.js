import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://maymeavcrujiwjfnjzpr.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const cuisines = [
  "Italian",
  "Chinese",
  "Japanese",
  "Mexican",
  "Indian",
  "French"
];

async function importRecipes() {

  console.log("Starting recipe import...\n");

  for (const cuisineName of cuisines) {

    console.log(`Importing cuisine: ${cuisineName}`);

    const { data: cuisineRow } = await supabase
      .from("cuisines")
      .select("id")
      .eq("name", cuisineName)
      .single();

    if (!cuisineRow) {
      console.log(`Cuisine not found in DB: ${cuisineName}`);
      continue;
    }

    const cuisineId = cuisineRow.id;

    const listRes = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisineName}`
    );

    const listData = await listRes.json();

    if (!listData.meals) continue;

    for (const meal of listData.meals) {

      try {

        const detailRes = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
        );

        const detailData = await detailRes.json();
        const recipe = detailData.meals[0];

        // Insert recipe
        const { data: insertedRecipe, error: recipeError } = await supabase
          .from("recipes")
          .insert({
            name: recipe.strMeal,
            instructions: recipe.strInstructions || "No instructions",
            difficulty: "medium",
            cooking_time: 30,
            servings: 4,
            image_url: recipe.strMealThumb,
            cuisine_id: cuisineId
          })
          .select()
          .single();

        if (recipeError) {
          console.log("Recipe insert error:", recipeError.message);
          continue;
        }

        if (!insertedRecipe) continue;

        // Process ingredients
        for (let i = 1; i <= 20; i++) {

          const ingredientName = recipe[`strIngredient${i}`]?.trim().toLowerCase();
          const quantity = recipe[`strMeasure${i}`] || "1";

          if (!ingredientName || ingredientName.trim() === "") continue;

          let { data: ingredient } = await supabase
            .from("ingredients")
            .select("id")
            .ilike("name", ingredientName)
            .maybeSingle();

          // create ingredient if missing
          if (!ingredient) {

          const { data: newIngredient, error: ingredientError } = await supabase
  .from("ingredients")
  .upsert(
    {
      name: ingredientName,
      category: "general"
    },
    { onConflict: "name" }
  )
  .select("id")
  .single();

            if (ingredientError) {
              console.log("Ingredient insert error:", ingredientError.message);
              continue;
            }

            ingredient = newIngredient;
          }

          if (!ingredient) continue;

          const { error: linkError } = await supabase
            .from("recipe_ingredients")
            .insert({
              recipe_id: insertedRecipe.id,
              ingredient_id: ingredient.id,
              quantity: quantity
            });

          if (linkError) {
            console.log("Link insert error:", linkError.message);
          }

        }

        console.log(`Added recipe + ingredients: ${recipe.strMeal}`);

      } catch (err) {

        console.log("Error importing recipe:", err);

      }

    }

  }

  console.log("\nRecipe import completed!");
}

importRecipes();