/* core: constants, shades and texture, dates, shared state, saved-data store, loading messages */
const $ = (i) => document.getElementById(i),
  sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BANDS = [
  { n: "Good", m: 50, c: "#f2f2f2" },
  { n: "Moderate", m: 100, c: "#dadada" },
  { n: "Unhealthy", m: 200, c: "#bebebe" },
  { n: "Severe", m: 300, c: "#a0a0a0" },
  { n: "Hazardous", m: 1e4, c: "#828282" },
];
const bi = (p) => BANDS.findIndex((b) => p <= b.m);
/* texture: two staggered fine dot layers, each 15% darker than the shade they sit on */
const GL = [242, 218, 190, 160, 130],
  dotc = (g) => {
    const d = Math.round(g - 25.5);
    return `rgb(${d},${d},${d})`;
  },
  TXG = (g) => {
    const c = dotc(g);
    return `radial-gradient(${c} 1px,transparent 1px) 2px 2px/4px 4px,radial-gradient(${c} 1px,transparent 1px) 2px 2px/4px 4px`;
  };
const SW = (i) => `background:${TXG(GL[i])},${BANDS[i].c}`,
  TC = (b) => "#111";
const sg = new Date(
  new Date().toLocaleString("en-US", { timeZone: "Asia/Singapore" }),
);
const TY = sg.getFullYear(),
  TD = Math.round(
    (new Date(TY, sg.getMonth(), sg.getDate()) - new Date(TY, 0, 1)) / 864e5,
  );
const YRS = [];
for (let y = 2014; y <= TY; y++) YRS.push(y);
const ylen = (y) => (y == TY ? TD + 1 : y % 4 ? 365 : 366),
  dt = (y, d) => new Date(y, 0, 1 + d),
  z2 = (n) => String(n).padStart(2, "0");
const iso = (y, d) => {
  const t = dt(y, d);
  return t.getFullYear() + "-" + z2(t.getMonth() + 1) + "-" + z2(t.getDate());
};
const fmt = (y, d, w) =>
  dt(y, d).toLocaleDateString("en-GB", {
    weekday: w ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
let HOSTED = 0,
  DAILY = {},
  DMIN = {},
  MODE = "none",
  sel = { y: TY, d: TD },
  HIST = {};
const LS = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("hg2") || "{}");
    } catch (e) {
      return {};
    }
  },
  set() {
    if (HOSTED) return;
    try {
      localStorage.setItem("hg2", JSON.stringify(HIST));
    } catch (e) {}
  },
};
function blank() {
  YRS.forEach((y) => {
    DAILY[y] = Array(ylen(y)).fill(null);
    DMIN[y] = Array(ylen(y)).fill(null);
  });
}
function applyHist() {
  blank();
  let any = 0;
  YRS.forEach((y) => {
    (HIST[y] || []).forEach((v, i) => {
      if (v != null && i < DAILY[y].length) {
        DAILY[y][i] = v;
        any = 1;
      }
    });
    ((HIST.mn || {})[y] || []).forEach((v, i) => {
      if (v != null && i < DMIN[y].length) DMIN[y][i] = v;
    });
  });
  setMode(any ? "nea" : "none");
}
function setVal(y, d, v, m) {
  HIST[y] = HIST[y] || Array(ylen(y)).fill(null);
  HIST[y][d] = v;
  DAILY[y][d] = v;
  if (m != null) {
    HIST.mn = HIST.mn || {};
    HIST.mn[y] = HIST.mn[y] || Array(ylen(y)).fill(null);
    HIST.mn[y][d] = m;
    DMIN[y][d] = m;
  }
  LS.set();
  if (MODE == "none") setMode("nea");
}
const SMS = {
  nea: "Serving NEA data.",
  none: "No data available yet.",
  sample: "Sample data: none of these numbers are NEA readings.",
};
function setMode(m) {
  MODE = m;
  $("st").textContent = SMS[m];
}
const LD = { arch: 1, live: 1, day: 0, gap: 0, gn: "" };
function ldShow() {
  const t = LD.arch
    ? "Loading saved data…"
    : LD.live
      ? "Checking NEA for the latest reading…"
      : LD.day
        ? "Loading hourly readings…"
        : LD.gap
          ? `Fetching recent days from NEA${LD.gn}…`
          : "";
  $("ld").hidden = !t;
  $("ldt").textContent = t;
}

const REG = ["north", "south", "east", "west", "central"],
  NAMES = {
    north: "North",
    south: "South",
    east: "East",
    west: "West",
    central: "Central",
  }; // order used in every data file
