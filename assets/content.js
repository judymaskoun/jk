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
  const profiles = [['Google Scholar','scholar_url','scholar'],['LinkedIn','linkedin_url','linkedin'],
    ['ORCID','orcid_url','orcid'],['Scopus','scopus_url','scopus'],['Web of Science','wos_url','wos']];
  const socialSymbol = {
    scholar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8.5 12 3l10 5.5-10 5.5z"/><path d="M6.5 11v6c3 2.6 8 2.6 11 0v-6"/><path d="M21 9v7"/></svg>',
    linkedin:'in', orcid:'iD', scopus:'S', wos:`<img src="${root}assets/icons/web-of-science.png?v=20261024b" alt="" width="32" height="32">`
  };
  const socialIcons = (site,keys=null) => `<div class="profile-icon-list" aria-label="Academic profile links">`+
    profiles.filter(([_,key])=>!keys||keys.includes(key)).map(([name,key,kind])=>{
      const url=safeUrl(site[key]);
      return url?`<a class="profile-icon profile-${kind}" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}" title="${esc(name)}"><span class="icon-symbol" aria-hidden="true">${socialSymbol[kind]}</span></a>`:'';
    }).join('')+'</div>';

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
    document.querySelectorAll('.profile-icon-list').forEach(el => {
      const publicationIcons = page === 'publications' && !!el.closest('.pub-profile-wrap');
      const keys = publicationIcons ? ['scholar_url','orcid_url','scopus_url','wos_url'] : null;
      el.outerHTML = socialIcons(site, keys);
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
    if (page === 'research') {
      const interests = document.querySelector('.research-hero-interests');
      if (interests && Array.isArray(site.research_interests))
        interests.innerHTML = site.research_interests.map(x => `<span class="pill">${esc(x)}</span>`).join('');
    }
    // Legacy site.cv_pdf does not override the CV editor's uploaded_pdf value.
  }

  // Contact labels, headings, details and email link are all editable in content/contact.json.
  // This runs after the general site editor so Contact's fields are authoritative.
  async function updateContact() {
    const contact = await load('contact');
    if (!contact || typeof contact !== 'object' || Array.isArray(contact)) return;

    const pageHeading = document.querySelector('.page-hero h1');
    if (pageHeading && typeof contact.page_title === 'string') pageHeading.textContent = contact.page_title;
    const smallHeading = document.querySelector('main > section.section .section-heading .kicker');
    if (smallHeading && typeof contact.section_heading === 'string') {
      smallHeading.textContent = contact.section_heading;
      smallHeading.closest('.section-heading').hidden = !contact.section_heading.trim();
    }

    const grid = document.querySelector('.contact-grid');
    if (!grid) return;
    const field = key => String(contact[key] ?? '');
    const label = key => field(key).trim() ? `<div class="kicker">${esc(field(key))}</div>` : '';
    const heading = key => field(key).trim() ? `<h3>${esc(field(key))}</h3>` : '';
    const lines = value => esc(value).replace(/\r\n?|\n/g, '<br>');
    const addr = field('address_text').trim() ? `<p class="address-content">${lines(field('address_text'))}</p>` : '';

    const email = field('email_address').trim();
    const display = field('email_link_text').trim() || email;
    // A well-formed email creates a mailto link; other values are shown as text, not unsafe URLs.
    const isEmail = /^[^\s<>"'@]+@[^\s<>"'@]+\.[^\s<>"'@]+$/.test(email);
    const emailLink = display ? `<p>${isEmail ? `<a href="mailto:${esc(email)}">${esc(display)}</a>` : esc(display)}</p>` : '';
    const emailNotes = field('email_notes').trim() ? `<p class="contact-notes">${lines(field('email_notes'))}</p>` : '';
    grid.innerHTML =
      `<div class="contact-card" data-contact-card="address">${label('address_label')}${heading('address_heading')}${addr}</div>`+
      `<div class="contact-card" data-contact-card="email">${label('email_label')}${heading('email_heading')}${emailLink}${emailNotes}</div>`;
  }

  async function updateHome() {
    const [updates, publications, presentations, awards] = await Promise.all(
      ['updates','publications','presentations','awards'].map(load));
    if (updates) {
      const list = document.querySelector('.updates-list');
      if (list) list.innerHTML = visible(updates).map(x => {
        const image = asset(x.image);
        const thumb = image ? `<img class="update-thumb" src="${esc(image)}" alt="${esc(x.image_alt || x.title || 'Update photo')}" loading="lazy">` : '';
        const url = safeUrl(x.url), tag = url ? 'a' : 'article';
        const attrs = url ? ` href="${url}" target="_blank" rel="noopener noreferrer"` : '';
        return `<${tag} class="update-item${url?' clickable-card':''}"${attrs}><div class="update-date">${esc(x.date_label)}</div>`+
          `<div class="update-body"><div class="update-copy"><strong>${esc(x.title)}</strong> — ${esc(x.description)}</div>${thumb}</div></${tag}>`;
      }).join('');
    }
    const nums = document.querySelectorAll('.stats .stat-num');
    if (nums.length >= 3) {
      if (publications) nums[0].textContent = visible(publications).filter(x=>['article','review'].includes(x.category)).length;
      if (presentations) nums[1].textContent = visible(presentations).length;
      if (awards) nums[2].textContent = visible(awards).length;
    }
  }

  async function updateResearch() {
    const [headings,records] = await Promise.all([load('research_headings'),load('research')]);
    if(headings && typeof headings==='object' && !Array.isArray(headings)) {
      const current=document.querySelector('#current-projects .section-heading h2');
      const past=document.querySelector('#past-projects .section-heading h2');
      if(current && typeof headings.current_heading==='string' && headings.current_heading.trim())
        current.textContent=headings.current_heading.trim();
      if(past && typeof headings.past_heading==='string' && headings.past_heading.trim())
        past.textContent=headings.past_heading.trim();
    }
    const all=visible(records); if(!all)return;
    // Historical categories from older CMS content are grouped under Past Projects.
    for (const [id,current] of [['current-projects',true],['past-projects',false]]) {
      const container=document.querySelector(`#${id} .two-col`);
      if(!container)continue;
      container.innerHTML=all.filter(x =>
        (['Current Projects','Current Research'].includes(x.category))===current).map(x=>{
          const cover=asset(x.image) ? `<img class="research-cover" src="${asset(x.image)}" alt="${esc(x.title)}" loading="lazy">` : '';
          const gallery=(x.gallery||[]).map(path=>asset(path)?`<img loading="lazy" src="${asset(path)}" alt="Photograph for ${esc(x.title)}">`:'').join('');
          const url=safeUrl(x.url), tag=url?'a':'article', attrs=url?` href="${url}" target="_blank" rel="noopener noreferrer"`:'';
          return `<${tag} class="card research-card${url?' clickable-card':''}"${attrs}>${cover}<div class="kicker">${esc(x.tag||x.category)}</div>`+
            `<h3>${esc(x.title)}</h3>${paragraph(x.summary)}${paragraph(x.details)}`+
            `${gallery?`<div class="research-gallery">${gallery}</div>`:''}${url?'<span class="resource-link">View project ↗</span>':''}</${tag}>`;
        }).join('');
    }
  }

  async function updatePublications() {
    // Independent Pages CMS switch for manuscripts in preparation (not submitted manuscripts).
    // Hide the whole section rather than just its entries so no empty space remains.
    const [publicationData,sectionSettings]=await Promise.all([load('publications'),load('sections')]);
    const showInProgress=sectionSettings?.show_publications_in_progress !== false;
    const all=visible(publicationData);
    const inProgressSection=document.getElementById('manuscripts-in-progress');
    // Also hide an empty section if every manuscript is individually hidden in Pages CMS.
    const hasInProgressRecords=!all || all.some(x=>x.category==='in_preparation');
    const sectionVisible=showInProgress && hasInProgressRecords;
    if(inProgressSection){
      inProgressSection.hidden=!sectionVisible;
      inProgressSection.style.display=sectionVisible?'':'none';
    }
    if(!all) return;
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
    replaceTimeline(inProgressSection||sections[2], showInProgress ? all.filter(x=>x.category==='in_preparation') : [], make);
    window.refreshPublicationList?.();
  }

  async function updatePresentations() {
    const list=visible(await load('presentations'));if(!list)return;
    replaceTimeline(document.querySelector('main > section.section'),list,x=> {
      const photos = [x.image, ...(Array.isArray(x.gallery) ? x.gallery : [])]
        .filter(path => asset(path));
      const gallery = photos.length ? `<div class="presentation-photos">${photos.map((path,i) =>
        `<a href="${asset(path)}" target="_blank" rel="noopener noreferrer" aria-label="Open conference photo ${i+1} for ${esc(x.title)}">`+
        `<img src="${asset(path)}" loading="lazy" alt="${esc(i===0 && x.image_alt ? x.image_alt : `Photo ${i+1} from ${x.title}`)}"></a>`).join('')}</div>` : '';
      return `<div class="timeline-entry"><div class="timeline-date">${esc(x.date_label)}</div><div class="timeline-body"><h3>${esc(x.title)}</h3>`+
        `<div class="timeline-detail">${paragraph(x.authors)}${paragraph(x.venue)}${link(x.url,'View presentation')}${gallery}</div></div></div>`;
    });
  }

  async function updateTeaching() {
    const all=visible(await load('teaching'));if(!all)return;
    // The unified page has ONE courses grid plus a nested development grid.
    // Never run the old 3-section replaceTimeline here: it erased 7 TA courses
    // and both development records while retaining only 2 instructor records.
    if (document.getElementById('teaching-courses')?.classList.contains('unified-teaching-section')) {
      if (typeof window.renderUnifiedTeaching === 'function') {
        window.renderUnifiedTeaching(all);
      }
      return;
    }
    // Compatibility for older Teaching pages that have separate top-level sections.
    const sections=[...document.querySelectorAll('main > section.section')];
    ['Course Instruction','Teaching Assistant','Teaching Development'].forEach((name,i)=>
      replaceTimeline(sections[i],all.filter(x=>x.category===name)));
  }

  // Pages CMS file field stores /assets/documents/<filename>.pdf.
  // Only accept local PDF uploads from the dedicated document folder; no remote or unsafe links.
  const manualCvHref = raw => {
    if (typeof raw !== 'string') return '';
    let value = raw.trim().replaceAll('\\','/');
    for (const prefix of ['/assets/documents/','assets/documents/','./assets/documents/','../assets/documents/']) {
      if (value.startsWith(prefix)) {
        const name = value.slice(prefix.length);
        if (!name || name === '.' || name === '..' || name.includes('/') || name.includes('..') ||
            name.includes('?') || name.includes('#') || !/\.pdf$/i.test(name)) return '';
        return '../assets/documents/' + encodeURIComponent(name);
      }
    }
    return '';
  };

  async function updateCV() {
    const cvInfo = await load('cv');
    const download = document.getElementById('cv-download-link');
    if (download) {
      const manual = manualCvHref(cvInfo?.uploaded_pdf);
      download.setAttribute('href', manual || '../assets/documents/julide-kahkeci-cv.pdf');
      download.setAttribute('download', manual ? 'Julide-Kahkeci-CV.pdf' : 'Julide-Kahkeci-CV.pdf');
      download.setAttribute('title', manual ? 'Download the CV uploaded in Pages CMS' : 'Download automatically generated CV');
      download.dataset.pdfSource = manual ? 'uploaded' : 'automatic';
    }
    if (cvInfo && typeof cvInfo.intro === 'string') {
      const el = document.querySelector('.page-hero .cv-intro');
      if (el) el.innerHTML = esc(cvInfo.intro)
        .replace(/\bpublications\b/i, '<a href="../publications/">publications</a>')
        .replace(/\bpresentations\b/i, '<a href="../presentations/">presentations</a>');
    }
    const groups=[['education','Education'],['experience','Academic & professional appointments'],['teaching','University instruction and mentorship'],['service','Service']];
    const loaded=await Promise.all(groups.map(([name])=>load(name)));
    groups.forEach(([_,title],i)=>{const arr=visible(loaded[i]);if(arr)replaceTimeline(cvSection(title),arr);});
    const funding = visible(await load('funding'));
    if (funding && funding.length) {
      const awardsSec = cvSection('Awards & scholarships');
      if (awardsSec) {
        let fundingSec = document.getElementById('cv-funding');
        if (!fundingSec) {
          fundingSec = document.createElement('section');
          fundingSec.id = 'cv-funding';
          fundingSec.className = 'cv-section';
          fundingSec.innerHTML = '<div class="section-heading"><div class="kicker">Funding</div><h2>Research funding</h2></div>';
          awardsSec.before(fundingSec);
        }
        replaceTimeline(fundingSec, funding, x =>
          `<div class="timeline-entry"><div class="timeline-date">${esc(x.date_label)}</div>`+
          `<div class="timeline-body"><h3>${esc(x.title)}</h3><div class="timeline-detail">`+
          `${paragraph(x.organization)}${paragraph(x.amount)}${paragraph(x.description)}</div></div></div>`);
      }
    }
    const awards=visible(await load('awards'));
    if(awards){const list=cvSection('Awards & scholarships')?.querySelector('.plain-list');
      if(list)list.innerHTML=awards.map(x=>`<li><span class="list-year">${esc(x.date_label)}</span><strong>${esc(x.title)}</strong>${x.amount?' — '+esc(x.amount):''}</li>`).join('');}
    const affiliations=visible(await load('affiliations'));
    if(affiliations)replaceTimeline(cvSection('Professional affiliations'),affiliations);
    const skills=visible(await load('skills'));
    if(skills){const list=cvSection('Software & analytical expertise')?.querySelector('.plain-list');
      if(list)list.innerHTML=skills.map(x=>`<li>${esc(x.text)}</li>`).join('');}
    const [papers,talks,sectionSettings]=await Promise.all([load('publications'),load('presentations'),load('sections')]);
    if(papers && talks){
      const arr=visible(papers);
      const counts=cvSection('Publications & presentations')?.querySelector('p');
      const summary=[
        `${arr.filter(x=>['article','review'].includes(x.category)).length} peer-reviewed publications`,
        `${visible(talks).length} conference presentations`,
        `${arr.filter(x=>x.category==='submitted').length} submitted manuscripts`
      ];
      const inProgressCount=arr.filter(x=>x.category==='in_preparation').length;
      if(sectionSettings?.show_publications_in_progress!==false && inProgressCount>0)
        summary.push(`${inProgressCount} manuscripts in preparation`);
      if(counts)counts.textContent=summary.join(' · ')+'.';
    }
  }

  // original-jk-asset-fallback: preserve old research images while you migrate media.
  // Newly uploaded pictures on this repository are always preferred.
  const inheritedImages = new Set(['engineered.jpg','wa.jpg','sw.jpg','adc.png']);
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.originalFallback === '1') return;
    const filename = img.getAttribute('src')?.split('/').pop();
    if (inheritedImages.has(filename)) {
      img.dataset.originalFallback = '1';
      img.src = 'https://judymaskoun.github.io/jk/assets/uploads/' + filename;
    }
  }, true);
  // Fail safely: static HTML remains visible even if JSON cannot be retrieved.
  (async()=>{
    await updateSite();
    try {
      if (page === 'contact') await updateContact();
      if(page==='home') await updateHome();
      if(page==='research') await updateResearch();
      if(page==='publications') await updatePublications();
      if(page==='presentations') await updatePresentations();
      if(page==='teaching') await updateTeaching();
      if(page==='cv') await updateCV();
    } catch (error) {console.warn('Some editable content could not be displayed:',error);}
    document.dispatchEvent(new Event('editable-content-ready'));
  })();
})();
