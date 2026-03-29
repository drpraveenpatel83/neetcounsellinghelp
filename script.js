'use strict';

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== MOBILE MENU =====
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll(
  '.about-card, .step, .round-card, .info-card, .doc-category, .contact-item'
);

revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => observer.observe(el));

// ===== DOCUMENT CHECKLIST =====
document.querySelectorAll('.doc-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('checked');
    updateCheckedCount();
  });
});

function updateCheckedCount() {
  const total = document.querySelectorAll('.doc-item').length;
  const checked = document.querySelectorAll('.doc-item.checked').length;
  const tipEl = document.querySelector('.docs-tip p');
  if (checked > 0 && tipEl) {
    const pct = Math.round((checked / total) * 100);
    const original = "Make multiple photocopies of all documents and keep them in a dedicated folder. Also maintain digital scans in a cloud storage for quick access.";
    tipEl.innerHTML = `<strong>${checked}/${total} documents checked (${pct}%)</strong> — ${original}`;
  }
}

// ===== COLLEGE PREDICTOR =====
const predictBtn = document.getElementById('predictBtn');
const predictorResult = document.getElementById('predictorResult');

const collegeData = [
  { name: 'AIIMS New Delhi', type: 'govt', minScore: 680, chance: (s) => s >= 680 ? 'high' : s >= 650 ? 'moderate' : 'low' },
  { name: 'Maulana Azad Medical College, Delhi', type: 'govt', minScore: 640, chance: (s) => s >= 650 ? 'high' : s >= 620 ? 'moderate' : 'low' },
  { name: 'Grant Medical College, Mumbai', type: 'govt', minScore: 580, chance: (s) => s >= 600 ? 'high' : s >= 570 ? 'moderate' : 'low' },
  { name: 'Bangalore Medical College', type: 'govt', minScore: 560, chance: (s) => s >= 580 ? 'high' : s >= 550 ? 'moderate' : 'low' },
  { name: 'Govt. Medical College, Thiruvananthapuram', type: 'govt', minScore: 540, chance: (s) => s >= 560 ? 'high' : s >= 530 ? 'moderate' : 'low' },
  { name: 'Kasturba Medical College, Mangalore', type: 'deemed', minScore: 500, chance: (s) => s >= 540 ? 'high' : s >= 490 ? 'moderate' : 'low' },
  { name: 'Amrita School of Medicine, Kochi', type: 'deemed', minScore: 480, chance: (s) => s >= 520 ? 'high' : s >= 470 ? 'moderate' : 'low' },
  { name: 'SRM Medical College, Chennai', type: 'private', minScore: 450, chance: (s) => s >= 490 ? 'high' : s >= 440 ? 'moderate' : 'low' },
  { name: 'JSS Medical College, Mysuru', type: 'deemed', minScore: 460, chance: (s) => s >= 500 ? 'high' : s >= 450 ? 'moderate' : 'low' },
  { name: 'MGIMS Wardha', type: 'deemed', minScore: 420, chance: (s) => s >= 460 ? 'high' : s >= 410 ? 'moderate' : 'low' },
  { name: 'MGM Medical College, Aurangabad', type: 'private', minScore: 400, chance: (s) => s >= 440 ? 'high' : s >= 390 ? 'moderate' : 'low' },
  { name: 'DY Patil Medical College, Pune', type: 'deemed', minScore: 380, chance: (s) => s >= 420 ? 'high' : s >= 370 ? 'moderate' : 'low' },
  { name: 'Pacific Medical College, Udaipur', type: 'private', minScore: 350, chance: (s) => s >= 390 ? 'high' : s >= 340 ? 'moderate' : 'low' },
];

predictBtn.addEventListener('click', () => {
  const score = parseInt(document.getElementById('neetScore').value);
  const category = document.getElementById('category').value;

  if (!score || score < 0 || score > 720) {
    showPredictorError('Please enter a valid NEET score (0–720).');
    return;
  }
  if (!category) {
    showPredictorError('Please select your category.');
    return;
  }

  // Category-based score adjustment (approximation)
  const adjustments = { general: 0, ews: 10, obc: 20, sc: 50, st: 60, pwd: 80 };
  const adjustedScore = score + (adjustments[category] || 0);

  const eligible = collegeData
    .filter(c => adjustedScore >= c.minScore - 40)
    .map(c => ({ ...c, chanceLevel: c.chance(adjustedScore) }))
    .sort((a, b) => b.minScore - a.minScore)
    .slice(0, 6);

  renderPredictorResults(eligible, score, category);
});

function showPredictorError(msg) {
  predictorResult.innerHTML = `
    <div class="result-placeholder">
      <p style="color: var(--red-500); font-weight: 500;">${msg}</p>
    </div>`;
}

