'use strict';

/* ═══════════════════════════════════════════
   Md Abu Salehin — Portfolio JS
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', init);

function init() {
  setupLoader();
  setupCursor();
  setupTheme();
  setupNav();
  setupMobileMenu();
  setupSmoothScroll();
  setupAOS();
  setupSkillBars();
  setupCounters();
  setupVisibilityTitle();
}

/* ── Loading Screen ── */
function setupLoader() {
  const screen = document.getElementById('loadingScreen');
  const fill   = document.getElementById('loaderFill');
  if (!screen) return;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress > 100) progress = 100;
    fill.style.width = progress + '%';
    if (progress >= 100) clearInterval(interval);
  }, 60);

  const hide = () => {
    clearInterval(interval);
    fill.style.width = '100%';
    setTimeout(() => screen.classList.add('done'), 200);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 900);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
    setTimeout(hide, 2500); // failsafe
  }
}

/* ── Custom Cursor ── */
function setupCursor() {
  const dot   = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  if (!dot || !trail || window.matchMedia('(pointer: coarse)').matches) return;

  document.body.classList.add('cursor-active');

  let mx = 0, my = 0, tx = 0, ty = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  const animateTrail = () => {
    tx += (mx - tx) * 0.14;
    ty += (my - ty) * 0.14;
    trail.style.left = tx + 'px';
    trail.style.top  = ty + 'px';
    raf = requestAnimationFrame(animateTrail);
  };
  raf = requestAnimationFrame(animateTrail);

  // Hover scale
  const hoverEls = document.querySelectorAll('a, button, .project-card-s, .stat-card, .cm-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = '20px';
      dot.style.height = '20px';
      dot.style.background = 'var(--accent-ai)';
      trail.style.opacity = '0.2';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '';
      dot.style.height = '';
      dot.style.background = '';
      trail.style.opacity = '';
    });
  });
}

/* ── Theme Toggle ── */
function setupTheme() {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ── Navigation ── */
function setupNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nl');
  const sections = document.querySelectorAll('section[id]');

  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;

      // Scrolled class
      nav.classList.toggle('scrolled', y > 30);

      // Hide/show on scroll direction
      if (y > lastY && y > 200) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
      lastY = y;

      // Active link
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
          current = sec.getAttribute('id');
        }
      });
      links.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
      });

      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Mobile Menu ── */
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('mobileMenu');
  const mmLinks   = document.querySelectorAll('.mm-link');
  if (!hamburger || !menu) return;

  const toggle = (open) => {
    hamburger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggle(!menu.classList.contains('open')));

  mmLinks.forEach(link => link.addEventListener('click', () => toggle(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggle(false);
  });
}

/* ── Smooth Scroll ── */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    });
  });
}

/* ── Scroll Reveal (AOS) ── */
function setupAOS() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    document.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-in'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-in');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

/* ── Skill Bar Animation ── */
function setupSkillBars() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.sr-fill').forEach(bar => {
      bar.style.width = bar.style.getPropertyValue('--w');
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fills = entry.target.querySelectorAll('.sr-fill');
      fills.forEach((fill, i) => {
        setTimeout(() => {
          fill.style.width = fill.style.getPropertyValue('--w') || getComputedStyle(fill).getPropertyValue('--w');
        }, i * 120);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skill-block').forEach(block => obs.observe(block));
}

/* ── Stats Counter ── */
function setupCounters() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.sc-num').forEach(el => {
      el.textContent = el.getAttribute('data-count') + '+';
    });
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const nums = entry.target.querySelectorAll('.sc-num[data-count]');
      nums.forEach(el => animateCount(el, parseInt(el.getAttribute('data-count'))));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const statSection = document.querySelector('.about-stats');
  if (statSection) obs.observe(statSection);
}

function animateCount(el, target) {
  if (el.classList.contains('counted')) return;
  el.classList.add('counted');

  const duration = 1400;
  const start    = performance.now();

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.floor(eased * target) + '+';
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/* ── Page Visibility Title ── */
function setupVisibilityTitle() {
  const original = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'Come back! 👋 — Salehin' : original;
  });
}
