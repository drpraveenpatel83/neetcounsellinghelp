/* ═══════════════════════════════════════════
   NCH Admin Panel — admin.js
   ═══════════════════════════════════════════ */

// ── STATE ──
let websiteDir   = null;
let currentPosts = [];
let mbbsData     = JSON.parse(localStorage.getItem('mbbsData') || '[]');
let ayushData    = JSON.parse(localStorage.getItem('ayushData') || '[]');
let adsConfig    = JSON.parse(localStorage.getItem('adsConfig') || '{}');
let siteInfo     = JSON.parse(localStorage.getItem('siteInfo') || '{"url":"https://neetcounsellinghelp.in","name":"NEET Counselling Help","author":"Dr. Praveen Patel"}');
let docsItems    = ['NEET UG 2026 Admit Card','NEET UG 2026 Score Card','Class 10 Certificate (DOB Proof)','Class 12 Marksheet','Class 12 Pass Certificate','Domicile Certificate','Category Certificate (SC/ST/OBC/EWS)','Aadhaar Card','Passport Size Photographs (10)','Character Certificate'];
const DEFAULT_PW = 'nch@2026';

// ── AUTH ──
function doLogin() {
  const pw = document.getElementById('pwInput').value;
  const stored = localStorage.getItem('adminPw') || DEFAULT_PW;
  if (pw === stored) {
    localStorage.setItem('adminLoggedIn','1');
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display    = 'flex';
    initApp();
  } else {
    document.getElementById('loginErr').textContent = '❌ Wrong password';
  }
}

function doLogout() {
  localStorage.removeItem('adminLoggedIn');
  location.reload();
}

function checkLogin() {
  if (localStorage.getItem('adminLoggedIn') === '1') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display    = 'flex';
    initApp();
  }
}

// ── INIT ──
function initApp() {
  document.getElementById('dashDate').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  loadAdsConfigToForm();
  loadSiteInfoToForm();
  initDocsItems();
  populateStateFilters();
  if (mbbsData.length)  { showToast('MBBS sheet loaded ('+mbbsData.length+' colleges)','info'); updateSheetStatus('mbbs',mbbsData.length); }
  if (ayushData.length) { showToast('AYUSH sheet loaded ('+ayushData.length+' colleges)','info'); updateSheetStatus('ayush',ayushData.length); }
}

// ── TAB NAV ──
function showTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => { if(n.textContent.toLowerCase().includes(name==='dashboard'?'dashboard':name==='news'?'news':name==='builder'?'page':name==='sheets'?'sheet':name==='ads'?'ads':'settings')) n.classList.add('active'); });
  if (name === 'news' && currentPosts.length === 0) loadPostsFromFile();
  if (name === 'dashboard') refreshDashboard();
}

// ── TOAST ──
function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'show '+type;
  setTimeout(() => t.className = '', 3000);
}

// ── MODAL ──
function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalBg').classList.add('show');
}
function closeModal() { document.getElementById('modalBg').classList.remove('show'); }

// ── FILE SYSTEM ──
async function connectFolder() {
  if (!window.showDirectoryPicker) { showToast('Chrome/Edge browser use karo','error'); return; }
  try {
    websiteDir = await window.showDirectoryPicker({ mode: 'readwrite' });
    // verify it's the right folder
    try { await websiteDir.getFileHandle('index.html'); } catch(e) { showToast('index.html nahi mila — sahi folder select karo','error'); websiteDir=null; return; }
    document.getElementById('folderBtn').textContent = '✓ ' + websiteDir.name;
    document.getElementById('folderBtn').classList.add('connected');
    document.getElementById('folderName').textContent = '';
    showToast('Folder connected: ' + websiteDir.name,'success');
    await loadPostsFromFile();
    await refreshDashboard();
  } catch(e) {
    if (e.name !== 'AbortError') showToast('Error: '+e.message,'error');
  }
}

async function readFile(filename) {
  if (!websiteDir) throw new Error('Folder not connected');
  const parts = filename.split('/');
  let dir = websiteDir;
  for (let i = 0; i < parts.length - 1; i++) dir = await dir.getDirectoryHandle(parts[i], {create:true});
  const fh = await dir.getFileHandle(parts[parts.length-1]);
  const f  = await fh.getFile();
  return await f.text();
}

async function writeFile(filename, content) {
  if (!websiteDir) throw new Error('Folder not connected');
  const parts = filename.split('/');
  let dir = websiteDir;
  for (let i = 0; i < parts.length - 1; i++) dir = await dir.getDirectoryHandle(parts[i], {create:true});
  const fh = await dir.getFileHandle(parts[parts.length-1], {create:true});
  const wr = await fh.createWritable();
  await wr.write(content);
  await wr.close();
}

async function listHtmlFiles() {
  if (!websiteDir) return [];
  const files = [];
  for await (const entry of websiteDir.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.html') && entry.name !== 'index.html') files.push(entry.name);
  }
  return files;
}

