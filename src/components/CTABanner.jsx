import React from 'react';

export default function CTABanner({ onPick }) {
  return (
    <div className="cta-banner">
      <h3>Ready to make something stunning?</h3>
      <p>Free, unlimited, no sign-up. Your images never leave your device.</p>
      <button className="btn btn-primary btn-lg" onClick={onPick}>Start creating now</button>
    </div>
  );
}
