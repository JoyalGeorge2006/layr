import React from 'react';

/**
 * Decorative SVG previews — no network needed (renders in sandboxed previews too).
 * Each card mimics the "text-behind-subject" effect.
 */
const cards = [
  {
    bg: ['#0b3d91', '#03a9f4'],
    text: 'DREAM',
    silhouette: 'person',
    subjectColor: '#0a0a0a',
  },
  {
    bg: ['#ff8a00', '#e52e71'],
    text: 'BOLD',
    silhouette: 'face',
    subjectColor: '#1a1a1a',
  },
  {
    bg: ['#06beb6', '#48b1bf'],
    text: 'CHILL',
    silhouette: 'leaf',
    subjectColor: '#0d2e2c',
  },
  {
    bg: ['#232526', '#414345'],
    text: 'NOIR',
    silhouette: 'cat',
    subjectColor: '#fafafa',
  },
];

function Silhouette({ kind, color }) {
  if (kind === 'person')
    return (
      <g fill={color}>
        <circle cx="200" cy="180" r="60" />
        <path d="M120 380 C120 290 280 290 280 380 L280 500 L120 500 Z" />
      </g>
    );
  if (kind === 'face')
    return (
      <g fill={color}>
        <ellipse cx="200" cy="260" rx="120" ry="160" />
      </g>
    );
  if (kind === 'leaf')
    return (
      <g fill={color}>
        <path d="M100 420 C 80 240 220 80 360 100 C 360 280 220 440 100 420 Z" />
      </g>
    );
  if (kind === 'cat')
    return (
      <g fill={color}>
        <path d="M120 240 L150 160 L200 220 L250 160 L280 240 C320 300 320 380 200 420 C 80 380 80 300 120 240 Z" />
        <circle cx="170" cy="270" r="8" fill="#000" />
        <circle cx="230" cy="270" r="8" fill="#000" />
      </g>
    );
  return null;
}

export default function Gallery() {
  return (
    <section className="gallery container" id="gallery">
      <div className="gallery-head">
        <div>
          <h2 className="h-section">Trending Layr styles</h2>
          <p className="lede">Stand out on Instagram with eye-catching, scroll-stopping designs.</p>
        </div>
      </div>
      <div className="gallery-grid">
        {cards.map((c, i) => (
          <div className="gallery-card" key={i}>
            <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`g${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c.bg[0]} />
                  <stop offset="100%" stopColor={c.bg[1]} />
                </linearGradient>
              </defs>
              <rect width="400" height="500" fill={`url(#g${i})`} />
              {/* text BEHIND subject */}
              <text
                x="200" y="290"
                textAnchor="middle"
                fontFamily="-apple-system, SF Pro Display, sans-serif"
                fontSize="140"
                fontWeight="900"
                fill="#ffffff"
                opacity="0.95"
                letterSpacing="-4"
              >{c.text}</text>
              {/* subject ON TOP */}
              <Silhouette kind={c.silhouette} color={c.subjectColor} />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}
