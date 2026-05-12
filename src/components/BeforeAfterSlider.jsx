import { useState, useRef, useCallback } from 'react';

function BeforeAfterSlider() {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const containerRef = useRef(null);

  const move = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseUp = () => { dragging.current = false; };
  const onMouseMove = (e) => { if (dragging.current) move(e.clientX); };
  const onMouseLeave = () => { dragging.current = false; };

  const onTouchMove = (e) => {
    e.preventDefault();
    move(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="ba-slider"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
    >
      {/* BEFORE */}
      <div className="ba-before-bg">
        <p className="ba-placeholder-text">Fotografía<br />del paciente<br />antes</p>
      </div>

      {/* AFTER */}
      <div className="ba-after-wrap" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="ba-after-bg">
          <p className="ba-placeholder-text">Fotografía<br />del paciente<br />después</p>
        </div>
      </div>

      {/* Handle */}
      <div className="ba-handle" style={{ left: `${pos}%` }}>
        <div className="ba-handle-btn">⇄</div>
      </div>

      <span className="ba-label ba-label-before">Antes</span>
      <span className="ba-label ba-label-after">Después</span>
    </div>
  );
}

export default BeforeAfterSlider;
