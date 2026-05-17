import React from 'react';

export default function TextPanel({
  layers, activeId, activeLayer,
  onSelect, onAdd, onRemove, onDuplicate, onChange,
  fonts, colors,
}) {
  return (
    <>
      {/* Layers */}
      <div className="panel-section">
        <h6>Text layers</h6>
        <div className="text-layer-list">
          {layers.map((l) => (
            <div
              key={l.id}
              className={`layer-pill${l.id === activeId ? ' active' : ''}`}
              onClick={() => onSelect(l.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>
              </svg>
              <span className="preview">{l.text || 'Untitled'}</span>
              <button
                className="del"
                onClick={(e) => { e.stopPropagation(); onRemove(l.id); }}
                aria-label="Delete layer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="row-2">
          <button className="btn btn-secondary btn-sm" onClick={onAdd}>+ Add</button>
          <button className="btn btn-secondary btn-sm" onClick={onDuplicate} disabled={!activeLayer}>Duplicate</button>
        </div>
        {!activeLayer && <div className="empty">Add a text layer to get started.</div>}
      </div>

      {activeLayer && (
        <>
          {/* Content */}
          <div className="panel-section">
            <h6>Content</h6>
            <div className="field">
              <label>Text</label>
              <textarea
                className="textarea"
                value={activeLayer.text}
                onChange={(e) => onChange({ text: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          {/* Typography */}
          <div className="panel-section">
            <h6>Typography</h6>
            <div className="field">
              <label>Font family</label>
              <select
                className="select"
                value={activeLayer.font}
                onChange={(e) => onChange({ font: e.target.value })}
              >
                {fonts.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f.split(',')[0].replace(/"/g, '')}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Weight <span className="val">{activeLayer.weight}</span></label>
              <input
                type="range" className="range"
                min="100" max="900" step="100"
                value={activeLayer.weight}
                onChange={(e) => onChange({ weight: +e.target.value })}
              />
            </div>

            <div className="field">
              <label>Style</label>
              <div className="toggle-group">
                <button
                  className={!activeLayer.italic ? 'active' : ''}
                  onClick={() => onChange({ italic: false })}
                >Regular</button>
                <button
                  className={activeLayer.italic ? 'active' : ''}
                  onClick={() => onChange({ italic: true })}
                ><i>Italic</i></button>
              </div>
            </div>

            <div className="field">
              <label>Size <span className="val">{activeLayer.size}%</span></label>
              <input
                type="range" className="range"
                min="3" max="80" step="0.5"
                value={activeLayer.size}
                onChange={(e) => onChange({ size: +e.target.value })}
              />
            </div>

            <div className="field">
              <label>Letter spacing <span className="val">{activeLayer.letterSpacing}px</span></label>
              <input
                type="range" className="range"
                min="-20" max="40" step="0.5"
                value={activeLayer.letterSpacing}
                onChange={(e) => onChange({ letterSpacing: +e.target.value })}
              />
            </div>
          </div>

          {/* Color */}
          <div className="panel-section">
            <h6>Color</h6>
            <div className="color-swatches" style={{ marginBottom: 10 }}>
              {colors.map((c) => (
                <button
                  key={c}
                  className={`color-swatch${activeLayer.color === c ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => onChange({ color: c })}
                  aria-label={c}
                />
              ))}
            </div>
            <div className="row-2">
              <div className="field">
                <label>Custom</label>
                <input
                  type="color"
                  className="input"
                  value={activeLayer.color}
                  onChange={(e) => onChange({ color: e.target.value })}
                  style={{ padding: 2, height: 36 }}
                />
              </div>
              <div className="field">
                <label>Opacity <span className="val">{Math.round(activeLayer.opacity * 100)}%</span></label>
                <input
                  type="range" className="range"
                  min="0" max="1" step="0.01"
                  value={activeLayer.opacity}
                  onChange={(e) => onChange({ opacity: +e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Position */}
          <div className="panel-section">
            <h6>Position</h6>
            <div className="row-2">
              <div className="field">
                <label>X <span className="val">{Math.round(activeLayer.x)}%</span></label>
                <input
                  type="range" className="range"
                  min="0" max="100" step="0.1"
                  value={activeLayer.x}
                  onChange={(e) => onChange({ x: +e.target.value })}
                />
              </div>
              <div className="field">
                <label>Y <span className="val">{Math.round(activeLayer.y)}%</span></label>
                <input
                  type="range" className="range"
                  min="0" max="100" step="0.1"
                  value={activeLayer.y}
                  onChange={(e) => onChange({ y: +e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Rotation <span className="val">{Math.round(activeLayer.rotation)}°</span></label>
              <input
                type="range" className="range"
                min="-180" max="180" step="1"
                value={activeLayer.rotation}
                onChange={(e) => onChange({ rotation: +e.target.value })}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Tip: drag the text directly on the canvas to reposition.
            </div>
          </div>

          {/* Shadow */}
          <div className="panel-section">
            <h6>Shadow</h6>
            <div className="field">
              <label>Enable</label>
              <div className="toggle-group">
                <button className={!activeLayer.shadow ? 'active' : ''} onClick={() => onChange({ shadow: false })}>Off</button>
                <button className={activeLayer.shadow ? 'active' : ''} onClick={() => onChange({ shadow: true })}>On</button>
              </div>
            </div>
            {activeLayer.shadow && (
              <>
                <div className="row-2">
                  <div className="field">
                    <label>Color</label>
                    <input
                      type="color" className="input"
                      value={activeLayer.shadowColor}
                      onChange={(e) => onChange({ shadowColor: e.target.value })}
                      style={{ padding: 2, height: 36 }}
                    />
                  </div>
                  <div className="field">
                    <label>Blur <span className="val">{activeLayer.shadowBlur}</span></label>
                    <input
                      type="range" className="range"
                      min="0" max="60" step="1"
                      value={activeLayer.shadowBlur}
                      onChange={(e) => onChange({ shadowBlur: +e.target.value })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Opacity <span className="val">{Math.round(activeLayer.shadowOpacity * 100)}%</span></label>
                  <input
                    type="range" className="range"
                    min="0" max="1" step="0.01"
                    value={activeLayer.shadowOpacity}
                    onChange={(e) => onChange({ shadowOpacity: +e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
