import React from 'react';

const items = [
  {
    title: '100% Free Forever',
    body: 'No subscriptions, no hidden costs. Create as much as you want, for as long as you want.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    title: 'Unlimited Exports',
    body: 'Download high-quality PNGs at the original resolution. No watermarks, ever.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    title: 'AI-Enhanced Results',
    body: 'On-device AI separates your subject in seconds — professional quality every time.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 14.39 8.25 21 9 16 13.74 17.18 20.4 12 17.27 6.82 20.4 8 13.74 3 9l6.61-.75z"/>
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="features container" id="features">
      <div className="features-grid">
        {items.map((it) => (
          <div className="feature-card" key={it.title}>
            <div className="ico">{it.icon}</div>
            <h4>{it.title}</h4>
            <p>{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
