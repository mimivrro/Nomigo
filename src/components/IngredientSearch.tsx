import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RecipeCard from './RecipeCard';

interface Cuisine {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  cooking_time: number;
  servings: number;
  image_url: string;
  matchCount: number;
}

interface IngredientSearchProps {
  cuisine: Cuisine;
  onBack: () => void;
}

export default function IngredientSearch({ cuisine, onBack }: IngredientSearchProps) {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      searchRecipes();
    } else {
      setMatchedRecipes([]);
    }
  }, [selectedIngredients]);

  const loadIngredients = async () => {
    const { data } = await supabase
      .from('ingredients')
      .select('*')
      .order('name');

    if (data) {
      setAvailableIngredients(data);
    }
  };

  const searchRecipes = async () => {
    setLoading(true);

    const { data: recipes } = await supabase
      .from('recipes')
      .select(`
        id,
        name,
        description,
        difficulty,
        cooking_time,
        servings,
        image_url,
        recipe_ingredients (
          ingredient_id
        )
      `)
      .eq('cuisine_id', cuisine.id);

    if (recipes) {
      const scoredRecipes = recipes.map((recipe: any) => {
        const recipeIngredients = recipe.recipe_ingredients.map((ri: any) => ri.ingredient_id);
        const matchCount = selectedIngredients.filter(ing => recipeIngredients.includes(ing)).length;
        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          difficulty: recipe.difficulty,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
          image_url: recipe.image_url,
          matchCount,
        };
      }).filter((recipe: Recipe) => recipe.matchCount > 0)
        .sort((a: Recipe, b: Recipe) => b.matchCount - a.matchCount);

      setMatchedRecipes(scoredRecipes);
    }

    setLoading(false);
  };

  const filteredIngredients = availableIngredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.includes(ing.id)
  );

  const toggleIngredient = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

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

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Your Ingredients
              </h3>

              {selectedIngredients.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedIngredients.map((ingId) => {
                    const ingredient = availableIngredients.find(i => i.id === ingId);
                    return ingredient ? (
                      <span
                        key={ingId}
                        className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {ingredient.name}
                        <button
                          onClick={() => toggleIngredient(ingId)}
                          className="hover:text-orange-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredIngredients.slice(0, 20).map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                  >
                    <span className="text-gray-700">{ingredient.name}</span>
                    <Plus size={20} className="text-orange-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Matching Recipes
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
              </div>
            ) : matchedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">
                  {selectedIngredients.length === 0
                    ? 'Select ingredients to find matching recipes'
                    : 'No recipes match your ingredients. Try different combinations!'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {matchedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    matchCount={recipe.matchCount}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
