// Mobile navigation and live publication search; no server or third-party dependencies.
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰';
    }));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; }
    });
  }
  // Toggle between dark and light on every page. Remember the visitor's choice.
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const refresh = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('aria-pressed', String(dark));
    };
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('julide-site-theme', next); } catch (error) { /* storage might be unavailable */ }
      refresh();
    });
    refresh();
  }
  // Pages CMS can hide the complete CV page, including header/footer navigation.
  // The deploy step also excludes /cv/ and its downloadable PDF when this switch is off.
  const contentPrefix = document.body.dataset.page === 'home' ? './' : '../';
  fetch(contentPrefix + 'content/sections.json', {cache:'no-cache'})
    .then(response => response.ok ? response.json() : null)
    .then(settings => {
      if (!settings || settings.show_cv_page !== false) return;
      document.querySelectorAll('a[href]').forEach(anchor => {
        try {
          const url = new URL(anchor.getAttribute('href'), document.baseURI);
          if (url.origin === new URL(document.baseURI).origin && /\/cv\/(?:index\.html)?$/.test(url.pathname)) {
            anchor.hidden = true;
            anchor.style.display = 'none';
          }
        } catch (_) { /* Ignore invalid links. */ }
      });
    }).catch(() => {});

  const search = document.querySelector('#publication-search');
  if (search) {
    const buttons = [...document.querySelectorAll('[data-filter]')];
    const count = document.querySelector('#pub-count');
    const empty = document.querySelector('#no-results');
    let filter = 'all';
    const update = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      document.querySelectorAll('[data-publication]').forEach(item => {
        const matches = (filter === 'all' || item.dataset.type === filter) && item.textContent.toLocaleLowerCase().includes(query);
        item.hidden = !matches;
        if (matches) visible++;
      });
      count.textContent = `${visible} publication${visible === 1 ? '' : 's'} shown`;
      empty.classList.toggle('show', visible === 0);
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      update();
    }));
    search.addEventListener('input', update);
    window.refreshPublicationList = update;
    update();
  }

  // Compact section picker. With JavaScript disabled, all sections remain visible.
  function initializeSectionPickers(){
    document.querySelectorAll('[data-section-picker]').forEach(nav=>{
      const scope=nav.dataset.sectionPicker;
      const panels=scope==='cv' ? [...document.querySelectorAll('main .cv-section')]
        : [...document.querySelectorAll('main > section.section')];
      const titles=panels.map(p=>({id:p.id,label:p.querySelector('.section-heading h2')?.textContent.trim()||'Section'}))
        .filter(x=>x.id);
      const oldActive=nav.dataset.active;
      const hash=decodeURIComponent(window.location.hash.slice(1));
      const active=oldActive==='all'||titles.some(x=>x.id===oldActive) ? oldActive
        : (hash==='cv-sections'||hash==='teaching-sections') ? 'all'
        : titles.some(x=>x.id===hash) ? hash : (titles[0]?.id||'all');
      nav.innerHTML=[{id:'all',label:'Show all'},...titles].map(x=>
        `<a href="#${x.id==='all'?(scope==='cv'?'cv-sections':'teaching-sections'):x.id}" data-target="${x.id}"`+
        ` class="section-pill${active===x.id?' selected':''}" aria-current="${active===x.id?'true':'false'}">${x.label}</a>`).join('');
      nav.id=scope==='cv'?'cv-sections':'teaching-sections';
      const show=which=>{
        nav.dataset.active=which;
        panels.forEach(panel=>panel.hidden=which!=='all'&&panel.id!==which);
        nav.querySelectorAll('.section-pill').forEach(a=>{
          const selected=a.dataset.target===which;
          a.classList.toggle('selected',selected);
          a.setAttribute('aria-current',String(selected));
        });
      };
      nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',event=>{
        event.preventDefault(); const selected=a.dataset.target;
        show(selected); history.replaceState(null,'',a.getAttribute('href'));
        nav.scrollIntoView({behavior:'smooth',block:'start'});
      }));
      show(active);
    });
  }
  window.addEventListener('hashchange',()=>{
    document.querySelectorAll('[data-section-picker]').forEach(nav=>{
      nav.dataset.active=''; // Re-read deep links from awards counter or external links.
    });
    initializeSectionPickers();
  });
  document.addEventListener('editable-content-ready',initializeSectionPickers);
  initializeSectionPickers();
})();
