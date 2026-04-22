// Lectures page: renders the hero gallery + the archive timeline from data/lectures.json.
// Add a new lecture by appending an object to the JSON file — no HTML edits needed.
// Grid math: hero cards span 6 cols (pair per row), regular cards span 4 cols (trio per row).
// Featured-but-non-fitting cards automatically fall back to regular size to keep grid integrity.

(async function renderLectures() {
  const galleryEl = document.getElementById('lecture-gallery');
  const archiveEl = document.getElementById('lecture-archive');
  if (!galleryEl && !archiveEl) return;

  let data;
  try {
    const url = (window.navHref ? window.navHref('data/lectures.json') : 'data/lectures.json');
    const res = await fetch(url, { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('lectures.json fetch failed', e);
    return;
  }

  const all = (data.lectures || []).slice();

  // Sort by sortKey descending (most recent/upcoming first)
  all.sort((a, b) => (b.sortKey || '').localeCompare(a.sortKey || ''));

  // --- Featured gallery (image cards) ---
  if (galleryEl) {
    const featured = all.filter(l => l.featured);

    // Separate hero (span 6) and regular (span 4). We preserve original array order
    // for featured items so the author controls the visual rhythm via JSON order.
    const orderedFeatured = (data.lectures || []).filter(l => l.featured);

    // Build rows by packing cards: hero (6) + hero (6) = 12, or regular×3 = 12.
    // If hero has no partner, it becomes a lonely row (acceptable — still 12 cols aligned with big image).
    const rows = [];
    let buffer = [];
    let bufferSum = 0;

    const flush = () => {
      if (buffer.length) rows.push(buffer);
      buffer = [];
      bufferSum = 0;
    };

    for (const item of orderedFeatured) {
      const span = item.size === 'hero' ? 6 : 4;
      // If adding would exceed 12, or if we're mixing hero+regular mid-row, flush first.
      const wouldExceed = bufferSum + span > 12;
      const mixingSizes = buffer.length && (buffer[0].size === 'hero') !== (item.size === 'hero');
      if (wouldExceed || mixingSizes) flush();
      buffer.push(item);
      bufferSum += span;
      if (bufferSum === 12) flush();
    }
    flush();

    galleryEl.innerHTML = rows.flat().map(cardHTML).join('');
  }

  // --- Archive timeline (all entries, grouped by year) ---
  if (archiveEl) {
    const byYear = {};
    for (const l of all) {
      const year = (l.sortKey || l.date || '').slice(0, 4);
      (byYear[year] = byYear[year] || []).push(l);
    }
    const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

    archiveEl.innerHTML = years.map(year => `
      <div class="arch-group">
        <div class="arch-year">${year}</div>
        <ol class="arch-list">
          ${byYear[year].map(archiveRowHTML).join('')}
        </ol>
      </div>
    `).join('');

    // Total count
    const countEl = document.getElementById('lecture-count');
    if (countEl) countEl.textContent = all.length;
  }

  function cardHTML(item) {
    const span = item.size === 'hero' ? 6 : 4;
    const bigClass = item.size === 'hero' ? ' big' : '';
    const portraitClass = item.size === 'portrait' ? ' portrait' : '';
    const badge = item.badge
      ? `<div class="gbadge${item.badgeAccent ? ' accent' : ''}">${escapeHTML(item.badge)}</div>`
      : '';
    return `
      <div class="g-card${bigClass}${portraitClass} g-${span}">
        ${badge}
        <div class="gimg"><img src="assets/${escapeAttr(item.image)}" alt="${escapeAttr(item.title)}"></div>
        <div class="gbody">
          <div class="gwhen">${escapeHTML(item.dateDisplay || item.date)}</div>
          <div class="gtitle">${smartQuote(item.title)}</div>
          <div class="gwhere">${escapeHTML(item.venue || '')}</div>
        </div>
      </div>
    `;
  }

  function archiveRowHTML(item) {
    const date = item.date || '';
    return `
      <li class="arch-row">
        <div class="arch-date">${escapeHTML(date)}</div>
        <div class="arch-body">
          <div class="arch-title">${smartQuote(item.title)}</div>
          <div class="arch-meta">${escapeHTML(item.host || '')}${item.venue ? ' · ' + escapeHTML(item.venue) : ''}</div>
        </div>
        ${item.badge ? `<div class="arch-tag">${escapeHTML(item.badge)}</div>` : '<div class="arch-tag"></div>'}
      </li>
    `;
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHTML(s).replace(/`/g, '&#96;'); }
  function smartQuote(s) {
    // Wrap the title in curly quotes for that editorial feel, without double-wrapping
    // if it already has 『』「」 or existing curly quotes.
    const t = escapeHTML(s);
    if (/[『「"""]/.test(t)) return t;
    return `"${t}"`;
  }
})();
