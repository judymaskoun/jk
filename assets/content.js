/* Editable content, loaded directly from JSON. Works on ordinary GitHub Pages. */
(() => {
  'use strict';
  const page = document.body.dataset.page || 'home';
  const root = page === 'home' ? './' : '../';
  const dataUrl = name => `${root}content/${name}.json`;
  const cache = new Map();
  const load = name => {
    if (!cache.has(name)) cache.set(name, fetch(dataUrl(name), {cache: 'no-cache'})
      .then(response => {if (!response.ok) throw Error(`${name}: ${response.status}`);return response.json();})
      .catch(error => { console.warn('Using static website content:', error.message); return null; }));
    return cache.get(name);
  };
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const visible = list => Array.isArray(list) ? list.filter(x => x && x.visible !== false)
    .sort((a, b) => (Number(a.order ?? 999) - Number(b.order ?? 999))) : null;
  const safeUrl = raw => {
    if (!raw) return '';
    try {
      const u = new URL(String(raw), document.baseURI);
      return ['https:','http:'].includes(u.protocol) ? esc(u.href) : '';
    } catch {return '';}
  };
  const asset = raw => {
    if (!raw) return '';
    const path = String(raw).replace(/^\//, '');
    if (!/^assets\/[a-zA-Z0-9_./-]+$/.test(path) || path.includes('..')) return '';
    return root + path;
  };
  const link = (url, label) => safeUrl(url)
    ? `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : '';
  const paragraph = v => v ? `<p>${esc(v)}</p>` : '';
  const timeline = x => `<div class="timeline-entry"><div class="timeline-date">${esc(x.date_label || x.year || '')}</div>`+
    `<div class="timeline-body"><h3>${esc(x.title)}</h3><div class="timeline-detail">${paragraph(x.organization || x.authors)}${paragraph(x.description || x.venue)}${x.url ? link(x.url,'More information') : ''}</div></div></div>`;
  const replaceTimeline = (section, items, make=timeline) => {
    if (!section || !items) return;
    const parent = section.querySelector(':scope > .container') || section;
    parent.querySelectorAll('.timeline-entry').forEach(el => el.remove());
    const heading = parent.querySelector('.section-heading');
    if (heading) heading.insertAdjacentHTML('afterend', items.map(make).join(''));
  };
  const cvSection = title => [...document.querySelectorAll('.cv-section')]
    .find(sec => sec.querySelector('h2')?.textContent.trim() === title);
  const set = (selector, val) => {
    const el = document.querySelector(selector);
    if (el && val !== undefined && val !== null) el.textContent = val;
  };
  const profiles = [['Google Scholar','scholar_url'],['LinkedIn','linkedin_url'],['ORCID','orcid_url'],
    ['Scopus','scopus_url'],['Web of Science','wos_url']];

  async function updateSite() {
    const site = await load('site');
    if (!site || typeof site !== 'object' || Array.isArray(site)) return;
    if (site.name) {
      document.querySelectorAll('.logo').forEach(el => {
        const dot = document.createElement('span'); dot.textContent = '.';
        el.replaceChildren(document.createTextNode(site.name), dot);
      });
      set('.name-accent', site.name);
      document.title = document.title.replace(/ — .*$/, ' — ' + site.name);
      const portrait = document.querySelector('.hero-portrait img');
      if (portrait) portrait.alt = 'Portrait of ' + site.name;
    }
    document.querySelectorAll('.profile-link-list').forEach(el => {
      el.innerHTML = profiles.map(([name, key]) => link(site[key], name)).filter(Boolean).join('');
    });
    const copyright = document.querySelector('.footer-bottom');
    if (copyright) copyright.textContent = `© ${new Date().getFullYear()} ${site.name || 'Jülide Kahkeci'} · ${site.university || ''} · ${site.location || ''}`;
    if (page === 'home') {
      set('.hero-copy .eyebrow', site.role);
      set('.hero .hero-title', site.subtitle);
      const alternate = document.querySelector('.alternate-name');
      if (alternate) alternate.textContent = site.alternate_name ? `Also known as ${site.alternate_name}` : '';
      set('.hero .lead', site.intro);
      set('.about-academic .section-heading h2', site.about_heading);
      const cols = document.querySelectorAll('.about-columns .about-column p');
      if (cols[0] && site.about_paragraph_1 !== undefined) cols[0].textContent = site.about_paragraph_1;
      if (cols[1] && site.about_paragraph_2 !== undefined) cols[1].textContent = site.about_paragraph_2;
      const interests = document.querySelector('.interest-pills');
      if (interests && Array.isArray(site.research_interests)) interests.innerHTML = site.research_interests.map(i=>`<span class="pill">${esc(i)}</span>`).join('');
      const portrait = document.querySelector('.hero-portrait img');
      if (portrait && asset(site.profile_photo)) portrait.src = asset(site.profile_photo);
    }
    if (page === 'cv') {
      const pdf = document.querySelector('.page-hero .btn');
      if (pdf && asset(site.cv_pdf)) pdf.href = asset(site.cv_pdf);
    }
    if (page === 'contact') {
      const grid = document.querySelector('.contact-grid');
      if (grid) grid.innerHTML = `<div class="contact-card"><div class="kicker">University</div><h3>${esc(site.university)}</h3><p>${esc(site.location)}</p></div>`+
        `<div class="contact-card"><div class="kicker">Email</div><h3>Professional correspondence</h3><p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p></div>`;
      const list = document.querySelector('.three-col');
      if (list) list.innerHTML = profiles.filter(([_,key])=>safeUrl(site[key]))
        .map(([name,key])=>`<article class="card"><h3>${esc(name)}</h3>${link(site[key],'View profile')}</article>`).join('');
    }
    if (page === 'publications') {
      const note = document.querySelector('.publication-name-note strong');
      if (note) note.textContent = site.earlier_publication_name || '';
    }
  }

  async function updateHome() {
    const [updates, publications, presentations, awards] = await Promise.all(
      ['updates','publications','presentations','awards'].map(load));
    if (updates) {
      const list = document.querySelector('.updates-list');
      if (list) list.innerHTML = visible(updates).map(x =>
        `<article class="update-item"><div class="update-date">${esc(x.date_label)}</div>`+
        `<div class="update-body"><strong>${esc(x.title)}</strong> — ${esc(x.description)} ${link(x.url,'Read more')}</div></article>`).join('');
    }
    const nums = document.querySelectorAll('.stats .stat-num');
    if (nums.length >= 3) {
      if (publications) nums[0].textContent = visible(publications).filter(x=>['article','review'].includes(x.category)).length;
      if (presentations) nums[1].textContent = visible(presentations).length;
      if (awards) nums[2].textContent = visible(awards).length;
    }
  }

  async function updateResearch() {
    const all = visible(await load('research')); if (!all) return;
    const sections = {'Current Research':0,'Doctoral Research':1,'Earlier Research':2};
    const elements = [...document.querySelectorAll('main > section.section')];
    for (const [cat,index] of Object.entries(sections)) {
      const container=elements[index]?.querySelector('.two-col'); if (!container) continue;
      container.innerHTML=all.filter(x=>x.category===cat).map(x => {
        const cover=asset(x.image) ? `<img class="research-cover" src="${asset(x.image)}" alt="${esc(x.title)}" loading="lazy">` : '';
        const gallery=(x.gallery || []).map(path=>asset(path) ? `<img loading="lazy" src="${asset(path)}" alt="Photograph for ${esc(x.title)}">` : '').join('');
        return `<article class="card research-card">${cover}<div class="kicker">${esc(x.tag || x.category)}</div><h3>${esc(x.title)}</h3>`+
          `${paragraph(x.summary)}${paragraph(x.details)}${gallery ? `<div class="research-gallery">${gallery}</div>` : ''}`+
          `${link(x.url,'Read more')}</article>`;
      }).join('');
    }
  }

  async function updatePublications() {
    const all=visible(await load('publications')); if (!all) return;
    const pubs=all.filter(x=>['article','review'].includes(x.category));
    const published=document.querySelector('main > section.section');
    if (published) {
      published.querySelectorAll('.pub-item').forEach(x=>x.remove());
      const noResults=published.querySelector('#no-results');
      if (noResults) noResults.insertAdjacentHTML('beforebegin', pubs.map(x=>{
        const label=x.category==='review'?'Review':'Research Article';
        const doi=x.doi ? safeUrl('https://doi.org/'+String(x.doi).replace(/^https?:\/\/(?:dx\.)?doi\.org\//,'')) : '';
        const dest=safeUrl(x.url)||doi;
        return `<article class="pub-item" data-publication data-type="${esc(x.category)}">`+
        `<div class="pub-meta">${esc(x.year)} · ${esc(x.venue)} · ${label}</div><h3>${esc(x.title)}</h3>${paragraph(x.authors)}`+
        `<p><em>${esc([x.venue,x.details].filter(Boolean).join(', '))}</em></p>`+
        `<div class="resource-link">${dest?`<a href="${dest}" target="_blank" rel="noopener noreferrer">View publication ↗</a>`:''}</div></article>`;
      }).join(''));
    }
    const sections=[...document.querySelectorAll('main > section.section')];
    const make=(x)=>`<div class="timeline-entry"><div class="timeline-date">${esc(x.year)}</div><div class="timeline-body"><h3>${esc(x.title)}</h3>`+
      `<div class="timeline-detail">${paragraph(x.authors)}${paragraph(x.venue? (x.category==='submitted'?'Submitted to ':'')+x.venue:'')}</div></div></div>`;
    replaceTimeline(sections[1], all.filter(x=>x.category==='submitted'), make);
    replaceTimeline(sections[2], all.filter(x=>x.category==='in_preparation'), make);
    window.refreshPublicationList?.();
  }

  async function updatePresentations() {
    const list=visible(await load('presentations'));if(!list)return;
    replaceTimeline(document.querySelector('main > section.section'),list,x=>
      `<div class="timeline-entry"><div class="timeline-date">${esc(x.date_label)}</div><div class="timeline-body"><h3>${esc(x.title)}</h3>`+
      `<div class="timeline-detail">${paragraph(x.authors)}${paragraph(x.venue)}${link(x.url,'View presentation')}</div></div></div>`);
  }

  async function updateTeaching() {
    const all=visible(await load('teaching'));if(!all)return;
    const sections=[...document.querySelectorAll('main > section.section')];
    ['Course Instruction','Teaching Assistant','Teaching Development'].forEach((name,i)=>
      replaceTimeline(sections[i],all.filter(x=>x.category===name)));
  }

  async function updateCV() {
    const groups=[['education','Education'],['experience','Research experience'],['teaching','University instruction and mentorship'],['service','Service']];
    const loaded=await Promise.all(groups.map(([name])=>load(name)));
    groups.forEach(([_,title],i)=>{const arr=visible(loaded[i]);if(arr)replaceTimeline(cvSection(title),arr);});
    const awards=visible(await load('awards'));
    if(awards){const list=cvSection('Awards & scholarships')?.querySelector('.plain-list');
      if(list)list.innerHTML=awards.map(x=>`<li><span class="list-year">${esc(x.date_label)}</span><strong>${esc(x.title)}</strong>${x.amount?' — '+esc(x.amount):''}</li>`).join('');}
    const [papers,talks]=await Promise.all([load('publications'),load('presentations')]);
    if(papers && talks){const arr=visible(papers);const counts=cvSection('Publications & presentations')?.querySelector('p');
      if(counts)counts.textContent=`${arr.filter(x=>['article','review'].includes(x.category)).length} peer-reviewed publications · ${visible(talks).length} conference presentations · ${arr.filter(x=>x.category==='submitted').length} submitted manuscripts · ${arr.filter(x=>x.category==='in_preparation').length} manuscripts in preparation.`;}
  }

  // Fail safely: static HTML remains visible even if JSON cannot be retrieved.
  (async()=>{
    await updateSite();
    try {
      if(page==='home') await updateHome();
      if(page==='research') await updateResearch();
      if(page==='publications') await updatePublications();
      if(page==='presentations') await updatePresentations();
      if(page==='teaching') await updateTeaching();
      if(page==='cv') await updateCV();
    } catch (error) {console.warn('Some editable content could not be displayed:',error);}
  })();
})();
