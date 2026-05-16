'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/* Wipe-style route transition (Jesse-Zhou-lite).
   On route change: overlay panels sweep in, content fades, panels sweep out. */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState('idle'); // 'idle' | 'enter'
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPhase('enter');
    const t1 = setTimeout(() => setPhase('idle'), 900);
    return () => clearTimeout(t1);
  }, [pathname]);

  return (
    <>
      <div className={`rhlz-wipe ${phase === 'enter' ? 'is-active' : ''}`} aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className={`rhlz-route ${phase === 'enter' ? 'is-entering' : ''}`}>
        {children}
      </div>
    </>
  );
}
