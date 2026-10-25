/* Place the ORIGINAL ROUNDED section balloons so their vertical centers sit ON
   the page-hero divider. Works with old or new versions of assets/site.js. */
(()=>{
  const nameMaps={
    cv:{all:'Show all','cv-education':'Education','cv-appointments':'Appointments',
       'cv-teaching':'Teaching','cv-service':'Service','cv-awards':'Awards',
       'cv-affiliations':'Affiliations','cv-skills':'Skills',
       'cv-scholarly':'Publications & talks','cv-funding':'Funding'},
    teaching:{all:'Show all','teaching-courses':'Courses',
      'teaching-assistant':'Teaching assistant',
      'teaching-development':'Development',
      'teaching-mentorship':'Mentorship'}
  };
  function update(){
    const hero=document.querySelector('main > .page-hero');
    const nav=document.querySelector('main [data-section-picker]');
    if(!hero||!nav||!nameMaps[nav.dataset.sectionPicker]) return;
    let bar=document.querySelector('main > .section-balloon-bar');
    if(!bar){bar=document.createElement('div');bar.className='section-balloon-bar';hero.insertAdjacentElement('afterend',bar);}
    if(nav.parentElement!==bar) bar.appendChild(nav);
    nav.classList.add('section-pill-nav');
    nav.classList.remove('container','section-tab-nav');
    nav.style.removeProperty('top');
    // Keep full-length section names for accessibility and the tooltip.
    const names=nameMaps[nav.dataset.sectionPicker];
    nav.querySelectorAll('a.section-pill').forEach(a=>{
      const full=a.dataset.fullLabel||a.getAttribute('aria-label')||a.textContent.trim();
      a.dataset.fullLabel=full;
      a.setAttribute('aria-label',full);
      a.title=full;
      const short=names[a.dataset.target];
      if(short) a.textContent=short;
    });
    // Clean up any empty rectangular-tab host left by a previous patch.
    document.querySelectorAll('main > .section-tab-bar').forEach(el=>{if(!el.children.length) el.remove();});
  }
  update();
  document.addEventListener('editable-content-ready',update);
  window.addEventListener('hashchange',update);
  window.addEventListener('load',update);
})();
