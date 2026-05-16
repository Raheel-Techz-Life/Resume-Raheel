'use client';
import { useEffect, useRef } from 'react';

/* Floating blurred gradient orbs that drift on their own and gently
   react to the mouse — inspired by danny-garcia.com.
   Pure transform-driven; runs on a single rAF loop. */
export default function AmbientOrbs() {
  const layerRef = useRef(null);
  const orbsRef = useRef([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5 });

  useEffect(() => {
    const orbs = orbsRef.current;

    // Per-orb drift configuration
    const config = [
      { ampX: 80, ampY: 60, speed: 0.00018, phase: 0.0, sensitivity: 0.06 },
      { ampX: 120, ampY: 80, speed: 0.00012, phase: 1.7, sensitivity: 0.04 },
      { ampX: 60, ampY: 100, speed: 0.00022, phase: 3.1, sensitivity: 0.08 },
      { ampX: 100, ampY: 40, speed: 0.00010, phase: 5.0, sensitivity: 0.05 },
    ];

    let raf;
    const onMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseRef.current.x = e.clientX / w - 0.5;
      mouseRef.current.y = e.clientY / h - 0.5;
    };

    const tick = (t) => {
      // Smooth mouse for inertia
      mouseRef.current.sx += (mouseRef.current.x - mouseRef.current.sx) * 0.04;
      mouseRef.current.sy += (mouseRef.current.y - mouseRef.current.sy) * 0.04;

      orbs.forEach((el, i) => {
        if (!el) return;
        const c = config[i % config.length];
        const drift = Math.sin(t * c.speed + c.phase);
        const drift2 = Math.cos(t * c.speed * 0.7 + c.phase);
        const tx = drift * c.ampX + mouseRef.current.sx * window.innerWidth * c.sensitivity;
        const ty = drift2 * c.ampY + mouseRef.current.sy * window.innerHeight * c.sensitivity;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="rhlz-orbs" ref={layerRef} aria-hidden="true">
      <div className="rhlz-orbs__inner">
        <span className="orb orb--cyan"  ref={(el) => (orbsRef.current[0] = el)} />
        <span className="orb orb--violet" ref={(el) => (orbsRef.current[1] = el)} />
        <span className="orb orb--orange" ref={(el) => (orbsRef.current[2] = el)} />
        <span className="orb orb--deep"   ref={(el) => (orbsRef.current[3] = el)} />
      </div>
    </div>
  );
}
