import { useState, useEffect } from 'react';
import { ArrowLeft, X, Search, ChevronDown, Globe } from 'lucide-react';

interface LeftoverSearchProps {
  onBack: () => void;
}

// ── All available cuisines ──────────────────────────────────
const ALL_CUISINES = [
  'African', 'American', 'British', 'Cajun', 'Caribbean',
  'Chinese', 'Eastern European', 'European', 'French', 'German',
  'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish',
  'Korean', 'Latin American', 'Mediterranean', 'Mexican',
  'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai',
  'Vietnamese',
];

// ── Common ingredient suggestions ──────────────────────────
const COMMON_INGREDIENTS = [
  'chicken', 'rice', 'onion', 'garlic', 'tomato', 'egg', 'butter',
  'olive oil', 'lemon', 'ginger', 'cumin', 'coriander', 'pasta',
  'beef', 'potato', 'spinach', 'cheese', 'milk', 'flour', 'chili',
  'coconut milk', 'soy sauce', 'carrot', 'pepper', 'salt', 'basil',
  'lamb', 'shrimp', 'mushroom', 'bell pepper', 'yogurt', 'cream',
  'pork', 'salmon', 'tuna', 'broccoli', 'cauliflower', 'zucchini',
  'eggplant', 'chickpeas', 'lentils', 'beans', 'corn', 'avocado',
  'cilantro', 'parsley', 'thyme', 'oregano', 'paprika', 'turmeric',
];

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
}

interface SpoonacularDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  cuisines: string[];
  dishTypes: string[];
  extendedIngredients: { original: string }[];
  analyzedInstructions: { steps: { number: number; step: string }[] }[];
}

const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

