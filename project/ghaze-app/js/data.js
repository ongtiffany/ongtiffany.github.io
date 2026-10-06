/* data: live NEA feed, recent-day backfill, sample preview, one-day regional readings */
/* live NEA feed (v2 real-time API, spaced to respect rate limits) */
let chain=Promise.resolve(),gapRun=0;
const api=p=>{const r=chain.then(()=>{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),15000);return fetch('https://api-open.data.gov.sg/v2/real-time/api/'+p,{signal:ac.signal}).then(x=>{clearTimeout(t);if(!x.ok)throw 0;return x.json()},e=>{clearTimeout(t);throw e})});chain=r.catch(()=>0).then(()=>sleep(2200));return r};
const PR={};function psiRaw(k){const c=PR[k];if(c&&Date.now()-c.t<6e5)return c.p;const p=api('psi?date='+k);PR[k]={t:Date.now(),p};p.catch(()=>{PR[k].t=Date.now()-57e4});return p}   // a failed request is remembered for 30 seconds so we do not retry straight away
const mx=r=>{if(!r)return null;if(typeof r.national=='number')return r.national;const v=Object.values(r).filter(x=>typeof x=='number');return v.length?Math.max(...v):null};
async function liveDay(y,d){const j=await psiRaw(iso(y,d)),v=((j.data&&j.data.items)||[]).map(i=>mx(i.readings&&i.readings.psi_twenty_four_hourly)).filter(x=>x!=null);return v.length?[Math.min(...v),Math.max(...v)]:null}
let liveN=0;
async function live(){if(MODE=='sample'){LD.live=0;ldShow();return}if(!liveN++){LD.live=1;ldShow()}try{const r=await liveDay(TY,TD);if(r)setVal(TY,TD,r[1],r[0]);
 $('lv').textContent='Live feed last checked '+new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Singapore',hour:'2-digit',minute:'2-digit'})+' SGT.';
 drawStrip();drawYears();if(sel.y==TY&&sel.d==TD)select(TY,TD);gap()}catch(e){$('lv').textContent='Live feed unavailable (blocked or rate-limited).'}finally{LD.live=0;ldShow();if(DAILY[sel.y][sel.d]==null)select(sel.y,sel.d)}}
async function gap(){if(gapRun||HOSTED)return;gapRun=1;HIST.t=HIST.t||{};
 for(let k=1;k<=45&&MODE!='sample';k++){const t=new Date(TY,sg.getMonth(),sg.getDate()-k),y=t.getFullYear(),d=Math.round((t-new Date(y,0,1))/864e5),key=iso(y,d);
  if(y<2014||!DAILY[y]||DAILY[y][d]!=null||HIST.t[key])continue;
  try{LD.gap=1;LD.gn=` (${k} of 45)`;ldShow();const r=await liveDay(y,d);HIST.t[key]=1;if(r)setVal(y,d,r[1],r[0]);else LS.set();drawStrip();hl()}catch(e){break}}
 gapRun=0;LD.gap=0;ldShow();drawYears()}

/* sample preview (add ?sample to the address to see the design without data) */
const R=s=>{let a=s>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const EP={2014:[170,7,105],2015:[250,32,235],2016:[238,9,92],2018:[245,8,88],2019:[255,26,158],2023:[272,12,118]};
function sample(){blank();YRS.forEach(y=>{const r=R(y*97);DAILY[y]=DAILY[y].map((_,d)=>{let v=38+14*Math.exp(-(((d-225)/50)**2))+(r()-.5)*14;const e=EP[y];
 if(e&&d>=e[0]&&d<e[0]+e[1]){const t=(d-e[0])/e[1];v=Math.max(v,v+(e[2]-v)*Math.sin(Math.PI*t)**.8*(.75+.25*r()))}return y==2014&&d<90?null:Math.round(Math.max(18,v))});
 DMIN[y]=DAILY[y].map(v=>v==null?null:Math.round(v*(.55+.2*r())))});setMode('sample')}


/* regional readings for one day: sample, saved archive (past days) or live feed (today) */
const YC={};
function parseItems(j){const H=Array(24).fill(null);((j.data&&j.data.items)||[]).forEach(i=>{const h=+i.timestamp.slice(11,13),r=i.readings&&i.readings.psi_twenty_four_hourly;
 if(r&&h>=0&&h<24){const v=REG.map(k=>typeof r[k]=='number'?r[k]:null);if(v.some(x=>x!=null))H[h]=v}});return H}
const arch=y=>YC[y]||(YC[y]=fetch(`data/${y}.json`).then(r=>r.ok?r.json():{}).catch(()=>({})));
async function loadDay(y,d){const k=iso(y,d),now=y==TY&&d==TD;
 if(MODE=='sample'){const p=DAILY[y][d];if(p==null)return null;const r=R(y*400+d);return Array.from({length:24},(_,h)=>REG.map(()=>Math.round(Math.max(15,p*(.85+.3*Math.sin((h-6)/24*6.283))*(.88+.24*r())))))}
 if(HOSTED&&!now)return(await arch(y))[k]||null;
 try{return parseItems(await psiRaw(k))}catch(e){return HOSTED?(await arch(y))[k]||null:null}}
