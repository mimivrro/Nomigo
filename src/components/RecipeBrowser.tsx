import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

interface Cuisine {
  id: string;
  name: string;
}

interface RecipeBrowserProps {
  cuisine: Cuisine;
  onBack: () => void;
}

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export default function RecipeBrowser({ cuisine, onBack }: RecipeBrowserProps) {

  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, [cuisine.name]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine.name}`
      );

      const data = await res.json();

      if (data.meals) {
        setRecipes(data.meals);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setLoading(false);
    }
  };

  const loadRecipeDetails = async (id: string) => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );

      const data = await res.json();

      if (data.meals) {
        setSelectedRecipe(data.meals[0]);
      }
    } catch (error) {
      console.error("Error loading recipe:", error);
    }
  };

  /* =============================
     RECIPE DETAILS PAGE
  ============================== */

  if (selectedRecipe) {

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedRecipe[`strIngredient${i}`];
      const measure = selectedRecipe[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== "") {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }

    return (
      <div className="max-w-4xl mx-auto p-6">

        <button
          onClick={() => setSelectedRecipe(null)}
          className="mb-6 text-orange-500 font-semibold"
        >
          ← Back to recipes
        </button>

        <h1 className="text-3xl font-bold mb-4">
          {selectedRecipe.strMeal}
        </h1>

        <img
          src={selectedRecipe.strMealThumb}
          alt={selectedRecipe.strMeal}
          className="rounded-xl mb-6"
        />

        <h2 className="text-xl font-bold mb-2">Ingredients</h2>
        <ul className="list-disc ml-6 mb-6">
          {ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mb-2">Instructions</h2>
        <p className="mb-6 whitespace-pre-line">
          {selectedRecipe.strInstructions}
        </p>

        {selectedRecipe.strYoutube && (
          <a
            href={selectedRecipe.strYoutube}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            Watch Cooking Video
          </a>
        )}

      </div>
    );
  }

  /* =============================
     RECIPE LIST PAGE
  ============================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">

      <div className="max-w-7xl mx-auto px-4">

        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>

        <h2 className="text-4xl font-bold text-gray-900 mb-8">
          {cuisine.name} Recipes
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No recipes found for this cuisine.
            </p>
          </div>
        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {recipes.map((recipe) => (

              <div
                key={recipe.idMeal}
                onClick={() => loadRecipeDetails(recipe.idMeal)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
              >

                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-lg font-bold">
                    {recipe.strMeal}
                  </h3>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}