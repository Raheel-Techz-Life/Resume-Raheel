'use client';
import { useEffect, useRef, useState } from 'react';

/* A cat that *runs behind* the cursor. Big lag, real direction-based
   offset, idle "sitting" pose when the cursor stops moving. */

export default function CursorPet() {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const stateRef = useRef({
    mx: -200, my: -200,         // raw mouse
    x: -200, y: -200,           // pet position (eased)
    px: -200, py: -200,         // previous pet position
    vx: 0, vy: 0,               // eased velocity (for facing & run intensity)
    lastMoveTs: 0,
    idle: true,
  });

  useEffect(() => {
    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    if (!hasMouse) return;
    setEnabled(true);

    const onMove = (e) => {
      stateRef.current.mx = e.clientX;
      stateRef.current.my = e.clientY;
      stateRef.current.lastMoveTs = performance.now();
    };

    const tick = () => {
      const s = stateRef.current;

      // Heavy lag — pet moves at ~3% of the gap per frame, so it
      // visibly chases the cursor instead of sticking to it.
      s.x += (s.mx - s.x) * 0.035;
      s.y += (s.my - s.y) * 0.035;

      // Eased velocity for direction & run animation intensity
      const dx = s.x - s.px;
      const dy = s.y - s.py;
      s.vx = s.vx * 0.8 + dx * 0.2;
      s.vy = s.vy * 0.8 + dy * 0.2;
      s.px = s.x;
      s.py = s.y;

      const speed = Math.hypot(s.vx, s.vy);
      const moving = speed > 0.5;
      const facing = s.vx >= 0 ? 1 : -1;

      // Idle if cursor hasn't moved for >700ms AND pet is essentially still
      const now = performance.now();
      const idle = now - s.lastMoveTs > 700 && speed < 0.3;
      s.idle = idle;

      // Position cat BEHIND the cursor along the travel direction
      // (opposite to velocity vector). Falls back to a default offset
      // when idle so it sits below the cursor.
      const trailMag = 38; // px behind cursor
      let offX, offY;
      if (idle || speed < 0.4) {
        offX = -8;   // slight left/down sit pose
        offY = 22;
      } else {
        const inv = 1 / (speed || 1);
        offX = -s.vx * inv * trailMag - 16;
        offY = -s.vy * inv * trailMag + 14;
      }

      if (ref.current) {
        ref.current.style.transform = `translate3d(${s.x + offX}px, ${s.y + offY}px, 0) scaleX(${facing})`;
        ref.current.dataset.moving = moving ? '1' : '0';
        ref.current.dataset.idle = idle ? '1' : '0';
        // Run intensity drives leg animation speed via CSS variable
        const dur = Math.max(0.16, 0.42 - Math.min(speed, 18) * 0.014);
        ref.current.style.setProperty('--pet-step', dur.toFixed(3) + 's');
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    let raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div ref={ref} className="rhlz-pet" aria-hidden="true">
      <svg
        viewBox="0 0 32 26"
        width="44"
        height="36"
        shapeRendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <rect x="6"  y="11" width="18" height="8"  fill="currentColor" />
        {/* Head */}
        <rect x="20" y="6"  width="8"  height="8"  fill="currentColor" />
        {/* Ears */}
        <rect x="20" y="3"  width="2"  height="3"  fill="currentColor" />
        <rect x="26" y="3"  width="2"  height="3"  fill="currentColor" />
        <rect x="21" y="4"  width="1"  height="2"  fill="#16223a" />
        <rect x="26" y="4"  width="1"  height="2"  fill="#16223a" />
        {/* Eyes */}
        <rect className="eye" x="22" y="9"  width="1"  height="1"  fill="#0a0f1a" />
        <rect className="eye" x="26" y="9"  width="1"  height="1"  fill="#0a0f1a" />
        {/* Nose */}
        <rect x="24" y="11" width="1" height="1" fill="#0a0f1a" />
        {/* Legs */}
        <rect className="leg leg-fl" x="9"  y="19" width="2" height="4" fill="currentColor" />
        <rect className="leg leg-bl" x="13" y="19" width="2" height="4" fill="currentColor" />
        <rect className="leg leg-fr" x="17" y="19" width="2" height="4" fill="currentColor" />
        <rect className="leg leg-br" x="21" y="19" width="2" height="4" fill="currentColor" />
        {/* Tail */}
        <rect className="tail t1" x="4"  y="9"  width="2" height="2" fill="currentColor" />
        <rect className="tail t2" x="2"  y="7"  width="2" height="2" fill="currentColor" />
        <rect className="tail t3" x="0"  y="5"  width="2" height="2" fill="currentColor" />
      </svg>
      <span className="rhlz-pet__dust" />
    </div>
  );
}
