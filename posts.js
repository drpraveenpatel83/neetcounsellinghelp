/**
 * NEET Counselling Help — Posts Data
 * ===================================
 * Naya post add karna ho toh neeche array mein ek object add karo.
 * Admin panel se automatically update hoga.
 *
 * category:    "neet" | "mcc" | "ayush" | "vci"
 * subcategory: Badge label (e.g. "Syllabus", "Exam Date", "Round 1")
 * badges:      Array — "new" | "hot" | "mustread" | "update" | ""
 * live:        true = show on homepage | false = hidden
 * url:         Page link — "#" if page not created yet
 */

const POSTS = [
  {
    "id": "mcc-free-exit-rule-explained",
    "title": "MCC Free Exit Rules Explained — All Rounds (Round 1, 2, 3 & Stray Vacancy)",
    "url": "mcc-free-exit-rules.html",
    "category": "mcc",
    "subcategory": "All Rounds",
    "date": "Apr 5, 2026",
    "readTime": "4 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "hot",
      "mustread"
    ],
    "featured": true,
    "live": true,
    "content": "<p>In the complex world of NEET UG/PG counselling, the \"Free Exit\" rule is a lifesaver for students. It allows you to explore your options without the fear of losing your hard-earned security deposit. Here is a comprehensive breakdown of how this rule works and when the \"free\" part ends.</p><h3>1. What is the Round 1 \"Free Exit\"?</h3><p>If you are allotted a seat in Round 1 of the MCC (Medical Counselling Committee) process but choose not to join the college, you can simply walk away.</p><ul><li><strong>No Penalty:</strong> Your security deposit will not be forfeited.</li><li><strong>No Registration Needed Again:</strong> You remain eligible for Round 2 automatically.</li><li><strong>Why it exists:</strong> It gives students a chance to see what college you can get and decide if you want to hold it or try for a better one in the next round.</li></ul><h3>2. The Step-by-Step Flow</h3><div class=\"tbl-wrap\"><table class=\"mini-table\"><thead><tr><th>Stage</th><th>Action</th><th>Result/Rule</th></tr></thead><tbody><tr><td><strong>Registration</strong></td><td>Pay Registration Fee (Non-refundable) + Security Deposit (Refundable).</td><td>You are now in the system.</td></tr><tr><td><strong>Choice Filling</strong></td><td>Lock your preferred colleges.</td><td>Based on your rank, a seat is allotted.</td></tr><tr><td><strong>Allotment</strong></td><td>You get a seat in Round 1.</td><td>You have two choices: Join or Free Exit.</td></tr><tr><td><strong>Exit Option</strong></td><td>You don't report to the college.</td><td>Free Exit triggered. Security deposit is safe.</td></tr></tbody></table></div><h3>3. When does the \"Penalty\" kick in? (Exit with Forfeiture)</h3><p>The rules get stricter once you move past Round 1. Here is how the penalty (forfeiture of security deposit) works in subsequent rounds:</p><h4>Round 2 Rules</h4><ul><li><strong>If Allotted & Not Joined:</strong> If you get a seat in Round 2 and do not join, your Security Deposit will be forfeited (lost). To participate in further rounds (like Round 3), you will have to register and pay the security deposit again.</li><li><strong>If Joined & Resigned:</strong> If you join the Round 2 seat and later want to resign, it must be done within the MCC's specified \"Resignation Period,\" or you risk forfeiture and further debarment.</li></ul><h4>Round 3 & Stray Vacancy Round</h4><ul><li><strong>Strict No-Exit:</strong> If you are allotted a seat in Round 3 or the Stray Vacancy Round and you do not join, your security deposit is forfeited, and you may be debarred from NEET counselling for the next academic year.</li><li><strong>No Resignation:</strong> Once you join a seat in Round 3, you cannot resign or participate in any further counselling (State or Central).</li></ul><h3>4. Security Deposit Breakdown</h3><p>The amount you risk losing depends on the type of college you are applying for:</p><ul><li><strong>AIQ/Central Universities/ESIC:</strong> General: ₹10,000 | SC/ST/OBC/PwD: ₹5,000</li><li><strong>Deemed Universities:</strong> All Categories: ₹2,00,000 (This is why the Round 2 exit is very expensive for Deemed aspirants!)</li></ul><div class=\"note-box\"><h4>💡 Pro-Tips for Students</h4><p><strong>Must Read:</strong> If you are satisfied with your Round 1 seat but want to try for a better one, Join the college and opt for Upgradation. This keeps your Round 1 seat safe while you \"shop\" for a better one in Round 2.</p><p><strong>Warning:</strong> If you do a \"Free Exit\" in Round 1, you have no claim on that seat anymore. It goes back into the pool for Round 2.</p><p><a href=\"https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2025/07/202509181307981517.pdf\" target=\"_blank\" rel=\"noopener\" style=\"color:#2563eb;font-weight:700;\">🔗 Official Notice PDF Reference</a></p></div>"
  },
  {
    "id": "neet-2026-syllabus",
    "title": "NEET UG 2026 Syllabus — Complete Physics, Chemistry & Biology Chapter List (NMC Official)",
    "url": "neet-2026-syllabus.html",
    "category": "neet",
    "subcategory": "Syllabus",
    "date": "Jan 8, 2026",
    "readTime": "10 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "new",
      "mustread"
    ],
    "featured": true,
    "live": true
  },
  {
    "id": "neet-2026-exam-details",
    "title": "NEET UG 2026 Exam Date, Pattern & Important Dates — Official NTA Info",
    "url": "neet-2026-exam-details.html",
    "category": "neet",
    "subcategory": "Exam Date",
    "date": "Mar 12, 2026",
    "readTime": "8 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "new"
    ],
    "featured": false,
    "live": true
  },
  {
    "id": "vci-counselling-2026-guide",
    "title": "VCI Counselling 2026: Complete Guide for 15% AIQ BVSc & AH Admissions",
    "url": "vci-counselling.html",
    "category": "vci",
    "subcategory": "Information",
    "date": "Apr 15, 2026",
    "readTime": "6 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "new",
      "mustread"
    ],
    "featured": true,
    "live": true
  },
  {
    "id": "ayush-counselling-2026-update",
    "title": "AACCC AYUSH Counselling 2026: Registration & Choice Filling Guide",
    "url": "aaccc-ayush-counselling.html",
    "category": "ayush",
    "subcategory": "Alert",
    "date": "Apr 18, 2026",
    "readTime": "4 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "new",
      "hot"
    ],
    "featured": true,
    "live": true
  },
  {
    "id": "aaccc-free-exit-rule-explained",
    "title": "AACCC AYUSH Free Exit Rules Explained — All Rounds (Round 1, 2, 3 & Stray Vacancy)",
    "url": "aaccc-free-exit-rules.html",
    "category": "ayush",
    "subcategory": "All Rounds",
    "date": "Apr 6, 2026",
    "readTime": "6 min read",
    "author": "Dr. Praveen Patel",
    "badges": [
      "hot",
      "mustread"
    ],
    "featured": true,
    "live": true
  }
];

