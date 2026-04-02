/**
 * NEET Counselling Help — Posts Data
 * ===================================
 * Naya post add karna ho toh neeche array mein ek object add karo.
 * Admin panel se automatically update hoga.
 *
 * category:    "neet" | "mcc" | "ayush" | "vcc"
 * subcategory: Badge label (e.g. "Syllabus", "Exam Date", "Round 1")
 * badges:      Array — "new" | "hot" | "mustread" | "update" | ""
 * live:        true = show on homepage | false = hidden
 * url:         Page link — "#" if page not created yet
 */

const POSTS = [

  /* ===================== NEET EXAM NEWS ===================== */
  {
    id: "neet-2026-syllabus",
    title: "NEET UG 2026 Syllabus — Complete Physics, Chemistry & Biology Chapter List (NMC Official)",
    url: "neet-2026-syllabus.html",
    category: "neet",
    subcategory: "Syllabus",
    date: "Jan 8, 2026",
    readTime: "10 min read",
    author: "Dr. Praveen Patel",
    badges: ["new", "mustread"],
    featured: true,
    live: true
  },
  {
    id: "neet-2026-exam-details",
    title: "NEET UG 2026 Exam Date, Pattern & Important Dates — Official NTA Info",
    url: "neet-2026-exam-details.html",
    category: "neet",
    subcategory: "Exam Date",
    date: "Mar 12, 2026",
    readTime: "8 min read",
    author: "Dr. Praveen Patel",
    badges: ["new"],
    featured: false,
    live: true
  }

];

/* ── Category config ── */
const CAT_CONFIG = {
  neet:  { class: "neet-cat",  label: "NEET Exam News",  viewAll: "View All NEET News" },
  mcc:   { class: "mcc-cat",   label: "MCC News",        viewAll: "View All MCC News" },
  ayush: { class: "ayush-cat", label: "AYUSH News",      viewAll: "View All AYUSH News" },
  vcc:   { class: "vcc-cat",   label: "VCC News",        viewAll: "View All VCC News" }
};

/* ── Badge config ── */
const BADGE_HTML = {
  new:      '<span class="new-badge-pill">🔴 New</span>',
  hot:      '<span class="new-badge-pill" style="background:#fff7ed;color:#c2410c;border-color:#fed7aa;">🔥 Hot</span>',
  mustread: '<span class="new-badge-pill" style="background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;">📋 Must Read</span>',
  update:   '<span class="new-badge-pill" style="background:#f0fdf4;color:#15803d;border-color:#bbf7d0;">📢 Update</span>'
};

/* ── Render a single post card ── */
function _buildCard(post) {
  const cfg      = CAT_CONFIG[post.category] || CAT_CONFIG.neet;
  const catBadge = `<span class="news-cat ${cfg.class}">${post.subcategory}</span>`;
  const badgesHTML = (post.badges || []).map(b => BADGE_HTML[b] || '').join('');
  const hasBadges  = badgesHTML.length > 0;

  const catRow = hasBadges
    ? `<div class="news-cat-row">${catBadge}${badgesHTML}</div>`
    : catBadge;

  const authorStr = post.author ? ` · By ${post.author}` : '';
  const isPlaceholder = !post.url || post.url === '#';
  const linkClass = [
    'news-item',
    post.badges.includes('new') ? 'new-item' : '',
    post.featured ? 'featured-news' : '',
    isPlaceholder ? 'post-placeholder' : ''
  ].filter(Boolean).join(' ');

  return `
    <a href="${post.url || '#'}" class="${linkClass}"${isPlaceholder ? ' tabindex="-1" aria-disabled="true"' : ''}>
      <div class="news-item-left">
        ${catRow}
        <h4>${post.title}</h4>
        <span class="news-meta">${post.date} · ${post.readTime}${authorStr}</span>
      </div>
      <div class="news-arrow">${isPlaceholder ? '🔒' : '→'}</div>
    </a>`;
}

/* ── Render all panels ── */
function renderNewsPosts() {
  ['neet', 'mcc', 'ayush', 'vcc'].forEach(cat => {
    const list = document.querySelector(`#panel-${cat} .news-list`);
    if (!list) return;
    const posts = POSTS.filter(p => p.category === cat && p.live);
    if (posts.length === 0) {
      list.innerHTML = `<div class="news-empty"><span>🔜</span><p>Posts coming soon — check back later!</p></div>`;
    } else {
      list.innerHTML = posts.map(_buildCard).join('');
    }
  });
}

