// Renders the whole portfolio from content.json.
// To update the site, edit content.json only — you never need to touch this file.

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  fetch('content.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(render)
    .catch((err) => {
      console.error(err);
      document.querySelector('main').insertAdjacentHTML('afterbegin',
        '<p style="padding:24px 0;color:#e66">Could not load content.json. If you opened index.html straight from your computer, run a local server instead (see README).</p>');
    });

  function render(c) {
    const site = c.site || {};

    // ---- meta + theme ----
    document.title = site.pageTitle || site.name || '';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', site.description || '');
    if (site.accent) document.documentElement.style.setProperty('--accent', site.accent);
    if (site.accentOnLight) document.documentElement.style.setProperty('--accent-on-light', site.accentOnLight);
    setTheme(store.get('theme') || site.defaultTheme || 'dark');
    $('#theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next); store.set('theme', next);
    });

    // ---- simple text bindings ----
    const flat = Object.assign({}, c, site);
    document.querySelectorAll('[data-bind]').forEach((el) => {
      const v = get(flat, el.dataset.bind);
      if (v != null) el.textContent = v;
    });
    $('#copyright').textContent = '© ' + new Date().getFullYear() + ' ' + (site.name || '');

    // ---- rotating role ----
    const roles = (c.hero && c.hero.roles) || [];
    const roleEl = $('#role');
    let ri = 0;
    if (roles.length) {
      roleEl.textContent = roles[0];
      if (roles.length > 1) setInterval(() => {
        ri = (ri + 1) % roles.length;
        roleEl.innerHTML = `<span class="role-swap">${esc(roles[ri])}</span>`;
      }, 2400);
    }

    // ---- now ----
    $('#now').innerHTML = (c.now || []).map((n) =>
      `<div class="now__item"><span class="now__title">${esc(n.title)}</span><span class="now__meta">${esc(n.meta)}</span></div>`).join('');

    // ---- stats ----
    const stats = c.stats || [];
    $('#stats').innerHTML = stats.map((s) =>
      `<div class="stat"><span class="stat__value">${esc(s.value)}</span><span class="stat__label">${esc(s.label)}</span></div>`).join('');
    if (!stats.length) $('#stats').remove();

    // ---- projects ----
    const projects = c.projects || [];
    $('#projects').innerHTML = projects.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      const id = 'proj-' + i;
      return `<article class="project${i === 0 ? ' is-open' : ''}" data-cats="${esc((p.categories || []).join(' '))}">
        <button type="button" class="project__row" aria-expanded="${i === 0}" aria-controls="${id}">
          <span class="project__num">${num}</span>
          <span class="project__titles"><span class="project__title">${esc(p.title)}</span><span class="project__sub">${esc(p.subtitle)}</span></span>
          <span class="project__metric"><strong>${esc(p.highlight)}</strong><span>${esc(p.highlightLabel)}</span></span>
          <span class="project__date">${esc(p.date)}</span>
          <span class="chev" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>
        </button>
        <div class="project__body" id="${id}"><div class="project__inner"><div class="project__content">
          <ul class="project__points">${(p.points || []).map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
          <div class="project__side">
            <span class="eyebrow">Stack</span>
            <p class="project__stack">${esc((p.stack || []).join(', '))}</p>
            ${p.note ? `<p class="project__note">${esc(p.note)}</p>` : ''}
            ${p.link ? `<a class="project__link" href="${esc(p.link)}" target="_blank" rel="noopener">View project ↗</a>` : ''}
          </div>
        </div></div></div>
      </article>`;
    }).join('');

    $('#projects').addEventListener('click', (e) => {
      const row = e.target.closest('.project__row');
      if (!row) return;
      const art = row.parentElement;
      const open = !art.classList.contains('is-open');
      document.querySelectorAll('.project.is-open').forEach((a) => {
        a.classList.remove('is-open'); a.querySelector('.project__row').setAttribute('aria-expanded', 'false');
      });
      if (open) { art.classList.add('is-open'); row.setAttribute('aria-expanded', 'true'); }
    });

    // ---- project filters ----
    const filters = [{ id: 'all', label: 'All' }].concat(c.projectFilters || []);
    $('#filters').innerHTML = filters.map((f, i) =>
      `<button type="button" class="pill" data-filter="${esc(f.id)}" aria-pressed="${i === 0}">${esc(f.label)}</button>`).join('');
    $('#filters').addEventListener('click', (e) => {
      const b = e.target.closest('.pill');
      if (!b) return;
      const f = b.dataset.filter;
      $('#filters').querySelectorAll('.pill').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      document.querySelectorAll('.project').forEach((a) => {
        const show = f === 'all' || a.dataset.cats.split(' ').indexOf(f) !== -1;
        a.classList.toggle('is-hidden', !show);
        if (show) { a.classList.remove('fade'); void a.offsetWidth; a.classList.add('fade'); }
      });
    });

    // ---- experience ----
    // Newest role first, sorted automatically by its "start" date (YYYY-MM).
    const jobs = (c.experience || []).slice().sort((a, b) => String(b.start || '').localeCompare(String(a.start || '')));
    $('#exp-tabs').innerHTML = jobs.map((j, i) =>
      `<button type="button" role="tab" class="exp__tab" data-i="${i}" aria-selected="${i === 0}">
        <span class="exp__tab-date">${esc(j.date)}</span><span class="exp__tab-role">${esc(j.role)}</span><span class="exp__tab-org">${esc(j.org)}</span>
      </button>`).join('');
    const showJob = (i) => {
      const j = jobs[i]; if (!j) return;
      $('#exp-tabs').querySelectorAll('.exp__tab').forEach((t) => t.setAttribute('aria-selected', String(+t.dataset.i === i)));
      const panel = $('#exp-panel');
      panel.innerHTML = `<div class="exp__panel-head"><h3>${esc(j.role)}</h3><span class="exp__date">${esc(j.date)}</span></div>
        <p class="exp__org">${esc([j.org, j.place].filter(Boolean).join(', '))}</p>
        <ul class="exp__points">${(j.points || []).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        ${(j.tags || []).length ? `<p class="exp__tags">${esc(j.tags.join(', '))}</p>` : ''}`;
      panel.classList.remove('fade'); void panel.offsetWidth; panel.classList.add('fade');
    };
    $('#exp-tabs').addEventListener('click', (e) => { const t = e.target.closest('.exp__tab'); if (t) showJob(+t.dataset.i); });
    showJob(0);

    // ---- skills ----
    $('#skills-list').innerHTML = (c.skills || []).map((s) =>
      `<div class="skill-row"><h3>${esc(s.group)}</h3><div class="skill-row__tags">${(s.items || []).map((it) => `<span class="tag">${esc(it)}</span>`).join('')}</div></div>`).join('');

    // ---- education + leadership ----
    $('#education').innerHTML = (c.education || []).map((e) =>
      `<div class="edu"><h3>${esc(e.school)}</h3>
        ${e.detail ? `<p class="edu__detail">${esc(e.detail)}</p>` : ''}
        ${e.highlight ? `<p class="edu__highlight">${esc(e.highlight)}</p>` : ''}
        ${e.extra ? `<p class="edu__extra">${esc(e.extra)}</p>` : ''}</div>`).join('');
    $('#leadership').innerHTML = (c.leadership || []).map((l) =>
      `<li><span><span class="list__title">${esc(l.title)}</span><span class="list__org">${esc(l.org)}</span></span><span class="list__date">${esc(l.date)}</span></li>`).join('');

    // ---- contact ----
    $('#contact-links').insertAdjacentHTML('beforeend', (site.links || []).filter((l) => l.url).map((l) =>
      `<a class="btn btn--outline-ink" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join(''));
    document.querySelectorAll('.js-copy-label').forEach((el) => {
      if (!el.dataset.default) { el.dataset.default = site.email || ''; el.textContent = site.email || ''; }
    });
    document.querySelectorAll('.js-copy').forEach((btn) => btn.addEventListener('click', () => {
      const email = site.email || '';
      const done = () => {
        document.querySelectorAll('.js-copy-label').forEach((l) => { l.textContent = 'Copied!'; });
        setTimeout(() => document.querySelectorAll('.js-copy-label').forEach((l) => { l.textContent = l.dataset.default; }), 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, () => { location.href = 'mailto:' + email; });
      else location.href = 'mailto:' + email;
    }));

    setupReveal();
  }

  // Scroll-reveal: each group of elements slides up and fades in, one after another,
  // as it scrolls into view. Elements already on screen animate in on load.
  function setupReveal() {
    const groups = [
      ['.stats'],
      ['#work .section__head', '.project'],
      ['#experience .section__head', '.exp__tab', '#exp-panel'],
      ['#skills .section__head', '.skill-row', '.two-col .card'],
      ['.contact', '.footer']
    ];
    const els = [];
    groups.forEach((sels) => {
      let i = 0;
      sels.forEach((sel) => document.querySelectorAll(sel).forEach((el) => {
        el.classList.add('reveal');
        el.style.setProperty('--i', String(Math.min(i++, 6)));
        els.push(el);
      }));
    });
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
          // Clear the stagger delay after it plays so hover effects stay snappy.
          setTimeout(() => en.target.style.removeProperty('--i'), 1500);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    const b = document.getElementById('theme-toggle');
    if (b) b.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
})();
