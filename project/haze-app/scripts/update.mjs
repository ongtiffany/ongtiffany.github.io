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

const z2 = n => String(n).padStart(2, '0');
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function stamp(str) {                                                   // -> [year, month, day, hour] or null; accepts ISO, day-first, and "1-Apr-14" styles
  let m;
  const pm = /\bpm\b/i.test(str), am = /\bam\b/i.test(str);
  const hr = x => { let v = x == null ? 0 : +x; if (pm && v < 12) v += 12; if (am && v == 12) v = 0; return v; };
  if ((m = str.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[T\s,]+(\d{1,2}))?/))) return [+m[1], +m[2], +m[3], hr(m[4])];
  if ((m = str.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:[T\s,]+(\d{1,2}))?/))) return [+m[3], +m[2], +m[1], hr(m[4])];
  if ((m = str.match(/(\d{1,2})[-\s]([A-Za-z]{3})[a-z]*[-\s,]*(\d{2,4})(?:[T\s,]+(\d{1,2}))?/)) && MON[m[2].toLowerCase()])
    return [m[3].length == 2 ? 2000 + +m[3] : +m[3], MON[m[2].toLowerCase()], +m[1], hr(m[4])];
  return null;
}
const cells = l => { const o = []; let c = '', q = false; for (const ch of l) { if (ch == '"') q = !q; else if (ch == ',' && !q) { o.push(c); c = ''; } else c += ch; } o.push(c); return o.map(x => x.trim()); };

function csv(text, name) {                                              // finds the region columns by header name and the date in any cell
  const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim()).map(cells);
  const hd = rows[0].map(x => x.toLowerCase()), col = REG.map(r => hd.findIndex(h => h.includes(r)));
  console.log(`[${name}] header: ${rows[0].join(' | ')}`);
  if (col.some(i => i < 0)) throw new Error(`[${name}] could not find north/south/east/west/central columns in the header row`);
  let n = 0, skipped = 0; const bad = [], years = {};
  for (const r of rows.slice(1)) {
    let t = null;
    for (const c of r) if ((t = stamp(c))) break;
    const v = col.map(i => { const x = parseFloat(r[i]); return isFinite(x) ? x : null; });
    if (!t || v.every(x => x == null) || t[1] < 1 || t[1] > 12 || t[2] < 1 || t[2] > 31 || t[3] > 23) { skipped++; if (bad.length < 3) bad.push(r.join(',')); continue; }
    put(`${t[0]}-${z2(t[1])}-${z2(t[2])}`, t[3], v); n++; years[t[0]] = (years[t[0]] || 0) + 1;
  }
  console.log(`[${name}] ${n} rows read, ${skipped} skipped. Rows per year:`, years);
  if (bad.length) console.log(`[${name}] example skipped rows:`, bad);
  return n;
}

async function ingestFiles() {                                          // every .csv in data/source is read and merged (one full file, or one per year)
  const dir = 'data/source', files = (await fs.readdir(dir).catch(() => [])).filter(f => /\.csv$/i.test(f)).sort();
  let n = 0;
  for (const f of files) n += csv(await fs.readFile(`${dir}/${f}`, 'utf8'), f);
  return { files: files.length, n };
}

async function download() {
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

const src = await ingestFiles();
if (src.files) {
  if (!src.n) throw new Error('Found CSV files in data/source but could not read any rows from them. See the messages above.');
  await save();
} else if (!dates().length) {
  console.log('No data yet: downloading the history from NEA…');
  const n = csv(await download(), 'download');
  if (!n) throw new Error('No rows parsed from the downloaded history');
  await save();   // keep the history even if the live fill below is interrupted
}
console.log('Years on file:', Object.keys(Y).sort().join(', '));

// Fill recent days (and any gaps in the last 60 days) from the real-time API
const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const add = (s, n) => new Date(Date.parse(s) + n * 864e5).toISOString().slice(0, 10);
const all = dates(), last = all.length ? all[all.length - 1] : '2014-03-31', todo = new Set();
const floor = add(today, -400), from = add(last, -2) < floor ? floor : add(last, -2);   // never walk forward from an old date
for (let d = from; d <= today; d = add(d, 1)) todo.add(d);
for (let k = 0; k < 60; k++) { const d = add(today, -k); if (!Y[d.slice(0, 4)]?.[d]) todo.add(d); }
if (process.env.SKIP_LIVE) console.log('SKIP_LIVE set: not contacting the live API.');
// An item's timestamp may carry an offset ("+08:00"), be UTC ("Z"), or have none. Convert to Singapore date and hour.
function sgtOf(ts) {
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(ts)) return { date: ts.slice(0, 10), h: +ts.slice(11, 13) };
  const t = new Date(ts);
  if (isNaN(t)) return null;
  const s = new Date(t.getTime() + 8 * 3600e3).toISOString();
  return { date: s.slice(0, 10), h: +s.slice(11, 13) };
}
const failed = [];
if (process.env.SKIP_LIVE) console.log('SKIP_LIVE set: not contacting the live API.');
for (const d of process.env.SKIP_LIVE ? [] : [...todo].sort()) {
  try {
    let tok, n = 0;
    do {
      const j = await get(`${BASE}/v2/real-time/api/psi?date=${d}` + (tok ? '&paginationToken=' + tok : ''));
      for (const it of j.data?.items ?? []) {
        const t = sgtOf(String(it.timestamp)), r = it.readings?.psi_twenty_four_hourly;
        if (!t || !r || !(t.h >= 0 && t.h < 24)) continue;
        const v = REG.map(k => typeof r[k] == 'number' ? r[k] : null);
        if (v.some(x => x != null)) { put(t.date, t.h, v); n++; }      // stored under the reading's own Singapore date
      }
      tok = j.data?.paginationToken;
    } while (tok);
    console.log(d, n, 'hours');
    if (!n) failed.push(d);
  } catch (e) { console.warn(d, e.message); failed.push(d); }
  await sleep(2200);
}

await save();
const have = d => (Y[d.slice(0, 4)]?.[d] ?? []).some(Boolean);
const recentMissing = [add(today, -1), today].filter(d => !have(d));
if (!process.env.SKIP_LIVE && failed.length)
  console.log(`::warning::NEA returned nothing for ${failed.length} day(s): ${failed.slice(-8).join(', ')}${failed.length > 8 ? ' …' : ''}. This is usually a rate limit on shared GitHub IP addresses. Add a free DATA_GOV_SG_API_KEY secret (see README).`);
if (!process.env.SKIP_LIVE && recentMissing.length)
  console.log(`::warning::No readings saved for ${recentMissing.join(' and ')}. The page will try to fill recent days from NEA live.`);
console.log('Latest days on file:', dates().slice(-3).join(', '));
console.log('Done.');
