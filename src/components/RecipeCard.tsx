import { useState } from 'react';
import { Clock, Users, Heart } from 'lucide-react';
import RecipeDetail from './RecipeDetail';

interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  cooking_time: number;
  servings: number;
  image_url: string;
}

interface RecipeCardProps {
  recipe: Recipe;
  matchCount?: number;
}

export default function RecipeCard({ recipe, matchCount }: RecipeCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer group"
      >
        <div className="relative h-48 bg-gradient-to-br from-orange-300 to-red-300 flex items-center justify-center">
          <span className="text-6xl">🍽️</span>
          {matchCount !== undefined && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {matchCount} ingredients match
            </div>
          )}
          <button className="absolute top-3 left-3 bg-white/90 p-2 rounded-full hover:bg-white transition-colors">
            <Heart size={20} className="text-gray-600 hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors flex-1">
              {recipe.name}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              difficultyColors[recipe.difficulty as keyof typeof difficultyColors] || difficultyColors.Medium
            }`}>
              {recipe.difficulty}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{recipe.cooking_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <RecipeDetail
          recipeId={recipe.id}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
