/* ui: accordions, dialogs, scroll hints, start-up */
/* accordions and dialogs */
function tog(b,p){const o=$(p).hidden;$(p).hidden=!o;$(b).setAttribute('aria-expanded',o);$(b).querySelector('.ch').textContent=o?'▴':'▾'}
$('lt').onclick=()=>tog('lt','lp');$('dsb').onclick=()=>tog('dsb','dsp');$('gt').onclick=()=>tog('gt','gp');$('prof').onchange=()=>info();
['dlg','info','dpd'].forEach(i=>$(i).addEventListener('click',e=>{if(e.target==$(i))$(i).close()}));
$('q1').onerror=function(){this.hidden=true;const m=document.createElement('div');m.className='miss';m.textContent='QR code coming soon.';this.after(m)};
$('sup').onclick=()=>$('dlg').showModal();$('abt').onclick=()=>showInfo('About the project','Gaze the Haze turns NEA\'s open PSI readings and Singapore\'s newspaper archives into one picture of the haze, today and since 1961. Today\'s numbers update live; earlier years are a saved copy of NEA\'s dataset that refreshes once a day. It is a personal project, free to use, and not official health advice: check nea.gov.sg for that. Cause tags are placeholders for now.');$('dx').onclick=()=>$('dlg').close();$('ix').onclick=()=>$('info').close();
let IA=null;$('ia').onclick=()=>{$('info').close();if(IA)IA()};
function showInfo(t,b,al,fn){$('ih').textContent=t;$('ib').innerHTML=b;IA=fn||null;$('ia').hidden=!al;if(al)$('ia').textContent=al;$('info').showModal()}

/* scroll hints: edge fades and arrow buttons on sideways-scrolling rows */
function scroller(el){const w=document.createElement('div');w.className='sw';el.parentNode.insertBefore(w,el);w.appendChild(el);
 w.insertAdjacentHTML('beforeend','<button class="sb l" aria-label="Scroll left" hidden>‹</button><button class="sb r" aria-label="Scroll right" hidden>›</button>');
 const L=w.querySelector('.l'),Rr=w.querySelector('.r'),u=()=>{const l=el.scrollLeft>4,r=el.scrollLeft<el.scrollWidth-el.clientWidth-4;L.hidden=!l;Rr.hidden=!r;w.classList.toggle('fl',l);w.classList.toggle('fr',r)};
 el.addEventListener('scroll',u,{passive:true});L.onclick=()=>el.scrollBy({left:-el.clientWidth*.7,behavior:'smooth'});Rr.onclick=()=>el.scrollBy({left:el.clientWidth*.7,behavior:'smooth'});
 new MutationObserver(u).observe(el,{childList:true,subtree:true});if(window.ResizeObserver)new ResizeObserver(u).observe(el);addEventListener('resize',u);setTimeout(u,0)}
[$('strip'),$('sc'),document.querySelector('.hgw')].forEach(scroller);

function renderAll(){drawStrip();drawYears();select(sel.y,sel.d)}
async function boot(){HIST=LS.get();ldShow();
 if(/[?&]sample/.test(location.search)){sample();LD.arch=0;LD.live=0;ldShow();renderAll();return}
 psiRaw(iso(TY,TD)).catch(()=>{});   // start today's live request while the saved data loads
 try{const[a,b,c]=await Promise.all([fetch('data/daily.json'),fetch('data/daily-min.json'),fetch('data/meta.json')]);
  if(a.ok){HIST=await a.json();HOSTED=1;if(b.ok)HIST.mn=await b.json();try{const m=await c.json();$('ar').textContent='Saved archive last updated '+new Date(m.updated).toLocaleString('en-GB',{timeZone:'Asia/Singapore',dateStyle:'medium',timeStyle:'short'})+' SGT.'}catch(e){}}}catch(e){}
 applyHist();LD.arch=0;ldShow();renderAll();live();setInterval(live,9e5)}
boot();

