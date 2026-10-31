import React, { useCallback, useState } from 'react';

export default function Hero({ onFile, onPick }) {
  const [drag, setDrag] = useState(false);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDrag(true); }, []);
  const onDragLeave = useCallback(() => setDrag(false), []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <section className="hero" id="top">
      <div className="container">
        <a
          className="dl-pill"
          href="https://discoveryloop.vercel.app/p/layr-create-stunning-designs-in-seconds-26fe6313"
          target="_blank"
          rel="noopener"
          aria-label="Launched on DiscoveryLoop — founder badge"
        >
          <span className="dl-pill-mark" aria-hidden="true">D</span>
          <span className="dl-pill-copy">
            <span className="dl-pill-title">Launched on <strong>DiscoveryLoop</strong></span>
            <span className="dl-pill-sub">0 votes · Founder badge</span>
          </span>
        </a>
        <span className="eyebrow">✨ AI-powered · No sign-up · Free forever</span>
        <h1 className="h-display">
          Create <span className="gradient-text">Text-Behind-Image</span><br />
          designs in seconds.
        </h1>
        <p className="lede">
          Make stunning, scroll-stopping designs where your text sits beautifully behind the
          subject of any photo — automatically, with AI.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary btn-lg" onClick={onPick}>Start creating now</button>
          <a className="btn btn-secondary btn-lg" href="#how">See how it works</a>
        </div>
        <div className="trust-row">
          <span><span className="dot" /> 100% Free Forever</span>
          <span><span className="dot" /> Unlimited Exports</span>
          <span><span className="dot" /> No Ads. No Sign-up.</span>
        </div>
      </div>

      <div className="dropzone-wrap" id="upload">
        <div
          className={`dropzone${drag ? ' is-drag' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onPick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(); }}
        >
          <div className="icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4" />
              <path d="m6 10 6-6 6 6" />
              <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
            </svg>
          </div>
          <h3>Drag and drop an image here</h3>
          <p>or click to select a file — JPG, PNG, WebP</p>
          <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onPick(); }}>
            Select Image
          </button>
        </div>
      </div>
    </section>
  );
}