export default function LeftoverSearch({ onBack }: LeftoverSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<SpoonacularDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Autocomplete
  useEffect(() => {
    if (!inputValue.trim()) { setSuggestions([]); return; }
    const q = inputValue.toLowerCase();
    setSuggestions(
      COMMON_INGREDIENTS.filter(i => i.includes(q) && !selectedIngredients.includes(i)).slice(0, 6)
    );
  }, [inputValue, selectedIngredients]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setDropdownOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const addIngredient = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients(prev => [...prev, trimmed]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const removeIngredient = (name: string) =>
    setSelectedIngredients(prev => prev.filter(i => i !== name));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const handleSearch = async () => {
    if (!selectedIngredients.length) return;
    if (!SPOONACULAR_KEY) {
      setError('Spoonacular API key missing. Add VITE_SPOONACULAR_KEY to your .env file.');
      return;
    }
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const ingredientParam = selectedIngredients.join(',+');

      if (selectedCuisine === 'all') {
        // Use findByIngredients for global search — best ingredient matching
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientParam)}&number=24&ranking=2&ignorePantry=true&apiKey=${SPOONACULAR_KEY}`;
        const data: SpoonacularRecipe[] = await fetch(url).then(r => r.json());
        data.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
        setRecipes(data);
      } else {
        // Use complexSearch with cuisine filter + ingredients
        const url = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${encodeURIComponent(selectedCuisine)}&includeIngredients=${encodeURIComponent(ingredientParam)}&number=24&sort=max-used-ingredients&addRecipeInformation=false&apiKey=${SPOONACULAR_KEY}`;
        const data = await fetch(url).then(r => r.json());

        // complexSearch returns { results: [{id, title, image}] }
        // We need to convert to our shape — usedCount not available here so set to 0
        const mapped: SpoonacularRecipe[] = (data.results || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          image: r.image,
          usedIngredientCount: 0,
          missedIngredientCount: 0,
        }));
        setRecipes(mapped);
      }
    } catch {
      setError('Failed to fetch recipes. Check your API key and try again.');
    }
    setLoading(false);
  };

  const loadDetail = async (id: number) => {
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

  const cuisineLabel = selectedCuisine === 'all' ? 'All Cuisines' : selectedCuisine;

  // ── LOADING DETAIL ───────────────────────────────────────
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

  // ── RECIPE DETAIL ────────────────────────────────────────
  if (selectedRecipe) {
    const steps = selectedRecipe.analyzedInstructions?.[0]?.steps || [];
    return (
      <>
        <style>{`${SHARED_STYLES}
          .rd-wrap { min-height:100vh; background:var(--dark); padding:2.5rem 1.5rem 6rem; }
          .rd-inner { max-width:820px; margin:0 auto; }
          .rd-hero { position:relative; height:260px; border-radius:18px; overflow:hidden; margin-bottom:2rem; box-shadow:0 24px 60px rgba(0,0,0,.6); }
          .rd-hero-img { width:100%; height:100%; object-fit:cover; filter:brightness(.55) saturate(.8); display:block; }
          .rd-hero-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(22,18,14,1) 0%,rgba(22,18,14,.3) 55%,transparent 100%); }
          .rd-gold-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,#C9A84C,transparent); z-index:3; }
          .rd-hero-name { position:absolute; bottom:1.5rem; left:1.75rem; right:1.75rem; font-family:'Cormorant Garamond',serif; font-size:clamp(1.6rem,4vw,2.6rem); font-weight:700; color:var(--cream); line-height:1.1; z-index:2; }
          .rd-meta { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.5rem; }
          .rd-pill { display:inline-flex; align-items:center; gap:5px; background:rgba(255,255,255,.03); border:1px solid rgba(201,168,76,.12); border-radius:20px; padding:4px 12px; font-size:.76rem; color:var(--muted); font-family:'Jost',sans-serif; }
          .rd-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(201,168,76,.15),transparent); margin-bottom:1.5rem; }
          .rd-content { display:grid; grid-template-columns:240px 1fr; gap:2.5rem; }
          @media(max-width:600px){ .rd-content { grid-template-columns:1fr; } }
          .rd-section-title { font-family:'Cormorant Garamond',serif; font-size:1.15rem; font-weight:700; color:var(--cream); margin:0 0 .3rem; }
          .rd-section-line { width:26px; height:1px; background:linear-gradient(90deg,var(--gold),transparent); margin-bottom:1rem; }
          .rd-ing-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
          .rd-ing-item { display:flex; align-items:flex-start; gap:9px; font-size:.82rem; color:var(--muted); line-height:1.4; }
          .rd-ing-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); flex-shrink:0; margin-top:5px; }
          .rd-steps { display:flex; flex-direction:column; gap:14px; }
          .rd-step { display:flex; gap:12px; align-items:flex-start; }
          .rd-step-num { flex-shrink:0; width:26px; height:26px; border-radius:50%; border:1px solid rgba(201,168,76,.28); background:rgba(201,168,76,.06); display:flex; align-items:center; justify-content:center; font-family:'Cormorant Garamond',serif; font-size:.82rem; font-weight:700; color:var(--gold); }
          .rd-step-text { font-size:.84rem; font-weight:300; color:var(--muted); line-height:1.8; padding-top:2px; }
          .rd-no-steps { font-size:.84rem; color:var(--dim); font-style:italic; font-family:'Jost',sans-serif; }
        `}</style>
        <div className="rd-wrap">
          <div className="rd-inner">
            <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
              <ArrowLeft size={15} strokeWidth={2} /> Back to results
            </button>
            <div className="rd-hero">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} className="rd-hero-img" />
              <div className="rd-hero-overlay" />
              <div className="rd-gold-bar" />
              <h1 className="rd-hero-name">{selectedRecipe.title}</h1>
            </div>
            <div className="rd-meta">
              {selectedRecipe.readyInMinutes > 0 && <span className="rd-pill">⏱ {selectedRecipe.readyInMinutes} min</span>}
              {selectedRecipe.servings > 0 && <span className="rd-pill">👥 {selectedRecipe.servings} servings</span>}
              {selectedRecipe.cuisines?.length > 0 && <span className="rd-pill">🌍 {selectedRecipe.cuisines.join(', ')}</span>}
              {selectedRecipe.dishTypes?.length > 0 && <span className="rd-pill">🍽 {selectedRecipe.dishTypes[0]}</span>}
            </div>
            <div className="rd-divider" />
            <div className="rd-content">
              <div>
                <h2 className="rd-section-title">Ingredients</h2>
                <div className="rd-section-line" />
                <ul className="rd-ing-list">
                  {selectedRecipe.extendedIngredients?.map((ing, i) => (
                    <li key={i} className="rd-ing-item">
                      <span className="rd-ing-dot" />{ing.original}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="rd-section-title">Instructions</h2>
                <div className="rd-section-line" />
                {steps.length > 0 ? (
                  <div className="rd-steps">
                    {steps.map(s => (
                      <div key={s.number} className="rd-step">
                        <span className="rd-step-num">{s.number}</span>
                        <p className="rd-step-text">{s.step}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rd-no-steps">No step-by-step instructions available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN SEARCH PAGE ─────────────────────────────────────
  return (
    <>
      <style>{`${SHARED_STYLES}
        .ls-wrap { min-height:100vh; background:var(--dark); font-family:'Jost',sans-serif; }

        /* ── Hero banner ── */
        .ls-hero {
          position:relative; padding:4rem 1.5rem 3rem;
          background:
            linear-gradient(to bottom, rgba(22,18,14,.7) 0%, rgba(22,18,14,.95) 100%),
            url('https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=1600&q=70') center/cover no-repeat;
          text-align:center; overflow:hidden;
        }
        .ls-hero-grain {
          position:absolute; inset:0; pointer-events:none; opacity:.4;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .ls-hero-content { position:relative; z-index:1; max-width:640px; margin:0 auto; }
        .ls-eyebrow {
          display:inline-flex; align-items:center; gap:7px;
          font-size:.7rem; font-weight:500; letter-spacing:.16em; text-transform:uppercase;
          color:var(--gold); border:1px solid rgba(201,168,76,.25);
          background:rgba(201,168,76,.08); border-radius:30px; padding:4px 14px;
          margin-bottom:1.2rem;
        }
        .ls-eyebrow-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); animation:blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .ls-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(2.2rem,6vw,4rem); font-weight:700; line-height:1.05;
          letter-spacing:-.02em; color:var(--cream); margin:0 0 .75rem;
        }
        .ls-title em { font-style:italic; background:linear-gradient(135deg,var(--gold),var(--gold-lt)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .ls-subtitle { font-size:.9rem; font-weight:300; color:var(--muted); line-height:1.65; margin-bottom:0; }

        /* ── Search panel ── */
        .ls-panel-wrap { max-width:820px; margin:-1.5rem auto 0; padding:0 1.5rem 5rem; position:relative; z-index:2; }

        .ls-panel {
          background:var(--dark2); border:1px solid rgba(201,168,76,.15);
          border-radius:22px; overflow:visible;
          box-shadow:0 24px 80px rgba(0,0,0,.5);
        }
        .ls-panel::before { content:''; display:block; height:2px; border-radius:22px 22px 0 0; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,#C9A84C,transparent); }

        .ls-panel-inner { padding:1.75rem 1.75rem 2rem; }

        /* ── Cuisine selector ── */
        .ls-cuisine-row { display:flex; align-items:center; gap:12px; margin-bottom:1.5rem; flex-wrap:wrap; }
        .ls-cuisine-label { font-size:.72rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--dim); white-space:nowrap; }

        .ls-dropdown { position:relative; }
        .ls-dropdown-btn {
          display:inline-flex; align-items:center; gap:8px;
          padding:9px 16px; min-width:200px;
          background:rgba(255,255,255,.03); border:1px solid rgba(201,168,76,.2);
          border-radius:10px; cursor:pointer; font-family:'Jost',sans-serif;
          font-size:.85rem; font-weight:500; color:var(--cream);
          transition:all .2s ease; justify-content:space-between;
        }
        .ls-dropdown-btn:hover { border-color:rgba(201,168,76,.45); background:rgba(201,168,76,.05); }
        .ls-dropdown-btn.open { border-color:rgba(201,168,76,.5); background:rgba(201,168,76,.06); }
        .ls-dropdown-btn svg { color:var(--gold); transition:transform .2s; flex-shrink:0; }
        .ls-dropdown-btn.open svg { transform:rotate(180deg); }

        .ls-dropdown-icon { color:var(--gold); flex-shrink:0; }

        .ls-dropdown-menu {
          position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:20;
          background:var(--dark3); border:1px solid rgba(201,168,76,.18);
          border-radius:12px; overflow:hidden;
          box-shadow:0 16px 48px rgba(0,0,0,.6);
          max-height:280px; overflow-y:auto;
          scrollbar-width:thin; scrollbar-color:rgba(201,168,76,.2) transparent;
          animation:ddIn .18s ease;
        }
        @keyframes ddIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .ls-dropdown-menu::-webkit-scrollbar { width:4px; }
        .ls-dropdown-menu::-webkit-scrollbar-thumb { background:rgba(201,168,76,.2); border-radius:4px; }

        .ls-dd-item {
          width:100%; padding:9px 14px;
          background:none; border:none; cursor:pointer; text-align:left;
          font-family:'Jost',sans-serif; font-size:.84rem; font-weight:400;
          color:var(--muted); display:flex; align-items:center; gap:8px;
          transition:all .15s;
        }
        .ls-dd-item:hover { background:rgba(201,168,76,.08); color:var(--cream); }
        .ls-dd-item.active { background:rgba(201,168,76,.12); color:var(--gold-lt); font-weight:500; }
        .ls-dd-item-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); flex-shrink:0; opacity:.5; }
        .ls-dd-item.active .ls-dd-item-dot { opacity:1; }
        .ls-dd-divider { height:1px; background:rgba(201,168,76,.08); margin:4px 0; }

        /* ── Ingredient input ── */
        .ls-ing-section { }
        .ls-ing-label { font-size:.72rem; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--dim); margin-bottom:.75rem; display:block; }

        .ls-tags { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:.85rem; min-height:0; }
        .ls-tag { display:inline-flex; align-items:center; gap:6px; background:rgba(201,168,76,.12); border:1px solid rgba(201,168,76,.28); border-radius:20px; padding:4px 10px 4px 12px; font-size:.75rem; font-weight:500; color:var(--gold-lt); letter-spacing:.04em; }
        .ls-tag-x { display:flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:rgba(201,168,76,.15); border:none; cursor:pointer; color:var(--gold); padding:0; transition:all .2s; }
        .ls-tag-x:hover { background:rgba(201,168,76,.35); }

        .ls-input-row { display:flex; gap:8px; position:relative; }
        .ls-input-wrap { flex:1; position:relative; }
        .ls-input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:rgba(201,168,76,.4); pointer-events:none; }
        .ls-input {
          width:100%; padding:12px 14px 12px 38px;
          background:rgba(255,255,255,.03); border:1px solid rgba(201,168,76,.15); border-radius:10px;
          font-family:'Jost',sans-serif; font-size:.88rem; font-weight:300;
          color:var(--cream); outline:none; transition:border-color .2s, background .2s;
        }
        .ls-input::placeholder { color:var(--dim); }
        .ls-input:focus { border-color:rgba(201,168,76,.45); background:rgba(201,168,76,.04); }

        /* Autocomplete */
        .ls-suggestions {
          position:absolute; top:calc(100% + 5px); left:0; right:0; z-index:15;
          background:var(--dark3); border:1px solid rgba(201,168,76,.18); border-radius:10px;
          overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.5);
        }
        .ls-sug-item { width:100%; padding:9px 14px; background:none; border:none; cursor:pointer; text-align:left; font-family:'Jost',sans-serif; font-size:.84rem; color:var(--muted); display:flex; align-items:center; gap:8px; transition:all .15s; }
        .ls-sug-item:hover { background:rgba(201,168,76,.08); color:var(--cream); }
        .ls-sug-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); flex-shrink:0; }

        .ls-search-btn {
          padding:12px 24px; background:linear-gradient(135deg,var(--gold),var(--gold-dk));
          color:var(--dark); border:none; border-radius:10px;
          font-family:'Jost',sans-serif; font-size:.85rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; cursor:pointer;
          box-shadow:0 4px 16px rgba(201,168,76,.25); transition:all .25s ease; white-space:nowrap;
          display:flex; align-items:center; gap:7px;
        }
        .ls-search-btn:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-1px); box-shadow:0 8px 24px rgba(201,168,76,.38); }
        .ls-search-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; }

        .ls-hint { font-size:.72rem; font-weight:300; color:var(--dim); margin-top:.6rem; }

        /* ── Results area ── */
        .ls-results { padding:0 1.5rem 5rem; max-width:820px; margin:0 auto; }

        .ls-results-header { margin-bottom:1.5rem; }
        .ls-results-title { font-family:'Cormorant Garamond',serif; font-size:clamp(1.4rem,3vw,1.9rem); font-weight:700; color:var(--cream); margin:0 0 .3rem; }
        .ls-results-title em { font-style:italic; color:var(--gold-lt); }
        .ls-results-sub { font-size:.8rem; font-weight:300; color:var(--dim); }
        .ls-count { display:inline-flex; align-items:center; gap:5px; font-family:'Jost',sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); background:rgba(201,168,76,.08); border:1px solid rgba(201,168,76,.2); border-radius:20px; padding:2px 10px; margin-left:10px; vertical-align:middle; }

        .ls-error { background:rgba(224,112,112,.08); border:1px solid rgba(224,112,112,.2); border-radius:12px; padding:1rem 1.25rem; font-size:.85rem; color:#e09090; margin-bottom:1.5rem; font-family:'Jost',sans-serif; }

        .ls-empty { background:var(--dark2); border:1px solid rgba(201,168,76,.1); border-radius:18px; padding:4rem 2rem; text-align:center; }
        .ls-empty-emoji { font-size:2.5rem; margin-bottom:1rem; }
        .ls-empty-text { font-size:.9rem; font-weight:300; color:var(--dim); line-height:1.65; font-family:'Jost',sans-serif; }

        /* Grid */
        .ls-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:860px){ .ls-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .ls-grid { grid-template-columns:1fr; } }

        /* Recipe card */
        .ls-card { position:relative; overflow:hidden; background:var(--dark2); border:1px solid rgba(201,168,76,.1); border-radius:16px; cursor:pointer; transition:all .3s cubic-bezier(.4,0,.2,1); text-align:left; }
        .ls-card::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#C9A84C,#E2C47A,transparent); transform:scaleX(0); transition:transform .35s ease; }
        .ls-card:hover { border-color:rgba(201,168,76,.3); transform:translateY(-5px); box-shadow:0 20px 60px rgba(0,0,0,.5); }
        .ls-card:hover::after { transform:scaleX(1); }
        .ls-card-img { height:170px; overflow:hidden; position:relative; }
        .ls-card-photo { width:100%; height:100%; object-fit:cover; filter:brightness(.6) saturate(.8); transition:transform .5s ease, filter .4s ease; display:block; }
        .ls-card:hover .ls-card-photo { transform:scale(1.07); filter:brightness(.78) saturate(1); }
        .ls-card-img-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(22,18,14,.85) 0%,transparent 55%); }
        .ls-match-badge { position:absolute; bottom:9px; left:10px; z-index:2; display:inline-flex; align-items:center; gap:5px; background:rgba(201,168,76,.16); border:1px solid rgba(201,168,76,.32); border-radius:20px; padding:3px 9px; font-size:.66rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--gold-lt); backdrop-filter:blur(6px); font-family:'Jost',sans-serif; }
        .ls-match-dot { width:4px; height:4px; border-radius:50%; background:var(--gold); }
        .ls-missed-badge { position:absolute; bottom:9px; right:10px; z-index:2; display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:3px 9px; font-size:.64rem; color:rgba(245,237,216,.4); backdrop-filter:blur(6px); font-family:'Jost',sans-serif; }
        .ls-card-body { padding:1rem 1.1rem 1.2rem; }
        .ls-card-name { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:700; color:var(--cream); margin:0 0 .3rem; line-height:1.25; transition:color .2s; }
        .ls-card:hover .ls-card-name { color:var(--gold-lt); }
        .ls-card-sep { width:20px; height:1px; background:linear-gradient(90deg,var(--gold),transparent); margin-bottom:.5rem; transition:width .3s; }
        .ls-card:hover .ls-card-sep { width:34px; }
        .ls-card-meta { font-size:.74rem; font-weight:300; color:rgba(245,237,216,.35); font-family:'Jost',sans-serif; }
        .ls-card-meta span { color:var(--gold-lt); font-weight:500; }
      `}</style>

      <div className="ls-wrap">
        {/* ── Hero ── */}
        <div className="ls-hero">
          <div className="ls-hero-grain" />
          <div className="ls-hero-content">
            <button className="back-btn" onClick={onBack} style={{ marginBottom:'1.5rem', justifyContent:'center' }}>
              <ArrowLeft size={15} strokeWidth={2} /> Back to home
            </button>
            <div className="ls-eyebrow">
              <span className="ls-eyebrow-dot" /> Use what you have
            </div>
            <h1 className="ls-title">
              My <em>Leftovers</em>
            </h1>
            <p className="ls-subtitle">
              Tell us what's in your kitchen — we'll find recipes across any cuisine that match what you have.
            </p>
          </div>
        </div>

        {/* ── Search panel ── */}
        <div className="ls-panel-wrap">
          <div className="ls-panel">
            <div className="ls-panel-inner">

              {/* Cuisine selector */}
              <div className="ls-cuisine-row">
                <span className="ls-cuisine-label">Cuisine:</span>
                <div className="ls-dropdown" onClick={e => e.stopPropagation()}>
                  <button
                    className={`ls-dropdown-btn ${dropdownOpen ? 'open' : ''}`}
                    onClick={() => setDropdownOpen(o => !o)}
                  >
                    <span style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                      {selectedCuisine === 'all'
                        ? <><Globe size={14} color="var(--gold)" /> All Cuisines</>
                        : <><span style={{ fontSize:'1rem' }}>🍽</span> {selectedCuisine}</>
                      }
                    </span>
                    <ChevronDown size={15} />
                  </button>

                  {dropdownOpen && (
                    <div className="ls-dropdown-menu">
                      {/* All cuisines option */}
                      <button
                        className={`ls-dd-item ${selectedCuisine === 'all' ? 'active' : ''}`}
                        onClick={() => { setSelectedCuisine('all'); setDropdownOpen(false); }}
                      >
                        <Globe size={13} color="var(--gold)" />
                        All Cuisines
                      </button>
                      <div className="ls-dd-divider" />
                      {/* Individual cuisines */}
                      {ALL_CUISINES.map(c => (
                        <button
                          key={c}
                          className={`ls-dd-item ${selectedCuisine === c ? 'active' : ''}`}
                          onClick={() => { setSelectedCuisine(c); setDropdownOpen(false); }}
                        >
                          <span className="ls-dd-item-dot" />
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredient input */}
              <div className="ls-ing-section">
                <span className="ls-ing-label">Your ingredients</span>

                {selectedIngredients.length > 0 && (
                  <div className="ls-tags">
                    {selectedIngredients.map(ing => (
                      <span key={ing} className="ls-tag">
                        {ing}
                        <button className="ls-tag-x" onClick={() => removeIngredient(ing)}>
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="ls-input-row">
                  <div className="ls-input-wrap">
                    <Search size={15} className="ls-input-icon" strokeWidth={2} />
                    <input
                      type="text"
                      className="ls-input"
                      placeholder="e.g. chicken, garlic, rice... (press Enter to add)"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    {suggestions.length > 0 && (
                      <div className="ls-suggestions">
                        {suggestions.map(s => (
                          <button key={s} className="ls-sug-item" onClick={() => addIngredient(s)}>
                            <span className="ls-sug-dot" />{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="ls-search-btn"
                    onClick={handleSearch}
                    disabled={selectedIngredients.length === 0 || loading}
                  >
                    <Search size={14} strokeWidth={2.5} />
                    Search
                  </button>
                </div>
                <p className="ls-hint">Press <strong style={{ color:'var(--gold-lt)' }}>Enter</strong> or <strong style={{ color:'var(--gold-lt)' }}>,</strong> to add each ingredient</p>
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          {error && <div className="ls-error" style={{ marginTop:'1.5rem' }}>⚠ {error}</div>}

          {(hasSearched || recipes.length > 0) && (
            <div style={{ marginTop:'2.5rem' }}>
              <div className="ls-results-header">
                <h2 className="ls-results-title">
                  Results in <em>{cuisineLabel}</em>
                  {!loading && recipes.length > 0 && (
                    <span className="ls-count">{recipes.length} recipes</span>
                  )}
                </h2>
                <p className="ls-results-sub">
                  {loading
                    ? 'Finding the best matches...'
                    : recipes.length > 0
                      ? `Sorted by best ingredient match · ${cuisineLabel}`
                      : 'No recipes found — try different ingredients or switch cuisine'}
                </p>
              </div>

              {loading ? (
                <div style={{ display:'flex', justifyContent:'center', padding:'3rem 0' }}>
                  <div className="spinner-ring" />
                </div>
              ) : recipes.length === 0 ? (
                <div className="ls-empty">
                  <div className="ls-empty-emoji">🍳</div>
                  <p className="ls-empty-text">
                    No matches found for those ingredients in <strong style={{ color:'var(--gold-lt)' }}>{cuisineLabel}</strong>.<br />
                    Try switching to <strong style={{ color:'var(--gold-lt)' }}>All Cuisines</strong> for more results.
                  </p>
                </div>
              ) : (
                <div className="ls-grid">
                  {recipes.map(recipe => (
                    <div key={recipe.id} className="ls-card" onClick={() => loadDetail(recipe.id)}>
                      <div className="ls-card-img">
                        <img src={recipe.image} alt={recipe.title} className="ls-card-photo"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div className="ls-card-img-overlay" />
                        {recipe.usedIngredientCount > 0 && (
                          <span className="ls-match-badge">
                            <span className="ls-match-dot" />
                            {recipe.usedIngredientCount} matched
                          </span>
                        )}
                        {recipe.missedIngredientCount > 0 && (
                          <span className="ls-missed-badge">+{recipe.missedIngredientCount} needed</span>
                        )}
                      </div>
                      <div className="ls-card-body">
                        <h3 className="ls-card-name">{recipe.title}</h3>
                        <div className="ls-card-sep" />
                        <p className="ls-card-meta">
                          {recipe.usedIngredientCount > 0
                            ? <>Uses <span>{recipe.usedIngredientCount}</span> of your ingredients{recipe.missedIngredientCount > 0 && `, missing ${recipe.missedIngredientCount}`}</>
                            : 'View recipe →'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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