// ── DASHBOARD ──
async function refreshDashboard() {
  const total = currentPosts.length;
  const live  = currentPosts.filter(p=>p.live).length;
  const pages = websiteDir ? (await listHtmlFiles()).length : '—';
  document.getElementById('st-total').textContent = total || '—';
  document.getElementById('st-live').textContent  = live  || '—';
  document.getElementById('st-pages').textContent = pages;

  // Recent posts
  const recent = [...currentPosts].slice(0,5);
  const rl = document.getElementById('recentPostsList');
  if (!recent.length) { rl.innerHTML = '<div class="empty-state"><p>No posts found</p></div>'; return; }
  rl.innerHTML = recent.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;">
      <span class="badge badge-${p.category}">${p.category.toUpperCase()}</span>
      <span style="font-size:13px;font-weight:600;flex:1;">${p.title}</span>
      <span style="font-size:12px;color:#94a3b8;">${p.date}</span>
      <span class="badge ${p.live?'badge-live':'badge-draft'}">${p.live?'Live':'Draft'}</span>
    </div>`).join('');

  // Pages list
  if (websiteDir) {
    const htmlFiles = await listHtmlFiles();
    const pl = document.getElementById('pagesList');
    if (!htmlFiles.length) { pl.innerHTML = '<div class="empty-state"><p>No pages found</p></div>'; return; }
    pl.innerHTML = htmlFiles.map(f => `
      <div class="page-card">
        <h5>${f}</h5>
        <p style="font-size:11px;color:#94a3b8;">${siteInfo.url}/${f}</p>
        <div class="page-card-footer">
          <button class="btn btn-outline btn-xs" onclick="editExistingPage('${f}')">Edit</button>
        </div>
      </div>`).join('');
  }
}

// ── NEWS MANAGER ──
async function loadPostsFromFile() {
  if (!websiteDir) { showToast('Pehle folder connect karo','error'); return; }
  try {
    const txt = await readFile('posts.js');
    // Extract POSTS array
    const match = txt.match(/const POSTS\s*=\s*(\[[\s\S]*?\n\]);/);
    if (!match) { showToast('posts.js mein POSTS array nahi mila','error'); return; }
    currentPosts = JSON.parse(match[1]);
    renderPostsTable('all');
    refreshDashboard();
    showToast('Posts loaded: ' + currentPosts.length,'success');
  } catch(e) { showToast('Error loading posts: '+e.message,'error'); }
}

function renderPostsTable(filter) {
  const tbody = document.getElementById('postsTableBody');
  let posts = filter === 'all' ? currentPosts : currentPosts.filter(p=>p.category===filter);
  if (!posts.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#94a3b8;">No posts in this category</td></tr>'; return; }
  tbody.innerHTML = posts.map((p,i) => `
    <tr>
      <td style="color:#94a3b8;font-size:12px;">${currentPosts.indexOf(p)+1}</td>
      <td style="max-width:320px;">
        <div style="font-size:13px;font-weight:600;color:#0f172a;">${p.title}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${p.url||'#'}</div>
      </td>
      <td><span class="badge badge-${p.category}">${p.category.toUpperCase()}</span></td>
      <td style="font-size:12px;">${p.subcategory||'—'}</td>
      <td style="font-size:12px;">${p.date||'—'}</td>
      <td style="font-size:11px;">${(p.badges||[]).map(b=>`<span class="badge badge-new" style="margin-right:2px;">${b}</span>`).join('')}</td>
      <td><span class="badge ${p.live?'badge-live':'badge-draft'}">${p.live?'Live':'Draft'}</span></td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-xs" onclick="editPost('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deletePost('${p.id}')">Del</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterPosts(cat, el) {
  document.querySelectorAll('.cat-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderPostsTable(cat);
}

function toggleAddForm() {
  const f = document.getElementById('postForm');
  f.classList.toggle('show');
  if (f.classList.contains('show')) { clearPostForm(); document.getElementById('formTitle').textContent='New Post'; }
}

function clearPostForm() {
  ['pTitle','pUrl','pAuthor','pDate','pRead','pSubcat','editPostId'].forEach(id => document.getElementById(id).value='');
  document.getElementById('pCat').value='neet';
  document.getElementById('pLive').value='true';
  ['bNew','bHot','bMust','bUpd','bFeat'].forEach(id => document.getElementById(id).checked=false);
}

function editPost(id) {
  const p = currentPosts.find(x=>x.id===id);
  if (!p) return;
  document.getElementById('postForm').classList.add('show');
  document.getElementById('formTitle').textContent = 'Edit Post';
  document.getElementById('editPostId').value = id;
  document.getElementById('pTitle').value  = p.title||'';
  document.getElementById('pUrl').value    = p.url||'';
  document.getElementById('pCat').value    = p.category||'neet';
  document.getElementById('pSubcat').value = p.subcategory||'';
  document.getElementById('pDate').value   = p.date||'';
  document.getElementById('pRead').value   = p.readTime||'';
  document.getElementById('pAuthor').value = p.author||'';
  document.getElementById('pLive').value   = String(p.live!==false);
  document.getElementById('bFeat').checked = !!p.featured;
  ['bNew','bHot','bMust','bUpd'].forEach(id => {
    const val = id.replace('b','').toLowerCase().replace('must','mustread').replace('upd','update').replace('hot','hot').replace('new','new');
    document.getElementById(id).checked = (p.badges||[]).includes(id==='bMust'?'mustread':id==='bUpd'?'update':id==='bNew'?'new':'hot');
  });
  document.getElementById('bNew').checked  = (p.badges||[]).includes('new');
  document.getElementById('bHot').checked  = (p.badges||[]).includes('hot');
  document.getElementById('bMust').checked = (p.badges||[]).includes('mustread');
  document.getElementById('bUpd').checked  = (p.badges||[]).includes('update');
}

function savePost() {
  const title = document.getElementById('pTitle').value.trim();
  if (!title) { showToast('Title required','error'); return; }
  const badges = [];
  if (document.getElementById('bNew').checked)  badges.push('new');
  if (document.getElementById('bHot').checked)  badges.push('hot');
  if (document.getElementById('bMust').checked) badges.push('mustread');
  if (document.getElementById('bUpd').checked)  badges.push('update');

  const post = {
    id:          document.getElementById('editPostId').value || 'post-'+Date.now(),
    title,
    url:         document.getElementById('pUrl').value.trim()||'#',
    category:    document.getElementById('pCat').value,
    subcategory: document.getElementById('pSubcat').value.trim(),
    date:        document.getElementById('pDate').value.trim(),
    readTime:    document.getElementById('pRead').value.trim(),
    author:      document.getElementById('pAuthor').value.trim(),
    badges,
    featured:    document.getElementById('bFeat').checked,
    live:        document.getElementById('pLive').value === 'true'
  };

  const editId = document.getElementById('editPostId').value;
  if (editId) {
    const idx = currentPosts.findIndex(p=>p.id===editId);
    if (idx>-1) currentPosts[idx] = post;
  } else {
    currentPosts.unshift(post);
  }
  renderPostsTable('all');
  document.getElementById('postForm').classList.remove('show');
  document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes — click Save to posts.js';
  showToast('Post saved in memory. Click "Save to posts.js"','info');
}

function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  currentPosts = currentPosts.filter(p=>p.id!==id);
  renderPostsTable('all');
  document.getElementById('saveStatus').textContent = '⚠️ Unsaved changes';
  showToast('Post deleted','success');
}

async function savePostsToFile() {
  if (!websiteDir) { showToast('Folder connect karo','error'); return; }
  try {
    const currentTxt = await readFile('posts.js');
    const postsJSON  = JSON.stringify(currentPosts, null, 2);
    const newTxt = currentTxt.replace(/const POSTS\s*=\s*\[[\s\S]*?\n\];/, 'const POSTS = ' + postsJSON + ';');
    await writeFile('posts.js', newTxt);
    document.getElementById('saveStatus').textContent = '✓ Saved successfully';
    showToast('posts.js saved!','success');
  } catch(e) { showToast('Save failed: '+e.message,'error'); }
}

// ── PAGE BUILDER ──
let builderStep = 1;

function goStep(n) {
  // validate step 1
  if (n>1 && !document.getElementById('b-pageType').value) { showToast('Page type select karo','error'); return; }
  document.querySelectorAll('.builder-steps>div').forEach(d=>d.classList.remove('show'));
  document.querySelectorAll('.step-bar .step').forEach((s,i)=>{
    s.classList.remove('active','done');
    if (i+1<n) s.classList.add('done');
    if (i+1===n) s.classList.add('active');
  });
  document.getElementById('bstep-'+n).classList.add('show');
  builderStep = n;
  if (n===3) updateCollegeSheetStatus();
}

function resetBuilder() {
  document.getElementById('b-pageType').value='';
  document.getElementById('b-state').value='';
  document.getElementById('b-slug').value='';
  goStep(1);
  showToast('Builder reset','info');
}

function onPageTypeChange() {
  const t = document.getElementById('b-pageType').value;
  document.getElementById('stateFieldWrap').style.display = (t.startsWith('state')) ? '' : 'none';
  // auto-generate slug
  const state = document.getElementById('b-state').value.toLowerCase().replace(/\s+/g,'-');
  const slugMap = {'state-mbbs':'mbbs-counselling','state-ayush':'ayush-counselling','mcc':'mcc-neet-counselling','aaccc':'aaccc-ayush-counselling'};
  document.getElementById('b-slug').value = state ? state+'-'+slugMap[t] : (slugMap[t]||'');
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('b-state').addEventListener('change', onPageTypeChange);
});

