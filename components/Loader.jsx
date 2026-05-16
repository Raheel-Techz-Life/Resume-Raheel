'use client';
import { useEffect, useRef, useState } from 'react';

/* Terminal-window boot loader. Types boot lines one by one,
   shows a progress bar, ends with a prompt, then fades out. */

const BOOT_LINES = [
  { delay: 60,  text: '$ ssh raheel@rhlz.portfolio' },
  { delay: 280, text: 'Authenticating...   [OK]' },
  { delay: 120, text: '$ ./boot --target=hero' },
  { delay: 90,  text: 'mounting frameworks........... [OK]' },
  { delay: 90,  text: 'hydrating identity layer...... [OK]' },
  { delay: 90,  text: 'loading 6 AI frameworks....... [OK]' },
  { delay: 90,  text: 'resolving 1.4B+ records....... [OK]' },
  { delay: 110, text: 'calibrating cursor............ [OK]' },
  { delay: 120, text: '$ ./run.sh --mode=portfolio' },
];

export default function Loader() {
  const [lines, setLines] = useState([]);
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState('boot');
  const [hidden, setHidden] = useState(false);
  const [clock, setClock] = useState('');     // empty on SSR -> no mismatch
  const [mounted, setMounted] = useState(false);
  const scrollerRef = useRef(null);

  /* Mount-only side effects: boot animation + ticking clock */
  useEffect(() => {
    setMounted(true);

    let cancelled = false;
    let typingTimers = [];

    /* Clock */
    const updateClock = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss}`);
    };
    updateClock();
    const clockInt = setInterval(updateClock, 1000);

    /* Type one line of text character-by-character */
    const typeLine = (text, onDone) => {
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i++;
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { text: text.slice(0, i), done: i >= text.length };
          return next;
        });
        if (i < text.length) {
          const jitter = 8 + Math.random() * 14;
          const t = setTimeout(tick, jitter);
          typingTimers.push(t);
        } else {
          onDone?.();
        }
      };
      tick();
    };

    let lineIdx = 0;
    const next = () => {
      if (cancelled) return;
      if (lineIdx >= BOOT_LINES.length) {
        setPhase('done');
        const t = setTimeout(() => !cancelled && setHidden(true), 700);
        typingTimers.push(t);
        return;
      }
      const { delay, text } = BOOT_LINES[lineIdx++];
      const t = setTimeout(() => {
        setLines((prev) => [...prev, { text: '', done: false }]);
        typeLine(text, () => {
          setPct(Math.min(100, Math.round((lineIdx / BOOT_LINES.length) * 100)));
          next();
        });
      }, delay);
      typingTimers.push(t);
    };
    next();

    return () => {
      cancelled = true;
      clearInterval(clockInt);
      typingTimers.forEach(clearTimeout);
    };
  }, []);

  /* Auto-scroll terminal body */
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [lines]);

  if (hidden) return null;

  return (
    <div className={`rhlz-term ${phase === 'done' ? 'is-done' : ''}`} aria-hidden="true">
      <div className="rhlz-term__window">
        <header className="rhlz-term__bar">
          <span className="rhlz-term__dot rhlz-term__dot--r" />
          <span className="rhlz-term__dot rhlz-term__dot--y" />
          <span className="rhlz-term__dot rhlz-term__dot--g" />
          <span className="rhlz-term__title">raheel@rhlz: ~/portfolio &mdash; bash</span>
          {/* suppressHydrationWarning + only render after mount = no mismatch */}
          <span className="rhlz-term__clock" suppressHydrationWarning>
            {mounted ? clock : ''}
          </span>
        </header>

        <div className="rhlz-term__body" ref={scrollerRef}>
          <pre className="rhlz-term__pre">
{`RHLZ.OS 2.6.0  (kernel 6.18-rhlz, x86_64)
Last login: now on tty/main
`}
          </pre>

          {lines.map((ln, i) => {
            const isPrompt = ln.text.startsWith('$');
            const isOK = /\[OK\]$/.test(ln.text);
            return (
              <div key={i} className="rhlz-term__line">
                {isPrompt ? (
                  <>
                    <span className="rhlz-term__prompt">raheel@rhlz</span>
                    <span className="rhlz-term__sep">:</span>
                    <span className="rhlz-term__path">~/portfolio</span>
                    <span className="rhlz-term__sep">$ </span>
                    <span>{ln.text.replace(/^\$\s*/, '')}</span>
                  </>
                ) : (
                  <span className={isOK ? 'rhlz-term__ok' : ''}>{ln.text}</span>
                )}
                {!ln.done && i === lines.length - 1 && <span className="rhlz-term__caret" />}
              </div>
            );
          })}

          <div className="rhlz-term__bar2">
            <div className="rhlz-term__bar2fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div className="rhlz-term__pctrow">
            <span>progress</span>
            <span className="rhlz-term__pct">{String(pct).padStart(3, '0')}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
