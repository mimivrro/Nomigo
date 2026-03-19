import { useState, useEffect } from 'react';
import { X, Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
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
  image_url?: string;
}

interface RecipeIngredient {
  quantity: string;
  unit: string;
  ingredients: { name: string };
}

const DIFFICULTY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Easy:   { color: '#6fcf8a', bg: 'rgba(111,207,138,0.1)',  border: 'rgba(111,207,138,0.28)' },
  Medium: { color: '#E2C47A', bg: 'rgba(226,196,122,0.1)', border: 'rgba(226,196,122,0.28)' },
  Hard:   { color: '#e07070', bg: 'rgba(224,112,112,0.1)', border: 'rgba(224,112,112,0.28)' },
};

export default function RecipeDetail({ recipeId, onClose }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipeDetail();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [recipeId]);

  const loadRecipeDetail = async () => {
    const { data: recipeData } = await supabase
      .from('recipes').select('*').eq('id', recipeId).maybeSingle();
    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select(`quantity, unit, ingredients(name)`)
      .eq('recipe_id', recipeId);
    if (recipeData) setRecipe(recipeData);
    if (ingredientsData) setIngredients(ingredientsData as unknown as RecipeIngredient[]);
    setLoading(false);
  };

  const steps = recipe?.instructions
    ? recipe.instructions
        .split(/\r?\n/)
        .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(s => s.length > 15)
    : [];

  const diff = DIFFICULTY_STYLES[recipe?.difficulty ?? 'Medium'] ?? DIFFICULTY_STYLES.Medium;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --dark:    #16120e;
          --dark2:   #1e1a14;
          --gold:    #C9A84C;
          --gold-lt: #E2C47A;
          --gold-dk: #8B6914;
          --cream:   #F5EDD8;
          --muted:   rgba(245,237,216,0.48);
          --dim:     rgba(245,237,216,0.22);
        }

        /* Backdrop starts at 68px to sit below the sticky header */
        .rd-backdrop {
          position: fixed;
          top: 68px; left: 0; right: 0; bottom: 0;
          z-index: 40;
          background: rgba(10,8,6,0.88);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          animation: bdIn .22s ease;
        }
        @keyframes bdIn { from { opacity:0; } to { opacity:1; } }

        .rd-backdrop-click {
          position: absolute; inset: 0; z-index: 0;
        }

        /* Modal fits within the space below the header */
        .rd-modal {
          position: relative; z-index: 1;
          width: 100%;
          max-width: 800px;
          max-height: calc(100vh - 68px - 2.5rem);
          overflow-y: auto;
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.15);
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(0,0,0,.8);
          animation: modalIn .28s cubic-bezier(.4,0,.2,1);
          scrollbar-width: thin;
          scrollbar-color: rgba(201,168,76,.2) transparent;
        }
        .rd-modal::-webkit-scrollbar { width: 4px; }
        .rd-modal::-webkit-scrollbar-thumb { background: rgba(201,168,76,.2); border-radius: 4px; }

        @keyframes modalIn {
          from { opacity:0; transform:translateY(16px) scale(.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Gold top bar */
        .rd-gold-bar {
          position: sticky; top: 0; left: 0; right: 0; height: 2px; z-index: 5;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, #C9A84C, transparent);
          flex-shrink: 0;
        }

        /* Hero */
        .rd-hero {
          position: relative; height: 180px; overflow: hidden;
          background: var(--dark); flex-shrink: 0;
        }
        .rd-hero-img {
          width:100%; height:100%; object-fit:cover;
          filter: brightness(.55) saturate(.8); display:block;
        }
        .rd-hero-fallback {
          width:100%; height:100%;
          background: linear-gradient(135deg, #1e1a14, #2d2318);
          display:flex; align-items:center; justify-content:center;
        }
        .rd-hero-overlay {
          position:absolute; inset:0;
          background: linear-gradient(to top, rgba(22,18,14,1) 0%, rgba(22,18,14,.35) 55%, transparent 100%);
        }

        /* Floating buttons over hero */
        .rd-back {
          position:absolute; top:12px; left:12px; z-index:4;
          display:inline-flex; align-items:center; gap:6px;
          background: rgba(22,18,14,.8); backdrop-filter:blur(8px);
          border:1px solid rgba(201,168,76,.22); border-radius:8px;
          padding:6px 13px;
          font-family:'Jost',sans-serif;
          font-size:.7rem; font-weight:500; letter-spacing:.1em;
          text-transform:uppercase; color:var(--muted);
          cursor:pointer; transition:all .2s;
        }
        .rd-back:hover { color:var(--gold); border-color:rgba(201,168,76,.45); }

        .rd-close {
          position:absolute; top:12px; right:12px; z-index:4;
          width:32px; height:32px; border-radius:50%;
          background: rgba(22,18,14,.8); backdrop-filter:blur(8px);
          border:1px solid rgba(201,168,76,.22);
          display:flex; align-items:center; justify-content:center;
          color:var(--muted); cursor:pointer; transition:all .2s;
        }
        .rd-close:hover { color:var(--cream); border-color:rgba(201,168,76,.45); }

        /* Recipe name on hero */
        .rd-hero-name {
          position:absolute; bottom:1rem; left:1.5rem; right:4rem;
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1.4rem,3.5vw,2.2rem); font-weight:700;
          color:var(--cream); letter-spacing:-.01em; line-height:1.1; z-index:2;
        }

        /* Body */
        .rd-body { padding:1.25rem 1.5rem 2rem; }

        /* Top row */
        .rd-top-row {
          display:flex; align-items:flex-start;
          justify-content:space-between; gap:12px; margin-bottom:1rem;
        }
        .rd-desc {
          font-size:.88rem; font-weight:300;
          color:var(--muted); line-height:1.65; flex:1;
        }
        .rd-diff-badge {
          flex-shrink:0; font-size:.62rem; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          padding:3px 11px; border-radius:20px; border:1px solid; white-space:nowrap;
        }

        /* Meta pills */
        .rd-meta { display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-bottom:1.5rem; }
        .rd-meta-pill {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(201,168,76,.12);
          border-radius:20px; padding:4px 12px;
          font-size:.75rem; font-weight:400; color:var(--muted);
        }
        .rd-meta-pill svg { color:var(--gold); }

        /* Divider */
        .rd-divider {
          height:1px;
          background:linear-gradient(90deg, transparent, rgba(201,168,76,.15), transparent);
          margin-bottom:1.5rem;
        }

        /* Two-col */
        .rd-content { display:grid; grid-template-columns:220px 1fr; gap:2rem; }
        @media(max-width:580px){ .rd-content { grid-template-columns:1fr; } }

        /* Section title */
        .rd-section-title {
          font-family:'Cormorant Garamond',serif;
          font-size:1.1rem; font-weight:700; color:var(--cream); margin:0 0 .3rem;
        }
        .rd-section-line {
          width:26px; height:1px;
          background:linear-gradient(90deg, var(--gold), transparent); margin-bottom:1rem;
        }

        /* Ingredients */
        .rd-ing-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px; }
        .rd-ing-item { display:flex; align-items:flex-start; gap:9px; font-size:.8rem; color:var(--muted); line-height:1.4; }
        .rd-ing-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); flex-shrink:0; margin-top:5px; }
        .rd-ing-measure { color:var(--gold-lt); font-weight:500; }

        /* Steps */
        .rd-steps { display:flex; flex-direction:column; gap:12px; }
        .rd-step { display:flex; gap:12px; align-items:flex-start; }
        .rd-step-num {
          flex-shrink:0; width:24px; height:24px; border-radius:50%;
          border:1px solid rgba(201,168,76,.28); background:rgba(201,168,76,.06);
          display:flex; align-items:center; justify-content:center;
          font-family:'Cormorant Garamond',serif;
          font-size:.8rem; font-weight:700; color:var(--gold);
        }
        .rd-step-text { font-size:.82rem; font-weight:300; color:var(--muted); line-height:1.75; padding-top:2px; }

        /* Loading */
        .rd-loading { display:flex; align-items:center; justify-content:center; padding:4rem 2rem; }
        .spinner-ring {
          width:40px; height:40px; border-radius:50%;
          border:2px solid rgba(201,168,76,.15); border-top-color:var(--gold);
          animation:spin .8s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="rd-backdrop">
        <div className="rd-backdrop-click" onClick={onClose} />

        <div className="rd-modal">
          <div className="rd-gold-bar" />

          {loading ? (
            <div className="rd-loading"><div className="spinner-ring" /></div>
          ) : !recipe ? null : (
            <>
              <div className="rd-hero">
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt={recipe.name} className="rd-hero-img" />
                ) : (
                  <div className="rd-hero-fallback">
                    <ChefHat size={56} color="rgba(201,168,76,0.18)" strokeWidth={1} />
                  </div>
                )}
                <div className="rd-hero-overlay" />
                <button className="rd-back" onClick={onClose}>
                  <ArrowLeft size={12} strokeWidth={2} /> Back
                </button>
                <button className="rd-close" onClick={onClose}>
                  <X size={14} strokeWidth={2} />
                </button>
                <h2 className="rd-hero-name">{recipe.name}</h2>
              </div>

              <div className="rd-body">
                <div className="rd-top-row">
                  {recipe.description && <p className="rd-desc">{recipe.description}</p>}
                  <span className="rd-diff-badge" style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
                    {recipe.difficulty}
                  </span>
                </div>

                <div className="rd-meta">
                  <span className="rd-meta-pill"><Clock size={12} strokeWidth={2} />{recipe.cooking_time} min</span>
                  <span className="rd-meta-pill"><Users size={12} strokeWidth={2} />{recipe.servings} servings</span>
                  <span className="rd-meta-pill"><ChefHat size={12} strokeWidth={2} />{recipe.difficulty}</span>
                </div>

                <div className="rd-divider" />

                <div className="rd-content">
                  <div>
                    <h3 className="rd-section-title">Ingredients</h3>
                    <div className="rd-section-line" />
                    <ul className="rd-ing-list">
                      {ingredients.map((item, i) => (
                        <li key={i} className="rd-ing-item">
                          <span className="rd-ing-dot" />
                          <span>
                            {(item.quantity || item.unit) && (
                              <span className="rd-ing-measure">{item.quantity} {item.unit} </span>
                            )}
                            {item.ingredients.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="rd-section-title">Instructions</h3>
                    <div className="rd-section-line" />
                    <div className="rd-steps">
                      {steps.length > 0 ? steps.map((step, i) => (
                        <div key={i} className="rd-step">
                          <span className="rd-step-num">{i + 1}</span>
                          <p className="rd-step-text">{step}</p>
                        </div>
                      )) : (
                        <p className="rd-step-text" style={{ paddingTop:0 }}>{recipe.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}