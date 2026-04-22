// ============================================================
// SHARED SITE SCRIPT — nav, footer injection, tweaks, email
// ============================================================
(function () {
  // Preview token propagation for <img src>
  try {
    const token = new URL(window.location.href).searchParams.get('t');
    if (token) {
      const patch = (img) => {
        const src = img.getAttribute('src');
        if (!src) return;
        try {
          const u = new URL(src, window.location.href);
          if (u.origin === window.location.origin && !u.searchParams.has('t')) {
            u.searchParams.set('t', token);
            img.setAttribute('src', u.href);
          }
        } catch (e) {}
      };
      const run = () => document.querySelectorAll('img').forEach(patch);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
      else run();
      new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType === 1) { if (n.tagName === 'IMG') patch(n); else if (n.querySelectorAll) n.querySelectorAll('img').forEach(patch); }
      }))).observe(document.documentElement, { childList: true, subtree: true });
    }
  } catch (e) {}

  // Token-preserving link helper for same-site nav
  window.navHref = function (href) {
    try {
      const token = new URL(window.location.href).searchParams.get('t');
      if (!token) return href;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return href;
      return href + (href.includes('?') ? '&' : '?') + 't=' + encodeURIComponent(token);
    } catch (e) { return href; }
  };

  const PAGES = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'profile.html', label: 'Profile', key: 'profile' },
    { href: 'books.html', label: 'Books', key: 'books' },
    { href: 'lectures.html', label: 'Talks', key: 'lectures' },
    { href: 'media.html', label: 'Media', key: 'media' },
    { href: 'research.html', label: 'Research', key: 'research' },
    { href: 'contact.html', label: 'Contact', key: 'contact' }
  ];

  function renderNav(activeKey) {
    const links = PAGES.filter(p => p.key !== 'contact').map(p =>
      `<li><a href="${window.navHref(p.href)}" class="${p.key === activeKey ? 'active' : ''}">${p.label}</a></li>`
    ).join('');
    return `
      <nav class="top" id="topNav">
        <div class="row">
          <a href="${window.navHref('index.html')}" class="brand">
            <span class="mk">J</span>
            <span class="nm">
              <span class="k">최재운</span>
              <span class="e">Jaeun Choi · KWU</span>
            </span>
          </a>
          <ul>${links}</ul>
          <a href="${window.navHref('contact.html')}" class="cta">Contact →</a>
        </div>
      </nav>`;
  }

  function renderFooter() {
    return `
      <footer class="site">
        <div class="wrap">
          <div class="row">
            <div>
              <h2>같이 <span class="kr-italic">이야기할</span><br>자리를 만듭니다.</h2>
              <p class="sub">AI를 둘러싼 흐름, 그리고 그 안에서 사람이 해야 할 일. 강연·자문·협업 문의를 환영합니다.</p>
              <button class="email-link" data-email-btn>
                <span data-email-text>이메일 주소 보기</span>
                <span>→</span>
              </button>
            </div>
            <div>
              <h5>Affiliation</h5>
              <ul>
                <li>광운대학교 경영대학<span>College of Business · Kwangwoon University</span></li>
                <li>경영학부 빅데이터경영전공<span>Big Data Management</span></li>
                <li>서울 노원구 광운로 20<span>20 Gwangwoon-ro, Nowon-gu, Seoul</span></li>
              </ul>
            </div>
            <div>
              <h5>Menu</h5>
              <ul>
                <li><a href="${window.navHref('profile.html')}">Profile · 이력</a></li>
                <li><a href="${window.navHref('books.html')}">Books · 저서</a></li>
                <li><a href="${window.navHref('lectures.html')}">Talks · 강연</a></li>
                <li><a href="${window.navHref('media.html')}">Media · 미디어</a></li>
                <li><a href="${window.navHref('research.html')}">Research · 연구</a></li>
                <li><a href="${window.navHref('contact.html')}">Contact · 문의</a></li>
              </ul>
            </div>
            <div class="copy">
              <span>© 2026 Jaeun Choi · Kwangwoon University</span>
              <span>Last updated · Apr 2026</span>
            </div>
          </div>
        </div>
      </footer>`;
  }

  function renderTweaks() {
    return `
      <button id="tweakTab">Tweaks</button>
      <div class="tweaks-panel" id="tweaksPanel">
        <h6><span>Tweaks</span><span class="x" id="tweakClose">×</span></h6>
        <div class="tw-grp">
          <label>Color theme</label>
          <div class="swatches" id="swatches">
            <div class="sw warm" data-theme="warm" title="Noir"></div>
            <div class="sw cool" data-theme="cool" title="Steel"></div>
            <div class="sw mono" data-theme="mono" title="Mono"></div>
          </div>
        </div>
        <div class="tw-grp">
          <div class="tog-row"><span>Dark mode</span><button class="tog" id="darkTog"></button></div>
        </div>
      </div>`;
  }

  // Email spam protection
  const emailParts = ['juchoi', 'kw', 'ac', 'kr'];
  const getEmail = () => emailParts[0] + '@' + emailParts[1] + '.' + emailParts[2] + '.' + emailParts[3];
  function bindEmailButtons() {
    document.querySelectorAll('[data-email-btn]').forEach(btn => {
      if (btn.__bound) return; btn.__bound = true;
      const txt = btn.querySelector('[data-email-text]');
      let shown = false;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = getEmail();
        if (!shown) { if (txt) txt.textContent = email; shown = true; setTimeout(() => { window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[문의] '); }, 200); }
        else { window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('[문의] '); }
      });
    });
  }

  // Tweaks state — persisted in localStorage across pages
  function loadTweaks() {
    try { return JSON.parse(localStorage.getItem('site_tweaks') || '{}'); } catch (e) { return {}; }
  }
  function saveTweaks(t) { try { localStorage.setItem('site_tweaks', JSON.stringify(t)); } catch (e) {} }

  function applyTweaks(t) {
    const root = document.documentElement;
    root.setAttribute('data-theme', t.theme || 'warm');
    root.setAttribute('data-dark', t.dark ? 'true' : 'false');
    document.querySelectorAll('#swatches .sw').forEach(s => s.classList.toggle('active', s.dataset.theme === (t.theme || 'warm')));
    const tog = document.getElementById('darkTog');
    if (tog) tog.classList.toggle('on', !!t.dark);
  }

  function bindTweaks() {
    const tab = document.getElementById('tweakTab');
    const panel = document.getElementById('tweaksPanel');
    const close = document.getElementById('tweakClose');
    if (!tab || !panel) return;

    const state = Object.assign({ theme: 'warm', dark: false }, (window.TWEAK_DEFAULTS || {}), loadTweaks());
    applyTweaks(state);

    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.type === '__activate_edit_mode') tab.classList.add('show');
      if (e.data.type === '__deactivate_edit_mode') { tab.classList.remove('show'); panel.classList.remove('open'); }
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

    tab.addEventListener('click', () => panel.classList.toggle('open'));
    close.addEventListener('click', () => panel.classList.remove('open'));
    document.querySelectorAll('#swatches .sw').forEach(sw => {
      sw.addEventListener('click', () => {
        state.theme = sw.dataset.theme;
        applyTweaks(state); saveTweaks(state);
        try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: state.theme } }, '*'); } catch (e) {}
      });
    });
    document.getElementById('darkTog').addEventListener('click', () => {
      state.dark = !state.dark;
      applyTweaks(state); saveTweaks(state);
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { dark: state.dark } }, '*'); } catch (e) {}
    });
  }

  function bindNavScroll() {
    const nav = document.getElementById('topNav');
    if (!nav) return;
    const fn = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', fn); fn();
  }

  // Public init — call at end of every page
  window.initSite = function (activeKey) {
    const navSlot = document.getElementById('site-nav');
    const footSlot = document.getElementById('site-footer');
    const tweakSlot = document.getElementById('site-tweaks');
    if (navSlot) navSlot.outerHTML = renderNav(activeKey);
    if (footSlot) footSlot.outerHTML = renderFooter();
    if (tweakSlot) tweakSlot.outerHTML = renderTweaks();
    bindNavScroll(); bindEmailButtons(); bindTweaks();
  };
})();
