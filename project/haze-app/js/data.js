/* data: live NEA feed, recent-day backfill, sample preview, one-day regional readings */
/* live NEA feed (v2 real-time API, spaced to respect rate limits) */
let chain = Promise.resolve(),
  gapRun = 0;
const api = (p) => {
  const r = chain.then(() => {
    const ac = new AbortController(),
      t = setTimeout(() => ac.abort(), 15000);
    return fetch("https://api-open.data.gov.sg/v2/real-time/api/" + p, {
      signal: ac.signal,
    }).then(
      (x) => {
        clearTimeout(t);
        if (!x.ok) {
          const retryAfter = x.headers.get("Retry-After");
          throw new Error(
            `PSI API HTTP ${x.status}` +
              (retryAfter ? `; Retry-After: ${retryAfter}` : ""),
          );
        }
        return x.json();
      },
      (e) => {
        clearTimeout(t);
        throw e;
      },
    );
  });
  chain = r.catch(() => 0).then(() => sleep(2200));
  return r;
};
const PR = {};
function psiRaw(k) {
  const c = PR[k];
  if (c && Date.now() - c.t < 6e5) return c.p;
  const p = api("psi?date=" + k);
  PR[k] = { t: Date.now(), p };
  p.catch(() => {
    PR[k].t = Date.now() - 57e4;
  });
  return p;
} // a failed request is remembered for 30 seconds so we do not retry straight away
const mx = (r) => {
  if (!r) return null;
  if (typeof r.national == "number") return r.national;
  const v = Object.values(r).filter((x) => typeof x == "number");
  return v.length ? Math.max(...v) : null;
};
function sgtOf(ts) {
  ts = String(ts);
  if (!/(Z|[+-]\d{2}:?\d{2})$/.test(ts))
    return { date: ts.slice(0, 10), h: +ts.slice(11, 13) };
  const t = new Date(ts);
  if (isNaN(t)) return null;
  const s = new Date(t.getTime() + 8 * 36e5).toISOString();
  return { date: s.slice(0, 10), h: +s.slice(11, 13) };
} // reading time as Singapore date and hour, whatever format NEA sends
function dayItems(j, key) {
  const all = ((j.data && j.data.items) || [])
    .map((i) => ({
      t: sgtOf(i.timestamp),
      r: i.readings && i.readings.psi_twenty_four_hourly,
    }))
    .filter((x) => x.t && x.r);
  const own = all.filter((x) => x.t.date == key);
  return own.length ? own : all;
} // this day's readings (falls back to everything returned)
async function liveDay(y, d) {
  const k = iso(y, d);
  const j = await psiRaw(k);
  const items = dayItems(j, k);
  const v = items
    .map((x) => mx(x.r))
    .filter((x) => x != null);
  if (!v.length) return null;
  const max = Math.max(...v);
  const min = Math.min(...v);
  const hourly = parseItems(j, k);
  if (hourly.some((row) => row && row.some((x) => x != null))) {
    try {
      const a = await arch(y);
      if (a) a[k] = hourly;
    } catch (e) {}
    LS.saveRecent(k, max, min, hourly);
  }
  return [min, max];
}
let liveN = 0;
async function live() {
  if (MODE == "sample") {
    LD.live = 0;
    ldShow();
    return;
  }
  if (!liveN++) {
    LD.live = 1;
    ldShow();
  }
  try {
    const r = await liveDay(TY, TD);
    if (r) setVal(TY, TD, r[1], r[0]);
    $("lv").textContent =
      "Live feed last checked " +
      new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Singapore",
        hour: "2-digit",
        minute: "2-digit",
      }) +
      " SGT.";
    drawStrip();
    drawYears();
    if (sel.y == TY && sel.d == TD) select(TY, TD);
    gap();
  } catch (e) {
    $("lv").textContent = "Live feed unavailable (blocked or rate-limited).";
  } finally {
    LD.live = 0;
    ldShow();
    if (DAILY[sel.y][sel.d] == null) select(sel.y, sel.d);
  }
}
async function gap() {
  if (gapRun) return;
  gapRun = 1;
  const N = 90; // Cover the full 90-day strip so past data is always harvested
  HIST.t = HIST.t || {};
  for (let k = 1; k <= N && MODE != "sample"; k++) {
    const t = new Date(TY, sg.getMonth(), sg.getDate() - k),
      y = t.getFullYear(),
      d = Math.round((t - new Date(y, 0, 1)) / 864e5),
      key = iso(y, d);
    if (y < 2014 || !DAILY[y] || DAILY[y][d] != null || HIST.t[key]) continue;
    try {
      LD.gap = 1;
      LD.gn = ` (${k} of ${N})`;
      ldShow();
      const r = await liveDay(y, d);
      HIST.t[key] = 1;
      if (r) setVal(y, d, r[1], r[0]);
      else LS.set();
      drawStrip();
      hl();
    } catch (e) {
      console.warn(`[gap] Skipping ${key}; fetch failed:`, e);
      if (String(e?.message).includes("429")) {
        await sleep(5000);
      }
      continue;
    }
  }
  gapRun = 0;
  LD.gap = 0;
  ldShow();
  drawYears();
}

