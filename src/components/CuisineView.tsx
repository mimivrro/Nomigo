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

/* ─── Real food images mapped by cuisine name (Unsplash, free) ─── */
const CUISINE_IMAGES: Record<string, string> = {
  // Asian
  indian:      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=70',
  japanese:    'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=70',
  thai:        'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=70',
  chinese:     'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=70',
  korean:      'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=600&q=70',
  vietnamese:  'https://images.unsplash.com/photo-1583224994559-5dbf8e4e1ed1?w=600&q=70',
  indonesian:  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=70',
  malaysian:   'https://images.unsplash.com/photo-1562802378-063ec186a863?w=600&q=70',
  // European
  italian:     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70',
  french:      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=70',
  spanish:     'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=70',
  greek:       'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=70',
  turkish:     'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=70',
  // Americas
  mexican:     'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=70',
  american:    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=70',
  brazilian:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  peruvian:    'https://images.unsplash.com/photo-1612166153011-c3a2f4d8a8ad?w=600&q=70',
  // African
  moroccan:    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=70',
  ethiopian:   'https://images.unsplash.com/photo-1567364816519-cbc9c4ffe1eb?w=600&q=70',
  nigerian:    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=70',
  // Middle East
  lebanese:    'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=70',
  persian:     'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=70',
  israeli:     'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=600&q=70',
  // Oceania
  australian:  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70',
};

/* Fallback: a nice moody food shot if cuisine not in map */
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=70';

