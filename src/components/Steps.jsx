import React from 'react';

const steps = [
  { n: 1, title: 'Upload Photo', body: 'Upload any image from your device — JPG, PNG, or WebP.' },
  { n: 2, title: 'Add Text', body: 'Add and style your text layers with custom fonts, colors and effects.' },
  { n: 3, title: 'Position Text', body: 'Place text behind image elements automatically with AI.' },
  { n: 4, title: 'Download', body: 'Export in high-quality PNG format — no watermark, no sign-up.' },
];

export default function Steps() {
  return (
    <section className="steps container" id="how">
      <div className="steps-head">
        <h2 className="h-section">Create your design in 4 simple steps</h2>
        <p className="lede">From photo to share-worthy design — in under a minute.</p>
      </div>
      <div className="steps-grid">
        {steps.map((s) => (
          <div className="step" key={s.n}>
            <div className="num">{s.n}</div>
            <h5>{s.title}</h5>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
