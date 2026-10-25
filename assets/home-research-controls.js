/* Homepage statistics and research-interest CMS controls.
   Runs AFTER the original editable-content loader, never overwrites it. */
(()=>{
  'use strict';
  const page=document.body.dataset.page;
  if(page!=='home'&&page!=='research')return;
  const root=page==='home'?'./':'../';
  const getJSON=async(name)=>{
    try {const r=await fetch(`${root}content/${name}.json`,{cache:'no-cache'});
      return r.ok?await r.json():null;
    } catch(error){console.warn(`Optional CMS setting ${name}:`,error);return null;}
  };
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sortedVisible=arr=>Array.isArray(arr)?arr.filter(x=>x&&x.visible!==false)
    .sort((a,b)=>Number(a.order??999)-Number(b.order??999)):null;
  // Links may be either safe relative URLs, anchors or regular HTTPS links.
  const safeHref=value=>{
    if(!value)return '';
    try {const u=new URL(String(value),document.baseURI);
      return ['https:','http:'].includes(u.protocol)?u.href:'';
    }catch{return '';}
  };
  async function updateHome(){
    const stats=document.querySelector('.stats-academic');
    if(!stats)return;
    const [sections,items]=await Promise.all([getJSON('sections'),getJSON('home_stats')]);
    // The default is OFF. Existing sections.json versions with no setting are
    // intentionally treated as disabled until turned on via Pages CMS.
    const enabled=sections?.show_home_stats===true;
    const cards=sortedVisible(items);
    if(cards){
      stats.innerHTML=cards.map(x=>{
        const href=safeHref(x.url), tag=href?'a':'div';
        const attrs=href?` href="${esc(href)}" aria-label="View ${esc(x.label)}"`:'';
        return `<${tag} class="stat cardlike${href?' stat-link':''}"${attrs}>`+
          `<div class="stat-num">${esc(x.number)}</div><div class="stat-label">${esc(x.label)}</div></${tag}>`;
      }).join('');
    }
    const show=enabled && !!stats.children.length;
    stats.hidden=!show;
    document.body.classList.toggle('home-stats-hidden',!show);
  }
  async function updateResearch(){
    const host=document.querySelector('.research-hero-interests');
    if(!host)return;
    const [sections,items]=await Promise.all([getJSON('sections'),getJSON('research_interests')]);
    const bubbles=sortedVisible(items);
    if(bubbles)host.innerHTML=bubbles.map(x=>`<span class="pill">${esc(x.text)}</span>`).join('');
    const show=sections?.show_research_interests!==false && !!host.children.length;
    host.hidden=!show;
    document.body.classList.toggle('research-interests-hidden',!show);
  }
  let started=false;
  function init(){if(started)return;started=true;
    if(page==='home')updateHome();else updateResearch();}
  document.addEventListener('editable-content-ready',init,{once:true});
  // content.js dispatches the ready event even when a CMS JSON is missing.
  // Do not rely on a timeout that could race and be overwritten by its updates.
})();
