document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

// Active nav link
const navAnchors = [...navLinks.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navAnchors.forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
      );
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// Count-up stats
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// Experience tabs
const tabs = document.querySelectorAll('.xp-tab');
tabs.forEach((tab) =>
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.xp-panel').forEach((p) => {
      p.hidden = p.id !== tab.dataset.tab;
    });
  })
);

// Decorative hero telemetry
const socEl = document.getElementById('soc');
const socBar = document.getElementById('socBar');
const psetEl = document.getElementById('pset');
const spark = document.getElementById('sparkLine');
const series = Array.from({ length: 20 }, (_, i) => 4.8 + Math.sin(i / 2) * 0.4);
let soc = 72;

function tick() {
  soc = Math.min(88, Math.max(45, soc + (Math.random() - 0.5) * 3));
  socEl.textContent = Math.round(soc);
  socBar.style.width = `${soc}%`;

  const next = Math.min(5.6, Math.max(4.0, series[series.length - 1] + (Math.random() - 0.5) * 0.5));
  series.push(next);
  series.shift();
  psetEl.textContent = next.toFixed(1);
  spark.setAttribute('points', series.map((v, i) => `${(i / 19) * 100},${22 - ((v - 4) / 1.6) * 20}`).join(' '));
}

tick();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(tick, 1800);

// Spotlight on expertise tiles
document.querySelectorAll('.tile').forEach((tile) =>
  tile.addEventListener('pointermove', (e) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
    tile.style.setProperty('--my', `${e.clientY - r.top}px`);
  })
);
