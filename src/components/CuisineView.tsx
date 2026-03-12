import { useState, useEffect } from 'react';
import { ArrowLeft, Search, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import IngredientSearch from './IngredientSearch';
import RecipeBrowser from './RecipeBrowser';

interface Cuisine {
  id: string;
  name: string;
  region: string;
  description: string;
  image_url: string;
}

interface CuisineViewProps {
  region: string;
  onBack: () => void;
}

export default function CuisineView({ region, onBack }: CuisineViewProps) {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);
  const [viewMode, setViewMode] = useState<'select' | 'ingredient' | 'browse'>('select');
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  console.log("CuisineView mounted. Region:", region);
  loadCuisines();
}, [region]);

 const loadCuisines = async () => {
  setLoading(true);

  console.log("Region selected:", region);

  const { data, error } = await supabase
    .from('cuisines')
    .select('*')
    .eq('region', region);

  console.log("Supabase result:", data);
  console.log("Supabase error:", error);

  if (!error && data) {
    setCuisines(data);
  }

  setLoading(false);
};

  if (viewMode === 'ingredient' && selectedCuisine) {
    return (
      <IngredientSearch
        cuisine={selectedCuisine}
        onBack={() => setViewMode('select')}
      />
    );
  }

  if (viewMode === 'browse' && selectedCuisine) {
    return (
      <RecipeBrowser
        cuisine={selectedCuisine}
        onBack={() => setViewMode('select')}
      />
    );
  }

  if (selectedCuisine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedCuisine(null)}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to cuisines
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {selectedCuisine.name}
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {selectedCuisine.description}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setViewMode('ingredient')}
                className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all group"
              >
                <Search className="mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
                <h3 className="text-2xl font-bold mb-2">Search by Ingredients</h3>
                <p className="text-orange-100">
                  Tell us what you have, we'll find the perfect recipe
                </p>
              </button>

              <button
                onClick={() => setViewMode('browse')}
                className="bg-gradient-to-br from-red-400 to-red-600 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all group"
              >
                <BookOpen className="mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
                <h3 className="text-2xl font-bold mb-2">Browse All Recipes</h3>
                <p className="text-red-100">
                  Explore our complete collection of authentic recipes
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-orange-500 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to regions
        </button>

        <h2 className="text-4xl font-bold text-gray-900 mb-8 capitalize">
          {region.replace('-', ' ')} Cuisines
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : cuisines.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No cuisines available for this region yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cuisines.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => setSelectedCuisine(cuisine)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all group"
              >
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                    {cuisine.name}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">
                    {cuisine.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
