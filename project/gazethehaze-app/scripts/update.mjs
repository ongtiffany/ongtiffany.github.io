// Keeps data/ up to date from NEA via data.gov.sg. Node 20+, no dependencies.
// First run builds the full history (2014 onward); later runs only add recent days.
import fs from 'node:fs/promises';
const ID = 'd_b4cf557f8750260d229c49fd768e11ed', BASE = 'https://api-open.data.gov.sg';
const REG = ['north', 'south', 'east', 'west', 'central'];          // order used in every data file
const KEY = process.env.DATA_GOV_SG_API_KEY, HDR = KEY ? { 'x-api-key': KEY } : {};
const FAST = !!process.env.HG_FAST, sleep = ms => new Promise(r => setTimeout(r, FAST ? 0 : ms));

async function get(u, json = true) {
  for (let i = 1; i <= 6; i++) {
    const r = await fetch(u, { headers: HDR });
    if (r.ok) return json ? r.json() : r.text();
    if (r.status == 429 || r.status >= 500) { await sleep(15000 * i); continue; }
    throw new Error(`${r.status} ${u}`);
  }
  throw new Error('Gave up: ' + u);
}

const Y = {};                                                          // year -> { 'YYYY-MM-DD': [24 x [n,s,e,w,c] | null] }
await fs.mkdir('data', { recursive: true });
for (const f of await fs.readdir('data'))
  if (/^\d{4}\.json$/.test(f)) Y[f.slice(0, 4)] = JSON.parse(await fs.readFile('data/' + f, 'utf8'));
const put = (d, h, v) => { ((Y[d.slice(0, 4)] ??= {})[d] ??= Array(24).fill(null))[h] = v; };
const dates = () => Object.values(Y).flatMap(o => Object.keys(o)).sort();

function csv(text) {                                                    // tolerant: finds region columns by header name
  const rows = text.split(/\r?\n/).map(l => l.split(',').map(x => x.replace(/"/g, '').trim()));
  const hd = rows[0].map(x => x.toLowerCase()), col = REG.map(r => hd.findIndex(h => h.includes(r)));
  if (col.some(i => i < 0)) throw new Error('Unrecognised CSV header: ' + rows[0]);
  let n = 0;
  for (const r of rows.slice(1)) {
    const m = r.join(' ').match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2})/);
    if (!m) continue;
    const v = col.map(i => { const x = parseFloat(r[i]); return isFinite(x) ? x : null; });
    if (v.every(x => x == null)) continue;
    put(`${m[1]}-${m[2]}-${m[3]}`, +m[4], v); n++;
  }
  return n;
}

async function bootstrap() {
  try { return await fs.readFile('data/source/Historical24hrPSI.csv', 'utf8'); } catch {}   // optional manual file
  await get(`${BASE}/v1/public/api/datasets/${ID}/initiate-download`).catch(() => {});
  for (let i = 0; i < 30; i++) {
    const j = await get(`${BASE}/v1/public/api/datasets/${ID}/poll-download`);
    if (j.code === 0 && j.data?.url) return (await fetch(j.data.url)).text();
    await sleep(10000);
  }
  throw new Error('Bulk download was not ready in time');
}

// Write one hourly file per year, plus small daily summaries the page loads first
async function save() {
  const daily = {}, dmin = {};
  for (const y of Object.keys(Y).sort()) {
    const o = Y[y];
    await fs.writeFile(`data/${y}.json`, JSON.stringify(Object.fromEntries(Object.entries(o).sort())));
    const a = Array(y % 4 ? 365 : 366).fill(null), m = [...a];
    for (const [d, hrs] of Object.entries(o)) {
      const v = hrs.filter(Boolean).map(h => Math.max(...h.filter(x => x != null)));   // highest region each hour
      if (v.length) { const i = Math.round((Date.parse(d) - Date.parse(y + '-01-01')) / 864e5); a[i] = Math.max(...v); m[i] = Math.min(...v); }
    }
    daily[y] = a; dmin[y] = m;
  }
  await fs.writeFile('data/daily.json', JSON.stringify(daily));
  await fs.writeFile('data/daily-min.json', JSON.stringify(dmin));
  await fs.writeFile('data/meta.json', JSON.stringify({ updated: new Date().toISOString(), last: dates().pop() ?? null }));
}

if (!dates().length) {
  console.log('No data yet: building history from the NEA dataset…');
  const n = csv(await bootstrap());
  if (!n) throw new Error('No rows parsed from the history CSV');
  console.log(n, 'hourly rows loaded');
  await save();   // keep the history even if the live fill below is interrupted
}

// Fill recent days (and any gaps in the last 60 days) from the real-time API
const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const add = (s, n) => new Date(Date.parse(s) + n * 864e5).toISOString().slice(0, 10);
const all = dates(), last = all.length ? all[all.length - 1] : '2014-03-31', todo = new Set();
for (let d = add(last, -2); d <= today && todo.size < 400; d = add(d, 1)) todo.add(d);
for (let k = 0; k < 60; k++) { const d = add(today, -k); if (!Y[d.slice(0, 4)]?.[d]) todo.add(d); }
if (process.env.SKIP_LIVE) console.log('SKIP_LIVE set: not contacting the live API.');
for (const d of process.env.SKIP_LIVE ? [] : [...todo].sort()) {
  try {
    let tok, n = 0;
    do {
      const j = await get(`${BASE}/v2/real-time/api/psi?date=${d}` + (tok ? '&paginationToken=' + tok : ''));
      for (const it of j.data?.items ?? []) {
        const h = +it.timestamp.slice(11, 13), r = it.readings?.psi_twenty_four_hourly;
        if (!r || !(h >= 0 && h < 24)) continue;
        const v = REG.map(k => typeof r[k] == 'number' ? r[k] : null);
        if (v.some(x => x != null)) { put(d, h, v); n++; }
      }
      tok = j.data?.paginationToken;
    } while (tok);
    console.log(d, n, 'hours');
  } catch (e) { console.warn(d, e.message); }
  await sleep(2200);
}

await save();
console.log('Done. Latest day on file:', dates().pop());
