// app.js — tiny progressive enhancements

// Respect reduced motion
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) Scroll reveals
(() => {
  const els = [
    ...document.querySelectorAll('.section-inner'),
    ...document.querySelectorAll('.drink-item')
  ];
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('reveal-in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '80px' });

  els.forEach(el => {
    el.classList.add('reveal-prep');
    io.observe(el);
  });
})();

// 2) Menu scrollspy + quick-jump
(() => {
  const titles = [...document.querySelectorAll('.menu .menu-category .category-title')];
  if (!titles.length) return;

  // build bar
  const bar = document.createElement('div');
  bar.className = 'menu-quickbar';
  titles.forEach((h3, i) => {
    const id = h3.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    h3.id ||= id;
    const a = document.createElement('a');
    a.href = `#${id}`;
    a.textContent = h3.textContent.trim();
    a.setAttribute('role', 'button');
    bar.appendChild(a);
  });

  const menuTop = document.querySelector('.menu .menu-top');
  if (menuTop && menuTop.parentElement) {
    menuTop.parentElement.insertBefore(bar, menuTop.nextElementSibling);
  }

  // scrollspy
  const links = [...bar.querySelectorAll('a')];
  const spy = new IntersectionObserver((entries) => {
    // find the most visible section
    const vis = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!vis) return;
    const id = vis.target.id;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  }, { threshold: [0.3, 0.6], rootMargin: '-20% 0px -60% 0px' });

  titles.forEach(h3 => spy.observe(h3));

  // smooth scroll (native CSS handles it, but this prevents hash-jump offset)
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.scrollY - 90; // adjust for nav
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();

// 3) Mobile accordions for categories
(() => {
  const mq = window.matchMedia('(max-width: 900px)');
  const cats = [...document.querySelectorAll('.menu-category')];
  if (!cats.length) return;

  function applyAccordions(enable) {
    cats.forEach(cat => {
      const title = cat.querySelector('.category-title');
      const grid  = cat.querySelector('.drink-grid');
      if (!title || !grid) return;

      if (enable) {
        cat.classList.add('is-accordion');
        title.setAttribute('tabindex', '0');
        title.setAttribute('role', 'button');
        title.setAttribute('aria-expanded', cat.classList.contains('open') ? 'true' : 'false');

        const toggle = () => {
          const open = cat.classList.toggle('open');
          title.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        title.onclick = toggle;
        title.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); toggle();
          }
        };

        // default: first one open
        if (cats.indexOf(cat) === 0) cat.classList.add('open');
      } else {
        cat.classList.remove('is-accordion', 'open');
        title.removeAttribute('tabindex');
        title.removeAttribute('role');
        title.removeAttribute('aria-expanded');
        title.onclick = null;
        title.onkeydown = null;
        grid.style.maxHeight = '';
      }
    });
  }

  applyAccordions(mq.matches);
  mq.addEventListener('change', (e) => applyAccordions(e.matches));
})();

// 4) Hero stripe drift (tiny parallax)
(() => {
  if (REDUCED) return;
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let rafId, start;
  const speed = 0.02; // tweak

  function frame(ts) {
    if (!start) start = ts;
    const t = (ts - start) * speed;
    // shift background-position-x very slightly
    hero.style.backgroundPosition = `${(t % 40)}px 0`;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  // pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId);
    else rafId = requestAnimationFrame(frame);
  });
})();

// 5) Nav polish on scroll
(() => {
  const nav = document.querySelector('.nav-inner');
  if (!nav) return;

  const onScroll = () => {
    const y = window.scrollY || 0;
    nav.classList.toggle('nav-scrolled', y > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
