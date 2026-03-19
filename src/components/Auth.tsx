import { useState } from 'react';
import { X, ChefHat, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthProps {
  onClose: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!username) { setError('Username is required'); setLoading(false); return; }
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap');

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

        .auth-backdrop {
          position: fixed; top: 68px; left: 0; right: 0; bottom: 0; z-index: 60;
          background: rgba(10,8,6,0.9);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: authBdIn .2s ease;
        }
        @keyframes authBdIn { from { opacity:0; } to { opacity:1; } }

        .auth-backdrop-click {
          position: absolute; inset: 0; z-index: 0;
        }

        .auth-modal {
          position: relative; z-index: 1;
          width: 100%; max-width: 420px;
          background: var(--dark2);
          border: 1px solid rgba(201,168,76,.18);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.02);
          animation: authIn .28s cubic-bezier(.4,0,.2,1);
          font-family: 'Jost', sans-serif;
        }
        @keyframes authIn {
          from { opacity:0; transform:translateY(18px) scale(.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        /* Gold top bar */
        .auth-gold-bar {
          height: 2px;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, #C9A84C, transparent);
        }

        /* Header area */
        .auth-header {
          padding: 2rem 2rem 0;
          position: relative;
        }

        .auth-logo {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 1.75rem;
        }
        .auth-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #C9A84C, #8B6914);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(201,168,76,.3);
        }
        .auth-logo-word {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 700; letter-spacing: .08em;
          text-transform: uppercase; color: var(--gold);
        }

        .auth-close {
          position: absolute; top: 1.5rem; right: 1.5rem;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(201,168,76,.18);
          display: flex; align-items: center; justify-content: center;
          color: var(--dim); cursor: pointer;
          transition: all .2s ease;
        }
        .auth-close:hover { color: var(--cream); border-color: rgba(201,168,76,.4); background: rgba(201,168,76,.08); }

        .auth-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 700; color: var(--cream);
          letter-spacing: -.01em; margin: 0 0 .3rem;
        }
        .auth-title em {
          font-style: italic;
          background: linear-gradient(135deg, var(--gold), var(--gold-lt));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .auth-subtitle {
          font-size: .8rem; font-weight: 300; color: var(--dim);
          letter-spacing: .04em; margin-bottom: 0;
        }

        /* Divider under header */
        .auth-header-line {
          height: 1px; margin: 1.5rem 0 0;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,.15), transparent);
        }

        /* Form area */
        .auth-body { padding: 1.5rem 2rem 2rem; }

        /* Field */
        .auth-field { margin-bottom: 1rem; }
        .auth-label {
          display: block;
          font-size: .72rem; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: var(--dim);
          margin-bottom: .5rem;
        }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: rgba(201,168,76,.4);
          pointer-events: none;
        }
        .auth-input {
          width: 100%; padding: 11px 14px 11px 38px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(201,168,76,.15);
          border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: .88rem; font-weight: 300;
          color: var(--cream); outline: none;
          transition: border-color .2s, background .2s;
        }
        .auth-input::placeholder { color: var(--dim); }
        .auth-input:focus {
          border-color: rgba(201,168,76,.45);
          background: rgba(201,168,76,.04);
        }

        /* Error */
        .auth-error {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(224,112,112,.08);
          border: 1px solid rgba(224,112,112,.22);
          border-radius: 10px; padding: 10px 14px;
          font-size: .8rem; color: #e08888; line-height: 1.5;
          margin-bottom: 1rem;
        }

        /* Submit button */
        .auth-submit {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, var(--gold), var(--gold-dk));
          color: var(--dark); border: none; border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: .88rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; cursor: pointer;
          box-shadow: 0 4px 18px rgba(201,168,76,.28);
          transition: all .25s ease;
          margin-bottom: 1.25rem;
        }
        .auth-submit:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow: 0 6px 26px rgba(201,168,76,.4);
          transform: translateY(-1px);
        }
        .auth-submit:disabled {
          opacity: .5; cursor: not-allowed; transform: none;
        }

        /* Loading dots */
        .auth-dots { display: inline-flex; gap: 4px; align-items: center; }
        .auth-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--dark); opacity: .6;
          animation: dotPulse 1.2s ease-in-out infinite;
        }
        .auth-dot:nth-child(2) { animation-delay: .2s; }
        .auth-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes dotPulse {
          0%,100% { opacity:.3; transform:scale(.8); }
          50%      { opacity:1;  transform:scale(1); }
        }

        /* Toggle link */
        .auth-toggle {
          text-align: center;
        }
        .auth-toggle-text {
          font-size: .78rem; font-weight: 300; color: var(--dim);
        }
        .auth-toggle-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: .78rem; font-weight: 600;
          color: var(--gold); letter-spacing: .04em;
          transition: color .2s; padding: 0; margin-left: 4px;
        }
        .auth-toggle-btn:hover { color: var(--gold-lt); }

        /* Animated tab indicator */
        .auth-tabs {
          display: flex; gap: 0;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(201,168,76,.1);
          border-radius: 10px; padding: 3px;
          margin-bottom: 1.5rem;
        }
        .auth-tab {
          flex: 1; padding: 8px;
          background: none; border: none; cursor: pointer;
          font-family: 'Jost', sans-serif;
          font-size: .75rem; font-weight: 500; letter-spacing: .1em;
          text-transform: uppercase; color: var(--dim);
          border-radius: 8px;
          transition: all .2s ease;
        }
        .auth-tab.active {
          background: rgba(201,168,76,.12);
          border: 1px solid rgba(201,168,76,.25);
          color: var(--gold-lt);
        }
      `}</style>

      <div className="auth-backdrop">
        <div className="auth-backdrop-click" onClick={onClose} />

        <div className="auth-modal">
          <div className="auth-gold-bar" />

          <div className="auth-header">
            {/* Logo */}
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <ChefHat size={18} color="#FFFCF0" strokeWidth={2} />
              </div>
              <span className="auth-logo-word">Nomigo</span>
            </div>

            {/* Close */}
            <button className="auth-close" onClick={onClose}>
              <X size={14} strokeWidth={2} />
            </button>

            {/* Title */}
            <h2 className="auth-title">
              {isSignUp ? <>Join <em>Nomigo</em></> : <>Welcome <em>back</em></>}
            </h2>
            <p className="auth-subtitle">
              {isSignUp ? 'Create your account to save recipes & more' : 'Sign in to your account to continue'}
            </p>
            <div className="auth-header-line" />
          </div>

          <div className="auth-body">
            {/* Tab switcher */}
            <div className="auth-tabs">
              <button className={`auth-tab ${!isSignUp ? 'active' : ''}`} onClick={() => { setIsSignUp(false); setError(''); }}>
                Sign In
              </button>
              <button className={`auth-tab ${isSignUp ? 'active' : ''}`} onClick={() => { setIsSignUp(true); setError(''); }}>
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {isSignUp && (
                <div className="auth-field">
                  <label className="auth-label">Username</label>
                  <div className="auth-input-wrap">
                    <User size={14} className="auth-input-icon" strokeWidth={2} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_username"
                      className="auth-input"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <Mail size={14} className="auth-input-icon" strokeWidth={2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={14} className="auth-input-icon" strokeWidth={2} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error">⚠ {error}</div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <span className="auth-dots">
                    <span className="auth-dot" />
                    <span className="auth-dot" />
                    <span className="auth-dot" />
                  </span>
                ) : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="auth-toggle">
              <span className="auth-toggle-text">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                className="auth-toggle-btn"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}