/* sample preview (add ?sample to the address to see the design without data) */
const R = (s) => {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const EP = {
  2014: [170, 7, 105],
  2015: [250, 32, 235],
  2016: [238, 9, 92],
  2018: [245, 8, 88],
  2019: [255, 26, 158],
  2023: [272, 12, 118],
};
function sample() {
  blank();
  YRS.forEach((y) => {
    const r = R(y * 97);
    DAILY[y] = DAILY[y].map((_, d) => {
      let v = 38 + 14 * Math.exp(-(((d - 225) / 50) ** 2)) + (r() - 0.5) * 14;
      const e = EP[y];
      if (e && d >= e[0] && d < e[0] + e[1]) {
        const t = (d - e[0]) / e[1];
        v = Math.max(
          v,
          v + (e[2] - v) * Math.sin(Math.PI * t) ** 0.8 * (0.75 + 0.25 * r()),
        );
      }
      return y == 2014 && d < 90 ? null : Math.round(Math.max(18, v));
    });
    DMIN[y] = DAILY[y].map((v) =>
      v == null ? null : Math.round(v * (0.55 + 0.2 * r())),
    );
  });
  setMode("sample");
}

/* regional readings for one day: sample, saved archive (past days) or live feed (today) */
const YC = {};
function parseItems(j, key) {
  const H = Array(24).fill(null);
  dayItems(j, key).forEach((x) => {
    const v = REG.map((k) => (typeof x.r[k] == "number" ? x.r[k] : null));
    if (x.t.h >= 0 && x.t.h < 24 && v.some((q) => q != null)) H[x.t.h] = v;
  });
  return H;
}
const arch = (y) =>
  YC[y] ||
  (YC[y] = fetch(`data/${y}.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((data) => {
      const recent = LS.getRecent();
      for (const [k, item] of Object.entries(recent)) {
        if (k.startsWith(y + "-") && item?.h && !data[k]) {
          data[k] = item.h;
        }
      }
      return data;
    })
    .catch(() => {
      const data = {};
      const recent = LS.getRecent();
      for (const [k, item] of Object.entries(recent)) {
        if (k.startsWith(y + "-") && item?.h) {
          data[k] = item.h;
        }
      }
      return data;
    }));
async function loadDay(y, d) {
  const k = iso(y, d);
  const now = y == TY && d == TD;

  if (MODE == "sample") {
    const p = DAILY[y][d];
    if (p == null) return null;

    const r = R(y * 400 + d);

    return Array.from({ length: 24 }, (_, h) =>
      REG.map(() =>
        Math.round(
          Math.max(
            15,
            p *
              (0.85 + 0.3 * Math.sin(((h - 6) / 24) * 6.283)) *
              (0.88 + 0.24 * r()),
          ),
        ),
      ),
    );
  }

  // Prefer saved hourly/regional readings when available.
  if (HOSTED && !now) {
    const saved = (await arch(y))[k];

    if (
      Array.isArray(saved) &&
      saved.some(
        (row) =>
          Array.isArray(row) && row.some((value) => typeof value == "number"),
      )
    ) {
      return saved;
    }
  }

  // If the archive has no readings for this date,
  // try retrieving them directly from NEA.
  try {
    const j = await psiRaw(k);
    const hourly = parseItems(j, k);

    if (
      hourly.some(
        (row) => Array.isArray(row) && row.some((value) => value != null),
      )
    ) {
      try {
        const a = await arch(y);
        if (a) a[k] = hourly;
      } catch (e) {}

      // If DAILY has no reading for this day, derive it from the hourly data
      const items = dayItems(j, k);
      const v = items.map((x) => mx(x.r)).filter((x) => x != null);
      if (v.length) {
        const max = Math.max(...v);
        const min = Math.min(...v);
        setVal(y, d, max, min, hourly);
      } else {
        LS.saveRecent(k, null, null, hourly);
      }

      return hourly;
    }
  } catch (e) {
    // NEA may not have historical readings available.
  }

  // Fall back to the saved archive if NEA cannot supply the day.
  if (HOSTED) return (await arch(y))[k] || null;

  return null;
}
