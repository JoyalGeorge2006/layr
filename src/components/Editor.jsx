import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import TextPanel from './TextPanel.jsx';

/* ─────────────────────────── constants ─────────────────────────── */

const FONTS = [
  '-apple-system, SF Pro Display, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  'Impact, Charcoal, sans-serif',
  '"Trebuchet MS", sans-serif',
  '"Arial Black", sans-serif',
  'Verdana, sans-serif',
];

const COLORS = [
  '#ffffff',
  '#000000',
  '#ff3b30',
  '#ff9500',
  '#ffcc00',
  '#34c759',
  '#0a84ff',
  '#5e5ce6',
  '#ff2d55',
];

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 10;
const WHEEL_ZOOM_FACTOR = 0.0015;


/* ─────────────────────────── helpers ───────────────────────────── */

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function hexWithAlpha(hex, a) {
  const h = hex.replace('#', '');
  let r, g, b;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(255,255,255,${a})`;
  return `rgba(${r},${g},${b},${a})`;
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
  );
}

/**
 * Draw text character-by-character to support cross-browser letter-spacing.
 * Requires ctx.textAlign = 'center' and ctx.textBaseline = 'middle'.
 */
function drawTextWithSpacing(ctx, text, x, y, spacing) {
  if (!text) return;
  const chars = [...text];

  if (spacing === 0 || chars.length === 0) {
    ctx.fillText(text, x, y);
    return;
  }

  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const totalSpacing = spacing * (chars.length - 1);
  const totalWidth = widths.reduce((s, w) => s + w, 0) + totalSpacing;

  let curX = x - totalWidth / 2;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const w = widths[i];
    ctx.fillText(ch, curX + w / 2, y);
    curX += w + spacing;
  }
}

/* ─────────────────────────── newLayer factory ──────────────────── */

const newLayer = (text = 'YOUR TEXT') => ({
  id: generateId(),
  text,
  font: FONTS[0],
  weight: 900,
  italic: false,
  size: 22,
  color: '#ffffff',
  opacity: 1,
  x: 50,
  y: 50,
  rotation: 0,
  letterSpacing: 0,
  shadow: false,
  shadowColor: '#000000',
  shadowBlur: 8,
  shadowOpacity: 0.5,
});

/* ═══════════════════════════ Editor ════════════════════════════════ */

export default function Editor({ imageUrl, onClose, onToast }) {
  /* ── image state ─────────────────────────────────────────────── */
  const [bgImg, setBgImg] = useState(null);
  const [fgImg, setFgImg] = useState(null);
  const [status, setStatus] = useState('loading');
  const [statusText, setStatusText] = useState('Loading image…');
  const [progress, setProgress] = useState(0);

  /* ── layer state ─────────────────────────────────────────────── */
  const [layers, setLayers] = useState(() => [newLayer()]);
  const [activeId, setActiveId] = useState(null);

  // Refs to avoid stale closures in stable callbacks
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const layersRef = useRef(layers);
  layersRef.current = layers;

  /* ── viewport state ──────────────────────────────────────────── */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fitZoom, setFitZoom] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);

  /* ── mobile panel state ─────────────────────────────────────── */
  const [panelOpen, setPanelOpen] = useState(false);



  /* ── refs ─────────────────────────────────────────────────────── */
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const dragRef = useRef(null);  // { id, dx, dy }
  const panRef = useRef(null);  // { pointerId, startX, startY, startPanX, startPanY }
  const panStateRef = useRef(pan);   // mirror of pan for stable pointer handler
  panStateRef.current = pan;
  const rafRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const fgObjectUrlRef = useRef(null);

  /* ═══ Compute canvas output dimensions ════════════════════════ */
  const canvasDims = useMemo(() => {
    if (!bgImg) return { W: 1080, H: 1080 };
    return { W: bgImg.naturalWidth, H: bgImg.naturalHeight };
  }, [bgImg]);

  const { W: outW, H: outH } = canvasDims;

  /* ═══ Fit-to-screen zoom ═══════════════════════════════════════ */
  const computeFitZoom = useCallback(() => {
    if (!bgImg || !canvasWrapRef.current) return 1;
    const container = canvasWrapRef.current;
    const isMobile = window.innerWidth <= 880;
    const panelOffset = isMobile && !panelOpen ? 48 : isMobile ? 40 : 0;
    const containerW = container.clientWidth - (isMobile ? 32 : 80);
    const containerH = container.clientHeight - (isMobile ? 80 + panelOffset : 120);
    const { W, H } = canvasDims;
    if (!W || !H) return 1;
    return Math.min(containerW / W, containerH / H, 1);
  }, [bgImg, canvasDims, panelOpen]);

  // Reset view whenever canvas size changes
  useEffect(() => {
    if (!bgImg) return;
    const id = requestAnimationFrame(() => {
      const fit = computeFitZoom();
      setFitZoom(fit);
      setZoom(fit);
      setPan({ x: 0, y: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [bgImg, computeFitZoom]);

  // Recalculate fitZoom on window resize or panel toggle
  useEffect(() => {
    const fit = computeFitZoom();
    setFitZoom(fit);
    setZoom((z) => Math.min(z, fit));
    setPan({ x: 0, y: 0 });
  }, [computeFitZoom]);



  /* ═══ Load original image ═════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (cancelled) return;
      setBgImg(img);
      setStatusText('Removing background with AI…');
      startBackgroundRemoval(imageUrl, () => cancelled);
    };

    img.onerror = () => {
      if (cancelled) return;
      setStatus('error');
      setStatusText('Could not load image.');
    };

    img.src = imageUrl;

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  /* ═══ Background removal ══════════════════════════════════════ */
  const startBackgroundRemoval = useCallback(
    async (src, isCancelled) => {
      let objectUrl = null;
      try {
        const mod = await import('@imgly/background-removal');
        const removeBackground = mod.default || mod.removeBackground;

        const response = await fetch(src, { mode: 'cors' });
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        const inputBlob = await response.blob();

        if (isCancelled()) return;

        const blob = await removeBackground(inputBlob, {
          progress: (key, current, total) => {
            if (isCancelled()) return;
            if (total) setProgress(Math.round((current / total) * 100));
            if (key?.startsWith('fetch')) setStatusText('Downloading AI model…');
            else if (key?.startsWith('compute')) setStatusText('Detecting subject…');
          },
          model: 'medium',
        });

        if (isCancelled()) return;

        objectUrl = URL.createObjectURL(blob);
        fgObjectUrlRef.current = objectUrl;
        const fgImage = new Image();

        fgImage.onload = () => {
          if (isCancelled()) {
            URL.revokeObjectURL(objectUrl);
            fgObjectUrlRef.current = null;
            return;
          }
          fgObjectUrlRef.current = null;
          setFgImg(fgImage);
          setStatus('ready');
          // Activate the first layer if none is active yet
          setActiveId((prev) => prev ?? layersRef.current[0]?.id ?? null);
        };

        fgImage.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          fgObjectUrlRef.current = null;
          if (isCancelled()) return;
          setStatus('ready');
          onToast?.('AI cut-out failed — text will appear on top of image.');
          setActiveId((prev) => prev ?? layersRef.current[0]?.id ?? null);
        };

        fgImage.src = objectUrl;
      } catch (err) {
        console.error('[Background Removal Error]:', err);
        if (isCancelled()) return;
        setStatus('ready');
        onToast?.('AI cut-out failed (CORS or Network issue).');
        setActiveId((prev) => prev ?? layersRef.current[0]?.id ?? null);
      }
    },
    [onToast],
  );

  // Revoke the foreground object URL when it changes or on unmount
  useEffect(() => {
    const src = fgImg?.src;
    return () => {
      if (src?.startsWith('blob:')) URL.revokeObjectURL(src);
      if (fgObjectUrlRef.current) {
        URL.revokeObjectURL(fgObjectUrlRef.current);
        fgObjectUrlRef.current = null;
      }
    };
  }, [fgImg]);



  /* ═══ Canvas render (rAF-batched) ═════════════════════════════ */
  useEffect(() => {
    if (!bgImg || !canvasRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { W, H } = canvasDims;
      canvas.width = W;
      canvas.height = H;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // 1 — Background photo
      ctx.drawImage(bgImg, 0, 0, W, H);

      // 2 — Text layers (behind foreground subject)
      for (const l of layers) {
        ctx.save();

        const px = (l.x / 100) * W;
        const py = (l.y / 100) * H;
        const fontPx = (l.size / 100) * H;

        ctx.translate(px, py);
        ctx.rotate((l.rotation * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${l.italic ? 'italic ' : ''}${l.weight} ${fontPx}px ${l.font}`;
        ctx.fillStyle = l.color;
        ctx.globalAlpha = l.opacity;

        if (l.shadow) {
          ctx.shadowColor = hexWithAlpha(l.shadowColor, l.shadowOpacity);
          ctx.shadowBlur = l.shadowBlur;
        }

        drawTextWithSpacing(ctx, l.text || ' ', 0, 0, l.letterSpacing ?? 0);

        ctx.restore();
      }

      // 3 — Foreground subject (on top of text)
      if (fgImg) {
        ctx.drawImage(fgImg, 0, 0, W, H);
      }
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [bgImg, fgImg, layers, canvasDims]);
  // Note: drawTextWithSpacing is a module-level pure function — not a dependency

  /* ═══ Zoom helpers ═════════════════════════════════════════════ */
  const zoomIn = useCallback(() => {
    setZoom((z) => clamp(z * 1.25, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => clamp(z / 1.25, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const resetView = useCallback(() => {
    const fit = computeFitZoom();
    setFitZoom(fit);
    setZoom(fit);
    setPan({ x: 0, y: 0 });
  }, [computeFitZoom]);

  const zoomToActual = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /* ═══ Mouse-wheel zoom (centred on cursor) ═════════════════════ */
  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.target.closest('.zoom-controls')) return;
      e.preventDefault();

      setIsInteracting(true);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => setIsInteracting(false), 150);

      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const mx = e.clientX - rect.left - cx;
      const my = e.clientY - rect.top - cy;
      const delta = -e.deltaY * WHEEL_ZOOM_FACTOR;
      const factor = Math.exp(delta);

      setZoom((prevZoom) => {
        const newZoom = clamp(prevZoom * factor, MIN_ZOOM, MAX_ZOOM);
        const actualFactor = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: mx - (mx - prevPan.x) * actualFactor,
          y: my - (my - prevPan.y) * actualFactor,
        }));
        return newZoom;
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  /* ═══ Keyboard shortcuts ══════════════════════════════════════ */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); zoomIn();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault(); zoomOut();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault(); resetView();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault(); zoomToActual();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetView, zoomToActual]);

  /* ═══ Canvas pointer — drag text layers ══════════════════════ */
  const getCanvasPercent = useCallback((e) => {
    if (!canvasRef.current) return { xPct: 0, yPct: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const onCanvasPointerDown = useCallback((e) => {
    if (!canvasRef.current) return;
    const { xPct, yPct } = getCanvasPercent(e);

    // Find the nearest layer using the ref (no setState needed)
    let nearest = null;
    let bestDist = Infinity;
    for (const l of layersRef.current) {
      const d = Math.hypot(l.x - xPct, l.y - yPct);
      if (d < bestDist) { bestDist = d; nearest = l; }
    }

    if (nearest && bestDist < 30) {
      e.stopPropagation();
      setActiveId(nearest.id);
      dragRef.current = { id: nearest.id, dx: nearest.x - xPct, dy: nearest.y - yPct };
      try { canvasRef.current.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }
  }, [getCanvasPercent]);

  const onCanvasPointerMove = useCallback((e) => {
    if (!dragRef.current || !canvasRef.current) return;
    const { xPct, yPct } = getCanvasPercent(e);
    const { id, dx, dy } = dragRef.current;
    setLayers((arr) =>
      arr.map((l) =>
        l.id === id
          ? { ...l, x: clamp(xPct + dx, 0, 100), y: clamp(yPct + dy, 0, 100) }
          : l,
      ),
    );
  }, [getCanvasPercent]);

  const onCanvasPointerUp = useCallback((e) => {
    if (dragRef.current) {
      dragRef.current = null;
      try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }
  }, []);

  /* ═══ Wrap pointer — pan canvas ══════════════════════════════ */
  // Uses panStateRef so the callback is stable (no pan dep → no re-registration)
  const onWrapPointerDown = useCallback((e) => {
    if (e.target.closest('.zoom-controls')) return;
    if (dragRef.current) return;

    setIsInteracting(true);
    panRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panStateRef.current.x,
      startPanY: panStateRef.current.y,
    };
    try { canvasWrapRef.current?.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  }, []); // stable — reads panStateRef.current

  const onWrapPointerMove = useCallback((e) => {
    if (!panRef.current) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setPan({
      x: panRef.current.startPanX + dx,
      y: panRef.current.startPanY + dy,
    });
  }, []);

  const onWrapPointerUp = useCallback(() => {
    if (panRef.current) {
      try {
        canvasWrapRef.current?.releasePointerCapture(panRef.current.pointerId);
      } catch (_) { /* ignore */ }
      panRef.current = null;
    }
    setIsInteracting(false);
  }, []);

  /* ═══ Layer operations ════════════════════════════════════════ */
  const updateActive = useCallback((patch) => {
    setLayers((arr) =>
      arr.map((l) => (l.id === activeIdRef.current ? { ...l, ...patch } : l)),
    );
  }, []); // stable — reads activeIdRef.current

  const addLayer = useCallback(() => {
    const l = newLayer('NEW TEXT');
    setLayers((arr) => [...arr, l]);
    setActiveId(l.id);
  }, []);

  const removeLayer = useCallback((id) => {
    const arr = layersRef.current;
    const next = arr.filter((l) => l.id !== id);
    setLayers(next);
    if (activeIdRef.current === id) {
      setActiveId(next[0]?.id ?? null);
    }
  }, []);

  const duplicateActive = useCallback(() => {
    const arr = layersRef.current;
    const l = arr.find((x) => x.id === activeIdRef.current);
    if (!l) return;
    const copy = {
      ...l,
      id: generateId(),
      x: clamp(l.x + 4, 0, 100),
      y: clamp(l.y + 4, 0, 100),
    };
    setLayers([...arr, copy]);
    setActiveId(copy.id);
  }, []);

  /* ═══ Export PNG ══════════════════════════════════════════════ */
  const exportPNG = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        onToast?.('Export failed — image may be cross-origin protected.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const rand = Math.random().toString(36).slice(2, 6);
      a.download = `layr-${Date.now()}-${rand}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onToast?.('Downloaded ✓');
    }, 'image/png');
  }, [onToast]);

  /* ═══ Derived values ══════════════════════════════════════════ */
  const activeLayer = layers.find((l) => l.id === activeId) ?? null;
  const zoomPercent = Math.round(zoom * 100);
  const isAtFit = Math.abs(zoom - fitZoom) < 0.01 && Math.abs(pan.x) < 1 && Math.abs(pan.y) < 1;
  const isAtActual = Math.abs(zoom - 1) < 0.01;
  const cursor = isInteracting ? 'grabbing' : 'grab';

  /* ════════════════════════ RENDER ════════════════════════════════ */
  return (
    <div className="editor-overlay">

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="editor-toolbar">
        <div className="left">
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="back-label">Back</span>
          </button>
          <span className="title">Editor</span>
        </div>
        <div className="right">
          <button className="btn btn-secondary btn-sm" onClick={addLayer}
            style={{ whiteSpace: 'nowrap' }}>
            + Add text
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={exportPNG}
            disabled={status !== 'ready'}
            style={{ whiteSpace: 'nowrap' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="editor-body">

        {/* ── Canvas wrap ────────────────────────────────────────── */}
        <div
          className="canvas-wrap"
          ref={canvasWrapRef}
          onPointerDown={onWrapPointerDown}
          onPointerMove={onWrapPointerMove}
          onPointerUp={onWrapPointerUp}
          onPointerCancel={onWrapPointerUp}
          style={{
            touchAction: 'none',
            cursor,
            overflow: 'hidden',
            position: 'relative',
            height: '100%',
            minHeight: 0,
          }}
        >
          {/* Stage (zoom + pan transform) */}
          <div
            className="canvas-stage"
            ref={stageRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isInteracting ? 'none' : 'transform 0.12s ease-out',
              willChange: 'transform',
            }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Text-behind-image editor canvas, ${outW}×${outH}px`}
              onPointerDown={onCanvasPointerDown}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={onCanvasPointerUp}
              onPointerCancel={onCanvasPointerUp}
              style={{
                touchAction: 'none',
                display: 'block',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.4)',
              }}
            />
          </div>

          {/* Loading overlay */}
          {status === 'loading' && (
            <div className="processing" role="status" aria-live="polite">
              <div className="card">
                <div className="spinner" aria-hidden="true" />
                <div style={{ fontWeight: 600 }}>{statusText}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {progress > 0
                    ? `${progress}%`
                    : 'Runs locally — your image stays private.'}
                </div>
              </div>
            </div>
          )}



          {/* ── Zoom controls (bottom-centre) ─────────────────────── */}
          <div
            className="zoom-controls"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            role="toolbar"
            aria-label="Zoom controls"
          >
            <button
              type="button"
              className="zoom-btn"
              onClick={(e) => { e.stopPropagation(); zoomOut(); }}
              aria-label="Zoom out"
              title="Zoom out (Ctrl+−)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <button
              type="button"
              className="zoom-level-btn"
              onClick={(e) => { e.stopPropagation(); resetView(); }}
              title={`${zoomPercent}% — Click to fit (Ctrl+0)`}
              aria-label={`Zoom level ${zoomPercent}%, click to fit to screen`}
            >
              {zoomPercent}%
            </button>

            <button
              type="button"
              className="zoom-btn"
              onClick={(e) => { e.stopPropagation(); zoomIn(); }}
              aria-label="Zoom in"
              title="Zoom in (Ctrl+=)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>

            <div className="zoom-divider" aria-hidden="true" />

            <button
              type="button"
              className="zoom-btn"
              onClick={(e) => { e.stopPropagation(); resetView(); }}
              aria-label="Fit to screen"
              title="Fit to screen (Ctrl+0)"
              style={{ opacity: isAtFit ? 0.4 : 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </button>

            <button
              type="button"
              className="zoom-btn zoom-actual"
              onClick={(e) => { e.stopPropagation(); zoomToActual(); }}
              aria-label="Actual size 100%"
              title="Actual size 100% (Ctrl+1)"
              style={{ opacity: isAtActual ? 0.4 : 1 }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.5px' }}>
                1:1
              </span>
            </button>
          </div>
        </div>

        {/* ── Side panel ─────────────────────────────────────────── */}
        <aside
          className={`side-panel${panelOpen ? '' : ' collapsed'}`}
          aria-label="Text layer controls"
        >
          <div
            className="drag-handle"
            onClick={() => setPanelOpen((v) => !v)}
            onPointerDown={() => { if (!panelOpen) setPanelOpen(true); }}
          />
          <TextPanel
            layers={layers}
            activeId={activeId}
            activeLayer={activeLayer}
            onSelect={setActiveId}
            onAdd={addLayer}
            onRemove={removeLayer}
            onDuplicate={duplicateActive}
            onChange={updateActive}
            fonts={FONTS}
            colors={COLORS}
          />
        </aside>
      </div>

      {/* ── Scoped styles ─────────────────────────────────────────── */}
      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }

        .canvas-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .canvas-stage,
        .canvas-stage canvas {
          display: block;
        }
        @media (min-width: 881px) {
          .canvas-stage,
          .canvas-stage canvas {
            max-width: none !important;
            max-height: none !important;
          }
        }



        /* ══════════════════════════════════════
           Zoom Controls
        ══════════════════════════════════════ */
        .zoom-controls {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(28, 28, 30, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
          user-select: none;
        }

        .zoom-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          padding: 0;
        }
        .zoom-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .zoom-btn:active {
          background: rgba(255,255,255,0.15);
        }
        .zoom-btn:focus-visible {
          outline: 2px solid #4da3ff;
          outline-offset: -2px;
        }

        .zoom-level-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 56px;
          height: 32px;
          border: none;
          background: transparent;
          color: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          padding: 0 6px;
          transition: background 0.15s;
        }

        @media (max-width: 480px) {
          .zoom-btn { width: 38px; height: 38px; }
          .zoom-level-btn { min-width: 64px; height: 38px; font-size: 13px; }
          .zoom-controls { bottom: max(12px, env(safe-area-inset-bottom, 12px)); }
        }
        .zoom-level-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .zoom-level-btn:focus-visible {
          outline: 2px solid #4da3ff;
          outline-offset: -2px;
        }

        .zoom-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.12);
          margin: 0 2px;
        }

        /* ══════════════════════════════════════
           Processing overlay
        ══════════════════════════════════════ */
        .processing {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 200;
        }
        .processing .card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 40px;
          background: rgba(28,28,30,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          color: #fff;
          text-align: center;
        }
      `}</style>
    </div>
  );
}