function renderPredictorResults(colleges, score, category) {
  if (colleges.length === 0) {
    predictorResult.innerHTML = `
      <div class="result-placeholder">
        <p>No colleges found for score ${score}. Consider re-checking the NEET cutoff or explore management quota options.</p>
      </div>`;
    return;
  }

  const chanceLabels = { high: 'High Chance', moderate: 'Moderate', low: 'Low Chance' };
  const chanceClasses = { high: 'chance-high', moderate: 'chance-moderate', low: 'chance-low' };
  const categoryLabels = { general: 'General', ews: 'EWS', obc: 'OBC', sc: 'SC', st: 'ST', pwd: 'PwD' };

  const items = colleges.map(c => `
    <div class="college-item">
      <span class="college-name">${c.name}</span>
      <span class="college-chance ${chanceClasses[c.chanceLevel]}">${chanceLabels[c.chanceLevel]}</span>
    </div>
  `).join('');

  predictorResult.innerHTML = `
    <div class="result-content">
      <h4>Results for Score: <strong>${score}</strong> (${categoryLabels[category] || category})</h4>
      <div class="college-list">${items}</div>
      <p style="font-size:12px;color:var(--gray-400);margin-top:14px;">* Estimates based on previous year trends. Verify with official cutoffs.</p>
    </div>`;
}

// ===== CONTACT FORM VALIDATION =====
const contactForm = document.getElementById('contactForm');

function validateField(id, errorId, rules) {
  const el = document.getElementById(id);
  const errorEl = document.getElementById(errorId);
  let error = '';

  if (rules.required && !el.value.trim()) {
    error = 'This field is required.';
  } else if (rules.email && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
    error = 'Please enter a valid email address.';
  } else if (rules.minLength && el.value.trim().length < rules.minLength) {
    error = `Please enter at least ${rules.minLength} characters.`;
  }

  if (error) {
    el.classList.add('error');
    errorEl.textContent = error;
    return false;
  } else {
    el.classList.remove('error');
    errorEl.textContent = '';
    return true;
  }
}

// Live validation on blur
[
  { id: 'fullName', errorId: 'nameError', rules: { required: true, minLength: 2 } },
  { id: 'email', errorId: 'emailError', rules: { required: true, email: true } },
  { id: 'query', errorId: 'queryError', rules: { required: true } },
  { id: 'message', errorId: 'messageError', rules: { required: true, minLength: 10 } },
].forEach(({ id, errorId, rules }) => {
  document.getElementById(id)?.addEventListener('blur', () => validateField(id, errorId, rules));
  document.getElementById(id)?.addEventListener('input', () => {
    if (document.getElementById(id).classList.contains('error')) {
      validateField(id, errorId, rules);
    }
  });
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const validations = [
    validateField('fullName', 'nameError', { required: true, minLength: 2 }),
    validateField('email', 'emailError', { required: true, email: true }),
    validateField('query', 'queryError', { required: true }),
    validateField('message', 'messageError', { required: true, minLength: 10 }),
  ];

  if (!validations.every(Boolean)) {
    // Scroll to first error
    const firstError = contactForm.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  // Simulate form submission (replace with actual API call)
  await new Promise(resolve => setTimeout(resolve, 1500));

  submitBtn.classList.remove('loading');
  submitBtn.disabled = false;

  const successEl = document.getElementById('formSuccess');
  successEl.classList.add('show');
  contactForm.reset();

  setTimeout(() => successEl.classList.remove('show'), 6000);
});

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.fontWeight = a.getAttribute('href') === `#${entry.target.id}` ? '700' : '500';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ===== STEP HOVER ANIMATION =====
document.querySelectorAll('.step').forEach(step => {
  step.addEventListener('mouseenter', () => {
    step.style.background = 'var(--gray-50)';
  });
  step.addEventListener('mouseleave', () => {
    step.style.background = '';
  });
});

// ===== SCORE-RANK AUTO-ESTIMATE =====
const neetScoreInput = document.getElementById('neetScore');
const neetRankInput = document.getElementById('neetRank');

neetScoreInput.addEventListener('input', () => {
  const score = parseInt(neetScoreInput.value);
  if (!isNaN(score) && score >= 0 && score <= 720) {
    // Approximate rank estimation based on score
    let estimatedRank;
    if (score >= 700) estimatedRank = Math.round((720 - score) * 200 + 1);
    else if (score >= 650) estimatedRank = Math.round((700 - score) * 800 + 4001);
    else if (score >= 600) estimatedRank = Math.round((650 - score) * 1200 + 44001);
    else if (score >= 550) estimatedRank = Math.round((600 - score) * 1800 + 104001);
    else if (score >= 500) estimatedRank = Math.round((550 - score) * 3000 + 194001);
    else if (score >= 450) estimatedRank = Math.round((500 - score) * 5000 + 344001);
    else estimatedRank = Math.round((450 - score) * 8000 + 594001);

    neetRankInput.placeholder = `~${estimatedRank.toLocaleString('en-IN')} (estimated)`;
  } else {
    neetRankInput.placeholder = 'e.g. 25000';
  }
});

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  // Trigger navbar check on load
  if (window.scrollY > 60) navbar.classList.add('scrolled');
});