function toggleSection(headEl) {
  headEl.closest('.section-block').classList.toggle('open');
}

function setMode(section, mode, btn) {
  document.getElementById(section+'-form').style.display = mode==='form' ? '' : 'none';
  document.getElementById(section+'-html').style.display = mode==='html' ? '' : 'none';
  btn.closest('.mode-toggle').querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function delRow(btn) { btn.closest('tr').remove(); }
function addDatesRow()  { addTableRow('datesTbody', ['<input placeholder="Event"/>','<input placeholder="Date"/>','<select><option>Upcoming</option><option>Active</option><option>Done</option></select>']); }
function addEligRow()   { addTableRow('eligTbody',  ['<input placeholder="Criteria"/>','<input placeholder="Value"/>','<input placeholder="Notes"/>']); }
function addCutoffRow() { addTableRow('cutoffTbody',['<input placeholder="General"/>','<input placeholder="State Quota"/>','<input placeholder="570"/>','<input placeholder="680"/>']); }
function addStepRow()   { const n=document.getElementById('stepsTbody').rows.length+1; addTableRow('stepsTbody',['<input type="number" value="'+n+'" style="width:40px;"/>','<input placeholder="Step title"/>','<input placeholder="Description"/>']); }
function addFeesRow()   { addTableRow('feesTbody',  ['<input placeholder="Category"/>','<input placeholder="₹2,500"/>','<input placeholder="₹50,000"/>','<input placeholder="Refundable"/>']); }
function addResRow()    { addTableRow('resTbody',   ['<input placeholder="Category"/>','<input placeholder="%"/>','<input placeholder="Notes"/>']); }

function addTableRow(tbodyId, cells) {
  const tr = document.createElement('tr');
  cells.forEach(c => { const td=document.createElement('td'); td.innerHTML=c; tr.appendChild(td); });
  const del = document.createElement('td');
  del.innerHTML = '<button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button>';
  tr.appendChild(del);
  document.getElementById(tbodyId).appendChild(tr);
}

function initDocsItems() {
  renderDocsItems();
}

function renderDocsItems() {
  const container = document.getElementById('docsItems');
  container.innerHTML = docsItems.map((d,i) => `
    <div style="display:flex;align-items:center;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:6px 10px;font-size:12px;">
      <span style="flex:1;">✓ ${d}</span>
      <button class="btn btn-danger btn-xs" onclick="removeDoc(${i})">✕</button>
    </div>`).join('');
}

function addDocItem() {
  const val = document.getElementById('docNewItem').value.trim();
  if (!val) return;
  docsItems.push(val);
  document.getElementById('docNewItem').value = '';
  renderDocsItems();
}

function removeDoc(i) { docsItems.splice(i,1); renderDocsItems(); }

function copyAiPrompt() {
  const type  = document.getElementById('b-pageType').value || 'State MBBS';
  const state = document.getElementById('b-state').value || '';
  const prompt = `${state} ${type} counselling 2026 ke liye yeh JSON format mein data do:
{
  "authority": "...",
  "website": "...",
  "stateQuota": "85%",
  "aiq": "15%",
  "govtSeats": "...",
  "pvtSeats": "...",
  "rounds": "3 Rounds + Mop-up",
  "duration": "5.5 Years",
  "dates": [{"event":"...","date":"...","status":"Upcoming"}],
  "eligibility": [{"criteria":"...","value":"...","notes":"..."}],
  "cutoff": [{"category":"General","quota":"State Quota","min":"...","max":"..."}],
  "steps": [{"num":1,"title":"...","desc":"..."}],
  "fees": [{"category":"General/OBC/EWS","regFee":"₹2500","deposit":"₹50000","type":"Refundable"}],
  "reservation": [{"category":"General","percent":"41%","notes":""}],
  "documents": ["NEET Score Card","..."]
}`;
  navigator.clipboard.writeText(prompt).then(()=>showToast('AI Prompt copied to clipboard!','success'));
}

function pasteAiContent() {
  document.getElementById('aiPasteArea').style.display = '';
}

function parseAiResponse() {
  try {
    const txt = document.getElementById('aiResponseInput').value.trim();
    const json = JSON.parse(txt);
    // Fill form fields
    if(json.authority)   document.getElementById('ov-authority').value = json.authority;
    if(json.website)     document.getElementById('ov-website').value   = json.website;
    if(json.stateQuota)  document.getElementById('ov-stquota').value   = json.stateQuota;
    if(json.aiq)         document.getElementById('ov-aiq').value        = json.aiq;
    if(json.govtSeats)   document.getElementById('ov-govtseats').value  = json.govtSeats;
    if(json.pvtSeats)    document.getElementById('ov-pvtseats').value   = json.pvtSeats;
    if(json.rounds)      document.getElementById('ov-rounds').value     = json.rounds;
    if(json.duration)    document.getElementById('ov-duration').value   = json.duration;
    // Dates
    if(json.dates&&json.dates.length) {
      document.getElementById('datesTbody').innerHTML='';
      json.dates.forEach(d=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input value="${d.event}"/></td><td><input value="${d.date}"/></td><td><select><option>${d.status}</option></select></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('datesTbody').appendChild(tr);});
    }
    // Steps
    if(json.steps&&json.steps.length) {
      document.getElementById('stepsTbody').innerHTML='';
      json.steps.forEach(s=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input type="number" value="${s.num}" style="width:40px;"/></td><td><input value="${s.title}"/></td><td><input value="${s.desc}"/></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('stepsTbody').appendChild(tr);});
    }
    // Fees
    if(json.fees&&json.fees.length) {
      document.getElementById('feesTbody').innerHTML='';
      json.fees.forEach(f=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input value="${f.category}"/></td><td><input value="${f.regFee}"/></td><td><input value="${f.deposit}"/></td><td><input value="${f.type}"/></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('feesTbody').appendChild(tr);});
    }
    // Reservation
    if(json.reservation&&json.reservation.length) {
      document.getElementById('resTbody').innerHTML='';
      json.reservation.forEach(r=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input value="${r.category}"/></td><td><input value="${r.percent}"/></td><td><input value="${r.notes||''}"/></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('resTbody').appendChild(tr);});
    }
    // Documents
    if(json.documents&&json.documents.length) { docsItems=json.documents; renderDocsItems(); }
    // Eligibility
    if(json.eligibility&&json.eligibility.length) {
      document.getElementById('eligTbody').innerHTML='';
      json.eligibility.forEach(e=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input value="${e.criteria}"/></td><td><input value="${e.value}"/></td><td><input value="${e.notes||''}"/></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('eligTbody').appendChild(tr);});
    }
    // Cutoff
    if(json.cutoff&&json.cutoff.length) {
      document.getElementById('cutoffTbody').innerHTML='';
      json.cutoff.forEach(c=>{ const tr=document.createElement('tr');tr.innerHTML=`<td><input value="${c.category}"/></td><td><input value="${c.quota}"/></td><td><input value="${c.min}"/></td><td><input value="${c.max}"/></td><td><button class="btn btn-danger btn-xs" onclick="delRow(this)">✕</button></td>`;document.getElementById('cutoffTbody').appendChild(tr);});
    }
    document.getElementById('aiPasteArea').style.display='none';
    showToast('AI response parsed & filled!','success');
  } catch(e) { showToast('Invalid JSON: '+e.message,'error'); }
}

