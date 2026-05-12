'use client';

import { useState, useRef, useCallback } from 'react';

export default function BeforeAfterSlider({ label = '', beforeImg, afterImg }) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const ref = useRef(null);

  const move = useCallback((clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  return (
    <div
      ref={ref}
      className="ba-slider"
      onMouseDown={() => { dragging.current = true; }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onMouseMove={(e) => { if (dragging.current) move(e.clientX); }}
      onTouchMove={(e) => { e.preventDefault(); move(e.touches[0].clientX); }}
    >
      {/* ANTES */}
      <div className="ba-before-bg">
        {beforeImg
          ? <img src={beforeImg} alt="Antes" className="ba-img" draggable={false} />
          : <p className="ba-placeholder-text">Foto<br />antes</p>
        }
      </div>

      {/* DESPUÉS */}
      <div className="ba-after-wrap" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="ba-after-bg">
          {afterImg
            ? <img src={afterImg} alt="Después" className="ba-img" draggable={false} />
            : <p className="ba-placeholder-text">Foto<br />después</p>
          }
        </div>
      </div>

      {/* Watermark */}
      {label && <div className="ba-watermark">{label}</div>}

      {/* Handle */}
      <div className="ba-handle" style={{ left: `${pos}%` }}>
        <div className="ba-handle-btn">⇄</div>
      </div>

      <span className="ba-label ba-label-before">ANTES</span>
      <span className="ba-label ba-label-after">DESPUÉS</span>
    </div>
  );
}
