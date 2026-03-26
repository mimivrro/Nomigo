import { useState, useEffect, useRef, useCallback } from 'react';
import RegionMap from './RegionMap';
import CuisineView from './CuisineView';
import LeftoverSearch from './LeftoverSearch';

const HERO_WORDS = ['Explore.', 'Discover.', 'Create.'];

export default function HomePage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showLeftovers, setShowLeftovers] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % HERO_WORDS.length);
        setFade(true);
      }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, []);






  const handleNavEvent = useCallback((e: Event) => {
  const target = (e as CustomEvent).detail as string;

  // If we're on a sub-page, go back to home first, then scroll after mount
  if (selectedRegion || showLeftovers) {
    setSelectedRegion(null);
    setShowLeftovers(false);
    // Wait for HomePage to remount, then scroll
    setTimeout(() => {
      if (target === 'about') {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      } else if (target === 'contact') {
        document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80); // small delay lets the DOM render first
    return;
  }

  // Already on HomePage — scroll directly
  if (target === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (target === 'about') {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  } else if (target === 'contact') {
    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
  }
}, [selectedRegion, showLeftovers]);

useEffect(() => {
  window.addEventListener('nomigo:navigate', handleNavEvent);
  return () => window.removeEventListener('nomigo:navigate', handleNavEvent);
}, [handleNavEvent]);

  if (showLeftovers) {
    return <LeftoverSearch onBack={() => setShowLeftovers(false)} />;
  }

  if (selectedRegion) {
    return <CuisineView region={selectedRegion} onBack={() => setSelectedRegion(null)} />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --dark:   #16120e;
          --dark2:  #1e1a14;
          --dark3:  #26211a;
          --gold:   #C9A84C;
          --gold-lt:#E2C47A;
          --gold-dk:#8B6914;
          --cream:  #F5EDD8;
          --muted:  rgba(245,237,216,0.5);
          --dim:    rgba(245,237,216,0.25);
        }

        .hp { 
          min-height:100vh; 
          background:var(--dark); 
          font-family:'Jost',sans-serif;
          color:var(--cream);
          overflow-x:hidden;
        }

        /* ═══════════════════════════════════
           HERO
        ═══════════════════════════════════ */
        .hero {
          position:relative;
          min-height:100vh;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center;
          padding:5rem 1.5rem 4rem;
          overflow:hidden;
        }

        /* Full-bleed food photo background */
        .hero-bg {
          position:absolute; inset:0;
          background:
            linear-gradient(to bottom,
              rgba(22,18,14,0.55) 0%,
              rgba(22,18,14,0.3)  40%,
              rgba(22,18,14,0.7)  75%,
              rgba(22,18,14,1)    100%
            ),
            url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1800&q=80&auto=format') center/cover no-repeat;
        }

        /* Grain overlay */
        .hero-grain {
          position:absolute; inset:0; pointer-events:none; z-index:1;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }

        /* Gold dust sparkles */
        .hero-glow {
          position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(ellipse 60% 40% at 50% 30%, rgba(201,168,76,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 60%, rgba(201,168,76,0.05) 0%, transparent 60%);
        }

        .hero-content { position:relative; z-index:2; max-width:840px; }

        .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          border:1px solid rgba(201,168,76,0.35);
          border-radius:40px;
          padding:5px 18px 5px 12px;
          font-size:.72rem; font-weight:500;
          letter-spacing:.14em; text-transform:uppercase;
          color:var(--gold-lt);
          background:rgba(201,168,76,0.07);
          margin-bottom:1.8rem;
          opacity:0; transform:translateY(14px);
          transition:all .65s ease .1s;
        }
        .hero-badge.show { opacity:1; transform:translateY(0); }
        .badge-dot { width:5px; height:5px; border-radius:50%; background:var(--gold); animation:blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:.3;} }

        .hero-pre {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1rem,2.5vw,1.3rem);
          font-weight:300; font-style:italic;
          color:var(--gold); letter-spacing:.1em;
          margin-bottom:.4rem;
          opacity:0; transform:translateY(16px);
          transition:all .65s ease .2s;
        }
        .hero-pre.show { opacity:1; transform:translateY(0); }

        .hero-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(3rem,9vw,7rem);
          font-weight:700; line-height:1.0;
          letter-spacing:-.02em;
          color:var(--cream);
          margin:0 0 .5rem;
          opacity:0; transform:translateY(20px);
          transition:all .7s ease .3s;
        }
        .hero-title.show { opacity:1; transform:translateY(0); }

        .hero-title em {
          font-style:italic;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 60%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        /* Cycling word */
        .cycling-word {
          display:inline-block;
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(3rem,9vw,7rem);
          font-weight:700;
          font-style:italic;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-lt) 60%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          transition:opacity .35s ease, transform .35s ease;
        }
        .cycling-word.visible   { opacity:1; transform:translateY(0); }
        .cycling-word.invisible { opacity:0; transform:translateY(-8px); }

        .hero-tagline {
          font-size:clamp(.95rem,2vw,1.1rem);
          font-weight:300; line-height:1.7;
          color:var(--muted); max-width:520px; margin:0 auto 2.5rem;
          opacity:0; transform:translateY(16px);
          transition:all .7s ease .5s;
        }
        .hero-tagline.show { opacity:1; transform:translateY(0); }

        /* CTA pair */
        .hero-ctas {
          display:flex; align-items:center; justify-content:center;
          gap:14px; flex-wrap:wrap;
          opacity:0; transform:translateY(14px);
          transition:all .7s ease .65s;
        }
        .hero-ctas.show { opacity:1; transform:translateY(0); }

        .cta-gold {
          padding:13px 32px;
          background: linear-gradient(135deg, var(--gold), var(--gold-dk));
          color:var(--dark); border:none; border-radius:6px;
          font-family:'Jost',sans-serif;
          font-size:.85rem; font-weight:600; letter-spacing:.12em;
          text-transform:uppercase; cursor:pointer;
          box-shadow:0 4px 20px rgba(201,168,76,.28);
          transition:all .25s ease;
        }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(201,168,76,.42); filter:brightness(1.08); }

        .cta-outline {
          padding:12px 28px;
          background:transparent; color:var(--gold);
          border:1px solid rgba(201,168,76,.45); border-radius:6px;
          font-family:'Jost',sans-serif;
          font-size:.85rem; font-weight:500; letter-spacing:.12em;
          text-transform:uppercase; cursor:pointer;
          transition:all .25s ease;
        }
        .cta-outline:hover { background:rgba(201,168,76,.1); border-color:var(--gold); transform:translateY(-1px); }

        /* Scroll hint */
        .scroll-hint {
          position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:8px;
          color:var(--dim); font-size:.68rem; letter-spacing:.18em; text-transform:uppercase;
          animation:scrollHint 2.5s ease-in-out infinite;
          z-index:2;
        }
        @keyframes scrollHint {
          0%,100%{ opacity:.4; transform:translateX(-50%) translateY(0); }
          50%{ opacity:.9; transform:translateX(-50%) translateY(6px); }
        }
        .scroll-line { width:1px; height:32px; background:linear-gradient(to bottom, var(--gold), transparent); }

        /* ═══════════════════════════════════
           LEFTOVER INGREDIENTS BANNER
        ═══════════════════════════════════ */
        .leftover-banner {
          position:relative; overflow:hidden;
          background: var(--dark2);
          border-top:1px solid rgba(201,168,76,.1);
          border-bottom:1px solid rgba(201,168,76,.1);
          padding:4.5rem 1.5rem;
          text-align:center;
        }

        .leftover-bg {
          position:absolute; inset:0;
          background:
            linear-gradient(135deg, rgba(201,168,76,.04) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,.03), transparent);
        }

        .leftover-inner { position:relative; z-index:1; max-width:600px; margin:0 auto; }

        .leftover-label {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1.4rem,4vw,2rem);
          font-weight:300; font-style:italic;
          color:var(--gold-lt); letter-spacing:.06em;
          margin-bottom:.6rem;
        }

        .leftover-heading {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(2.4rem,7vw,4.5rem);
          font-weight:700; line-height:1.05; letter-spacing:-.01em;
          color:var(--cream); text-transform:uppercase;
          margin-bottom:2rem;
        }

        .leftover-heading span {
          background:linear-gradient(135deg,var(--gold),var(--gold-lt));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        .leftover-btn {
          padding:14px 36px;
          background:linear-gradient(135deg, var(--gold), var(--gold-dk));
          color:var(--dark); border:none; border-radius:6px;
          font-family:'Jost',sans-serif;
          font-size:.88rem; font-weight:700; letter-spacing:.16em;
          text-transform:uppercase; cursor:pointer;
          box-shadow:0 6px 28px rgba(201,168,76,.3);
          transition:all .25s ease;
        }
        .leftover-btn:hover { transform:translateY(-2px); box-shadow:0 10px 36px rgba(201,168,76,.45); }

        /* Decorative food strip */
        .food-strip {
          display:grid;
          grid-template-columns: repeat(4, 1fr);
          height:220px;
          overflow:hidden;
        }

        @media (max-width:640px){ .food-strip { grid-template-columns: repeat(2,1fr); height:160px; } }

        .food-strip-img {
          width:100%; height:100%; object-fit:cover;
          filter:brightness(.55) saturate(.85);
          transition:all .5s ease;
        }
        .food-strip-img:hover { filter:brightness(.8) saturate(1.1); transform:scale(1.03); }

        /* ═══════════════════════════════════
           MAP SECTION
        ═══════════════════════════════════ */
        .map-section {
          background:var(--dark);
          padding:5rem 1.5rem;
        }

        .section-header { text-align:center; margin-bottom:3rem; }

        .section-eyebrow {
          display:inline-flex; align-items:center; gap:12px;
          font-size:.72rem; font-weight:500; letter-spacing:.2em;
          text-transform:uppercase; color:var(--gold);
          margin-bottom:1rem;
        }
        .section-eyebrow::before,.section-eyebrow::after {
          content:''; display:block; width:36px; height:1px;
          background:linear-gradient(90deg, transparent, var(--gold));
        }
        .section-eyebrow::after { background:linear-gradient(90deg, var(--gold), transparent); }

        .section-title {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(1.8rem,4vw,3rem);
          font-weight:700; color:var(--cream);
          letter-spacing:-.01em; margin:0;
        }

        .section-title em { font-style:italic; color:var(--gold-lt); }

        .map-wrap {
          max-width:1100px; margin:0 auto;
          background:var(--dark2);
          border-radius:20px; overflow:hidden;
          border:1px solid rgba(201,168,76,.12);
          box-shadow:0 24px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.02);
          position:relative;
        }
        .map-wrap::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent, var(--gold), var(--gold-lt), var(--gold), transparent);
          z-index:1;
        }

        .map-inner { padding:1.5rem; }

        /* ═══════════════════════════════════
           ABOUT SECTION
        ═══════════════════════════════════ */
        .about-section {
          background:var(--dark2);
          border-top:1px solid rgba(201,168,76,.08);
          padding:5rem 1.5rem;
        }

        .about-grid {
          max-width:1100px; margin:0 auto;
          display:grid; grid-template-columns:1fr 1fr; gap:5rem;
          align-items:center;
        }
        @media(max-width:768px){ .about-grid { grid-template-columns:1fr; gap:3rem; } }

        .about-img-wrap { position:relative; }
        .about-img {
          width:100%; aspect-ratio:3/4;
          object-fit:cover; border-radius:14px;
          filter:brightness(.85) saturate(.9);
          box-shadow:0 24px 60px rgba(0,0,0,.5);
        }
        .about-img-badge {
          position:absolute; bottom:-18px; right:-18px;
          width:100px; height:100px;
          background:linear-gradient(135deg,var(--gold),var(--gold-dk));
          border-radius:50%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          box-shadow:0 8px 32px rgba(201,168,76,.35);
        }
        .about-img-badge-num {
          font-family:'Cormorant Garamond',serif;
          font-size:1.8rem; font-weight:700; color:var(--dark); line-height:1;
        }
        .about-img-badge-label {
          font-size:.58rem; font-weight:600; letter-spacing:.12em;
          text-transform:uppercase; color:rgba(22,18,14,.7);
        }

        .about-text { }
        .about-eyebrow {
          font-size:.72rem; font-weight:500; letter-spacing:.2em;
          text-transform:uppercase; color:var(--gold);
          margin-bottom:1rem;
        }
        .about-heading {
          font-family:'Cormorant Garamond',serif;
          font-size:clamp(2rem,4vw,3.2rem);
          font-weight:700; color:var(--cream);
          line-height:1.1; letter-spacing:-.01em;
          margin:0 0 1.5rem;
        }
        .about-heading em { font-style:italic; color:var(--gold-lt); }
        .about-body {
          font-size:.95rem; font-weight:300; line-height:1.8;
          color:var(--muted); margin-bottom:2rem;
        }

        .about-perks { list-style:none; padding:0; margin:0 0 2.5rem; display:flex; flex-direction:column; gap:10px; }
        .about-perk {
          display:flex; align-items:flex-start; gap:12px;
          font-size:.88rem; color:rgba(245,237,216,.65); line-height:1.5;
        }
        .perk-dot {
          width:6px; height:6px; border-radius:50%; background:var(--gold);
          flex-shrink:0; margin-top:7px;
        }

        /* ═══════════════════════════════════
           FOOTER
        ═══════════════════════════════════ */
        .footer {
          background:var(--dark);
          border-top:1px solid rgba(201,168,76,.1);
          padding:2.5rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap;
          gap:16px; max-width:100%;
        }

        .footer-logo {
          font-family:'Cormorant Garamond',serif;
          font-size:1.4rem; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; color:var(--gold);
        }

        .footer-links { display:flex; gap:24px; }
        .footer-link {
          font-size:.75rem; font-weight:500; letter-spacing:.1em;
          text-transform:uppercase; color:var(--dim);
          background:none; border:none; cursor:pointer;
          font-family:'Jost',sans-serif; transition:color .2s;
        }
        .footer-link:hover { color:var(--gold); }

        .footer-copy {
          font-size:.72rem; color:var(--dim); letter-spacing:.05em;
          width:100%; text-align:center; border-top:1px solid rgba(201,168,76,.06);
          margin-top:1rem; padding-top:1.5rem;
        }

        /* Social dots */
        .socials { display:flex; gap:10px; }
        .social-btn {
          width:32px; height:32px; border-radius:50%;
          border:1px solid rgba(201,168,76,.25);
          background:rgba(201,168,76,.06);
          color:var(--gold); cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-size:.8rem; transition:all .2s;
        }
        .social-btn:hover { background:var(--gold); color:var(--dark); }

        @media(max-width:640px){
          .footer { justify-content:center; text-align:center; }
          .footer-links { flex-wrap:wrap; justify-content:center; }
        }
      `}</style>

      <div className="hp">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grain" />
          <div className="hero-glow" />

          <div className="hero-content">
            <div className={`hero-badge ${mounted ? 'show' : ''}`}>
              <span className="badge-dot" />
              World cuisine explorer
            </div>

            <p className={`hero-pre ${mounted ? 'show' : ''}`}>leftover ingredients?</p>

            <h1 className={`hero-title ${mounted ? 'show' : ''}`}>
              <span className={`cycling-word ${fade ? 'visible' : 'invisible'}`}>
                {HERO_WORDS[wordIdx]}
              </span>
              <br />
              <em>Go Nom.</em>
            </h1>

            <p className={`hero-tagline ${mounted ? 'show' : ''}`}>
              Browse cuisines from every corner of the world — or toss in whatever's left in your fridge and let Nomigo cook up the perfect suggestion.
            </p>

            <div className={`hero-ctas ${mounted ? 'show' : ''}`}>
              <button className="cta-gold" onClick={() => document.getElementById('map')?.scrollIntoView({ behavior:'smooth' })}>
                Explore Cuisines
              </button>
              <button className="cta-outline" onClick={() => setShowLeftovers(true)}>
                My Leftovers
              </button>
            </div>
          </div>

          <div className="scroll-hint">
            <div className="scroll-line" />
            scroll
          </div>
        </section>

        {/* ── LEFTOVER BANNER ── */}
        <section className="leftover-banner" id="leftovers">
          <div className="leftover-bg" />
          <div className="leftover-inner">
            <p className="leftover-label">got leftovers?</p>
            <h2 className="leftover-heading">
              Leftover<br />
              Ingredients:<br />
              <span>Go Nom</span>
            </h2>
            <button className="leftover-btn" onClick={() => setShowLeftovers(true)}>My Leftovers →</button>
          </div>
        </section>

        {/* Food image strip */}
        <div className="food-strip">
          {[
            'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=70',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=70',
            'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=70',
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=70',
          ].map((src, i) => (
            <img key={i} src={src} alt="" className="food-strip-img" />
          ))}
        </div>

        {/* ── MAP SECTION ── */}
        <section className="map-section" id="map">
          <div className="section-header">
            <div className="section-eyebrow">Pick your region</div>
            <h2 className="section-title">Where does your appetite<br /><em>travel today?</em></h2>
          </div>
          <div className="map-wrap">
            <div className="map-inner">
              <RegionMap onRegionSelect={setSelectedRegion} />
            </div>
          </div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section className="about-section" id="about" ref={aboutRef}>
          <div className="about-grid">
            <div className="about-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
                alt="cooking"
                className="about-img"
              />
              <div className="about-img-badge">
                <span className="about-img-badge-num">500+</span>
                <span className="about-img-badge-label">Recipes</span>
              </div>
            </div>

            <div className="about-text">
              <p className="about-eyebrow">About Us</p>
              <h2 className="about-heading">
                Your kitchen<br /><em>companion</em>
              </h2>
              <p className="about-body">
                Welcome to Nomigo — your go-to kitchen companion for turning everyday ingredients and leftovers into delicious meals. We're here to make cooking easier, smarter, and more sustainable.
              </p>
              <ul className="about-perks">
                {[
                  'Explore recipes from global cuisines',
                  'Filter dishes by ingredients you already have',
                  'Cut down on food waste while saving time and money',
                  'Discover new flavours without a trip to the store',
                ].map(p => (
                  <li key={p} className="about-perk">
                    <span className="perk-dot" />
                    {p}
                  </li>
                ))}
              </ul>
              <button className="cta-gold">Learn More</button>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer" id="footer">
          <span className="footer-logo">Nomigo</span>
          <nav className="footer-links">
            {['Home','About','Contact','Privacy'].map(l => (
              <button key={l} className="footer-link">{l}</button>
            ))}
          </nav>
          <div className="socials">
            {['𝕏','f','▶','📷'].map((s,i) => (
              <button key={i} className="social-btn">{s}</button>
            ))}
          </div>
          <p className="footer-copy">Copyright © {new Date().getFullYear()} Nomigo. All Rights Reserved.</p>
        </footer>

      </div>
    </>
  );
}