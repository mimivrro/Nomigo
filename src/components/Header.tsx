import { useState, useEffect } from 'react';
import { ChefHat, User, LogOut, Heart, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Auth from './Auth';

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

        :root {
          --dark:    #1a1612;
          --dark2:   #221e19;
          --gold:    #C9A84C;
          --gold-lt: #E2C47A;
          --gold-dim: rgba(201,168,76,0.14);
          --cream:   #F5EDD8;
          --muted:   rgba(245,237,216,0.50);
        }

        .hdr {
          position: sticky; top: 0; z-index: 100;
          font-family: 'Jost', sans-serif;
          transition: all 0.4s ease;
        }
        .hdr.scrolled {
          background: rgba(26,22,18,0.96);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(201,168,76,0.13);
          box-shadow: 0 4px 40px rgba(0,0,0,0.5);
        }
        .hdr.top {
          background: rgba(26,22,18,0.72);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(201,168,76,0.07);
        }

        .hdr-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 2.5rem; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
        }
        @media (max-width:640px){
          .hdr-inner { padding: 0 1.25rem; }
          .hdr-nav  { display: none !important; }
          .mob-btn  { display: flex !important; }
        }

        /* ── Logo ── */
        .logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .logo-icon {
          width:36px; height:36px; border-radius:8px;
          background: linear-gradient(135deg,#C9A84C,#8B6914);
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 2px 14px rgba(201,168,76,0.32);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .logo:hover .logo-icon { transform:rotate(-8deg) scale(1.08); box-shadow:0 4px 20px rgba(201,168,76,0.48); }
        .logo-word {
          font-family:'Cormorant Garamond',serif;
          font-size:1.65rem; font-weight:700; letter-spacing:.08em;
          color: var(--gold); text-transform:uppercase;
        }

        /* ── Nav ── */
        .hdr-nav { display:flex; align-items:center; gap:4px; }

        .nav-link {
          font-size:.78rem; font-weight:500; letter-spacing:.14em;
          text-transform:uppercase; color:var(--muted);
          background:none; border:none; cursor:pointer;
          padding:8px 14px; border-radius:6px;
          font-family:'Jost',sans-serif;
          transition: color .2s ease;
          position:relative;
        }
        .nav-link::after {
          content:''; position:absolute;
          bottom:5px; left:50%; right:50%; height:1px;
          background:var(--gold); transition:all .25s ease;
        }
        .nav-link:hover { color:var(--gold-lt); }
        .nav-link:hover::after { left:14px; right:14px; }

        .nav-sep { width:1px; height:18px; background:rgba(201,168,76,0.18); margin:0 8px; }

        .nav-icon-btn {
          display:flex; align-items:center; gap:6px;
          font-size:.78rem; font-weight:500; letter-spacing:.1em;
          text-transform:uppercase; color:var(--muted);
          background:none; border:none; cursor:pointer;
          padding:8px 12px; border-radius:6px;
          font-family:'Jost',sans-serif; transition:all .2s ease;
        }
        .nav-icon-btn:hover { color:var(--gold-lt); background:var(--gold-dim); }
        .nav-icon-btn.danger:hover { color:#e08080; background:rgba(200,60,60,.1); }

        .login-btn {
          padding:8px 24px;
          background:transparent; color:var(--gold);
          border:1px solid rgba(201,168,76,.5); border-radius:6px;
          font-size:.78rem; font-weight:600; letter-spacing:.14em;
          text-transform:uppercase; font-family:'Jost',sans-serif;
          cursor:pointer; transition:all .25s ease;
        }
        .login-btn:hover {
          background:var(--gold); color:var(--dark);
          box-shadow:0 0 24px rgba(201,168,76,.35);
        }

        /* ── Mobile ── */
        .mob-btn {
          display:none; align-items:center; justify-content:center;
          width:38px; height:38px;
          border:1px solid rgba(201,168,76,.22);
          border-radius:8px; background:var(--gold-dim);
          color:var(--gold); cursor:pointer; transition:all .2s;
        }
        .mob-btn:hover { background:rgba(201,168,76,.24); }

        .mob-overlay {
          position:fixed; inset:0; z-index:99;
          background:rgba(22,18,14,.98);
          display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:6px;
          animation: mobIn .3s ease;
        }
        @keyframes mobIn {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .mob-close {
          position:absolute; top:22px; right:22px;
          background:none; border:none; color:var(--muted); cursor:pointer;
          transition:color .2s;
        }
        .mob-close:hover { color:var(--gold); }
        .mob-link {
          font-family:'Cormorant Garamond',serif;
          font-size:2.2rem; font-weight:600; font-style:italic;
          color:var(--cream); background:none; border:none; cursor:pointer;
          padding:10px 0; transition:color .2s;
          letter-spacing:.04em;
        }
        .mob-link:hover { color:var(--gold); }
      `}</style>

      <header className={`hdr ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="hdr-inner">
          <div className="logo">
            <div className="logo-icon">
              <ChefHat color="#FFFCF0" size={20} strokeWidth={2} />
            </div>
            <span className="logo-word">Nomigo</span>
          </div>

          <nav className="hdr-nav">
            <button className="nav-link" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</button>
            <button className="nav-link" onClick={() => { document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</button>
            <button className="nav-link" onClick={() => { document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</button>
            <div className="nav-sep" />
            {user ? (
              <>
                <button className="nav-icon-btn"><Heart size={14} strokeWidth={2} />Saved</button>
                <button className="nav-icon-btn"><User size={14} strokeWidth={2} />Profile</button>
                <button className="nav-icon-btn danger" onClick={() => signOut()}><LogOut size={14} strokeWidth={2} />Sign Out</button>
              </>
            ) : (
              <button className="login-btn" onClick={() => setShowAuth(true)}>Login</button>
            )}
          </nav>

          <button className="mob-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mob-overlay">
          <button className="mob-close" onClick={() => setMobileOpen(false)}><X size={28} /></button>
          {['Home','About','Contact'].map(l => (
            <button key={l} className="mob-link" onClick={() => setMobileOpen(false)}>{l}</button>
          ))}
          {user ? (
            <button className="mob-link" onClick={() => { signOut(); setMobileOpen(false); }}>Sign Out</button>
          ) : (
            <button className="login-btn" style={{ marginTop:'1.5rem', fontSize:'1rem', padding:'12px 40px' }}
              onClick={() => { setShowAuth(true); setMobileOpen(false); }}>
              Login
            </button>
          )}
        </div>
      )}

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </>
  );
}