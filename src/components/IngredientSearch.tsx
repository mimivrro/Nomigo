import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, X, Search, Globe, ChefHat } from 'lucide-react';

interface Cuisine {
  id: string;
  name: string;
}

interface IngredientSearchProps {
  cuisine: Cuisine;
  onBack: () => void;
}

// ── Spoonacular response types ──────────────────────────────
interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: { name: string }[];
  missedIngredients: { name: string }[];
}

interface SpoonacularDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  extendedIngredients: { original: string }[];
  analyzedInstructions: { steps: { number: number; step: string }[] }[];
  cuisines: string[];
  dishTypes: string[];
  summary: string;
}

// ── Popular ingredient suggestions ──────────────────────────
const COMMON_INGREDIENTS = [
  'chicken', 'rice', 'onion', 'garlic', 'tomato', 'egg', 'butter',
  'olive oil', 'lemon', 'ginger', 'cumin', 'coriander', 'pasta',
  'beef', 'potato', 'spinach', 'cheese', 'milk', 'flour', 'chili',
  'coconut milk', 'soy sauce', 'carrot', 'pepper', 'salt', 'basil',
  'lamb', 'shrimp', 'mushroom', 'bell pepper', 'yogurt', 'cream',
];

const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export default function IngredientSearch({ cuisine, onBack }: IngredientSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SpoonacularDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Filter suggestions as user types ──
  useEffect(() => {
    if (inputValue.trim().length < 1) { setSuggestions([]); return; }
    const q = inputValue.toLowerCase();
    const filtered = COMMON_INGREDIENTS.filter(
      i => i.includes(q) && !selectedIngredients.includes(i)
    );
    setSuggestions(filtered.slice(0, 6));
  }, [inputValue, selectedIngredients]);

  // ── Fetch recipes whenever ingredients or filter changes ──
  useEffect(() => {
    if (selectedIngredients.length === 0) { setRecipes([]); return; }
    fetchRecipes();
  }, [selectedIngredients, globalSearch]);

  const fetchRecipes = async () => {
    if (!SPOONACULAR_KEY) {
      setError('Spoonacular API key missing. Add VITE_SPOONACULAR_KEY to your .env file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ingredientParam = selectedIngredients.join(',');
      // ranking=2 → maximize used ingredients (best matches first)
      let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientParam)}&number=18&ranking=2&ignorePantry=true&apiKey=${SPOONACULAR_KEY}`;

      let data: SpoonacularRecipe[] = await fetch(url).then(r => r.json());

      // If cuisine filter is ON, filter results by cuisine name
      if (!globalSearch && data.length > 0) {
        const cuisineName = cuisine.name.toLowerCase();
        // Spoonacular findByIngredients doesn't support cuisine filter natively,
        // so we do a second call with cuisine tag and intersect by ID
        const cuisineUrl = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${encodeURIComponent(cuisine.name)}&includeIngredients=${encodeURIComponent(ingredientParam)}&number=18&ranking=2&apiKey=${SPOONACULAR_KEY}`;
        const cuisineData = await fetch(cuisineUrl).then(r => r.json());
        const cuisineIds = new Set((cuisineData.results || []).map((r: any) => r.id));

        // Split into cuisine-specific (best matches) and global (partial matches)
        const cuisineMatches = data.filter(r => cuisineIds.has(r.id));
        const globalMatches  = data.filter(r => !cuisineIds.has(r.id));

        // Put cuisine matches first, then global as "partial"
        data = [...cuisineMatches, ...globalMatches];
      }

      // Sort: most used ingredients first
      data.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
      setRecipes(data);
    } catch (err) {
      setError('Failed to fetch recipes. Check your API key and try again.');
    }
    setLoading(false);
  };

  const loadRecipeDetail = async (id: number) => {
    if (!SPOONACULAR_KEY) return;
    setDetailLoading(true);
    try {
      const data: SpoonacularDetail = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_KEY}`
      ).then(r => r.json());
      setSelectedRecipe(data);
    } catch {
      setError('Failed to load recipe details.');
    }
    setDetailLoading(false);
  };

  const addIngredient = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients(prev => [...prev, trimmed]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const removeIngredient = (name: string) => {
    setSelectedIngredients(prev => prev.filter(i => i !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  // ── DETAIL VIEW ────────────────────────────────────────────
  if (detailLoading) {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        <div style={{ minHeight:'100vh', background:'var(--dark)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="spinner-ring" />
        </div>
      </>
    );
  }

  if (selectedRecipe) {
    const steps = selectedRecipe.analyzedInstructions?.[0]?.steps || [];
    return (
      <>
        <style>{`${SHARED_STYLES}
          .sd-wrap { min-height:100vh; background:var(--dark); padding:2.5rem 1.5rem 6rem; }
          .sd-inner { max-width:820px; margin:0 auto; }
          .sd-hero { position:relative; height:260px; border-radius:18px; overflow:hidden; margin-bottom:2rem; box-shadow:0 24px 60px rgba(0,0,0,.6); }
          .sd-hero-img { width:100%; height:100%; object-fit:cover; filter:brightness(.55) saturate(.8); display:block; }
          .sd-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(22,18,14,1) 0%, rgba(22,18,14,.3) 55%, transparent 100%); }
          .sd-hero-name { position:absolute; bottom:1.5rem; left:1.75rem; right:1.75rem; font-family:'Cormorant Garamond',serif; font-size:clamp(1.6rem,4vw,2.6rem); font-weight:700; color:var(--cream); line-height:1.1; z-index:2; }
          .sd-gold-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,#C9A84C,transparent); z-index:3; }
          .sd-meta { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.5rem; }
          .sd-pill { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,.03); border:1px solid rgba(201,168,76,.12); border-radius:20px; padding:4px 12px; font-size:.76rem; color:var(--muted); }
          .sd-pill svg { color:var(--gold); }
          .sd-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent); margin-bottom:1.5rem; }
          .sd-content { display:grid; grid-template-columns:240px 1fr; gap:2.5rem; }
          @media(max-width:600px){ .sd-content { grid-template-columns:1fr; } }
          .sd-section-title { font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-weight:700; color:var(--cream); margin:0 0 .3rem; }
          .sd-section-line { width:26px; height:1px; background:linear-gradient(90deg,var(--gold),transparent); margin-bottom:1rem; }
          .sd-ing-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
          .sd-ing-item { display:flex; align-items:flex-start; gap:9px; font-size:.82rem; color:var(--muted); line-height:1.4; }
          .sd-ing-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); flex-shrink:0; margin-top:5px; }
          .sd-steps { display:flex; flex-direction:column; gap:14px; }
          .sd-step { display:flex; gap:12px; align-items:flex-start; }
          .sd-step-num { flex-shrink:0; width:26px; height:26px; border-radius:50%; border:1px solid rgba(201,168,76,.28); background:rgba(201,168,76,.06); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:.82rem; font-weight:700; color:var(--gold); }
          .sd-step-text { font-size:.84rem; font-weight:300; color:var(--muted); line-height:1.8; padding-top:2px; }
          .sd-no-steps { font-size:.84rem; font-weight:300; color:var(--dim); font-style:italic; }
        `}</style>
        <div className="sd-wrap">
          <div className="sd-inner">
            <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
              <ArrowLeft size={15} strokeWidth={2} /> Back to results
            </button>
            <div className="sd-hero">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="sd-hero-img" />
              <div className="sd-hero-overlay" />
              <div className="sd-gold-bar" />
              <h1 className="sd-hero-name">{selectedRecipe.title}</h1>
            </div>
            <div className="sd-meta">
              {selectedRecipe.readyInMinutes > 0 && (
                <span className="sd-pill">⏱ {selectedRecipe.readyInMinutes} min</span>
              )}
              {selectedRecipe.servings > 0 && (
                <span className="sd-pill">👥 {selectedRecipe.servings} servings</span>
              )}
              {selectedRecipe.cuisines?.length > 0 && (
                <span className="sd-pill">🌍 {selectedRecipe.cuisines.join(', ')}</span>
              )}
              {selectedRecipe.dishTypes?.length > 0 && (
                <span className="sd-pill">🍽 {selectedRecipe.dishTypes[0]}</span>
              )}
            </div>
            <div className="sd-divider" />
            <div className="sd-content">
              <div>
                <h2 className="sd-section-title">Ingredients</h2>
                <div className="sd-section-line" />
                <ul className="sd-ing-list">
                  {selectedRecipe.extendedIngredients?.map((ing, i) => (
                    <li key={i} className="sd-ing-item">
                      <span className="sd-ing-dot" />
                      {ing.original}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="sd-section-title">Instructions</h2>
                <div className="sd-section-line" />
                {steps.length > 0 ? (
                  <div className="sd-steps">
                    {steps.map(s => (
                      <div key={s.number} className="sd-step">
                        <span className="sd-step-num">{s.number}</span>
                        <p className="sd-step-text">{s.step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="sd-no-steps">No step-by-step instructions available for this recipe.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── SEARCH VIEW ────────────────────────────────────────────
  return (
    <>
      <style>{`${SHARED_STYLES}
        .is-wrap { min-height:100vh; background:var(--dark); padding:2.5rem 1.5rem 6rem; font-family:'Jost',sans-serif; }
        .is-inner { max-width:1200px; margin:0 auto; }
        .is-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(1.8rem,4vw,2.8rem); font-weight:700; color:var(--cream); letter-spacing:-.01em; margin:0 0 .35rem; }
        .is-heading em { font-style:italic; background:linear-gradient(135deg,var(--gold),var(--gold-lt)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .is-sub { font-size:.85rem; font-weight:300; color:var(--dim); letter-spacing:.04em; margin-bottom:2.5rem; }

        /* Ingredient input area */
        .is-input-card {
          background:var(--dark2); border:1px solid rgba(201,168,76,.13);
          border-radius:20px; overflow:hidden;
          box-shadow:0 8px 32px rgba(0,0,0,.3); margin-bottom:2rem;
        }
        .is-input-card::before { content:''; display:block; height:2px; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,#C9A84C,transparent); }
        .is-input-inner { padding:1.5rem; }
        .is-input-title { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:700; color:var(--cream); margin:0 0 .25rem; }
        .is-input-hint { font-size:.75rem; font-weight:300; color:var(--dim); margin-bottom:1rem; }

        /* Tags */
        .is-tags { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:1rem; min-height:0; }
        .is-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(201,168,76,.12); border:1px solid rgba(201,168,76,.28); border-radius:20px; padding:4px 10px 4px 12px; font-size:.75rem; font-weight:500; color:var(--gold-lt); letter-spacing:.04em; }
        .is-tag-x { display:flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:rgba(201,168,76,.15); border:none; cursor:pointer; color:var(--gold); padding:0; transition:all .2s; }
        .is-tag-x:hover { background:rgba(201,168,76,.35); }

        /* Text input row */
        .is-input-row { display:flex; gap:8px; position:relative; }
        .is-input-wrap { flex:1; position:relative; }
        .is-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(201,168,76,.4); pointer-events:none; }
        .is-input {
          width:100%; padding:11px 14px 11px 38px;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(201,168,76,.15); border-radius:10px;
          font-family:'Jost',sans-serif; font-size:.88rem; font-weight:300;
          color:var(--cream); outline:none;
          transition:border-color .2s, background .2s;
        }
        .is-input::placeholder { color:var(--dim); }
        .is-input:focus { border-color:rgba(201,168,76,.45); background:rgba(201,168,76,.04); }
        .is-add-btn {
          padding:11px 18px;
          background:linear-gradient(135deg,var(--gold),var(--gold-dk));
          color:var(--dark); border:none; border-radius:10px;
          font-family:'Jost',sans-serif; font-size:.8rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; cursor:pointer;
          transition:all .2s ease; white-space:nowrap;
        }
        .is-add-btn:hover { filter:brightness(1.08); transform:translateY(-1px); }

        /* Autocomplete dropdown */
        .is-suggestions {
          position:absolute; top:calc(100% + 6px); left:0; right:60px; z-index:10;
          background:var(--dark3); border:1px solid rgba(201,168,76,.18); border-radius:10px;
          overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.5);
        }
        .is-suggestion-item {
          width:100%; padding:9px 14px; background:none; border:none;
          text-align:left; font-family:'Jost',sans-serif;
          font-size:.84rem; font-weight:400; color:var(--muted);
          cursor:pointer; transition:all .15s;
          display:flex; align-items:center; gap:8px;
        }
        .is-suggestion-item:hover { background:rgba(201,168,76,.08); color:var(--cream); }
        .is-sug-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); flex-shrink:0; }

        /* Cuisine toggle */
        .is-toggle-row {
          display:flex; align-items:center; gap:10px;
          padding-top:1rem; border-top:1px solid rgba(201,168,76,.08);
          margin-top:1rem;
        }
        .is-toggle-label { font-size:.78rem; font-weight:400; color:var(--dim); }
        .is-toggle-btn {
          display:flex; align-items:center; gap:7px;
          padding:6px 14px; border-radius:8px;
          font-family:'Jost',sans-serif; font-size:.76rem; font-weight:600;
          letter-spacing:.08em; text-transform:uppercase; cursor:pointer;
          transition:all .2s ease; border:1px solid;
        }
        .is-toggle-btn.cuisine {
          background:rgba(201,168,76,.1); border-color:rgba(201,168,76,.3); color:var(--gold-lt);
        }
        .is-toggle-btn.global {
          background:rgba(100,180,255,.08); border-color:rgba(100,180,255,.25); color:#90c8f0;
        }

        /* Results */
        .is-results-header { margin-bottom:1.5rem; }
        .is-results-title { font-family:'Cormorant Garamond',serif; font-size:clamp(1.4rem,3vw,1.9rem); font-weight:700; color:var(--cream); margin:0 0 .3rem; }
        .is-results-sub { font-size:.8rem; font-weight:300; color:var(--dim); }
        .is-count { display:inline-flex; align-items:center; gap:5px; font-family:'Jost',sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); background:rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.2); border-radius:20px; padding:2px 10px; margin-left:10px; vertical-align:middle; }

        /* Error */
        .is-error { background:rgba(224,112,112,.08); border:1px solid rgba(224,112,112,.2); border-radius:12px; padding:1rem 1.25rem; font-size:.85rem; color:#e09090; margin-bottom:1.5rem; }

        /* Empty */
        .is-empty { background:var(--dark2); border:1px solid rgba(201,168,76,.1); border-radius:18px; padding:4rem 2rem; text-align:center; }
        .is-empty-emoji { font-size:2.5rem; margin-bottom:1rem; }
        .is-empty-text { font-size:.92rem; font-weight:300; color:var(--dim); line-height:1.65; }

        /* Grid */
        .is-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:860px){ .is-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .is-grid { grid-template-columns:1fr; } }

        /* Recipe card */
        .is-card { position:relative; overflow:hidden; background:var(--dark2); border:1px solid rgba(201,168,76,.1); border-radius:16px; cursor:pointer; transition:all .3s cubic-bezier(.4,0,.2,1); text-align:left; }
        .is-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,transparent); transform:scaleX(0); transition:transform .35s ease; }
        .is-card:hover { border-color:rgba(201,168,76,.3); transform:translateY(-5px); box-shadow:0 20px 60px rgba(0,0,0,.5); }
        .is-card:hover::after { transform:scaleX(1); }

        .is-card-img { height:170px; overflow:hidden; position:relative; }
        .is-card-photo { width:100%; height:100%; object-fit:cover; filter:brightness(.6) saturate(.8); transition:transform .5s ease, filter .4s ease; display:block; }
        .is-card:hover .is-card-photo { transform:scale(1.07); filter:brightness(.78) saturate(1); }
        .is-card-img-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(22,18,14,.85) 0%, transparent 55%); }

        /* Match badge */
        .is-match-badge { position:absolute; bottom:9px; left:10px; z-index:2; display:inline-flex; align-items:center; gap:5px; background:rgba(201,168,76,.16); border:1px solid rgba(201,168,76,.32); border-radius:20px; padding:3px 9px; font-size:.66rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--gold-lt); backdrop-filter:blur(6px); }
        .is-match-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); }
        .is-missed-badge { position:absolute; bottom:9px; right:10px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:3px 9px; font-size:.64rem; color:rgba(245,237,216,.4); backdrop-filter:blur(6px); }

        .is-card-body { padding:1rem 1.1rem 1.2rem; }
        .is-card-name { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:700; color:var(--cream); margin:0 0 .3rem; line-height:1.25; transition:color .2s; }
        .is-card:hover .is-card-name { color:var(--gold-lt); }
        .is-card-sep { width:20px; height:1px; background:linear-gradient(90deg,var(--gold),transparent); margin-bottom:.5rem; transition:width .3s; }
        .is-card:hover .is-card-sep { width:34px; }
        .is-card-used { font-size:.74rem; font-weight:300; color:rgba(245,237,216,.35); }
        .is-card-used span { color:var(--gold-lt); font-weight:500; }
      `}</style>

      <div className="is-wrap">
        <div className="is-inner">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={15} strokeWidth={2} /> Back
          </button>

          <h1 className="is-heading">
            Search <em>{globalSearch ? 'All Cuisines' : cuisine.name}</em> by Ingredients
          </h1>
          <p className="is-sub">Type ingredients you have — we'll find the best matching recipes</p>

          {/* ── Input card ── */}
          <div className="is-input-card">
            <div className="is-input-inner">
              <p className="is-input-title">What's in your kitchen?</p>
              <p className="is-input-hint">Type an ingredient and press Enter or comma to add it</p>

              {/* Selected tags */}
              {selectedIngredients.length > 0 && (
                <div className="is-tags">
                  {selectedIngredients.map(ing => (
                    <span key={ing} className="is-tag">
                      {ing}
                      <button className="is-tag-x" onClick={() => removeIngredient(ing)}>
                        <X size={10} strokeWidth={2.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Text input + add button */}
              <div className="is-input-row">
                <div className="is-input-wrap">
                  <Search size={15} className="is-input-icon" strokeWidth={2} />
                  <input
                    type="text"
                    className="is-input"
                    placeholder="e.g. chicken, garlic, rice..."
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {suggestions.length > 0 && (
                    <div className="is-suggestions">
                      {suggestions.map(s => (
                        <button key={s} className="is-suggestion-item" onClick={() => addIngredient(s)}>
                          <span className="is-sug-dot" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="is-add-btn" onClick={() => inputValue.trim() && addIngredient(inputValue)}>
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>

              {/* Cuisine / Global toggle */}
              <div className="is-toggle-row">
                <span className="is-toggle-label">Searching in:</span>
                <button
                  className={`is-toggle-btn ${globalSearch ? 'global' : 'cuisine'}`}
                  onClick={() => setGlobalSearch(g => !g)}
                >
                  {globalSearch
                    ? <><Globe size={13} strokeWidth={2} /> All cuisines</>
                    : <><ChefHat size={13} strokeWidth={2} /> {cuisine.name} only</>
                  }
                </button>
                <span className="is-toggle-label" style={{ opacity:.6 }}>— click to switch</span>
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          {error && <div className="is-error">⚠ {error}</div>}

          <div className="is-results-header">
            <h2 className="is-results-title">
              Matching Recipes
              {!loading && recipes.length > 0 && (
                <span className="is-count">{recipes.length} found</span>
              )}
            </h2>
            <p className="is-results-sub">
              {selectedIngredients.length === 0
                ? 'Add ingredients above to find matching recipes'
                : loading
                  ? 'Finding the best matches for you...'
                  : `Sorted by best ingredient match · ${globalSearch ? 'all cuisines' : cuisine.name + ' cuisine'}`}
            </p>
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
              <div className="spinner-ring" />
            </div>
          ) : recipes.length === 0 && selectedIngredients.length > 0 ? (
            <div className="is-empty">
              <div className="is-empty-emoji">🍳</div>
              <p className="is-empty-text">
                No recipes found for those ingredients.<br />Try adding more or switch to <strong style={{ color:'var(--gold-lt)' }}>All Cuisines</strong>.
              </p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="is-empty">
              <div className="is-empty-emoji">🥕</div>
              <p className="is-empty-text">Add ingredients from your kitchen to get started</p>
            </div>
          ) : (
            <div className="is-grid">
              {recipes.map(recipe => (
                <div key={recipe.id} className="is-card" onClick={() => loadRecipeDetail(recipe.id)}>
                  <div className="is-card-img">
                    <img src={recipe.image} alt={recipe.title} className="is-card-photo"
                      onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    <div className="is-card-img-overlay" />
                    {recipe.usedIngredientCount > 0 && (
                      <span className="is-match-badge">
                        <span className="is-match-dot" />
                        {recipe.usedIngredientCount} matched
                      </span>
                    )}
                    {recipe.missedIngredientCount > 0 && (
                      <span className="is-missed-badge">
                        +{recipe.missedIngredientCount} needed
                      </span>
                    )}
                  </div>
                  <div className="is-card-body">
                    <h3 className="is-card-name">{recipe.title}</h3>
                    <div className="is-card-sep" />
                    <p className="is-card-used">
                      Uses <span>{recipe.usedIngredientCount}</span> of your ingredients
                      {recipe.missedIngredientCount > 0 && `, missing ${recipe.missedIngredientCount}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --dark:    #16120e;
    --dark2:   #1e1a14;
    --dark3:   #26211a;
    --gold:    #C9A84C;
    --gold-lt: #E2C47A;
    --gold-dk: #8B6914;
    --cream:   #F5EDD8;
    --muted:   rgba(245,237,216,0.48);
    --dim:     rgba(245,237,216,0.22);
  }
  * { box-sizing:border-box; }
  .back-btn {
    display:inline-flex; align-items:center; gap:8px;
    font-family:'Jost',sans-serif; font-size:.78rem; font-weight:500;
    letter-spacing:.1em; text-transform:uppercase; color:var(--dim);
    background:none; border:none; cursor:pointer; padding:8px 0; margin-bottom:1.75rem;
    transition:color .2s;
  }
  .back-btn:hover { color:var(--gold); }
  .spinner-ring {
    width:44px; height:44px; border-radius:50%;
    border:2px solid rgba(201,168,76,.15); border-top-color:var(--gold);
    animation:spin .8s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }
`;