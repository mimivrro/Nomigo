import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Play, Clock, ChefHat } from "lucide-react";

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

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --dark:    #16120e;
    --dark2:   #1e1a14;
    --dark3:   #26211a;
    --gold:    #C9A84C;
    --gold-lt: #E2C47A;
    --gold-dk: #8B6914;
    --cream:   #F5EDD8;
    --muted:   rgba(245,237,216,0.45);
    --dim:     rgba(245,237,216,0.25);
  }
  * { box-sizing: border-box; }
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: .78rem; font-weight: 500;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--dim); background: none; border: none;
    cursor: pointer; padding: 8px 0; margin-bottom: 1.75rem;
    transition: color .2s ease;
  }
  .back-btn:hover { color: var(--gold); }
  .spinner-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 2px solid rgba(201,168,76,.15);
    border-top-color: var(--gold);
    animation: spin .8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function RecipeBrowser({ cuisine, onBack }: RecipeBrowserProps) {
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    fetchRecipes();
    // Load saved recipe IDs for heart state
    const s = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    setSaved(s.map((r: any) => r.idMeal));
  }, [cuisine.name]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine.name}`);
      const data = await res.json();
      if (data.meals) setRecipes(data.meals);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setLoading(false);
    }
  };

  const loadRecipeDetails = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      const data = await res.json();
      if (data.meals) setSelectedRecipe(data.meals[0]);
    } catch (error) {
      console.error("Error loading recipe:", error);
    }
    setDetailLoading(false);
  };

  const saveRecipe = (recipe: any) => {
    const existing = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    const alreadySaved = existing.find((r: any) => r.idMeal === recipe.idMeal);
    if (!alreadySaved) {
      existing.push(recipe);
      localStorage.setItem("savedRecipes", JSON.stringify(existing));
      setSaved(prev => [...prev, recipe.idMeal]);
    } else {
      // Unsave
      const updated = existing.filter((r: any) => r.idMeal !== recipe.idMeal);
      localStorage.setItem("savedRecipes", JSON.stringify(updated));
      setSaved(prev => prev.filter(id => id !== recipe.idMeal));
    }
  };

  /* ══════════════════════════════════
     DETAIL LOADING STATE
  ══════════════════════════════════ */
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

  /* ══════════════════════════════════
     RECIPE DETAIL PAGE
  ══════════════════════════════════ */
  if (selectedRecipe) {
    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = selectedRecipe[`strIngredient${i}`];
      const measure = selectedRecipe[`strMeasure${i}`];
      if (name && name.trim()) ingredients.push({ name: name.trim(), measure: (measure || '').trim() });
    }

    const isSaved = saved.includes(selectedRecipe.idMeal);

    return (
      <>
        <style>{`${SHARED_STYLES}
          .rd-wrap {
            min-height: 100vh; background: var(--dark);
            padding: 2.5rem 1.5rem 6rem;
          }
          .rd-inner { max-width: 820px; margin: 0 auto; }

          /* Hero */
          .rd-hero {
            position: relative; border-radius: 20px; overflow: hidden;
            margin-bottom: 2rem;
            box-shadow: 0 24px 80px rgba(0,0,0,.6);
          }
          .rd-hero-img {
            width: 100%; height: 380px; object-fit: cover;
            filter: brightness(.7) saturate(.85);
            display: block;
          }
          .rd-hero-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(22,18,14,1) 0%, rgba(22,18,14,.3) 50%, transparent 100%);
          }
          .rd-gold-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, #C9A84C, transparent);
          }
          .rd-hero-content {
            position: absolute; bottom: 0; left: 0; right: 0;
            padding: 2rem;
          }
          .rd-category {
            display: inline-block;
            font-family: 'Jost', sans-serif;
            font-size: .7rem; font-weight: 600; letter-spacing: .16em;
            text-transform: uppercase; color: var(--gold);
            background: rgba(201,168,76,.12);
            border: 1px solid rgba(201,168,76,.25);
            border-radius: 20px; padding: 3px 12px;
            margin-bottom: .75rem;
          }
          .rd-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(1.8rem, 5vw, 3rem);
            font-weight: 700; color: var(--cream);
            letter-spacing: -.01em; margin: 0;
            line-height: 1.1;
          }

          /* Action bar */
          .rd-actions {
            display: flex; gap: 12px; margin-bottom: 2.5rem; flex-wrap: wrap;
          }
          .rd-save-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 24px;
            font-family: 'Jost', sans-serif;
            font-size: .82rem; font-weight: 600; letter-spacing: .1em;
            text-transform: uppercase; border-radius: 8px;
            cursor: pointer; transition: all .25s ease;
            border: 1px solid;
          }
          .rd-save-btn.unsaved {
            background: transparent; color: var(--gold);
            border-color: rgba(201,168,76,.4);
          }
          .rd-save-btn.unsaved:hover {
            background: rgba(201,168,76,.1);
            border-color: var(--gold);
          }
          .rd-save-btn.saved-state {
            background: linear-gradient(135deg, var(--gold), var(--gold-dk));
            color: var(--dark); border-color: transparent;
            box-shadow: 0 4px 18px rgba(201,168,76,.3);
          }
          .rd-yt-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 11px 24px;
            background: rgba(255,255,255,.04);
            color: var(--muted); border: 1px solid rgba(255,255,255,.08);
            border-radius: 8px; font-family: 'Jost', sans-serif;
            font-size: .82rem; font-weight: 500; letter-spacing: .1em;
            text-transform: uppercase; cursor: pointer; text-decoration: none;
            transition: all .25s ease;
          }
          .rd-yt-btn:hover { background: rgba(255,60,60,.12); color: #ff6b6b; border-color: rgba(255,60,60,.25); }

          /* Two-col layout */
          .rd-body {
            display: grid; grid-template-columns: 280px 1fr; gap: 2rem;
          }
          @media(max-width:680px){ .rd-body { grid-template-columns: 1fr; } }

          /* Ingredients panel */
          .rd-ingredients {
            background: var(--dark2);
            border: 1px solid rgba(201,168,76,.12);
            border-radius: 16px; padding: 1.5rem;
            height: fit-content;
            position: sticky; top: 90px;
          }
          .rd-panel-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.2rem; font-weight: 700; color: var(--cream);
            margin: 0 0 .3rem;
          }
          .rd-panel-line {
            width: 32px; height: 1px;
            background: linear-gradient(90deg, var(--gold), transparent);
            margin-bottom: 1.2rem;
          }
          .rd-ingredient-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
          .rd-ingredient {
            display: flex; align-items: flex-start; gap: 10px;
            font-size: .82rem; color: var(--muted); line-height: 1.4;
          }
          .rd-ingredient-dot {
            width: 5px; height: 5px; border-radius: 50%;
            background: var(--gold); flex-shrink: 0; margin-top: 6px;
          }
          .rd-ingredient-measure { color: var(--gold-lt); font-weight: 500; }

          /* Instructions */
          .rd-instructions { }
          .rd-instructions-text {
            font-size: .9rem; font-weight: 300; line-height: 1.9;
            color: var(--muted); white-space: pre-line;
          }

          /* Step-ified instructions */
          .rd-steps { display: flex; flex-direction: column; gap: 16px; }
          .rd-step {
            display: flex; gap: 14px; align-items: flex-start;
          }
          .rd-step-num {
            flex-shrink: 0;
            width: 28px; height: 28px; border-radius: 50%;
            border: 1px solid rgba(201,168,76,.3);
            background: rgba(201,168,76,.07);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Cormorant Garamond', serif;
            font-size: .85rem; font-weight: 700; color: var(--gold);
          }
          .rd-step-text {
            font-size: .88rem; font-weight: 300;
            color: var(--muted); line-height: 1.75;
            padding-top: 4px;
          }
        `}</style>

        <div className="rd-wrap">
          <div className="rd-inner">
            <button className="back-btn" onClick={() => setSelectedRecipe(null)}>
              <ArrowLeft size={16} strokeWidth={2} /> Back to recipes
            </button>

            {/* Hero */}
            <div className="rd-hero">
              <img src={selectedRecipe.strMealThumb} alt={selectedRecipe.strMeal} className="rd-hero-img" />
              <div className="rd-hero-overlay" />
              <div className="rd-gold-bar" />
              <div className="rd-hero-content">
                {selectedRecipe.strCategory && (
                  <span className="rd-category">{selectedRecipe.strCategory}</span>
                )}
                <h1 className="rd-title">{selectedRecipe.strMeal}</h1>
              </div>
            </div>

            {/* Actions */}
            <div className="rd-actions">
              <button
                className={`rd-save-btn ${isSaved ? 'saved-state' : 'unsaved'}`}
                onClick={() => saveRecipe(selectedRecipe)}
              >
                <Heart size={15} strokeWidth={2} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save Recipe'}
              </button>
              {selectedRecipe.strYoutube && (
                <a href={selectedRecipe.strYoutube} target="_blank" rel="noreferrer" className="rd-yt-btn">
                  <Play size={14} strokeWidth={2} /> Watch Video
                </a>
              )}
            </div>

            {/* Body */}
            <div className="rd-body">
              {/* Ingredients */}
              <aside className="rd-ingredients">
                <h2 className="rd-panel-title">Ingredients</h2>
                <div className="rd-panel-line" />
                <ul className="rd-ingredient-list">
                  {ingredients.map((ing, i) => (
                    <li key={i} className="rd-ingredient">
                      <span className="rd-ingredient-dot" />
                      <span>
                        {ing.measure && <span className="rd-ingredient-measure">{ing.measure} </span>}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Instructions */}
              <div className="rd-instructions">
                <h2 className="rd-panel-title">Instructions</h2>
                <div className="rd-panel-line" />
                <div className="rd-steps">
                  {selectedRecipe.strInstructions
                    .split(/\r?\n/)
                    .filter((s: string) => s.trim().length > 20)
                    .map((step: string, i: number) => (
                      <div key={i} className="rd-step">
                        <span className="rd-step-num">{i + 1}</span>
                        <p className="rd-step-text">{step.trim()}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ══════════════════════════════════
     RECIPE LIST PAGE
  ══════════════════════════════════ */
  return (
    <>
      <style>{`${SHARED_STYLES}
        .rb-wrap { min-height: 100vh; background: var(--dark); padding: 2.5rem 1.5rem 6rem; }
        .rb-inner { max-width: 1100px; margin: 0 auto; }

        .rb-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700;
          color: var(--cream); letter-spacing: -.01em; margin: .5rem 0 .4rem;
        }
        .rb-heading em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold-lt));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .rb-sub {
          font-size: .85rem; font-weight: 300;
          color: var(--dim); letter-spacing: .04em; margin-bottom: 2.5rem;
        }
        .rb-count {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Jost', sans-serif;
          font-size: .72rem; font-weight: 500; letter-spacing: .12em;
          text-transform: uppercase; color: var(--gold);
          background: rgba(201,168,76,.08);
          border: 1px solid rgba(201,168,76,.2);
          border-radius: 20px; padding: 3px 12px; margin-left: 12px;
          vertical-align: middle;
        }

        .rb-empty {
          background: var(--dark2); border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; padding: 4rem 2rem; text-align: center;
          color: var(--dim); font-size: .95rem; font-weight: 300;
        }

        /* Grid */
        .rb-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media(max-width: 768px) { .rb-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width: 480px) { .rb-grid { grid-template-columns: 1fr; } }

        /* Recipe card */
        .rb-card {
          position: relative; overflow: hidden;
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; cursor: pointer;
          transition: all .3s cubic-bezier(.4,0,.2,1);
          text-align: left;
        }
        .rb-card::after {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, transparent);
          transform: scaleX(0); transition: transform .35s ease;
        }
        .rb-card:hover {
          border-color: rgba(201,168,76,.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(201,168,76,.08);
        }
        .rb-card:hover::after { transform: scaleX(1); }

        /* Photo */
        .rb-card-img { position: relative; height: 190px; overflow: hidden; }
        .rb-card-photo {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(.65) saturate(.8);
          transition: transform .5s ease, filter .4s ease;
          display: block;
        }
        .rb-card:hover .rb-card-photo {
          transform: scale(1.08);
          filter: brightness(.8) saturate(1);
        }
        .rb-card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(22,18,14,.8) 0%, transparent 55%);
        }

        /* Save heart on card */
        .rb-card-heart {
          position: absolute; top: 12px; right: 12px; z-index: 2;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(22,18,14,.7); backdrop-filter: blur(6px);
          border: 1px solid rgba(201,168,76,.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--muted);
          transition: all .2s ease;
        }
        .rb-card-heart:hover,
        .rb-card-heart.saved { color: #e07070; border-color: rgba(224,112,112,.4); }
        .rb-card-heart.saved { background: rgba(224,112,112,.12); }

        /* Body */
        .rb-card-body { padding: 1.1rem 1.2rem 1.4rem; }
        .rb-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 700;
          color: var(--cream); margin: 0 0 .35rem;
          line-height: 1.3;
          transition: color .2s;
        }
        .rb-card:hover .rb-card-name { color: var(--gold-lt); }
        .rb-card-sep {
          width: 22px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: .5rem; transition: width .3s;
        }
        .rb-card:hover .rb-card-sep { width: 36px; }
        .rb-card-cta {
          font-size: .72rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(201,168,76,.5);
          transition: color .2s;
        }
        .rb-card:hover .rb-card-cta { color: var(--gold); }
      `}</style>

      <div className="rb-wrap">
        <div className="rb-inner">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} strokeWidth={2} /> Back
          </button>

          <h2 className="rb-heading">
            <em>{cuisine.name}</em> Recipes
            {!loading && recipes.length > 0 && (
              <span className="rb-count">{recipes.length} dishes</span>
            )}
          </h2>
          <p className="rb-sub">Explore authentic {cuisine.name.toLowerCase()} dishes from around the world</p>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'5rem 0' }}>
              <div className="spinner-ring" />
            </div>
          ) : recipes.length === 0 ? (
            <div className="rb-empty">No recipes found for {cuisine.name}.</div>
          ) : (
            <div className="rb-grid">
              {recipes.map((recipe) => (
                <div key={recipe.idMeal} className="rb-card" onClick={() => loadRecipeDetails(recipe.idMeal)}>
                  <div className="rb-card-img">
                    <img src={recipe.strMealThumb} alt={recipe.strMeal} className="rb-card-photo" />
                    <div className="rb-card-img-overlay" />
                    {/* Heart button — stop propagation so it doesn't open recipe */}
                    <button
                      className={`rb-card-heart ${saved.includes(recipe.idMeal) ? 'saved' : ''}`}
                      onClick={(e) => { e.stopPropagation(); saveRecipe(recipe); }}
                      title="Save recipe"
                    >
                      <Heart size={15} strokeWidth={2} fill={saved.includes(recipe.idMeal) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="rb-card-body">
                    <h3 className="rb-card-name">{recipe.strMeal}</h3>
                    <div className="rb-card-sep" />
                    <span className="rb-card-cta">View recipe →</span>
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