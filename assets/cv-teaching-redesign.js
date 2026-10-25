/* Optional enhancements; preserve the Pages CMS teaching dataset and existing content renderer. */
(()=>{
  function markCourseLevels(){
    if(document.body.dataset.page!=='teaching')return;
    document.querySelectorAll('#teaching-courses .timeline-entry, #teaching-assistant .timeline-entry').forEach(card=>{
      const title=card.querySelector('.timeline-body h3')?.textContent||'';
      const number=title.match(/\b(?:CIV\s*E|ENV\s*E|[A-Z]{2,5})\s*(\d{3})\b/i);
      if(number){
        const level=Number(number[1])>=500 ? 'graduate' : 'undergraduate';
        card.dataset.courseLevel=level;
      }else if(/starting|upcoming/i.test(card.querySelector('.timeline-date')?.textContent||'')){
        card.dataset.courseLevel='upcoming';
      } else {delete card.dataset.courseLevel;}
    });
  }
  markCourseLevels();
  document.addEventListener('editable-content-ready',markCourseLevels);
})();
