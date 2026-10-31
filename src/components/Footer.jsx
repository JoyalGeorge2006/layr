import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ textAlign: 'center' }}>
        <div
          className="row"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <div
              className="brand"
              style={{
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <img src="/icon.svg" className="brand-mark" alt="Layr" />
              <span>Layr</span>
            </div>
            <div>
              Create stunning Layr designs in seconds. Built with ♥️.Built by miqu.
            </div>
          </div>

          <div
            className="footer-links"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#gallery">Gallery</a>
            <a href="#" target="_blank" rel="noreferrer">Twitter</a>
            <a href="#" target="_blank" rel="noreferrer">Instagram</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>

        <div className="dl-badge-wrap">
          <a
            className="dl-badge"
            href="https://discoveryloop.vercel.app/p/layr-create-stunning-designs-in-seconds-26fe6313"
            target="_blank"
            rel="noopener"
            aria-label="Launched on DiscoveryLoop"
          >
            <img
              className="dl-badge-light"
              src="/badges/dl-badge-light.svg"
              alt=""
              width="300"
              height="140"
              loading="lazy"
            />
            <img
              className="dl-badge-dark"
              src="/badges/dl-badge-dark.svg"
              alt=""
              width="300"
              height="140"
              loading="lazy"
            />
          </a>
        </div>

        <div style={{ marginTop: 18, color: 'var(--text-subtle)' }}>
          © {new Date().getFullYear()} Layr. All rights reserved.
        </div>
      </div>
    </footer>
  );
}