function getCuisineImage(cuisine: Cuisine): string {
  // 1. Use image_url from DB if it exists
  if (cuisine.image_url) return cuisine.image_url;
  // 2. Match by name (case-insensitive)
  const key = cuisine.name.toLowerCase().trim();
  return CUISINE_IMAGES[key] ?? FALLBACK_IMAGE;
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
    if (!error && data) setCuisines(data);
    setLoading(false);
  };

  if (viewMode === 'ingredient' && selectedCuisine) {
    return <IngredientSearch cuisine={selectedCuisine} onBack={() => setViewMode('select')} />;
  }
  if (viewMode === 'browse' && selectedCuisine) {
    return <RecipeBrowser cuisine={selectedCuisine} onBack={() => setViewMode('select')} />;
  }

  /* ── CUISINE DETAIL ── */
  if (selectedCuisine) {
    return (
      <>
        <style>{`${SHARED_STYLES}
          .detail-wrap {
            min-height: 100vh; background: var(--dark);
            padding: 2.5rem 1.5rem 5rem;
          }
          .detail-card {
            max-width: 760px; margin: 0 auto;
            background: var(--dark2);
            border: 1px solid rgba(201,168,76,.13);
            border-radius: 22px; overflow: hidden;
            box-shadow: 0 24px 80px rgba(0,0,0,.5);
          }
          .detail-hero {
            position: relative; height: 260px; overflow: hidden;
          }
          .detail-hero-img {
            width: 100%; height: 100%; object-fit: cover;
            filter: brightness(.55) saturate(.85);
            transition: transform .6s ease;
          }
          .detail-card:hover .detail-hero-img { transform: scale(1.04); }
          .detail-hero-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to top, rgba(22,18,14,.95) 0%, rgba(22,18,14,.2) 60%, transparent 100%);
          }
          .detail-gold-bar {
            position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, #C9A84C, transparent);
          }
          .detail-hero-name {
            position: absolute; bottom: 1.5rem; left: 2rem;
            font-family: 'Cormorant Garamond', serif;
            font-size: clamp(2rem,5vw,3rem); font-weight: 700;
            color: var(--cream); letter-spacing: -.01em;
          }
          .detail-body { padding: 2rem 2rem 2.5rem; }
          .detail-desc {
            font-size: .92rem; font-weight: 300;
            color: rgba(245,237,216,.5); line-height: 1.75;
            margin-bottom: 2.5rem;
          }
          .detail-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          @media(max-width:520px){ .detail-actions { grid-template-columns:1fr; } }
          .action-card {
            position: relative; overflow: hidden;
            background: rgba(255,255,255,.03);
            border: 1px solid rgba(201,168,76,.13);
            border-radius: 16px; padding: 2rem 1.5rem;
            cursor: pointer; text-align: center;
            transition: all .3s ease;
          }
          .action-card::after {
            content: ''; position: absolute;
            top: 0; left: 10%; right: 10%; height: 2px;
            background: linear-gradient(90deg, transparent, #C9A84C, transparent);
            transform: scaleX(0); transition: transform .35s ease;
          }
          .action-card:hover {
            background: rgba(201,168,76,.07);
            border-color: rgba(201,168,76,.3);
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(0,0,0,.4);
          }
          .action-card:hover::after { transform: scaleX(1); }
          .action-icon {
            width: 52px; height: 52px; border-radius: 50%;
            background: rgba(201,168,76,.1);
            border: 1px solid rgba(201,168,76,.2);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1rem; color: var(--gold);
            transition: all .3s ease;
          }
          .action-card:hover .action-icon { background: rgba(201,168,76,.18); transform: scale(1.1); }
          .action-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.25rem; font-weight: 700;
            color: var(--cream); margin: 0 0 .4rem;
            transition: color .2s;
          }
          .action-card:hover .action-title { color: var(--gold-lt); }
          .action-desc {
            font-size: .78rem; font-weight: 300;
            color: rgba(245,237,216,.38); line-height: 1.55;
          }
        `}</style>

        <div className="detail-wrap">
          <button className="back-btn" onClick={() => setSelectedCuisine(null)}>
            <ArrowLeft size={16} strokeWidth={2} /> Back to cuisines
          </button>
          <div className="detail-card">
            <div className="detail-hero">
              <img src={getCuisineImage(selectedCuisine)} alt={selectedCuisine.name} className="detail-hero-img" />
              <div className="detail-hero-overlay" />
              <div className="detail-gold-bar" />
              <h2 className="detail-hero-name">{selectedCuisine.name}</h2>
            </div>
            <div className="detail-body">
              <p className="detail-desc">{selectedCuisine.description}</p>
              <div className="detail-actions">
                <button className="action-card" onClick={() => setViewMode('ingredient')}>
                  <div className="action-icon"><Search size={22} strokeWidth={1.5} /></div>
                  <h3 className="action-title">Search by Ingredients</h3>
                  <p className="action-desc">Tell us what you have, we'll find the perfect recipe</p>
                </button>
                <button className="action-card" onClick={() => setViewMode('browse')}>
                  <div className="action-icon"><BookOpen size={22} strokeWidth={1.5} /></div>
                  <h3 className="action-title">Browse All Recipes</h3>
                  <p className="action-desc">Explore our complete collection of authentic recipes</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── CUISINE LIST ── */
  return (
    <>
      <style>{`${SHARED_STYLES}
        .cv-wrap { min-height: 100vh; background: var(--dark); padding: 2.5rem 1.5rem 5rem; }
        .cv-region-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2rem,5vw,3.2rem); font-weight: 700;
          color: var(--cream); letter-spacing: -.01em;
          margin: .5rem 0 .4rem; text-transform: capitalize;
        }
        .cv-region-title em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold-lt));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cv-region-sub {
          font-size: .85rem; font-weight: 300;
          color: rgba(245,237,216,.38); letter-spacing: .04em;
        }
        .cv-spinner { display: flex; justify-content: center; padding: 5rem 0; }
        .spinner-ring {
          width: 44px; height: 44px; border-radius: 50%;
          border: 2px solid rgba(201,168,76,.15);
          border-top-color: var(--gold);
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cv-empty {
          background: var(--dark2); border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; padding: 4rem 2rem; text-align: center;
          color: rgba(245,237,216,.4); font-size: .95rem; font-weight: 300;
        }
        .cv-grid {
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3,1fr); gap: 20px;
        }
        @media(max-width:768px){ .cv-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:480px){ .cv-grid { grid-template-columns: 1fr; } }

        /* Card */
        .cv-card {
          position: relative; overflow: hidden;
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.1);
          border-radius: 18px; cursor: pointer; text-align: left;
          transition: all .3s cubic-bezier(.4,0,.2,1);
        }
        .cv-card::after {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, transparent);
          transform: scaleX(0); transition: transform .35s ease;
        }
        .cv-card:hover {
          border-color: rgba(201,168,76,.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(201,168,76,.1);
        }
        .cv-card:hover::after { transform: scaleX(1); }

        /* Real photo area */
        .cv-card-img {
          height: 170px; overflow: hidden; position: relative;
        }
        .cv-card-photo {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(.6) saturate(.8);
          transition: transform .5s ease, filter .4s ease;
        }
        .cv-card:hover .cv-card-photo {
          transform: scale(1.07);
          filter: brightness(.75) saturate(1);
        }
        /* subtle dark gradient at bottom of photo */
        .cv-card-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(22,18,14,.7) 0%, transparent 55%);
        }

        .cv-card-body { padding: 1.25rem 1.25rem 1.5rem; }
        .cv-card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 700;
          color: var(--cream); margin: 0 0 .4rem;
          transition: color .2s ease;
        }
        .cv-card:hover .cv-card-name { color: var(--gold-lt); }
        .cv-card-sep {
          width: 24px; height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: .55rem; transition: width .3s ease;
        }
        .cv-card:hover .cv-card-sep { width: 40px; }
        .cv-card-desc {
          font-size: .78rem; font-weight: 300;
          color: rgba(245,237,216,.38); line-height: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .cv-card-arrow {
          position: absolute; bottom: 14px; right: 16px;
          font-size: .75rem; color: rgba(201,168,76,.35);
          opacity: 0; transform: translateX(-4px);
          transition: all .25s ease;
        }
        .cv-card:hover .cv-card-arrow { opacity: 1; transform: translateX(0); }
      `}</style>

      <div className="cv-wrap">
        <div style={{ maxWidth: '1100px', margin: '0 auto 2.5rem' }}>
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} strokeWidth={2} /> Back to regions
          </button>
          <h2 className="cv-region-title">
            <em>{region.replace('-', ' ')}</em> Cuisines
          </h2>
          <p className="cv-region-sub">Select a cuisine to explore authentic recipes</p>
        </div>

        {loading ? (
          <div className="cv-spinner"><div className="spinner-ring" /></div>
        ) : cuisines.length === 0 ? (
          <div className="cv-empty" style={{ maxWidth: '500px', margin: '0 auto' }}>
            No cuisines available for this region yet. Check back soon!
          </div>
        ) : (
          <div className="cv-grid">
            {cuisines.map((cuisine) => (
              <button key={cuisine.id} className="cv-card" onClick={() => setSelectedCuisine(cuisine)}>
                <div className="cv-card-img">
                  <img
                    src={getCuisineImage(cuisine)}
                    alt={cuisine.name}
                    className="cv-card-photo"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>
                <div className="cv-card-body">
                  <h3 className="cv-card-name">{cuisine.name}</h3>
                  <div className="cv-card-sep" />
                  <p className="cv-card-desc">{cuisine.description}</p>
                </div>
                <span className="cv-card-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@300;400;500;600&display=swap');
  :root {
    --dark:    #16120e;
    --dark2:   #1e1a14;
    --gold:    #C9A84C;
    --gold-lt: #E2C47A;
    --cream:   #F5EDD8;
  }
  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Jost', sans-serif;
    font-size: .78rem; font-weight: 500;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(245,237,216,.45);
    background: none; border: none; cursor: pointer;
    padding: 8px 0; margin-bottom: 1.5rem;
    transition: color .2s ease;
  }
  .back-btn:hover { color: var(--gold); }
`;