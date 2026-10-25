/* Pages CMS section-level show/hide controls + unified Teaching balloon navigation.
   Does not alter content files or interfere with the existing Pages CMS renderer. */
(()=>{
  const page=document.body.dataset.page;
  if(page!=='cv'&&page!=='teaching')return;
  const defaults={
    show_teaching_courses:true,show_teaching_development:true,show_teaching_mentorship:true,
    show_cv_education:true,show_cv_appointments:true,show_cv_teaching:true,
    show_cv_service:true,show_cv_funding:true,show_cv_awards:true,
    show_cv_affiliations:true,show_cv_skills:true,show_cv_scholarly:true
  };
  const cvIds={
    'cv-education':'show_cv_education',
    'cv-appointments':'show_cv_appointments',
    'cv-teaching':'show_cv_teaching',
    'cv-service':'show_cv_service',
    'cv-funding':'show_cv_funding',
    'cv-awards':'show_cv_awards',
    'cv-affiliations':'show_cv_affiliations',
    'cv-skills':'show_cv_skills',
    'cv-scholarly':'show_cv_scholarly'
  };
  let settings=defaults;
  let dataReady=false;
  const settingsPromise=fetch('../content/sections.json',{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw new Error(`sections.json HTTP ${r.status}`);return r.json();})
    .then(data=>{
      if(data&&typeof data==='object'&&!Array.isArray(data)){
        settings={...defaults,...data};
      }
      return settings;
    }).catch(err=>{console.warn('Using default section visibility:',err.message);return defaults;});
  function applyCV(){
    if (settings.show_cv_page === false) {
      // Hide the online CV while waiting for (or without) deployment exclusion.
      const main = document.getElementById('main');
      if (main) main.hidden = true;
      return;
    }
    let count=0;
    Object.entries(cvIds).forEach(([id,key])=>{
      const panel=document.getElementById(id);
      if(!panel)return;
      const enabled=settings[key]!==false;
      panel.classList.toggle('cms-section-disabled',!enabled);
      // The existing tab initializer discovers '.cv-section'. Hidden CMS sections
      // must be excluded so the associated navigation balloons disappear too.
      panel.classList.toggle('cv-section',enabled);
      if(enabled)count++;
    });
    const nav=document.querySelector('[data-section-picker="cv"]');
    if(nav) nav.hidden=count===0;
    // Independent Pages CMS switch: hide the PDF button without hiding the online CV.
    const pdfButton=document.getElementById('cv-download-link');
    if(pdfButton){
      const enabled=settings.show_cv_pdf_download!==false;
      pdfButton.hidden=!enabled;
      pdfButton.style.display=enabled?'':'none';
    }
    // Rebuild labels and event handlers after the CV CMS content has loaded.
    window.dispatchEvent(new Event('hashchange'));
  }
  const labels=[
    {id:'teaching-courses',key:'show_teaching_courses',name:'Courses'},
    {id:'teaching-development',key:'show_teaching_development',name:'Development'},
    {id:'teaching-mentorship',key:'show_teaching_mentorship',name:'Mentorship'}
  ];
  function applyTeaching(){
    const outer=document.getElementById('teaching-courses');
    const nav=document.querySelector('.teaching-section-nav');
    if(!outer||!nav)return;
    const enabled=labels.filter(x=>settings[x.key]!==false);
    outer.dataset.showCourses=String(settings.show_teaching_courses!==false);
    outer.dataset.showDevelopment=String(settings.show_teaching_development!==false);
    outer.dataset.showMentorship=String(settings.show_teaching_mentorship!==false);
    nav.querySelectorAll('a[data-target]').forEach(a=>{
      const item=labels.find(x=>x.id===a.dataset.target);
      if(item) a.hidden=settings[item.key]===false;
    });
    nav.hidden=enabled.length===0;
    const hash=decodeURIComponent(location.hash.slice(1));
    const valid=id=>enabled.some(x=>x.id===id);
    const choose=id=>{
      if(!valid(id)) id=enabled[0]?.id||'all';
      outer.dataset.visiblePanel=id;
      nav.querySelectorAll('a[data-target]').forEach(a=>{
        const yes=a.dataset.target===id;
        a.classList.toggle('selected',yes);
        a.setAttribute('aria-current',String(yes));
      });
    };
    nav.querySelectorAll('a[data-target]').forEach(a=>a.addEventListener('click',e=>{
      e.preventDefault();
      const id=a.dataset.target;
      choose(id);
      history.replaceState(null,'',a.getAttribute('href'));
    }));
    choose(valid(hash) ? hash : enabled[0]?.id || 'teaching-courses');
    window.addEventListener('hashchange',()=>{
      const selected=decodeURIComponent(location.hash.slice(1));
      if(valid(selected))choose(selected);
    });
  }
  let applied=false;
  function applyWhenReady(){
    if(applied||!dataReady)return;
    settingsPromise.then(()=>{
      if(applied)return;
      applied=true;
      if(page==='cv')applyCV();else applyTeaching();
    });
  }
  document.addEventListener('editable-content-ready',()=>{
    dataReady=true;
    applyWhenReady();
  });
  // Offline/static fallback if a broken content request prevents ready notification.
  window.addEventListener('load',()=>setTimeout(()=>{
    if(!dataReady){dataReady=true;applyWhenReady();}
  },1500));
})();