/* ── Category config ── */
const CAT_CONFIG = {
  neet:  { class: "neet-cat",  label: "NEET Exam News",  viewAll: "View All NEET News" },
  mcc:   { class: "mcc-cat",   label: "MCC News",        viewAll: "View All MCC News" },
  ayush: { class: "ayush-cat", label: "AYUSH News",      viewAll: "View All AYUSH News" },
  vci:   { class: "vci-cat",   label: "VCI News",        viewAll: "View All VCI News" }
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
    (post.badges || []).includes('new') ? 'new-item' : '',
    post.featured ? 'featured-news' : '',
    isPlaceholder ? 'post-placeholder' : ''
  ].filter(Boolean).join(' ');

  const shareBtn = isPlaceholder ? '' :
    `<button class="card-share-btn" title="Share" onclick="event.preventDefault();event.stopPropagation();(function(b){var u='https://neetcounsellinghelp.in/${post.url}';var t=encodeURIComponent('${post.title.replace(/'/g,"\\'")}');if(navigator.share){navigator.share({title:'${post.title.replace(/'/g,"\\'")}',url:u})}else{navigator.clipboard.writeText(u).then(function(){b.textContent='✅';setTimeout(function(){b.innerHTML='<svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' width=\\'14\\' height=\\'14\\'><path d=\\'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8\\'/><polyline points=\\'16 6 12 2 8 6\\'/><line x1=\\'12\\' y1=\\'2\\' x2=\\'12\\' y2=\\'15\\'/></svg>'},1800)})})(this)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
    </button>`;

  return `
    <div class="news-item-wrap">
      <a href="${post.url || '#'}" class="${linkClass}"${isPlaceholder ? ' tabindex="-1" aria-disabled="true"' : ''}>
        <div class="news-item-left">
          ${catRow}
          <h4>${post.title}</h4>
          <span class="news-meta">${post.date} · ${post.readTime}${authorStr}</span>
        </div>
        <div class="news-arrow">${isPlaceholder ? '🔒' : '→'}</div>
      </a>
      ${shareBtn}
    </div>`;
}

