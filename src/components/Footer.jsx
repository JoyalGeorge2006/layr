import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <img src="/icon.svg" className="brand-mark" alt="Layr" />
              <span>Layr</span>
            </a>
            <p className="footer-tagline">
              Create stunning Layr designs in seconds. Built with ♥️ by miqu.
            </p>
          </div>

          <nav className="footer-cols" aria-label="Footer">
            <div className="footer-col">
              <h6>Product</h6>
              <a href="#features">Features</a>
              <a href="#how">How it works</a>
              <a href="#gallery">Gallery</a>
            </div>
            <div className="footer-col">
              <h6>Connect</h6>
              <a href="#" target="_blank" rel="noreferrer">Twitter</a>
              <a href="#" target="_blank" rel="noreferrer">Instagram</a>
            </div>
            <div className="footer-col">
              <h6>Legal</h6>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Layr. All rights reserved.
          </span>
          <a
            className="dl-pill dl-pill--footer"
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
        </div>
      </div>
    </footer>
  );
}
