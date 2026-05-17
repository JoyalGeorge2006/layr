import React from 'react';

export default function Header({ onStart }) {
  return (
    <header className="app-header">
      <div className="container inner">
        <a href="#top" className="brand" aria-label="Layr">
          <img src="/icon.svg" className="brand-mark" alt="Layr" />
          <span>Layr</span>
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#gallery">Gallery</a>
          <a className="cta" href="#upload" onClick={(e) => { e.preventDefault(); onStart(); }}>
            <button className="btn btn-primary btn-sm">Create now</button>
          </a>
        </nav>
      </div>
    </header>
  );
}