/* ── Render all panels ── */
function renderNewsPosts() {
  ['neet', 'mcc', 'ayush', 'vci'].forEach(cat => {
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
    "state": "Rajasthan",
    "code": "RJ",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "rajasthan-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "rajasthan-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      },
      {
        "type": "Veterinary",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Uttar Pradesh",
    "code": "UP",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "up-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "up-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      },
      {
        "type": "Veterinary",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Maharashtra",
    "code": "MH",
    "region": "west",
    "courses": [
      {
        "type": "MBBS",
        "url": "maharashtra-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "maharashtra-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Madhya Pradesh",
    "code": "MP",
    "region": "central",
    "courses": [
      {
        "type": "MBBS",
        "url": "mp-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "mp-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Gujarat",
    "code": "GJ",
    "region": "west",
    "courses": [
      {
        "type": "MBBS",
        "url": "gujarat-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "gujarat-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Karnataka",
    "code": "KA",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "karnataka-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "karnataka-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Tamil Nadu",
    "code": "TN",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "tamil-nadu-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "tamil-nadu-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Delhi",
    "code": "DL",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "delhi-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "delhi-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Bihar",
    "code": "BR",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "bihar-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "bihar-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "West Bengal",
    "code": "WB",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "west-bengal-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "west-bengal-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Andhra Pradesh",
    "code": "AP",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "andhra-pradesh-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "andhra-pradesh-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Telangana",
    "code": "TG",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "telangana-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "telangana-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Punjab",
    "code": "PB",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "punjab-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "punjab-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Haryana",
    "code": "HR",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "haryana-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "haryana-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Kerala",
    "code": "KL",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "kerala-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "kerala-ayush-counselling.html",
        "live": true
      },
      {
        "type": "BDS",
        "url": "#",
        "live": false
      }
    ]
  },
  {
    "state": "Uttarakhand",
    "code": "UK",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "uttarakhand-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "uttarakhand-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Jharkhand",
    "code": "JH",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "jharkhand-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "jharkhand-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Goa",
    "code": "GA",
    "region": "west",
    "courses": [
      {
        "type": "MBBS",
        "url": "goa-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "goa-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Himachal Pradesh",
    "code": "HP",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "himachal-pradesh-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "himachal-pradesh-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Odisha",
    "code": "OD",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "odisha-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "odisha-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Assam",
    "code": "AS",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "assam-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "assam-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Jammu & Kashmir",
    "code": "JK",
    "region": "north",
    "courses": [
      {
        "type": "MBBS",
        "url": "jammu-kashmir-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "jammu-kashmir-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Tripura",
    "code": "TR",
    "region": "east",
    "courses": [
      {
        "type": "MBBS",
        "url": "tripura-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "tripura-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Arunachal Pradesh",
    "code": "AR",
    "region": "northeast",
    "courses": [
      {
        "type": "MBBS",
        "url": "arunachal-pradesh-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "arunachal-pradesh-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Manipur",
    "code": "MN",
    "region": "northeast",
    "courses": [
      {
        "type": "MBBS",
        "url": "manipur-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "manipur-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Chhattisgarh",
    "code": "CG",
    "region": "central",
    "courses": [
      {
        "type": "MBBS",
        "url": "chhattisgarh-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "chhattisgarh-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Meghalaya",
    "code": "ML",
    "region": "northeast",
    "courses": [
      {
        "type": "MBBS",
        "url": "meghalaya-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "meghalaya-ayush-counselling.html",
        "live": true
      }
    ]
  },
  {
    "state": "Pondicherry",
    "code": "PY",
    "region": "south",
    "courses": [
      {
        "type": "MBBS",
        "url": "pondicherry-mbbs-counselling.html",
        "live": true
      },
      {
        "type": "AYUSH",
        "url": "pondicherry-ayush-counselling.html",
        "live": true
      }
    ]
  }
];

/* ── Course icons & CSS classes ── */
const COURSE_META = {
  MBBS:       { icon: '🏥', cls: 'sg-btn-mbbs' },
  AYUSH:      { icon: '🌿', cls: 'sg-btn-ayush' },
  BDS:        { icon: '🦷', cls: 'sg-btn-bds' },
  Veterinary: { icon: '🐄', cls: 'sg-btn-vet' }
};

/* ── Build a compact state card ── */
function _buildStateCard(s) {
  const liveCourses = s.courses.filter(c => c.live);
  const hasLive = liveCourses.length > 0;

  const btns = liveCourses.map(c => {
    const meta = COURSE_META[c.type] || { icon: '📋', cls: 'sg-btn-mbbs' };
    return `<a href="${c.url}" class="sg-btn ${meta.cls}">${meta.icon} ${c.type}<span class="sg-btn-arrow">→</span></a>`;
  }).join('');

  const bodyHtml = hasLive
    ? `<div class="sg-btns">${btns}</div>`
    : `<div class="sg-soon">Coming Soon</div>`;

  return `
    <div class="sg-card${hasLive ? ' sg-card-live' : ''}">
      <div class="sg-card-head">
        <span class="sg-code">${s.code}</span>
        ${hasLive ? '<span class="sg-dot"></span>' : ''}
      </div>
      <div class="sg-name">${s.state}</div>
      ${bodyHtml}
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
