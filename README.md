# Layr — React + Apple Design Language

> Create stunning **Layr** designs in seconds using AI.
> 100% free · Unlimited downloads · No ads · No sign-up · Runs entirely in your browser.

A polished, production-ready React startup landing page **+** a fully working in-browser editor that:

1. Loads any photo
2. Uses an on-device AI model to cut out the subject (no upload)
3. Renders text **between** the background and the subject — true "text-behind-image" effect
4. Exports a high-res PNG

The UI follows **Apple's design language** — SF Pro typography, soft 22px radii, frosted-glass nav, generous whitespace, subtle motion, and a light/dark theme that follows your system.

---

## ✨ Features

- **AI background removal** powered by [`@imgly/background-removal`](https://www.npmjs.com/package/@imgly/background-removal) — runs locally with ONNX/WebAssembly. Your image never leaves your device.
- **Multi-layer text editor** — add unlimited text layers with full control over font, weight, italic, size, color, opacity, letter-spacing, position, rotation, and drop shadow.
- **Drag to reposition** text directly on the canvas (pointer events; works on touch).
- **High-quality PNG export** at the original image resolution. No watermark.
- **Apple HIG-inspired UI** — frosted sticky nav, pill buttons, SF-style type, light + dark mode, soft shadows, micro-interactions.
- **Zero backend** — entire app is static, deployable to any CDN (Vercel, Netlify, Cloudflare Pages, GitHub Pages).

---

## 🧱 Project structure

```
.
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry
    ├── App.jsx               # Routing between landing & editor
    ├── styles/
    │   └── global.css        # Apple-style design system (CSS variables, light/dark)
    └── components/
        ├── Header.jsx        # Sticky frosted nav
        ├── Hero.jsx          # Headline + drag-and-drop dropzone
        ├── Features.jsx      # 3-up feature grid
        ├── Steps.jsx         # 4-step "how it works"
        ├── Gallery.jsx       # Trending styles (inline SVG previews)
        ├── CTABanner.jsx     # Dark CTA card
        ├── Footer.jsx
        ├── Editor.jsx        # Canvas compositor + AI integration + export
        └── TextPanel.jsx     # Right-hand inspector with all text controls
```

---

## 🚀 Run locally

```bash
# 1. Install (Node 18+)
npm install

# 2. Dev server (hot reload)
npm run dev
# → http://localhost:5173

# 3. Production build
npm run build
npm run preview
```

The first time you process an image, the AI model (~50 MB) downloads from the
`@imgly/background-removal` CDN and is cached by the browser. Subsequent runs
are instant.

---

## 🎨 Apple design language — what we used

| Element            | Apple cue                                                                  |
|--------------------|----------------------------------------------------------------------------|
| Typography         | `-apple-system, "SF Pro Display", "SF Pro Text"` with negative tracking    |
| Headline color     | Subtle multi-stop gradient on the keyword (Apple Intelligence vibe)        |
| Nav                | Sticky, 52 px tall, `backdrop-filter: saturate(180%) blur(20px)`           |
| Buttons            | Fully rounded "pill" 980px radius, blue `#0071e3` primary                  |
| Cards              | 22 px radius, soft 1-px hairline borders, gentle elevation                 |
| Light/Dark         | `prefers-color-scheme` driven via CSS custom properties                    |
| Motion             | 120–180 ms ease, subtle `scale(0.97)` on `:active`                         |
| Inputs             | 36 px height, 10 px radius, focus ring uses `color-mix` with accent        |
| Spacing            | Generous padding (88 px hero, 80 px sections)                              |

---

## 🧠 How Layr works

The renderer in `Editor.jsx` paints, in order:

1. **Background** = original photo, at native resolution.
2. **Text layers** — each transformed (translate / rotate) and drawn with the user's font, color, opacity, letter-spacing, and optional shadow.
3. **Foreground** = subject cut-out PNG produced by the AI model.

Because the cut-out is drawn *on top* of the text, the subject appears in
front of the text — creating the iconic "text behind subject" look.

---

## 🔒 Privacy

Everything is processed in your browser. No images, model output, or text are
ever sent to a server. There are no analytics, ads, or trackers.

---

## 🛠 Tech

- React 18 + Vite 5
- Canvas 2D (with `CanvasRenderingContext2D.letterSpacing` where supported)
- `@imgly/background-removal` (ONNX runtime web)
- Pure CSS design system (no Tailwind, no UI libs) — tiny bundle

---

## 📦 Deploy

This is a static site. Any of the following will work zero-config:

- **Vercel**: `vercel` (auto-detects Vite)
- **Netlify**: build = `npm run build`, publish = `dist`
- **Cloudflare Pages**: same as Netlify
- **GitHub Pages**: `npm run build` → push `dist/`

---

## 📝 License

MIT — make it yours.
