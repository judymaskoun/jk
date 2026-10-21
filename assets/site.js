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
})();
