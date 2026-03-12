import { useState, useEffect } from 'react';
import { X, Clock, Users, ChefHat } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RecipeDetailProps {
  recipeId: string;
  onClose: () => void;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: string;
  cooking_time: number;
  servings: number;
}

interface RecipeIngredient {
  quantity: string;
  unit: string;
  ingredients: {
    name: string;
  };
}

export default function RecipeDetail({ recipeId, onClose }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipeDetail();
  }, [recipeId]);

  const loadRecipeDetail = async () => {
    const { data: recipeData } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .maybeSingle();

    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select(`
        quantity,
        unit,
        ingredients (
          name
        )
      `)
      .eq('recipe_id', recipeId);

    if (recipeData) setRecipe(recipeData);
    if (ingredientsData) setIngredients(ingredientsData as RecipeIngredient[]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!recipe) return null;

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="relative h-64 bg-gradient-to-br from-orange-400 to-red-400 rounded-t-2xl flex items-center justify-center">
          <span className="text-9xl">🍽️</span>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                {recipe.name}
              </h2>
              <p className="text-gray-600 text-lg">{recipe.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || difficultyColors.Medium
            }`}>
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex gap-6 mb-8 text-gray-700">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-orange-500" />
              <span>{recipe.cooking_time} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-orange-500" />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat size={20} className="text-orange-500" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ingredients
              </h3>
              <ul className="space-y-2">
                {ingredients.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">
                      {item.quantity} {item.unit} {item.ingredients.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Instructions
              </h3>
              <div className="prose prose-orange max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {recipe.instructions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