// ── COLLEGE PREVIEW (Step 3) ──
function updateCollegeSheetStatus() {
  const type = document.getElementById('b-pageType').value;
  const data = type==='state-ayush' ? ayushData : mbbsData;
  document.getElementById('sheetStatus').textContent = data.length ? '✓ Sheet loaded ('+data.length+' colleges)' : '⚠️ Sheet not loaded';
  populateStateFilters();
  filterCollegePreview();
}

function populateStateFilters() {
  const type = document.getElementById('b-pageType') ? document.getElementById('b-pageType').value : '';
  const data = type==='state-ayush' ? ayushData : mbbsData;
  const states = [...new Set(data.map(r=>r.State||r.state).filter(Boolean))].sort();
  const sel = document.getElementById('collegeStateFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Select State --</option>' + states.map(s=>`<option>${s}</option>`).join('');
  // also auto-select from b-state
  const bs = document.getElementById('b-state');
  if (bs && bs.value) { const opt=[...sel.options].find(o=>o.value.toLowerCase()===bs.value.toLowerCase()); if(opt) opt.selected=true; }
}

function filterCollegePreview() {
  const type    = document.getElementById('b-pageType').value;
  const state   = document.getElementById('collegeStateFilter').value;
  const course  = document.getElementById('collegeCourseFilter').value;
  const data    = type==='state-ayush' ? ayushData : mbbsData;

  let filtered = data.filter(r => {
    const rs = (r.State||r.state||'').toLowerCase();
    const ss = state.toLowerCase();
    return !state || rs===ss || rs.includes(ss);
  });
  if (course) filtered = filtered.filter(r=>(r.Course||r.course||'')===course);

  const prev = document.getElementById('collegePreview');
  if (!filtered.length) { prev.innerHTML='<div class="empty-state"><div class="es-icon">📄</div><p>No colleges found — sheet upload karo ya state select karo</p></div>'; return; }

  const govtRows = filtered.filter(r=>(r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('govt'));
  const pvtRows  = filtered.filter(r=>(r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('pvt')||( r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('priv'));

  prev.innerHTML = `
    <div style="font-weight:700;font-size:13px;color:#15803d;padding:8px 0;">🏛️ Government (${govtRows.length})</div>
    <div class="tbl-wrap" style="margin-bottom:14px;">${buildCollegeTable(govtRows)}</div>
    <div style="font-weight:700;font-size:13px;color:#1d4ed8;padding:8px 0;">🏢 Private (${pvtRows.length})</div>
    <div class="tbl-wrap">${buildCollegeTable(pvtRows)}</div>`;
}

function buildCollegeTable(rows) {
  if (!rows.length) return '<p style="padding:12px;font-size:13px;color:#94a3b8;">No colleges</p>';
  const headers = Object.keys(rows[0]);
  return `<table class="data-table">
    <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${headers.map(h=>`<td>${r[h]||''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

// ── PAGE GENERATOR ──
function collectFormData() {
  // Overview
  const ov = {
    authority: document.getElementById('ov-authority').value,
    website:   document.getElementById('ov-website').value,
    stateQuota:document.getElementById('ov-stquota').value,
    aiq:       document.getElementById('ov-aiq').value,
    govtSeats: document.getElementById('ov-govtseats').value,
    pvtSeats:  document.getElementById('ov-pvtseats').value,
    rounds:    document.getElementById('ov-rounds').value,
    duration:  document.getElementById('ov-duration').value,
  };
  // Dates
  const dates=[]; document.querySelectorAll('#datesTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input,select');
    if(inp[0]&&inp[0].value) dates.push({event:inp[0].value,date:inp[1]?inp[1].value:'',status:inp[2]?inp[2].value:'Upcoming'});
  });
  // Eligibility
  const elig=[]; document.querySelectorAll('#eligTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input'); if(inp[0]&&inp[0].value) elig.push({criteria:inp[0].value,value:inp[1]?inp[1].value:'',notes:inp[2]?inp[2].value:''});
  });
  // Cutoff
  const cutoff=[]; document.querySelectorAll('#cutoffTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input'); if(inp[0]&&inp[0].value) cutoff.push({category:inp[0].value,quota:inp[1]?inp[1].value:'',min:inp[2]?inp[2].value:'',max:inp[3]?inp[3].value:''});
  });
  // Steps
  const steps=[]; document.querySelectorAll('#stepsTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input'); if(inp[1]&&inp[1].value) steps.push({num:inp[0]?inp[0].value:'',title:inp[1].value,desc:inp[2]?inp[2].value:''});
  });
  // Fees
  const fees=[]; document.querySelectorAll('#feesTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input'); if(inp[0]&&inp[0].value) fees.push({category:inp[0].value,regFee:inp[1]?inp[1].value:'',deposit:inp[2]?inp[2].value:'',type:inp[3]?inp[3].value:''});
  });
  // Reservation
  const res=[]; document.querySelectorAll('#resTbody tr').forEach(tr=>{
    const inp=tr.querySelectorAll('input'); if(inp[0]&&inp[0].value) res.push({category:inp[0].value,percent:inp[1]?inp[1].value:'',notes:inp[2]?inp[2].value:''});
  });
  // Colleges
  const type    = document.getElementById('b-pageType').value;
  const state   = document.getElementById('collegeStateFilter').value || document.getElementById('b-state').value;
  const data    = type==='state-ayush' ? ayushData : mbbsData;
  const stColls = data.filter(r=>{const rs=(r.State||r.state||'').toLowerCase();return !state||rs===state.toLowerCase()||rs.includes(state.toLowerCase());});
  const govtColls = stColls.filter(r=>(r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('govt'));
  const pvtColls  = stColls.filter(r=>(r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('pvt')||(r.Govt_Pvt||r.govt_pvt||'').toLowerCase().includes('priv'));

  return { ov, dates, elig, cutoff, steps, fees, res, docs:docsItems, govtColls, pvtColls,
    customHtml: document.getElementById('custom-html').value,
    ovHtml:     document.getElementById('ov-html').value,
    datesHtml:  document.getElementById('dates-htmlarea').value,
    eligHtml:   document.getElementById('elig-htmlarea').value,
    stepsHtml:  document.getElementById('steps-htmlarea').value,
    feesHtml:   document.getElementById('fees-htmlarea').value,
    resHtml:    document.getElementById('res-htmlarea').value,
    docsHtml:   document.getElementById('docs-htmlarea').value,
    cutoffHtml: document.getElementById('cutoff-htmlarea').value,
    relAyush:   document.getElementById('rel-ayush').checked,
    relMcc:     document.getElementById('rel-mcc').checked,
    relAaccc:   document.getElementById('rel-aaccc').checked,
    relMbbs:    document.getElementById('rel-mbbs').checked,
  };
}

function generatePageHtml(d) {
  const pageType = document.getElementById('b-pageType').value;
  const state    = document.getElementById('b-state').value;
  const slug     = document.getElementById('b-slug').value;
  const metaDesc = document.getElementById('b-metadesc').value || `${state} ${pageType} counselling 2026 — complete guide with college list, seats, fees, eligibility and process.`;
  const pub      = adsConfig.publisherId || 'ca-pub-XXXXXXXXXXXXXXXXX';
  const slot1    = adsConfig.slot1 || 'XXXXXXXXXX';
  const title    = `${state} ${pageType==='state-mbbs'?'MBBS':pageType==='state-ayush'?'AYUSH':pageType==='mcc'?'MCC NEET':pageType==='aaccc'?'AACCC AYUSH':''} Counselling 2026`;
  const url      = `${siteInfo.url}/${slug}.html`;

  const ovSection = d.ovHtml || `
    <div class="overview-grid">
      ${d.ov.authority?`<div class="ov-item"><div class="ov-label">Authority</div><div class="ov-value">${d.ov.authority}</div></div>`:''}
      ${d.ov.website?`<div class="ov-item"><div class="ov-label">Official Website</div><div class="ov-value"><a href="https://${d.ov.website}" target="_blank" rel="nofollow" style="color:#2563eb;">${d.ov.website}</a></div></div>`:''}
      ${d.ov.stateQuota?`<div class="ov-item"><div class="ov-label">State Quota</div><div class="ov-value">${d.ov.stateQuota}</div></div>`:''}
      ${d.ov.aiq?`<div class="ov-item"><div class="ov-label">AIQ</div><div class="ov-value">${d.ov.aiq}</div></div>`:''}
      ${d.ov.govtSeats?`<div class="ov-item"><div class="ov-label">Govt Seats</div><div class="ov-value">${d.ov.govtSeats}</div></div>`:''}
      ${d.ov.pvtSeats?`<div class="ov-item"><div class="ov-label">Private Seats</div><div class="ov-value">${d.ov.pvtSeats}</div></div>`:''}
      ${d.ov.rounds?`<div class="ov-item"><div class="ov-label">Rounds</div><div class="ov-value">${d.ov.rounds}</div></div>`:''}
      ${d.ov.duration?`<div class="ov-item"><div class="ov-label">Duration</div><div class="ov-value">${d.ov.duration}</div></div>`:''}
    </div>`;

  const datesSection = d.datesHtml || (d.dates.length ? `
    <div class="tbl-wrap"><table class="mini-table">
      <thead><tr><th>Event</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${d.dates.map(r=>`<tr><td>${r.event}</td><td>${r.date}</td><td>${r.status}</td></tr>`).join('')}</tbody>
    </table></div>` : '');

  const eligSection = d.eligHtml || (d.elig.length ? `
    <div class="tbl-wrap"><table class="mini-table">
      <thead><tr><th>Criteria</th><th>Value</th><th>Notes</th></tr></thead>
      <tbody>${d.elig.map(r=>`<tr><td>${r.criteria}</td><td>${r.value}</td><td>${r.notes||'—'}</td></tr>`).join('')}</tbody>
    </table></div>` : '');

  const cutoffSection = d.cutoffHtml || (d.cutoff.length ? `
    <div class="tbl-wrap"><table class="mini-table">
      <thead><tr><th>Category</th><th>Quota</th><th>Min Score</th><th>Max Score</th></tr></thead>
      <tbody>${d.cutoff.map(r=>`<tr><td>${r.category}</td><td>${r.quota}</td><td>${r.min}</td><td>${r.max}</td></tr>`).join('')}</tbody>
    </table></div>` : '');

  const stepsSection = d.stepsHtml || (d.steps.length ? `
    <ul class="steps-list">${d.steps.map(s=>`
      <li class="step-item">
        <div class="step-num">${s.num}</div>
        <div><div class="step-title">${s.title}</div><div class="step-desc">${s.desc}</div></div>
      </li>`).join('')}</ul>` : '');

  const feesSection = d.feesHtml || (d.fees.length ? `
    <div class="tbl-wrap"><table class="mini-table">
      <thead><tr><th>Category</th><th>Reg Fee</th><th>Security Deposit</th><th>Type</th></tr></thead>
      <tbody>${d.fees.map(r=>`<tr><td>${r.category}</td><td>${r.regFee}</td><td>${r.deposit}</td><td>${r.type}</td></tr>`).join('')}</tbody>
    </table></div>` : '');

  const resSection = d.resHtml || (d.res.length ? `
    <div class="tbl-wrap"><table class="mini-table">
      <thead><tr><th>Category</th><th>%</th><th>Notes</th></tr></thead>
      <tbody>${d.res.map(r=>`<tr><td><strong>${r.category}</strong></td><td>${r.percent}</td><td>${r.notes||'—'}</td></tr>`).join('')}</tbody>
    </table></div>` : '');

  const docsSection = d.docsHtml || `<div class="doc-grid">${d.docs.map(doc=>`<div class="doc-item">${doc}</div>`).join('')}</div>`;

  const collegeRows = (rows, cls, label) => rows.length ? `
    <div class="college-section-header ${cls}">${label} (${rows.length})</div>
    <div class="ctbl-wrap">
      <table class="ctbl">
        <thead><tr><th>SN</th><th>Name</th><th>City</th><th>Est.</th><th>Seats</th><th>Fee</th><th>Other</th></tr></thead>
        <tbody>${rows.map((r,i)=>`<tr>
          <td class="td-sn">${r.SN||r.sn||i+1}</td>
          <td><div class="td-name">${r.Name||r.name||''}</div></td>
          <td>${r.City||r.city||''}</td>
          <td>${r.Year||r.year||''}</td>
          <td><span class="seat-pill">${r.Seats||r.seats||''}</span></td>
          <td class="${(r.Govt_Pvt||'').toLowerCase().includes('pvt')?'fee-pvt':'fee-govt'}">${r.Fee||r.fee||''}</td>
          <td>${r.Other||r.other||''}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>` : '';

  const relatedBox = (d.relAyush||d.relMcc||d.relAaccc||d.relMbbs) ? `
    <div class="info-card" style="background:linear-gradient(135deg,#f0f9ff,#eff6ff);">
      <h2>📌 Related Counselling Guides</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${d.relAyush?`<a href="${state.toLowerCase().replace(/\s+/g,'-')}-ayush-counselling.html" style="display:inline-block;padding:10px 18px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;font-size:13px;font-weight:700;color:#15803d;">🌿 ${state} AYUSH Counselling →</a>`:''}
        ${d.relMbbs?`<a href="${state.toLowerCase().replace(/\s+/g,'-')}-mbbs-counselling.html" style="display:inline-block;padding:10px 18px;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:8px;font-size:13px;font-weight:700;color:#1d4ed8;">🏥 ${state} MBBS Counselling →</a>`:''}
        ${d.relMcc?`<a href="mcc-neet-counselling.html" style="display:inline-block;padding:10px 18px;background:#f0f4ff;border:1.5px solid #c7d2fe;border-radius:8px;font-size:13px;font-weight:700;color:#4338ca;">🏛️ MCC Central Counselling →</a>`:''}
        ${d.relAaccc?`<a href="aaccc-ayush-counselling.html" style="display:inline-block;padding:10px 18px;background:#fdf4ff;border:1.5px solid #e9d5ff;border-radius:8px;font-size:13px;font-weight:700;color:#7c3aed;">🌿 AACCC Central Counselling →</a>`:''}
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — Complete Guide | ${siteInfo.name}</title>
<meta name="description" content="${metaDesc}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" /><meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" /><meta property="og:description" content="${metaDesc}" />
<meta property="og:image" content="${siteInfo.url}/logo.png" />
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Article","headline":"${title}","url":"${url}","datePublished":"${new Date().toISOString().split('T')[0]}","author":{"@type":"Person","name":"${siteInfo.author}"},"publisher":{"@type":"Organization","name":"${siteInfo.name}","url":"${siteInfo.url}"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${siteInfo.url}/"},{"@type":"ListItem","position":2,"name":"State Counselling","item":"${siteInfo.url}/#states"},{"@type":"ListItem","position":3,"name":"${state}","item":"${url}"}]}]}<\/script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pub}" crossorigin="anonymous"><\/script>
<link rel="stylesheet" href="../style.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
<style>
.state-hero{background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%);padding:110px 0 50px;position:relative;overflow:hidden;}
.state-hero::after{content:'';position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(to bottom,transparent,#f8fafc);}
.state-breadcrumb{font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.state-breadcrumb a{color:rgba(255,255,255,.55);}.state-breadcrumb a:hover{color:#4ade80;}
.state-hero h1{font-size:clamp(22px,4vw,40px);color:#fff;font-weight:800;line-height:1.2;margin-bottom:14px;max-width:760px;}
.state-hero p{color:rgba(255,255,255,.65);font-size:15px;max-width:640px;}
.state-badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;}
.state-badge{font-size:12px;font-weight:700;padding:4px 14px;border-radius:999px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.2);}
.state-body{background:#f8fafc;padding:36px 0 80px;}
.state-layout{max-width:1100px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:1fr 280px;gap:32px;align-items:start;}
.state-main{min-width:0;}
.info-card{background:#fff;border-radius:14px;padding:26px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #e2e8f0;margin-bottom:18px;}
.info-card h2{font-size:17px;font-weight:800;color:#0f172a;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #e2e8f0;display:flex;align-items:center;gap:8px;}
.overview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;}
.ov-item{background:#f8fafc;border-radius:10px;padding:12px 14px;border:1px solid #e2e8f0;}
.ov-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
.ov-value{font-size:13px;font-weight:700;color:#0f172a;}
.steps-list{list-style:none;margin:0;padding:0;}
.step-item{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid #f1f5f9;}
.step-item:last-child{border-bottom:none;}
.step-num{width:30px;height:30px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;}
.step-title{font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px;}
.step-desc{font-size:13px;color:#64748b;line-height:1.6;}
.tbl-wrap{overflow-x:auto;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:4px;}
.mini-table{width:100%;border-collapse:collapse;font-size:13px;min-width:400px;}
.mini-table th{background:#f1f5f9;color:#475569;padding:9px 13px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid #e2e8f0;}
.mini-table td{padding:10px 13px;border-bottom:1px solid #f1f5f9;color:#334155;}
.mini-table tr:last-child td{border-bottom:none;}
.doc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;}
.doc-item{display:flex;align-items:center;gap:8px;background:#f8fafc;border-radius:8px;padding:9px 12px;border:1px solid #e2e8f0;font-size:13px;color:#334155;}
.doc-item::before{content:'✓';color:#16a34a;font-weight:800;flex-shrink:0;}
.college-section-header{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:800;padding:13px 18px;margin-top:18px;border-radius:8px 8px 0 0;}
.govt-header{background:linear-gradient(135deg,#14532d,#16a34a);color:#fff;}
.pvt-header{background:linear-gradient(135deg,#1e3a5f,#1d4ed8);color:#fff;}
.ctbl-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;margin-bottom:4px;}
.ctbl{width:100%;border-collapse:collapse;font-size:13px;min-width:580px;}
.ctbl thead th{background:#f8fafc;padding:9px 12px;text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #e2e8f0;white-space:nowrap;}
.ctbl tbody td{padding:11px 12px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:top;}
.ctbl tbody tr:last-child td{border-bottom:none;}
.ctbl tbody tr:hover td{background:#f0f9ff;}
.td-sn{font-weight:700;color:#94a3b8;width:36px;}
.td-name{font-weight:600;color:#0f172a;}
.seat-pill{display:inline-block;background:#eff6ff;color:#1d4ed8;font-size:12px;font-weight:700;padding:2px 8px;border-radius:4px;}
.fee-govt{font-weight:600;color:#15803d;}
.fee-pvt{font-weight:600;color:#dc2626;}
.note-box{background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:11px 14px;margin:12px 0 0;font-size:13px;color:#92400e;}
.ad-unit{margin:0 0 18px;text-align:center;background:#f1f5f9;border-radius:10px;padding:8px;min-height:90px;overflow:hidden;}
.state-sidebar{position:sticky;top:88px;}
.sb-card{background:#fff;border-radius:14px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,.06);border:1px solid #e2e8f0;margin-bottom:14px;}
.sb-card h4{font-size:13px;font-weight:800;color:#0f172a;margin-bottom:12px;}
.sb-link{display:flex;align-items:center;gap:8px;font-size:13px;color:#334155;padding:7px 0;border-bottom:1px solid #f1f5f9;text-decoration:none;}
.sb-link:last-child{border-bottom:none;}
.sb-link:hover{color:#2563eb;}
.sb-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9;font-size:13px;}
.sb-row:last-child{border-bottom:none;}
.sb-row-label{color:#64748b;}.sb-row-val{font-weight:700;color:#0f172a;}
.sfn{background:#fff;border-top:1px solid #e2e8f0;padding:18px 20px;}
.sfn-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;}
.sfn-inner a{font-size:14px;font-weight:600;color:#2563eb;background:#eff6ff;padding:8px 18px;border-radius:8px;border:1px solid #bfdbfe;}
@media(max-width:900px){.state-layout{grid-template-columns:1fr;}.state-sidebar{position:static;}}
@media(max-width:600px){.overview-grid{grid-template-columns:1fr 1fr;}.doc-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
<nav class="navbar scrolled" id="navbar">
  <div class="container nav-inner">
    <a href="../index.html" class="nav-logo"><img src="../logo.png" height="45" alt="${siteInfo.name}" style="display:block;max-height:45px;width:auto;" /></a>
    <ul class="nav-links" id="navLinks">
      <li><a href="../index.html#about">About</a></li>
      <li><a href="../index.html#tools">Tools</a></li>
      <li><a href="../index.html#news">News</a></li>
      <li><a href="../index.html#contact" class="nav-cta">Contact</a></li>
    </ul>
    <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
  </div>
</nav>
<div class="state-hero">
  <div class="container" style="position:relative;z-index:1;">
    <div class="state-breadcrumb"><a href="../index.html">Home</a><span>›</span><a href="../index.html#states">State Counselling</a><span>›</span>${state}</div>
    <h1>${title} — Complete Guide 2026</h1>
    <p>Authority, counselling process, dates, eligibility, fees, reservation, documents & college list</p>
    <div class="state-badges">
      <span class="state-badge">🏛️ ${d.ov.authority||'Authority'}</span>
      <span class="state-badge">📅 Updated: ${new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span>
      <span class="state-badge">🎯 State Quota: ${d.ov.stateQuota||'85%'}</span>
    </div>
  </div>
</div>
<div class="state-body">
  <div class="state-layout">
    <div class="state-main">
      <div class="ad-unit"><ins class="adsbygoogle" style="display:block" data-ad-client="${pub}" data-ad-slot="${slot1}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script></div>
      ${d.ovHtml?`<div class="info-card"><h2>📌 Overview</h2>${d.ovHtml}</div>`:ovSection?`<div class="info-card"><h2>📌 Overview</h2>${ovSection}</div>`:''}
      ${datesSection?`<div class="info-card"><h2>📅 Important Dates</h2>${datesSection}</div>`:''}
      ${eligSection?`<div class="info-card"><h2>✅ Eligibility</h2>${eligSection}</div>`:''}
      ${cutoffSection?`<div class="info-card"><h2>📊 Cutoff 2025</h2>${cutoffSection}<div class="note-box">⚠️ Cutoff marks approximate hain — actual figures official notification se confirm karein.</div></div>`:''}
      <div class="ad-unit"><ins class="adsbygoogle" style="display:block" data-ad-client="${pub}" data-ad-slot="${slot1}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script></div>
      ${stepsSection?`<div class="info-card"><h2>📋 Counselling Process</h2>${stepsSection}</div>`:''}
      ${feesSection?`<div class="info-card"><h2>💰 Registration Fee & Security Deposit</h2>${feesSection}</div>`:''}
      ${resSection?`<div class="info-card"><h2>🎯 Reservation</h2>${resSection}<div class="note-box">📌 Domicile certificate mandatory hai state quota ke liye.</div></div>`:''}
      ${docsSection?`<div class="info-card"><h2>📁 Documents Required</h2>${docsSection}</div>`:''}
      ${d.customHtml?`<div class="info-card">${d.customHtml}</div>`:''}
      <div class="info-card" style="padding:0;overflow:hidden;">
        <div style="padding:20px 22px 14px;border-bottom:2px solid #e2e8f0;"><h2 style="margin:0;padding:0;border:none;">🏥 College List — ${state} 2026</h2></div>
        <div style="padding:0 16px 16px;">
          ${collegeRows(d.govtColls,'govt-header','🏛️ Government Colleges')}
          ${collegeRows(d.pvtColls,'pvt-header','🏢 Private Colleges')}
          <div class="note-box">⚠️ College data approximate hai — admission se pehle official notification se verify karein.</div>
        </div>
      </div>
      ${relatedBox}
      <div class="ad-unit"><ins class="adsbygoogle" style="display:block" data-ad-client="${pub}" data-ad-slot="${slot1}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script></div>
    </div>
    <aside class="state-sidebar">
      <div class="sb-card">
        <h4>⚡ Quick Facts</h4>
        ${d.ov.authority?`<div class="sb-row"><span class="sb-row-label">Authority</span><span class="sb-row-val">${d.ov.authority}</span></div>`:''}
        ${d.ov.stateQuota?`<div class="sb-row"><span class="sb-row-label">State Quota</span><span class="sb-row-val">${d.ov.stateQuota}</span></div>`:''}
        ${d.ov.aiq?`<div class="sb-row"><span class="sb-row-label">AIQ</span><span class="sb-row-val">${d.ov.aiq}</span></div>`:''}
        ${d.ov.govtSeats?`<div class="sb-row"><span class="sb-row-label">Govt Seats</span><span class="sb-row-val">${d.ov.govtSeats}</span></div>`:''}
        ${d.ov.pvtSeats?`<div class="sb-row"><span class="sb-row-label">Pvt Seats</span><span class="sb-row-val">${d.ov.pvtSeats}</span></div>`:''}
        ${d.ov.rounds?`<div class="sb-row"><span class="sb-row-label">Rounds</span><span class="sb-row-val">${d.ov.rounds}</span></div>`:''}
      </div>
      <div class="sb-card" style="background:linear-gradient(135deg,#1e3a8a,#2563eb);border:none;">
        <h4 style="color:#fff;">Need Help?</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.8);margin-bottom:14px;line-height:1.6;">College selection, cutoff prediction, seat allotment — expert guidance chahiye?</p>
        <a href="../index.html#contact" style="display:block;text-align:center;background:#fff;color:#1e3a8a;font-weight:700;font-size:13px;padding:10px;border-radius:8px;text-decoration:none;">📞 Free Consultation</a>
      </div>
      <div class="ad-unit" style="min-height:250px;"><ins class="adsbygoogle" style="display:block" data-ad-client="${pub}" data-ad-slot="${slot1}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});<\/script></div>
      <div class="sb-card">
        <h4>📚 Related Pages</h4>
        <a class="sb-link" href="../neet-2026-exam-details.html">NEET 2026 Exam Details</a>
        <a class="sb-link" href="../neet-2026-syllabus.html">NEET 2026 Syllabus</a>
        <a class="sb-link" href="../index.html#tools">College Predictor</a>
      </div>
    </aside>
  </div>
</div>
<div class="sfn"><div class="sfn-inner"><a href="../index.html">← Home</a><a href="../index.html#contact">Free Counselling →</a></div></div>
<div style="background:#0f172a;text-align:center;padding:20px;font-size:13px;color:rgba(255,255,255,.4);">
  © 2026 ${siteInfo.name} &nbsp;|&nbsp;<a href="../privacy-policy.html" style="color:rgba(255,255,255,.5);">Privacy Policy</a> &nbsp;|&nbsp;<a href="../index.html#contact" style="color:rgba(255,255,255,.5);">Contact</a>
</div>
<button id="backToTop" style="position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-size:18px;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:999;">↑</button>
<script>
  document.getElementById('hamburger').addEventListener('click',function(){this.classList.toggle('active');document.getElementById('navLinks').classList.toggle('open');});
  window.addEventListener('scroll',()=>{document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>50);document.getElementById('backToTop').style.display=window.scrollY>300?'flex':'none';});
  document.getElementById('backToTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
<\/script>
</body></html>`;
}

function generatePreview() {
  const d = collectFormData();
  const html = generatePageHtml(d);
  const frame = document.getElementById('previewFrame');
  frame.srcdoc = html;
  showToast('Preview generated!','success');
}

async function savePageFile() {
  if (!websiteDir) { showToast('Folder connect karo','error'); return; }
  const slug = document.getElementById('b-slug').value.trim();
  if (!slug) { showToast('Slug/filename required','error'); return; }
  const d = collectFormData();
  const html = generatePageHtml(d);
  try {
    await writeFile(slug+'.html', html);
    // Update sitemap
    await updateSitemap(slug);
    showToast('Page saved: '+slug+'.html','success');
    refreshDashboard();
  } catch(e) { showToast('Save failed: '+e.message,'error'); }
}

async function updateSitemap(slug) {
  try {
    const sm = await readFile('sitemap.xml');
    const entry = `\n  <url>\n    <loc>${siteInfo.url}/${slug}.html</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`;
    if (sm.includes(slug+'.html')) return; // already exists
    const newSm = sm.replace('</urlset>', entry+'\n\n</urlset>');
    await writeFile('sitemap.xml', newSm);
  } catch(e) { /* sitemap update failed silently */ }
}

async function editExistingPage(filename) {
  showToast('Existing pages direct edit karne ke liye VS Code use karo','info');
}

// ── SHEET MANAGER ──
function handleSheetUpload(type, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, {type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      if (type==='mbbs') {
        mbbsData = data;
        localStorage.setItem('mbbsData', JSON.stringify(data));
        updateSheetStatus('mbbs', data.length);
        showPreviewTable('mbbsPreview', data.slice(0,5));
        showToast('MBBS sheet loaded: '+data.length+' colleges','success');
      } else {
        ayushData = data;
        localStorage.setItem('ayushData', JSON.stringify(data));
        updateSheetStatus('ayush', data.length);
        showPreviewTable('ayushPreview', data.slice(0,5));
        showToast('AYUSH sheet loaded: '+data.length+' colleges','success');
      }
      document.getElementById(type+'UploadArea').classList.add('has-file');
      populateStateFilters();
    } catch(ex) { showToast('Sheet parse error: '+ex.message,'error'); }
  };
  reader.readAsArrayBuffer(file);
}

function updateSheetStatus(type, count) {
  document.getElementById(type+'Status').textContent = '✓ '+count+' colleges loaded';
}

function showPreviewTable(containerId, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  document.getElementById(containerId).innerHTML = `
    <div style="font-size:12px;color:#64748b;margin-bottom:6px;">First 5 rows preview:</div>
    <div class="tbl-wrap">
      <table class="data-table">
        <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${headers.map(h=>`<td>${r[h]||''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function downloadTemplate(type) {
  const cols = type==='mbbs'
    ? ['State','Govt_Pvt','SN','Name','City','Year','Seats','Fee','Other']
    : ['State','Course','Govt_Pvt','SN','Name','City','Year','Seats','Fee','Other'];
  const sample = type==='mbbs'
    ? [['Rajasthan','Govt',1,'SMS Medical College','Jaipur',1947,250,'Free','RUHS Affiliated'],['Rajasthan','Pvt',1,'Mahatma Gandhi Medical','Jaipur',2010,150,'12L/yr','RUHS Affiliated']]
    : [['Rajasthan','BAMS','Govt',1,'NIA Jaipur','Jaipur',1976,60,'Free','Deemed'],['Rajasthan','BAMS','Pvt',1,'MG Ayurvedic College','Jaipur',2005,60,'1.5L/yr','RUHS']];
  const ws = XLSX.utils.aoa_to_sheet([cols,...sample]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
  XLSX.writeFile(wb, `${type}-master-template.xlsx`);
  showToast('Template downloaded!','success');
}

// ── ADS MANAGER ──
function loadAdsConfigToForm() {
  if (adsConfig.publisherId) document.getElementById('publisherId').value = adsConfig.publisherId;
  if (adsConfig.slot1) document.getElementById('adSlot1').value = adsConfig.slot1;
  if (adsConfig.slot2) document.getElementById('adSlot2').value = adsConfig.slot2;
  if (adsConfig.slot3) document.getElementById('adSlot3').value = adsConfig.slot3;
  if (adsConfig.slot4) document.getElementById('adSlot4').value = adsConfig.slot4;
}

async function saveAdsConfig() {
  adsConfig = {
    publisherId: document.getElementById('publisherId').value.trim(),
    slot1: document.getElementById('adSlot1').value.trim(),
    slot2: document.getElementById('adSlot2').value.trim(),
    slot3: document.getElementById('adSlot3').value.trim(),
    slot4: document.getElementById('adSlot4').value.trim(),
  };
  localStorage.setItem('adsConfig', JSON.stringify(adsConfig));
  document.getElementById('adsStatus').textContent = '✓ Saved in browser';
  showToast('Ads config saved!','success');
}

async function applyAdsToAllPages() {
  if (!websiteDir) { showToast('Folder connect karo','error'); return; }
  const pub = adsConfig.publisherId;
  if (!pub || pub.includes('X')) { showToast('Sahi Publisher ID daalo','error'); return; }
  const files = await listHtmlFiles();
  let count = 0;
  for (const f of files) {
    try {
      let html = await readFile(f);
      const updated = html.replaceAll('ca-pub-XXXXXXXXXXXXXXXXX', pub);
      if (updated !== html) { await writeFile(f, updated); count++; }
    } catch(e) {}
  }
  showToast(`Publisher ID updated in ${count} files`,'success');
}

// ── SETTINGS ──
function loadSiteInfoToForm() {
  document.getElementById('siteUrl').value    = siteInfo.url;
  document.getElementById('siteName').value   = siteInfo.name;
  document.getElementById('defaultAuthor').value = siteInfo.author;
}

function saveSiteInfo() {
  siteInfo = { url: document.getElementById('siteUrl').value.trim(), name: document.getElementById('siteName').value.trim(), author: document.getElementById('defaultAuthor').value.trim() };
  localStorage.setItem('siteInfo', JSON.stringify(siteInfo));
  showToast('Site info saved!','success');
}

function changePassword() {
  const cur = document.getElementById('curPw').value;
  const nw  = document.getElementById('newPw').value;
  const con = document.getElementById('conPw').value;
  const stored = localStorage.getItem('adminPw') || DEFAULT_PW;
  const msg = document.getElementById('pwMsg');
  if (cur !== stored) { msg.textContent = '❌ Current password wrong'; return; }
  if (!nw || nw.length < 6) { msg.textContent = '❌ Min 6 characters'; return; }
  if (nw !== con) { msg.textContent = '❌ Passwords do not match'; return; }
  localStorage.setItem('adminPw', nw);
  msg.textContent = '✓ Password changed successfully';
  showToast('Password changed!','success');
  ['curPw','newPw','conPw'].forEach(id=>document.getElementById(id).value='');
}

// ── BOOT ──
checkLogin();
