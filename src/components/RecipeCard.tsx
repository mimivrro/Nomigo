import { useState } from 'react';
import { Clock, Users, Heart, ChefHat } from 'lucide-react';
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

const DIFFICULTY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Easy:   { color: '#6fcf8a', bg: 'rgba(111,207,138,0.1)',  border: 'rgba(111,207,138,0.25)' },
  Medium: { color: '#E2C47A', bg: 'rgba(226,196,122,0.1)', border: 'rgba(226,196,122,0.25)' },
  Hard:   { color: '#e07070', bg: 'rgba(224,112,112,0.1)', border: 'rgba(224,112,112,0.25)' },
};

export default function RecipeCard({ recipe, matchCount }: RecipeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [liked, setLiked] = useState(false);

  const diff = DIFFICULTY_STYLES[recipe.difficulty] ?? DIFFICULTY_STYLES.Medium;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --dark:    #16120e;
          --dark2:   #1e1a14;
          --gold:    #C9A84C;
          --gold-lt: #E2C47A;
          --cream:   #F5EDD8;
          --muted:   rgba(245,237,216,0.45);
          --dim:     rgba(245,237,216,0.22);
        }

        .rc-card {
          position: relative; overflow: hidden;
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; cursor: pointer;
          font-family: 'Jost', sans-serif;
          transition: all .3s cubic-bezier(.4,0,.2,1);
          text-align: left; display: flex; flex-direction: column;
        }

        /* Gold top bar slides in on hover */
        .rc-card::after {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, transparent);
          transform: scaleX(0); transition: transform .35s ease;
          z-index: 3;
        }
        .rc-card:hover {
          border-color: rgba(201,168,76,.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(201,168,76,.08);
        }
        .rc-card:hover::after { transform: scaleX(1); }

        /* ── Photo area ── */
        .rc-photo {
          position: relative; height: 180px; overflow: hidden;
          background: var(--dark);
        }

        .rc-photo-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(.6) saturate(.8);
          transition: transform .5s ease, filter .4s ease;
          display: block;
        }
        .rc-card:hover .rc-photo-img {
          transform: scale(1.07);
          filter: brightness(.78) saturate(1);
        }

        /* Fallback when no image */
        .rc-photo-fallback {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #1e1a14, #2a2218);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .rc-photo-fallback::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(201,168,76,.06), transparent);
        }
        .rc-photo-fallback-icon {
          color: rgba(201,168,76,.25); position: relative; z-index: 1;
        }

        /* Dark gradient at bottom of photo */
        .rc-photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(22,18,14,.85) 0%, transparent 55%);
          z-index: 1;
        }

        /* Match count badge */
        .rc-match-badge {
          position: absolute; bottom: 10px; left: 12px; z-index: 2;
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(201,168,76,.18);
          border: 1px solid rgba(201,168,76,.35);
          border-radius: 20px; padding: 3px 10px;
          font-size: .68rem; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--gold-lt);
          backdrop-filter: blur(6px);
        }
        .rc-match-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--gold);
        }

        /* Heart button */
        .rc-heart {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(22,18,14,.72); backdrop-filter: blur(8px);
          border: 1px solid rgba(201,168,76,.18);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--muted);
          transition: all .2s ease;
        }
        .rc-heart:hover { color: #e07070; border-color: rgba(224,112,112,.4); background: rgba(224,112,112,.1); }
        .rc-heart.liked { color: #e07070; border-color: rgba(224,112,112,.4); background: rgba(224,112,112,.12); }

        /* ── Card body ── */
        .rc-body {
          padding: 1.1rem 1.2rem 1.3rem;
          display: flex; flex-direction: column; flex: 1;
        }

        /* Top row: name + difficulty */
        .rc-top {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 10px;
          margin-bottom: .5rem;
        }

        .rc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 700;
          color: var(--cream); line-height: 1.25;
          transition: color .2s;
          flex: 1;
        }
        .rc-card:hover .rc-name { color: var(--gold-lt); }

        .rc-difficulty {
          flex-shrink: 0;
          font-size: .65rem; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 3px 9px; border-radius: 20px;
          border: 1px solid;
          white-space: nowrap;
        }

        /* Separator line */
        .rc-sep {
          width: 22px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: .6rem; transition: width .3s;
        }
        .rc-card:hover .rc-sep { width: 36px; }

        /* Description */
        .rc-desc {
          font-size: .78rem; font-weight: 300;
          color: rgba(245,237,216,.38); line-height: 1.6;
          margin-bottom: .9rem; flex: 1;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        /* Meta row */
        .rc-meta {
          display: flex; align-items: center; gap: 16px;
          padding-top: .75rem;
          border-top: 1px solid rgba(201,168,76,.08);
        }
        .rc-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: .74rem; font-weight: 400; color: var(--dim);
          transition: color .2s;
        }
        .rc-card:hover .rc-meta-item { color: rgba(245,237,216,.45); }
        .rc-meta-icon { color: rgba(201,168,76,.45); }

        /* View cue */
        .rc-cta {
          margin-left: auto;
          font-size: .7rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(201,168,76,.35); transition: color .2s;
        }
        .rc-card:hover .rc-cta { color: var(--gold); }
      `}</style>

      <div className="rc-card" onClick={() => setShowDetail(true)}>

        {/* Photo */}
        <div className="rc-photo">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.name}
              className="rc-photo-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="rc-photo-fallback">
              <ChefHat size={48} className="rc-photo-fallback-icon" strokeWidth={1} />
            </div>
          )}
          <div className="rc-photo-overlay" />

          {/* Match badge */}
          {matchCount !== undefined && matchCount > 0 && (
            <div className="rc-match-badge">
              <span className="rc-match-dot" />
              {matchCount} match{matchCount > 1 ? 'es' : ''}
            </div>
          )}

          {/* Heart */}
          <button
            className={`rc-heart ${liked ? 'liked' : ''}`}
            onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
            title={liked ? 'Unsave' : 'Save recipe'}
          >
            <Heart size={15} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Body */}
        <div className="rc-body">
          <div className="rc-top">
            <h3 className="rc-name">{recipe.name}</h3>
            <span
              className="rc-difficulty"
              style={{
                color: diff.color,
                background: diff.bg,
                borderColor: diff.border,
              }}
            >
              {recipe.difficulty}
            </span>
          </div>

          <div className="rc-sep" />

          {recipe.description && (
            <p className="rc-desc">{recipe.description}</p>
          )}

          <div className="rc-meta">
            <span className="rc-meta-item">
              <Clock size={13} className="rc-meta-icon" strokeWidth={2} />
              {recipe.cooking_time} min
            </span>
            <span className="rc-meta-item">
              <Users size={13} className="rc-meta-icon" strokeWidth={2} />
              {recipe.servings} servings
            </span>
            <span className="rc-cta">View →</span>
          </div>
        </div>
      </div>

      {showDetail && (
        <RecipeDetail recipeId={recipe.id} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}