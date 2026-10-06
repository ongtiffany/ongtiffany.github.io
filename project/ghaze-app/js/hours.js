/* hours: regional map and hourly table */
/* map of the five regions (previous angular shapes, a few extra points per region, stretched taller) */
const RP0={
 west:'14,120 28,100 44,84 72,76 100,72 106,86 112,100 116,120 120,140 115,159 110,178 81,170 52,162',
 north:'100,72 113,63 130,50 165,43 200,40 232,44 262,52 257,70 250,90 222,95 190,100 150,101 112,100 106,86',
 central:'112,100 150,101 190,100 222,95 250,90 257,104 262,118 250,134 236,150 205,152 170,150 145,146 120,140 116,120',
 east:'250,90 257,70 262,52 300,78 328,83 356,92 384,100 408,112 402,123 392,130 330,134 312,146 290,156 276,138 262,118 257,104',
 south:'120,140 145,146 170,150 205,152 236,150 250,134 262,118 276,138 290,156 263,171 236,182 203,185 170,186 140,184 110,178 115,159'};
const Ym=y=>{const P=[[40,40],[100,125],[150,200],[186,261]];if(y<=40)return y;for(let i=1;i<P.length;i++)if(y<=P[i][0]){const a=P[i-1],b=P[i];return a[1]+(y-a[0])*(b[1]-a[1])/(b[0]-a[0])}return 261+(y-186)};
const RP=Object.fromEntries(Object.entries(RP0).map(([k,v])=>[k,v.split(' ').map(p=>{const[x,y]=p.split(',').map(Number);return x+','+Ym(y).toFixed(1)}).join(' ')]));
const LB={north:[182,Ym(80)],west:[66,Ym(128)],central:[190,Ym(127)],east:[330,Ym(118)],south:[196,Ym(172)]};
$('map').innerHTML='<defs>'+BANDS.map((b,i)=>`<pattern id="pt${i}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${b.c}"/><g fill="${dotc(GL[i])}"><circle cx="0" cy="0" r="1"/><circle cx="4" cy="0" r="1"/><circle cx="0" cy="4" r="1"/><circle cx="4" cy="4" r="1"/></g></pattern>`).join('')+'</defs>'+
 REG.map(k=>`<polygon data-r="${k}" id="p-${k}" points="${RP[k]}" fill="#e6e6e6" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`).join('')+
 REG.map(k=>{const[x,y]=LB[k];return`<g data-r="${k}"><text class="mt" id="m-${k}" x="${x}" y="${(y-19).toFixed(1)}"></text><text id="t-${k}" x="${x}" y="${y.toFixed(1)}" font-size="20" style="font-family:var(--fd)">–</text><text class="nm" x="${x}" y="${(y+11).toFixed(1)}">${NAMES[k]}</text></g>`}).join('');


const ROWS=[['North','north',0],['South','south',1],['East','east',2],['West','west',3],['Central','central',4],['Overall','all',-1]],PARTS=['Night','Morning','Afternoon','Evening'];
const SKY=[['#3a3a3a','#3a3a3a'],['#3a3a3a','#d0d0d0'],['#d0d0d0','#d0d0d0'],['#d0d0d0','#3a3a3a']];
const nat=v=>{const f=v?v.filter(x=>x!=null):[];return f.length?Math.max(...f):null};
let DAYD=null,selH=null,selR=null;   // selH: chosen hour (null = daily average); selR: highlighted region row

/* hourly table: one column per hour, one row per region, Overall last */
function drawHours(){
 const dim=(i,r)=>(selR&&selR!=r)||(selH!=null&&selH!=i);
 const cell=(i,v,b,r,o)=>`<button class="hc${b==null?' n':''}${dim(i,r)?' dm':''}${o?' ov':''}" data-h="${i}" data-r="${r}" style="${b==null?'':SW(b)}">${v==null?'–':v}</button>`;
 let h='<i></i>'+PARTS.map((n,i)=>`<span class="pt" style="grid-column:span 6;background-image:linear-gradient(90deg,${SKY[i][0]},${SKY[i][1]})">${n}</span>`).join('')+'<span class="rl all">Time</span>'+Array.from({length:24},(_,i)=>`<button class="hh${i==selH?' on':''}" data-h="${i}">${z2(i)}</button>`).join('');
 ROWS.forEach(([lab,key,ix])=>{const o=key=='all';h+=`<button class="rl${selR==key?' on':''}${o?' all ov':''}" data-r="${key}">${lab}</button>`+Array.from({length:24},(_,i)=>{const r=DAYD&&DAYD[i],v=ix<0?nat(r):(r?r[ix]:null);return cell(i,v,v==null?null:bi(v),key,o)}).join('')});
 $('hrs').innerHTML=h}

/* map: daily average per region, or the chosen hour */
const avg=i=>{if(!DAYD)return null;const v=DAYD.map(r=>r?r[i]:null).filter(x=>x!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
function drawMap(){const v=DAYD&&selH!=null?DAYD[selH]:null;
 REG.forEach((k,i)=>{const col=DAYD?DAYD.map(r=>r?r[i]:null).filter(q=>q!=null):[],x=selH==null?avg(i):(v?v[i]:null),b=x==null?null:bi(x),t=$('t-'+k),m=$('m-'+k);
  $('p-'+k).setAttribute('fill',b==null?'#e6e6e6':`url(#pt${b})`);t.textContent=x==null?'–':x;m.textContent=x!=null&&col.length?Math.min(...col)+'-':''});
 document.querySelectorAll('#map [data-r]').forEach(n=>n.classList.toggle('dm',!!selR&&selR!=n.dataset.r));
 let last=-1;if(DAYD&&sel.y==TY&&sel.d==TD)for(let h=23;h>=0;h--)if(DAYD[h]){last=h;break}
 $('mcap').textContent=!DAYD?'No regional readings for this day.':selH==null?'PSI levels by region: daily average':`PSI levels by region at ${z2(selH)}:00${selH==last?' (latest reading)':''}`;
 $('rs').setAttribute('aria-pressed',selH==null);$('rs').classList.toggle('off',selH!=null)}

/* selection: an hour clears any highlighted row; a region (table label or map) highlights its row */
const redraw=()=>{drawHours();drawMap()};
const pickHour=h=>{selH=selH==h?null:h;selR=null;redraw()};
const pickRegion=k=>{selR=selR==k?null:k;redraw()};
const resetHM=()=>{selH=null;selR=null;redraw()};
$('map').onclick=e=>{const g=e.target.closest('[data-r]');if(g)pickRegion(g.dataset.r)};
$('hrs').onclick=e=>{const l=e.target.closest('.rl[data-r]');if(l){if(l.dataset.r!='all')pickRegion(l.dataset.r);return}
 const b=e.target.closest('[data-h]');if(b&&DAYD&&DAYD[+b.dataset.h])pickHour(+b.dataset.h)};
$('rs').onclick=resetHM;
function loadDay2(y,d){DAYD=null;selH=null;drawHours();drawMap();$('mcap').textContent='Loading hourly readings…';LD.day=1;ldShow();
 loadDay(y,d).then(D=>{if(sel.y!=y||sel.d!=d)return;LD.day=0;ldShow();DAYD=D;selH=null;redraw()}).catch(()=>{if(sel.y==y&&sel.d==d){LD.day=0;ldShow();$('mcap').textContent='Hourly readings are unavailable right now.'}})}
