'use strict';

/* ============================================================
   NEET COUNSELLING HELP — script.js
   ============================================================ */

// ===== NAVBAR =====
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) closeMenu();
});

function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== BACK TO TOP =====
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SCROLL REVEAL =====
const revealTargets = document.querySelectorAll(
  '.strip-item, .fc-node, .tool-card, .team-card, .news-item, .feature-item, .round-card, .about-card'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

// Stagger child reveal within grids
['strip-grid','tools-grid','team-grid'].forEach(cls => {
  const grid = document.querySelector('.' + cls);
  if (!grid) return;
  [...grid.children].forEach((child, i) => {
    child.style.transitionDelay = `${i * 80}ms`;
  });
});

// ===== NEWS TABS =====
const tabs   = document.querySelectorAll('.news-tab');
const panels = document.querySelectorAll('.news-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // deactivate all
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    // activate selected
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + target);
    if (panel) panel.classList.add('active');
  });
});

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        const isActive = a.getAttribute('href') === '#' + entry.target.id;
        a.style.fontWeight = isActive ? '700' : '500';
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => navObserver.observe(s));

// ===== FLOWCHART HOVER ANIMATION =====
document.querySelectorAll('.fc-node').forEach(node => {
  node.addEventListener('mouseenter', () => {
    node.style.transform = 'translateY(-6px) scale(1.02)';
  });
  node.addEventListener('mouseleave', () => {
    node.style.transform = '';
  });
});

// ===== TOOL CARD VIDEO LAZY LOAD =====
// Pause all iframes when not visible for performance
const iframeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const iframe = entry.target.querySelector('iframe');
    if (!iframe) return;
    if (!entry.isIntersecting) {
      // Temporarily store src and remove it to pause
      if (iframe.src) {
        iframe.dataset.src = iframe.src;
        // Don't remove — just let browser handle it; iframes are already lazy loaded
      }
    }
  });
}, { threshold: 0 });

document.querySelectorAll('.tool-card').forEach(card => iframeObserver.observe(card));

// ===== ANIMATED COUNTER on scroll (hero stats) =====
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString('en-IN') + suffix;
  }, 16);
}

const trustItems = document.querySelectorAll('.trust-item strong');
let countersRan = false;

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersRan) {
      countersRan = true;
      const data = [
        { el: trustItems[0], val: 50000, suffix: '+' },
        { el: trustItems[1], val: 700, suffix: '+' },
        { el: trustItems[2], val: 4.8, suffix: '★' },
      ];
      data.forEach(({ el, val, suffix }) => {
        if (!el) return;
        if (val < 10) {
          el.textContent = val + suffix;
        } else {
          animateCounter(el, val, suffix);
        }
      });
    }
  });
}, { threshold: 0.5 });

if (trustItems.length) counterObserver.observe(trustItems[0]);

// ===== SCORE BAR ANIMATION =====
const scoreBar = document.querySelector('.score-fill');
if (scoreBar) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scoreBar.style.transition = 'width 1.5s ease';
        scoreBar.style.width = '80%';
        barObserver.unobserve(scoreBar);
      }
    });
  }, { threshold: 0.5 });
  barObserver.observe(scoreBar);
}

// ===== KEYBOARD NAVIGATION FOR TABS =====
const tabsEl = document.getElementById('newsTabs');
if (tabsEl) {
  tabsEl.addEventListener('keydown', e => {
    const tabArr = [...tabs];
    const idx = tabArr.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight') {
      tabArr[(idx + 1) % tabArr.length].click();
      tabArr[(idx + 1) % tabArr.length].focus();
    }
    if (e.key === 'ArrowLeft') {
      tabArr[(idx - 1 + tabArr.length) % tabArr.length].click();
      tabArr[(idx - 1 + tabArr.length) % tabArr.length].focus();
    }
  });
  tabs.forEach(t => t.setAttribute('role', 'tab'));
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  if (window.scrollY > 400) document.getElementById('backToTop').classList.add('show');
});
