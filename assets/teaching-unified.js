/* A self-contained view of all teaching records from Pages CMS.
   Loads alongside the existing content.js without changing its behavior on any other page.
   The stored category values remain untouched for future CMS edits. */
(()=>{
  if(document.body.dataset.page!=='teaching')return;
  const host=document.querySelector('#teaching-courses > .container');
  if(!host)return;
  const escapeHTML=v=>String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const courseLevel=x=>{
    if(x.category==='Teaching Development')return'development';
    const m=String(x.title||'').match(/\b(?:CIV\s*E|ENV\s*E|[A-Z]{2,5})\s*(\d{3})\b/i);
    if(m)return Number(m[1])>=500?'graduate':'undergraduate';
    return /starting|upcoming/i.test(x.date_label||'')?'upcoming':'course';
  };
  const description=x=>{
    let d=String(x.description||'').trim();
    const title=String(x.title||'');
    if(x.category==='Teaching Assistant'&&!/teaching assistant/i.test(d)) d=('Role: Graduate teaching assistant. '+d).trim();
    if(x.category==='Course Instruction'&&/\bCourse Instructor\b/i.test(title)&&!/course instructor/i.test(d))d=('Role: Course instructor. '+d).trim();
    if(x.category==='Course Instruction'&&/Assistant Lecturer/i.test(title)&&!/Assistant Lecturer/i.test(d))d=('Role: Assistant lecturer. '+d).trim();
    return d;
  };
  const renderCard=x=>`<article class="timeline-entry" data-course-level="${courseLevel(x)}" data-teaching-category="${escapeHTML(x.category||'')}">`+
    `<div class="timeline-date">${escapeHTML(x.date_label||'')}</div>`+
    `<div class="timeline-body"><h3>${escapeHTML(x.title||'')}</h3>`+
    `<div class="timeline-detail"><p>${escapeHTML(x.organization||'')}</p><p>${escapeHTML(description(x))}</p></div></div></article>`;
  const render=arr=>{
    if(!Array.isArray(arr))return;
    const data=arr.filter(x=>x&&x.visible!==false).sort((a,b)=>(Number(a.order??999)-Number(b.order??999)));
    const sectionHeading=host.querySelector(':scope > .section-heading');
    host.querySelectorAll(':scope > .timeline-entry').forEach(x=>x.remove());
    sectionHeading.insertAdjacentHTML('afterend',data.filter(x=>x.category!=='Teaching Development').map(renderCard).join(''));
    const development=host.querySelector('.teaching-extra-grid');
    if(development) development.innerHTML=data.filter(x=>x.category==='Teaching Development').map(renderCard).join('');
    const devSection=host.querySelector('.teaching-extra');
    if(devSection)devSection.hidden=!development?.children.length;
  };
  // A single, authoritative renderer is shared with the main CMS loader.
  // This also fetches independently, so neither script ordering nor a missed
  // editable-content-ready event can leave just the two instructor cards.
  window.renderUnifiedTeaching = render;
  fetch('../content/teaching.json', {cache:'no-cache'})
    .then(response => {if(!response.ok) throw Error(`Teaching data: ${response.status}`);return response.json();})
    .then(render)
    .catch(err => console.warn('Preserving complete static teaching fallback:', err));
  // The shipped HTML already contains all 9 course entries and 2 development
  // entries. If CMS loading fails, none of that fallback is removed.
})();
