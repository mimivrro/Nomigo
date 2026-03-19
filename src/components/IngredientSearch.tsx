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

  useEffect(() => { loadIngredients(); }, []);

  useEffect(() => {
    if (selectedIngredients.length > 0) searchRecipes();
    else setMatchedRecipes([]);
  }, [selectedIngredients]);

  const loadIngredients = async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name');
    if (data) setAvailableIngredients(data);
  };

  const searchRecipes = async () => {
    setLoading(true);
    const { data: recipes } = await supabase
      .from('recipes')
      .select(`id, name, description, difficulty, cooking_time, servings, image_url, recipe_ingredients(ingredient_id)`)
      .eq('cuisine_id', cuisine.id);

    if (recipes) {
      const scored = recipes.map((recipe: any) => {
        const recipeIngredients = recipe.recipe_ingredients.map((ri: any) => ri.ingredient_id);
        const matchCount = selectedIngredients.filter(ing => recipeIngredients.includes(ing)).length;
        return { id: recipe.id, name: recipe.name, description: recipe.description, difficulty: recipe.difficulty, cooking_time: recipe.cooking_time, servings: recipe.servings, image_url: recipe.image_url, matchCount };
      }).filter((r: Recipe) => r.matchCount > 0)
        .sort((a: Recipe, b: Recipe) => b.matchCount - a.matchCount);
      setMatchedRecipes(scored);
    }
    setLoading(false);
  };

  const filteredIngredients = availableIngredients.filter(
    (ing) => ing.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedIngredients.includes(ing.id)
  );

  const toggleIngredient = (id: string) => {
    setSelectedIngredients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --dark:    #16120e;
          --dark2:   #1e1a14;
          --dark3:   #26211a;
          --gold:    #C9A84C;
          --gold-lt: #E2C47A;
          --gold-dk: #8B6914;
          --cream:   #F5EDD8;
          --muted:   rgba(245,237,216,0.45);
          --dim:     rgba(245,237,216,0.22);
        }

        * { box-sizing: border-box; }

        .is-wrap {
          min-height: 100vh;
          background: var(--dark);
          padding: 2.5rem 1.5rem 6rem;
          font-family: 'Jost', sans-serif;
        }

        .is-inner { max-width: 1200px; margin: 0 auto; }

        /* Back */
        .is-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: .78rem; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: var(--dim);
          background: none; border: none; cursor: pointer;
          padding: 8px 0; margin-bottom: 2rem;
          transition: color .2s;
        }
        .is-back:hover { color: var(--gold); }

        /* Page heading */
        .is-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700;
          color: var(--cream); letter-spacing: -.01em;
          margin: 0 0 .35rem;
        }
        .is-heading em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold-lt));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .is-subheading {
          font-size: .85rem; font-weight: 300; color: var(--dim);
          letter-spacing: .04em; margin-bottom: 2.5rem;
        }

        /* Layout grid */
        .is-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          align-items: start;
        }
        @media (max-width: 900px) { .is-grid { grid-template-columns: 1fr; } }

        /* ── SIDEBAR ── */
        .is-sidebar {
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.12);
          border-radius: 20px;
          overflow: hidden;
          position: sticky; top: 88px;
          box-shadow: 0 12px 48px rgba(0,0,0,.4);
        }

        /* Sidebar gold top bar */
        .is-sidebar::before {
          content: ''; display: block;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--gold), var(--gold-lt), var(--gold), transparent);
        }

        .is-sidebar-inner { padding: 1.5rem; }

        .is-sidebar-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 700; color: var(--cream);
          margin: 0 0 .3rem;
        }
        .is-sidebar-line {
          width: 28px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: 1.25rem;
        }

        /* Selected tags */
        .is-tags {
          display: flex; flex-wrap: wrap; gap: 7px;
          margin-bottom: 1.2rem; min-height: 0;
        }
        .is-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(201,168,76,.12);
          border: 1px solid rgba(201,168,76,.28);
          border-radius: 20px;
          padding: 4px 10px 4px 12px;
          font-size: .75rem; font-weight: 500;
          color: var(--gold-lt); letter-spacing: .04em;
          transition: all .2s;
        }
        .is-tag-remove {
          display: flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(201,168,76,.15);
          border: none; cursor: pointer; color: var(--gold);
          padding: 0; transition: all .2s;
        }
        .is-tag-remove:hover { background: rgba(201,168,76,.35); }

        /* Search box */
        .is-search-wrap {
          position: relative; margin-bottom: 1rem;
        }
        .is-search-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: rgba(201,168,76,.45);
          pointer-events: none;
        }
        .is-search-input {
          width: 100%; padding: 10px 12px 10px 38px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(201,168,76,.15);
          border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: .85rem; font-weight: 300;
          color: var(--cream); outline: none;
          transition: border-color .2s, background .2s;
        }
        .is-search-input::placeholder { color: var(--dim); }
        .is-search-input:focus {
          border-color: rgba(201,168,76,.4);
          background: rgba(201,168,76,.04);
        }

        /* Ingredient list */
        .is-ing-list {
          max-height: 360px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 3px;
          scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.2) transparent;
        }
        .is-ing-list::-webkit-scrollbar { width: 4px; }
        .is-ing-list::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 4px; }

        .is-ing-btn {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between;
          padding: 9px 12px; border-radius: 9px;
          background: transparent; border: none; cursor: pointer;
          text-align: left; transition: all .18s ease;
        }
        .is-ing-btn:hover { background: rgba(201,168,76,.07); }
        .is-ing-name {
          font-size: .84rem; font-weight: 400; color: var(--muted);
          transition: color .18s;
        }
        .is-ing-btn:hover .is-ing-name { color: var(--cream); }
        .is-ing-plus {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(201,168,76,.1);
          border: 1px solid rgba(201,168,76,.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold); flex-shrink: 0;
          transition: all .18s;
        }
        .is-ing-btn:hover .is-ing-plus {
          background: rgba(201,168,76,.22);
          border-color: var(--gold);
        }

        /* Empty ingredient list */
        .is-ing-empty {
          padding: 1.5rem; text-align: center;
          font-size: .8rem; color: var(--dim); font-weight: 300;
        }

        /* ── RESULTS PANEL ── */
        .is-results { }

        .is-results-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700;
          color: var(--cream); margin: 0 0 .3rem;
        }
        .is-results-count {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Jost', sans-serif;
          font-size: .7rem; font-weight: 600; letter-spacing: .12em;
          text-transform: uppercase; color: var(--gold);
          background: rgba(201,168,76,.08);
          border: 1px solid rgba(201,168,76,.2);
          border-radius: 20px; padding: 3px 12px;
          margin-left: 12px; vertical-align: middle;
        }
        .is-results-sub {
          font-size: .8rem; font-weight: 300; color: var(--dim);
          margin-bottom: 2rem; letter-spacing: .03em;
        }

        /* Spinner */
        .is-spinner {
          display: flex; justify-content: center; padding: 4rem 0;
        }
        .spinner-ring {
          width: 44px; height: 44px; border-radius: 50%;
          border: 2px solid rgba(201,168,76,.15);
          border-top-color: var(--gold);
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Empty state */
        .is-empty {
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; padding: 4rem 2rem;
          text-align: center;
        }
        .is-empty-emoji { font-size: 2.5rem; margin-bottom: 1rem; }
        .is-empty-text {
          font-size: .95rem; font-weight: 300;
          color: var(--dim); line-height: 1.6;
        }
        .is-empty-hint {
          display: inline-block; margin-top: 1rem;
          font-size: .75rem; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: rgba(201,168,76,.4);
        }

        /* Recipe grid */
        .is-recipe-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        @media (max-width: 640px) { .is-recipe-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="is-wrap">
        <div className="is-inner">
          <button className="is-back" onClick={onBack}>
            <ArrowLeft size={16} strokeWidth={2} /> Back
          </button>

          <h1 className="is-heading">
            Search <em>{cuisine.name}</em> by Ingredients
          </h1>
          <p className="is-subheading">
            Pick what's in your kitchen — we'll find the best matches
          </p>

          <div className="is-grid">

            {/* ── SIDEBAR ── */}
            <aside className="is-sidebar">
              <div className="is-sidebar-inner">
                <h3 className="is-sidebar-title">Your Ingredients</h3>
                <div className="is-sidebar-line" />

                {/* Selected tags */}
                {selectedIngredients.length > 0 && (
                  <div className="is-tags">
                    {selectedIngredients.map((ingId) => {
                      const ing = availableIngredients.find(i => i.id === ingId);
                      return ing ? (
                        <span key={ingId} className="is-tag">
                          {ing.name}
                          <button className="is-tag-remove" onClick={() => toggleIngredient(ingId)}>
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Search */}
                <div className="is-search-wrap">
                  <Search className="is-search-icon" size={16} strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Type an ingredient..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="is-search-input"
                  />
                </div>

                {/* Ingredient list */}
                <div className="is-ing-list">
                  {filteredIngredients.length === 0 ? (
                    <div className="is-ing-empty">
                      {searchTerm ? `No ingredients matching "${searchTerm}"` : 'No more ingredients to add'}
                    </div>
                  ) : (
                    filteredIngredients.slice(0, 20).map((ing) => (
                      <button key={ing.id} className="is-ing-btn" onClick={() => toggleIngredient(ing.id)}>
                        <span className="is-ing-name">{ing.name}</span>
                        <span className="is-ing-plus">
                          <Plus size={12} strokeWidth={2.5} />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* ── RESULTS ── */}
            <div className="is-results">
              <h2 className="is-results-title">
                Matching Recipes
                {!loading && matchedRecipes.length > 0 && (
                  <span className="is-results-count">{matchedRecipes.length} found</span>
                )}
              </h2>
              <p className="is-results-sub">
                {selectedIngredients.length === 0
                  ? 'Add ingredients from the panel to find recipes'
                  : `Showing recipes that use ${selectedIngredients.length} selected ingredient${selectedIngredients.length > 1 ? 's' : ''}`}
              </p>

              {loading ? (
                <div className="is-spinner"><div className="spinner-ring" /></div>
              ) : matchedRecipes.length === 0 ? (
                <div className="is-empty">
                  <div className="is-empty-emoji">
                    {selectedIngredients.length === 0 ? '🥕' : '🍳'}
                  </div>
                  <p className="is-empty-text">
                    {selectedIngredients.length === 0
                      ? 'Select ingredients to find matching recipes'
                      : 'No recipes match your ingredients. Try different combinations!'}
                  </p>
                  {selectedIngredients.length > 0 && (
                    <span className="is-empty-hint">Try removing some ingredients</span>
                  )}
                </div>
              ) : (
                <div className="is-recipe-grid">
                  {matchedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} matchCount={recipe.matchCount} />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}