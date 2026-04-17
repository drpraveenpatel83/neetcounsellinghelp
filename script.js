'use strict';

/* ============================================================
   NEET COUNSELLING HELP — script.js
   ============================================================ */

// ===== NAVBAR =====
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
const navCloseBtn = document.getElementById('navCloseBtn');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  navOverlay.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

if (navCloseBtn) {
  navCloseBtn.addEventListener('click', closeMenu);
}

navOverlay.addEventListener('click', closeMenu);

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('active');
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
      if (iframe.src) {
        iframe.dataset.src = iframe.src;
        iframe.src = ''; // Actually removes source to pause playback
      }
    } else {
      if (iframe.dataset.src && !iframe.src) {
        iframe.src = iframe.dataset.src; // Restore source when visible
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

// ===== PREVENT COPY & RIGHT CLICK =====
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

// ===== COLLEGE SEARCH TOOL LOGIC =====
(function() {
  const csTable = document.getElementById('cs-table');
  if (!csTable || typeof collegeData === 'undefined') return;

  const tbody = document.getElementById('cs-tbody');
  const searchInput = document.getElementById('cs-search');
  const courseSel = document.getElementById('cs-course');
  const stateSel = document.getElementById('cs-state');
  const typeSel = document.getElementById('cs-type');
  const countBadge = document.getElementById('cs-count');
  
  const btnPrev = document.getElementById('cs-prev');
  const btnNext = document.getElementById('cs-next');
  const pageInfo = document.getElementById('cs-page-info');

  let filtered = [];
  let currentPage = 1;
  const itemsPerPage = 50;

  // Populate States dynamically
  const states = [...new Set(collegeData.map(c => c.state))].sort();
  states.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st;
    opt.textContent = st;
    stateSel.appendChild(opt);
  });

  function renderTable() {
    tbody.innerHTML = '';
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);

    if (pageData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;">No colleges found matching your criteria.</td></tr>';
    } else {
      pageData.forEach(c => {
        const tr = document.createElement('tr');
        
        const typeBadgeClass = c.filterType === 'Govt' ? 'fee-govt' : (c.filterType === 'Deemed' ? 'fee-pvt' : 'fee-pvt');
        
        tr.innerHTML = `
          <td>
            <div class="td-name">${c.name}</div>
            <div style="font-size:11px;color:#64748b;">${c.city || '-'}</div>
          </td>
          <td><span class="seat-pill" style="background:#f3e8ff;color:#7e22ce;">${c.course}</span></td>
          <td>${c.state}</td>
          <td class="${typeBadgeClass}">${c.type || c.filterType}</td>
          <td><span class="seat-pill">${c.seats || 'N/A'}</span></td>
          <td><a href="${c.link}" style="display:inline-block;padding:4px 10px;background:#eff6ff;color:#1d4ed8;border-radius:4px;font-size:11px;font-weight:700;text-decoration:none;">View Info</a></td>
        `;
        tbody.appendChild(tr);
      });
    }

    countBadge.textContent = `Showing ${filtered.length} College${filtered.length !== 1 ? 's' : ''}`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
  }

  function applyFilters() {
    const q = searchInput.value.toLowerCase().trim();
    const crs = courseSel.value;
    const st = stateSel.value;
    const typ = typeSel.value;

    filtered = collegeData.filter(c => {
      // Name or City match
      let matchQ = true;
      if (q) {
        matchQ = (c.name.toLowerCase().includes(q) || (c.city && c.city.toLowerCase().includes(q)));
      }
      
      let matchCrs = (crs === 'all') || (c.course === crs);
      let matchSt = (st === 'all') || (c.state === st);
      let matchTyp = (typ === 'all') || (c.filterType === typ);

      return matchQ && matchCrs && matchSt && matchTyp;
    });

    currentPage = 1;
    renderTable();
  }

  // Event Listeners
  searchInput.addEventListener('input', applyFilters);
  courseSel.addEventListener('change', applyFilters);
  stateSel.addEventListener('change', applyFilters);
  typeSel.addEventListener('change', applyFilters);

  btnPrev.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderTable(); }
  });
  btnNext.addEventListener('click', () => {
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; renderTable(); }
  });

  // Initial Load
  applyFilters();

})();
