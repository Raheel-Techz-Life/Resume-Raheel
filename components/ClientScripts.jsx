'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientScripts() {
  const pathname = usePathname();

  useEffect(() => {
    /* 1. Section / card reveal on scroll */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add('visible'), i * 90);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document
      .querySelectorAll(
        '.timeline-item, .project-card, .achievement-card, .work-card, .section-header, .hero-stats, .stat-item'
      )
      .forEach((el) => observer.observe(el));

    /* 2. Card tilt on hover */
    const handleMouseMove = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translateZ(4px)`;
    };
    const handleMouseLeave = (e) => {
      e.currentTarget.style.transform = '';
    };
    const cards = document.querySelectorAll(
      '.project-card, .achievement-card, .work-card, .item, .card'
    );
    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    /* 3. Typewriter on hero eyebrow */
    const eyebrow = document.querySelector('.hero-eyebrow span');
    if (eyebrow && !eyebrow.hasAttribute('data-typed')) {
      const text = eyebrow.textContent;
      eyebrow.textContent = '';
      eyebrow.setAttribute('data-typed', 'true');
      let i = 0;
      const typeText = () => {
        if (i < text.length) {
          eyebrow.textContent += text[i++];
          setTimeout(typeText, 40);
        }
      };
      setTimeout(typeText, 400);
    }

    /* 4. Word-by-word reveal on big titles */
    const titleNodes = document.querySelectorAll(
      '.section-title, .contact-title, .hero-tagline'
    );
    titleNodes.forEach((node) => {
      if (node.dataset.split === '1') return;
      const html = node.innerHTML;
      if (html.includes('<span') && node.classList.contains('hero-tagline')) {
        node.dataset.split = '1';
        return;
      }
      node.dataset.split = '1';
      const wrapWords = (txt) =>
        txt
          .split(/(\s+)/)
          .map((chunk) =>
            /\s+/.test(chunk)
              ? chunk
              : `<span class="rhlz-word"><span class="rhlz-word__inner">${chunk}</span></span>`
          )
          .join('');
      const walk = (el) => {
        const kids = Array.from(el.childNodes);
        kids.forEach((kid) => {
          if (kid.nodeType === 3) {
            const span = document.createElement('span');
            span.innerHTML = wrapWords(kid.textContent);
            el.replaceChild(span, kid);
          } else if (kid.nodeType === 1) {
            walk(kid);
          }
        });
      };
      walk(node);
    });

    const titleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('rhlz-words-in');
            titleObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    titleNodes.forEach((n) => titleObserver.observe(n));

    /* 5. Magnetic buttons / links */
    const magnets = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .project-link, .contact-link, .nav-logo'
    );
    const magnetHandlers = [];
    magnets.forEach((el) => {
      const strength = el.classList.contains('btn-primary') ? 0.35 : 0.22;
      const move = (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      };
      const leave = () => {
        el.style.transform = '';
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      magnetHandlers.push({ el, move, leave });
    });

    /* 6. Scroll-driven parallax for the hero photo */
    const photo = document.querySelector('.hero-photo img');
    const heroName = document.querySelector('.hero-name');
    const onScrollParallax = () => {
      const y = window.scrollY;
      if (photo) photo.style.transform = `translateY(${y * 0.08}px) scale(${1 + y * 0.0002})`;
      if (heroName) heroName.style.transform = `translateY(${y * -0.06}px)`;
    };
    window.addEventListener('scroll', onScrollParallax, { passive: true });

    /* 7. Stat counters — count up when stat-item enters view */
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const numEl = e.target.querySelector('.stat-num');
          if (!numEl || numEl.dataset.counted === '1') return;
          numEl.dataset.counted = '1';
          const raw = numEl.textContent.trim();
          // Parse target value: pull leading number, keep suffix
          const match = raw.match(/^([\d.]+)([BMK+×x]*)(.*)$/i);
          if (!match) return;
          const target = parseFloat(match[1]);
          const suffix = (match[2] || '') + (match[3] || '');
          const isFloat = /\./.test(match[1]);
          const duration = 1400;
          const start = performance.now();
          const step = (t) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = target * eased;
            numEl.textContent = (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else numEl.textContent = raw; // settle on exact original
          };
          requestAnimationFrame(step);
          statObserver.unobserve(e.target);
        });
      },
      { threshold: 0.4 }
    );
    document.querySelectorAll('.stat-item').forEach((el) => statObserver.observe(el));

    /* 8. Chapter stamp — add a "CHAPTER NN" pre-label to each section
          on the home page that types in when the section becomes visible. */
    const SECTION_CHAPTERS = {
      hero: '00 / BOOT',
      projects: '01 / PROJECTS',
      experience: '02 / EXPERIENCE',
      achievements: '03 / RECOGNITION',
      work: '04 / WORK',
      contact: '05 / CONTACT',
    };
    Object.entries(SECTION_CHAPTERS).forEach(([id, label]) => {
      const sec = document.getElementById(id);
      if (!sec || sec.querySelector('.rhlz-chapter-stamp')) return;
      const stamp = document.createElement('div');
      stamp.className = 'rhlz-chapter-stamp';
      stamp.innerHTML = '<span class="rhlz-chapter-stamp__bracket">[</span><span class="rhlz-chapter-stamp__text"></span><span class="rhlz-chapter-stamp__bracket">]</span>';
      sec.prepend(stamp);

      const textEl = stamp.querySelector('.rhlz-chapter-stamp__text');

      const stampObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            if (stamp.dataset.typed === '1') return;
            stamp.dataset.typed = '1';
            stamp.classList.add('is-typing');
            let i = 0;
            const tick = () => {
              if (i <= label.length) {
                textEl.textContent = label.slice(0, i++);
                setTimeout(tick, 35 + Math.random() * 25);
              } else {
                stamp.classList.add('is-done');
              }
            };
            tick();
            stampObs.disconnect();
          });
        },
        { threshold: 0.2 }
      );
      stampObs.observe(sec);
    });

    /* Cleanup */
    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
      magnetHandlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
      window.removeEventListener('scroll', onScrollParallax);
      observer.disconnect();
      titleObserver.disconnect();
      statObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
