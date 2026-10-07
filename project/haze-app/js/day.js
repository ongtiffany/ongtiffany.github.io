/* day: shade scale, day strip, date picker, guidance and day selection */
/* scale and strip */
$("bands").innerHTML = BANDS.map((b, i) => `<i style="${SW(i)}"></i>`).join("");
$("lbls").innerHTML = BANDS.map((b) => `<span>${b.n}</span>`).join("");
const pos = (p) => {
  const b = bi(p),
    lo = b ? BANDS[b - 1].m : 0,
    hi = b == 4 ? 400 : BANDS[b].m;
  return Math.min(1, (b + (Math.min(p, 400) - lo) / (hi - lo)) / 5) * 100;
};
let stripDone = 0;
function drawStrip() {
  const sl = $("strip").scrollLeft;
  let h = "";
  for (let i = TD - 89; i <= TD; i++) {
    const [y, d] = i < 0 ? [TY - 1, ylen(TY - 1) + i] : [TY, i],
      p = DAILY[y] ? DAILY[y][d] : null,
      m = DMIN[y] ? DMIN[y][d] : null,
      b = p == null ? null : bi(p),
      t =
        i == TD
          ? "Today"
          : dt(y, d).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
    h += `<button class="dc" data-y="${y}" data-d="${d}"><span>${t}</span><span class="sq${b == null ? " n" : ""}" style="${b == null ? "" : SW(b) + ";color:" + TC(b)}">${p != null && m != null ? `<i>${m}-</i>` : ""}${p == null ? "–" : p}</span></button>`;
  }
  $("strip").innerHTML = h;
  hl(1);
  $("strip").scrollLeft = stripDone ? sl : 1e5;
  stripDone = 1;
}
function hl(c) {
  document.querySelectorAll(".dc").forEach((b) => {
    const m = +b.dataset.y == sel.y && +b.dataset.d == sel.d;
    b.classList.toggle("on", m);
    if (m && !c && $("strip").scrollTo)
      $("strip").scrollTo({
        left: b.offsetLeft - $("strip").clientWidth / 2 + b.offsetWidth / 2,
        behavior: "smooth",
      });
  });
}
$("strip").onclick = (e) => {
  const b = e.target.closest(".dc");
  if (b) select(+b.dataset.y, +b.dataset.d);
};
/* one date button opens the native picker */
$("dp").max = iso(TY, TD);
$("dp").value = iso(sel.y, sel.d);
$("today").onclick = () => $("dp").showPicker();
function dayLabel(y, d) {
  const date = dt(y, d),
    w =
      date.toLocaleDateString("en-GB", { weekday: "short" }) +
      " " +
      date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    yd = nb(TY, TD, -1);
  return y == TY && d == TD
    ? "Today, " + w
    : yd && y == yd[0] && d == yd[1]
      ? "Yesterday, " + w
      : w + " " + y;
}
$("dp").onchange = (e) => {
  const value = e.target.value,
    [y, m, d] = value.split("-").map(Number),
    day = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5);
  if (
    value >= "2014-04-01" &&
    value <= $("dp").max &&
    DAILY[y] &&
    iso(y, day) == value &&
    day < DAILY[y].length
  )
    select(y, day);
  else e.target.value = iso(sel.y, sel.d);
};
const nb = (y, d, n) => {
  const t = new Date(y, 0, 1 + d + n),
    y2 = t.getFullYear();
  return DAILY[y2] ? [y2, Math.round((t - new Date(y2, 0, 1)) / 864e5)] : null;
};
document.addEventListener("keydown", (e) => {
  if (/INPUT|SELECT/.test(e.target.tagName)) return;
  const n = e.key == "ArrowLeft" ? -1 : e.key == "ArrowRight" ? 1 : 0,
    x = n && nb(sel.y, sel.d, n);
  if (x && DAILY[x[0]][x[1]] !== undefined) select(...x);
});

/* guidance and selection */
function info() {
  const { y, d } = sel,
    p = DAILY[y][d];
  if (p == null) {
    $("cmp").innerHTML = "";
    $("gd").innerHTML =
      "<div><b>No reading</b>NEA has no record for this day, or it has not loaded yet.</div>";
    return;
  }
  const pv = nb(y, d, -1),
    q = pv ? DAILY[pv[0]][pv[1]] : null,
    f = +$("prof").value,
    e = p / f,
    lv = e <= 50 ? 0 : e <= 100 ? 1 : e <= 150 ? 2 : e <= 250 ? 3 : 4;
  let ch = 0;
  if (q == null) $("cmp").innerHTML = "";
  else {
    ch = ((p - q) / q) * 100;
    const s =
      Math.abs(ch) < 4
        ? ["≈", "Similar <br>to"]
        : ch > 0
          ? ["↑", "Higher <br>than"]
          : ["↓", "Lower <br>than"];
    $("cmp").innerHTML = `<b>${s[0]}</b>${s[1]} day before`;
  }
  const OUT = [
    "Carry on as normal.",
    "Fine for most. If you are sensitive, go easy on long, hard exercise.",
    "Short trips are fine. Cut back on long or strenuous time outdoors.",
    "Limit time outside and skip hard exercise. Wear an N95 mask if you must go out.",
    "Stay indoors where you can.",
  ][lv];
  const WIN =
    lv == 0
      ? "Open them."
      : lv == 1
        ? ch > 10
          ? "Open briefly, since air is getting worse."
          : "Fine to open."
        : lv == 2 && ch < -10
          ? "Air is clearing. Open them once it keeps dropping."
          : "Keep them shut.";
  const PUR =
    lv == 0
      ? "Not needed."
      : lv == 1
        ? "Optional. Helpful if someone at home is sensitive."
        : "Switch it on, with windows closed.";
  $("gd").innerHTML =
    `<div><b>Going outside</b>${OUT}</div><div><b>Indoors</b>Windows: ${WIN}<br>Air purifier: ${PUR}${lv >= 2 ? "<br>Air-con: helps with comfort when windows are shut, though most home units filter little fine smoke." : ""}</div>`;
}
function select(y, d) {
  sel = { y, d };
  const p = DAILY[y][d],
    b = p == null ? null : bi(p),
    ps = p == null ? 50 : pos(p);
  $("dp").value = iso(y, d);
  $("today").textContent = dayLabel(y, d);
  $("today").setAttribute(
    "aria-label",
    "Choose a date: " + $("today").textContent,
  );
  $("mn").textContent = p == null ? (LD.arch || LD.live ? "…" : "–") : p;
  $("mc").textContent =
    b == null ? (LD.arch || LD.live ? "Loading" : "No reading") : BANDS[b].n;
  $("mk").style.left =
    p == null ? "50%" : `clamp(70px,${ps}%,calc(100% - 70px))`;
  $("mk").classList.toggle("flip", ps > 60);
  hl();
  info();
  loadDay2(y, d);
}
