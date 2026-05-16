'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/* Fixed left rail that lights up the current "chapter" as you scroll.
   Each section in the hero page gets a sticky chapter label that types
   in as it enters view, so scrolling feels like unlocking a story. */

const CHAPTERS = [
  { id: 'hero',         num: '00', label: 'Boot' },
  { id: 'projects',     num: '01', label: 'Projects' },
  { id: 'experience',   num: '02', label: 'Experience' },
  { id: 'achievements', num: '03', label: 'Recognition' },
  { id: 'work',         num: '04', label: 'Work' },
  { id: 'contact',      num: '05', label: 'Contact' },
];

export default function Chapters() {
  const [active, setActive] = useState('hero');
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const railRef = useRef(null);

  useEffect(() => {
    // Only show on home page where these sections exist.
    if (pathname !== '/') {
      setVisible(false);
      return;
    }

    // Wait one tick so the page has rendered the sections
    const t = setTimeout(() => {
      const targets = CHAPTERS.map((c) => document.getElementById(c.id)).filter(Boolean);
      if (!targets.length) return;

      setVisible(true);

      const obs = new IntersectionObserver(
        (entries) => {
          // Pick the entry closest to top that's currently intersecting
          const inView = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
          if (inView[0]) setActive(inView[0].target.id);
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      targets.forEach((el) => obs.observe(el));

      return () => obs.disconnect();
    }, 200);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  const activeIdx = Math.max(0, CHAPTERS.findIndex((c) => c.id === active));
  const progress = (activeIdx / (CHAPTERS.length - 1)) * 100;

  return (
    <aside className="rhlz-chapters" aria-hidden="true">
      <div className="rhlz-chapters__track">
        <span className="rhlz-chapters__fill" style={{ height: `${progress}%` }} />
      </div>
      <ul className="rhlz-chapters__list">
        {CHAPTERS.map((c, i) => (
          <li
            key={c.id}
            className={`rhlz-chapters__item ${c.id === active ? 'is-active' : ''} ${i < activeIdx ? 'is-past' : ''}`}
          >
            <a href={`#${c.id}`} className="rhlz-chapters__link">
              <span className="rhlz-chapters__dot" />
              <span className="rhlz-chapters__num">{c.num}</span>
              <span className="rhlz-chapters__label">{c.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