/* Auto-run on DOM ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderNewsPosts);
} else {
  renderNewsPosts();
}

/* =====================================================================
   STATE COUNSELLING GUIDES
   Naya state add karne ke liye neeche STATE_PAGES array mein object add karo.
   course.live = true means link active hai, false means "Coming Soon"
   ===================================================================== */

const STATE_PAGES = [

  {
    state: "Rajasthan",
    code: "RJ",
    region: "north",
    courses: [
      { type: "MBBS",       url: "rajasthan-mbbs-counselling.html",   live: false },
      { type: "AYUSH",      url: "rajasthan-ayush-counselling.html",  live: false },
      { type: "BDS",        url: "#",                                  live: false },
      { type: "Veterinary", url: "#",                                  live: false }
    ]
  },
  {
    state: "Uttar Pradesh",
    code: "UP",
    region: "north",
    courses: [
      { type: "MBBS",       url: "#", live: false },
      { type: "AYUSH",      url: "#", live: false },
      { type: "BDS",        url: "#", live: false },
      { type: "Veterinary", url: "#", live: false }
    ]
  },
  {
    state: "Maharashtra",
    code: "MH",
    region: "west",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Madhya Pradesh",
    code: "MP",
    region: "central",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Gujarat",
    code: "GJ",
    region: "west",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Karnataka",
    code: "KA",
    region: "south",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Tamil Nadu",
    code: "TN",
    region: "south",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Delhi",
    code: "DL",
    region: "north",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Bihar",
    code: "BR",
    region: "east",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false }
    ]
  },
  {
    state: "West Bengal",
    code: "WB",
    region: "east",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Andhra Pradesh",
    code: "AP",
    region: "south",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false }
    ]
  },
  {
    state: "Telangana",
    code: "TG",
    region: "south",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  },
  {
    state: "Punjab",
    code: "PB",
    region: "north",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false }
    ]
  },
  {
    state: "Haryana",
    code: "HR",
    region: "north",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false }
    ]
  },
  {
    state: "Kerala",
    code: "KL",
    region: "south",
    courses: [
      { type: "MBBS",  url: "#", live: false },
      { type: "AYUSH", url: "#", live: false },
      { type: "BDS",   url: "#", live: false }
    ]
  }

];

/* ── Course colors ── */
const COURSE_COLORS = {
  MBBS:       { color: '#1d4ed8' },
  AYUSH:      { color: '#15803d' },
  BDS:        { color: '#7e22ce' },
  Veterinary: { color: '#c2410c' }
};

/* ── Build a compact state card ── */
function _buildStateCard(s) {
  const liveCourses = s.courses.filter(c => c.live);
  const hasLive = liveCourses.length > 0;

  // Only show chips for live courses
  const chips = liveCourses.map((c, i) => {
    const col = (COURSE_COLORS[c.type] || COURSE_COLORS.MBBS).color;
    const sep = i > 0 ? `<span class="sg-sep">|</span>` : '';
    return `${sep}<a href="${c.url}" class="sg-chip sg-chip-live" style="color:${col}">${c.type}</a>`;
  }).join('');

  const chipsHtml = hasLive ? chips : `<span class="sg-chip sg-chip-soon" style="font-size:10px;">Coming Soon</span>`;

  return `
    <div class="sg-card${hasLive ? ' sg-card-live' : ''}">
      <div class="sg-card-head">
        <span class="sg-code">${s.code}</span>
        ${hasLive ? '<span class="sg-dot"></span>' : ''}
      </div>
      <div class="sg-name">${s.state}</div>
      <div class="sg-chips">${chipsHtml}</div>
    </div>`;
}

/* ── Render state guides section ── */
function renderStateGuides() {
  const grid   = document.getElementById('sg-grid');
  const select = document.getElementById('sg-select');
  if (!grid || !select) return;

  // Populate dropdown options
  STATE_PAGES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.state;
    opt.textContent = s.state;
    select.appendChild(opt);
  });

  function render(state) {
    const list = state === 'all' ? STATE_PAGES : STATE_PAGES.filter(s => s.state === state);
    grid.innerHTML = list.map(_buildStateCard).join('');
  }

  select.addEventListener('change', () => render(select.value));

  render('all');
}

/* Auto-run */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderStateGuides);
} else {
  renderStateGuides();
}
