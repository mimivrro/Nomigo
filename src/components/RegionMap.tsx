import { useState } from 'react';
import { Globe } from 'lucide-react';

interface Region {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const regions: Region[] = [
  { id: 'asia',        name: 'Asia',        emoji: '🍜', description: 'Ramen, curries, dumplings & more' },
  { id: 'europe',      name: 'Europe',      emoji: '🥐', description: 'Pasta, pastries, hearty classics' },
  { id: 'americas',    name: 'Americas',    emoji: '🌮', description: 'Tacos, BBQ, bold street food' },
  { id: 'africa',      name: 'Africa',      emoji: '🍲', description: 'Spiced stews, jollof & tagines' },
  { id: 'oceania',     name: 'Oceania',     emoji: '🦞', description: 'Fresh seafood & bush tucker' },
  { id: 'middle-east', name: 'Middle East', emoji: '🧆', description: 'Hummus, kebabs & fragrant rice' },
];

interface RegionMapProps {
  onRegionSelect: (region: string) => void;
}

export default function RegionMap({ onRegionSelect }: RegionMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Jost:wght@300;400;500;600&display=swap');

        .rm-wrap {
          max-width: 960px;
          margin: 0 auto;
          padding: 2.5rem 1rem 2rem;
          font-family: 'Jost', sans-serif;
        }

        /* Header */
        .rm-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .rm-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px; height: 52px;
          border-radius: 50%;
          background: rgba(201,168,76,0.12);
          border: 1px solid rgba(201,168,76,0.25);
          margin-bottom: 1.1rem;
          color: #C9A84C;
        }

        .rm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          font-weight: 700;
          color: #F5EDD8;
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem;
        }

        .rm-title em {
          font-style: italic;
          background: linear-gradient(135deg, #C9A84C, #E2C47A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .rm-sub {
          font-size: 0.9rem;
          font-weight: 300;
          color: rgba(245,237,216,0.45);
          letter-spacing: 0.04em;
        }

        /* Grid */
        .rm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 600px) {
          .rm-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }

        /* Card */
        .rm-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(201,168,76,0.12);
          border-radius: 16px;
          padding: 1.75rem 1.25rem 1.5rem;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          text-align: center;
          outline: none;
        }

        .rm-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,168,76,0.08), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
        }

        /* Gold top border that slides in on hover */
        .rm-card::after {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #C9A84C, #E2C47A, #C9A84C, transparent);
          transform: scaleX(0);
          transition: transform 0.35s ease;
          border-radius: 0 0 4px 4px;
        }

        .rm-card:hover,
        .rm-card:focus-visible {
          background: rgba(201,168,76,0.07);
          border-color: rgba(201,168,76,0.35);
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.15);
        }

        .rm-card:hover::before,
        .rm-card:focus-visible::before { opacity: 1; }

        .rm-card:hover::after,
        .rm-card:focus-visible::after { transform: scaleX(1); }

        .rm-card:active { transform: translateY(-2px) scale(0.98); }

        /* Emoji */
        .rm-emoji {
          font-size: 2.2rem;
          display: block;
          margin-bottom: 0.9rem;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
        }

        .rm-card:hover .rm-emoji { transform: scale(1.18) rotate(-4deg); }

        /* Region name */
        .rm-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #F5EDD8;
          letter-spacing: 0.01em;
          margin: 0 0 0.3rem;
          transition: color 0.2s ease;
        }

        .rm-card:hover .rm-name { color: #E2C47A; }

        /* Underline accent */
        .rm-line {
          width: 28px; height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          margin: 0 auto 0.65rem;
          transition: width 0.3s ease;
        }

        .rm-card:hover .rm-line { width: 48px; }

        /* Description */
        .rm-desc {
          font-size: 0.75rem;
          font-weight: 300;
          color: rgba(245,237,216,0.35);
          letter-spacing: 0.03em;
          line-height: 1.5;
          transition: color 0.2s ease;
        }

        .rm-card:hover .rm-desc { color: rgba(245,237,216,0.55); }

        /* Arrow hint */
        .rm-arrow {
          position: absolute;
          bottom: 12px; right: 14px;
          font-size: 0.75rem;
          color: rgba(201,168,76,0.4);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.25s ease;
        }

        .rm-card:hover .rm-arrow { opacity: 1; transform: translateX(0); }
      `}</style>

      <div className="rm-wrap">
        {/* Header */}
        <div className="rm-header">
          <div className="rm-icon-wrap">
            <Globe size={24} strokeWidth={1.5} />
          </div>
          <h2 className="rm-title">
            Explore <em>Global Cuisines</em>
          </h2>
          <p className="rm-sub">Select a region to discover authentic recipes from around the world</p>
        </div>

        {/* Region grid */}
        <div className="rm-grid">
          {regions.map((region) => (
            <button
              key={region.id}
              className="rm-card"
              onClick={() => onRegionSelect(region.id)}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="rm-emoji">{region.emoji}</span>
              <h3 className="rm-name">{region.name}</h3>
              <div className="rm-line" />
              <p className="rm-desc">{region.description}</p>
              <span className="rm-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}