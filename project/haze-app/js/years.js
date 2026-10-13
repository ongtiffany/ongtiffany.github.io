/* years: causes, newspaper record, year and month columns, details pop-ups */
/* years, months, causes */
const CA = [
    [
      "f",
      "Peat and forest fires (Sumatra)",
      "cause-peat.svg",
      "Mostly man-made",
      "Sumatra is a large Indonesian island just west of Singapore. Peat is wet, spongy ground made of partly rotted plants. Once it is drained for farming it burns easily and can smoulder underground for weeks, giving off thick smoke.",
      "Land is often cleared with fire because it is cheap, for example for palm oil or pulpwood plantations. In the dry months (typically June to October) those fires spread out of control and are very hard to put out.",
    ],
    [
      "k",
      "Kalimantan fires",
      "cause-kalimantan.svg",
      "Mostly man-made",
      "Kalimantan is the Indonesian part of Borneo, to the east and south-east of Singapore. It has the same kind of peatland and the same kind of fires as Sumatra.",
      "The causes are the same: clearing land with fire, and drained peat that keeps burning. Smoke reaches Singapore mainly when the wind blows from the south-east, usually later in the dry season (August to October).",
    ],
    [
      "d",
      "Dry spell or El Niño",
      "cause-dry.svg",
      "Natural",
      "El Niño is a periodic warming of the Pacific Ocean that changes weather around the world. In South-East Asia it often means much less rain than usual.",
      "Dry weather makes forests and peat far more flammable and fires harder to stop. It does not start the fires, but it turns ordinary clearing fires into big ones. That is why the worst haze years often follow El Niño years.",
    ],
    [
      "w",
      "South-west monsoon winds",
      "cause-wind.svg",
      "Natural",
      "The south-west monsoon is a seasonal wind pattern, roughly June to September, when air tends to flow from the south-west across Sumatra towards Singapore.",
      "Those winds carry smoke from Sumatran fires across the Strait of Malacca. Without them the same fires would often miss Singapore. When the wind is weak, smoke also lingers instead of clearing.",
    ],
    [
      "l",
      "Local and industrial emissions",
      "cause-local.svg",
      "Man-made",
      "This is pollution made in and around Singapore: vehicle exhaust, power generation, industry, construction dust and the many ships in the port.",
      "It builds up when there is heavy traffic or activity and the air is still, so it cannot disperse. It rarely pushes PSI above the Moderate range, but on its own it can keep readings from being truly clean.",
    ],
  ],
  NINO = [2015, 2019, 2023],
  MO = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
const act = new Set(),
  cl = (x) => Math.max(0, Math.min(1, x)),
  ico = (c, cls) =>
    `<img class="ic${cls ? " " + cls : ""}" src="img/${CA.find((a) => a[0] == c)[2]}" alt="">`;
let first = 1;
function mstat(y) {
  const a = DAILY[y];

  // No PSI data for this year
  if (!Array.isArray(a)) {
    return Array(12).fill(null);
  }

  return MO.map((_, m) => {
    const s = Math.round((new Date(y, m, 1) - new Date(y, 0, 1)) / 864e5);
    const e = Math.round((new Date(y, m + 1, 1) - new Date(y, 0, 1)) / 864e5);

    const v = a.slice(s, e).filter((x) => x != null);

    if (!v.length) return null;

    const pk = Math.max(...v);
    const mean = v.reduce((x, k) => x + k, 0) / v.length;
    const c = [];

    if (m >= 5 && m <= 9 && pk >= 100) {
      c.push("f", "w");
      if (m >= 7) c.push("k");
    }

    if (NINO.includes(y) && m >= 5 && m <= 9 && mean > 50) {
      c.push("d");
    }

    if (!c.length && mean >= 50) {
      c.push("l");
    }

    return {
      mean,
      pk,
      c,
      day: a.indexOf(pk, s),
      over: v.filter((x) => x > 100).length,
    };
  });
}
function ystat(y) {
  const a = DAILY[y];

  // No PSI data for this year
  if (!Array.isArray(a)) return null;

  const v = a.filter((x) => x != null);
  if (!v.length) return null;

  const mv = Array.isArray(DMIN[y]) ? DMIN[y].filter((x) => x != null) : [];

  return {
    n: v.length,
    mean: v.reduce((a, b) => a + b, 0) / v.length,
    pk: Math.max(...v),
    mn: mv.length ? Math.min(...mv) : null,
    over: v.filter((x) => x > 100).length,
  };
}
const NEWS = {
  1961: {
    m: [9],
    days: null, // Add a count when supported by the articles
    t: "October 1961: the first haze on record",
    b: `<b>Newspaper record</b><br>19 Oct 1961, The Straits Times, page 1: “Another week of heavy haze”. Kuala Lumpur's weather station said the haze would last about another week and was worse than for several years. <a href="https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19611019-1" target="_blank" rel="noopener">Read the issue on NewspaperSG</a><br><br>19 Oct 1961, The Straits Times: “Haze gives the air pilots a hard time”. Headline as quoted by The Borneo Post; the article itself is still to be located on NewspaperSG. <a href="https://www.theborneopost.com/2019/09/21/ive-been-hazed-since-i-was-22-a-very-short-history-of-haze/" target="_blank" rel="noopener">The Borneo Post, 2019</a><br><br><b>Later account</b> (The Borneo Post): the first haze Singapore recorded, blamed on forest fires in Malaya. It cleared within about a week, panicked many Singaporeans (some thought a nuclear bomb had gone off) and caused some flight delays.`,
  },
  1997: {
    m: [7, 8, 9],
    days: null, // Add a count when supported by the articles
    t: "August to October 1997",
    b: `A major smoke haze outbreak. NLB Infopedia records the highest PSI reading, 226, in September. NEA began hourly reporting of the 3-hour PSI during this episode.<br><br><a href="https://eresources.nlb.gov.sg/infopedia/articles/SIP_2013-08-30_185150.html" target="_blank" rel="noopener">NLB Infopedia: Haze pollution</a><br><span class="mut">Daily readings for 1997 still need to be added from NEA's records.</span>`,
  },
  2013: {
    m: [5],
    days: null, // Add a count when supported by the articles
    t: "June 2013",
    b: `Haze returned in June 2013 and was one of the most serious episodes in the previous 16 years.<br><br><a href="https://eresources.nlb.gov.sg/infopedia/articles/SIP_2013-08-30_185150.html" target="_blank" rel="noopener">NLB Infopedia: Haze pollution</a><br><span class="mut">Daily readings for 2013 still need to be added from NEA's records.</span>`,
  },
};
const newsInfo = (y) => showInfo(NEWS[y].t, NEWS[y].b);
const pre = (y) => {
  const days = NEWS[y].days;
  const width = days == null ? 0 : days * 3;

  return `<div class="yc" data-pre-year="${y}">
    <div class="cc">
      <span class="ci hx"
        data-pre="${y}"
        role="button"
        tabindex="0"
        aria-label="${y}: haze recorded in newspapers. Tap for details">
      </span>
    </div>

    <div class="haze-bar-wrap">
      <div class="haze-bar"
        style="width:${width}px"
        title="${days == null ? "Article-based haze-day count unavailable" : days + " article-based haze days"}">
      </div>
    </div>

    <div class="haze-label">
      ${days == null ? "Days unknown" : days + " haze days"}
    </div>

    <b>${y}</b>

    ${Array.from({ length: 12 }, (_, m) =>
      NEWS[y].m.includes(m)
        ? `<button class="sg nw"
            data-news="${y}"
            aria-label="${MO[m]} ${y}. Tap for details"></button>`
        : '<i class="sg e"></i>',
    ).join("")}
  </div>`;
};
function ycol(y, MS) {
  const s = ystat(y);

  if (!s) {
    return `<div class="yc">
      <div class="cc"><span class="ci e">–</span></div>
      <b>${y}</b>
      <small>no data</small>
      ${'<i class="sg e"></i>'.repeat(12)}
    </div>`;
  }

  // Circle size and shade are based on peak PSI
  const t = cl((s.pk - 50) / 200);
  const dm = 34 + t * 52;
  const g = Math.round(240 - t * 180);

  return `<div class="yc" data-y="${y}">
    <div class="cc">
      <span class="ci"
        data-y="${y}"
        role="button"
        tabindex="0"
        aria-label="${y} peak ${s.pk}. Tap for details"
        style="width:${dm}px;height:${dm}px;background:rgb(${g},${g},${g})">
        ${s.mn != null ? `<i>${s.mn}-</i>` : ""}${s.pk}
      </span>
    </div>
<div class="haze-bar-wrap">
  <div class="haze-bar"
    style="width:${s.over * 3}px"
    title="${s.over} haze days"></div>
</div>
<div class="haze-label">${s.over} haze days</div>
    <b>${y}</b>
    ${MS.map((q, m) => {
      if (!q) return '<i class="sg e"></i>';

      const b = bi((q.mean + q.pk) / 2);

      return `<button class="sg"
        data-y="${y}"
        data-m="${m}"
        data-c="${q.c.join(" ")}"
        aria-label="${MO[m]} ${y}: ${q.over} haze days. Tap for details"
        style="${SW(b)};color:${TC(b)}">
        ${q.over > 0 ? `<span class="haze-count">${q.over}</span>` : ""}
        <span class="month-icons">${q.c.map((c) => ico(c)).join("")}</span>
      </button>`;
    }).join("")}
  </div>`;
}
let MST = {};
function drawYears() {
  const sl = $("sc").scrollLeft;
  YRS.forEach((y) => (MST[y] = mstat(y)));
  $("sc").innerHTML =
    `<div class="ml"><div class="sp"></div>${MO.map((m) => `<div>${m[0]}</div>`).join("")}</div>` +
    [1961, 1997, 2013].map(pre).join("") +
    YRS.map((y) => ycol(y, MST[y])).join("");
  $("cbs").innerHTML =
    CA.map((c) => {
      const n = causeCount(c[0]);
      return `<span class="cg"><button class="cn" data-c="${c[0]}" aria-label="What is ${c[1]}?">${ico(c[0])}</button><button class="cb" data-c="${c[0]}">${c[1]} (${n})</button></span>`;
    }).join("") + '<button class="cb" id="all">Show all</button>';
  paint();
  $("sc").scrollLeft = first ? 1e5 : sl;
  first = 0;
}
const causeCount = (c) =>
  YRS.reduce(
    (a, y) => a + MST[y].filter((s) => s && s.c.includes(c)).length,
    0,
  );
function causeInfo(c) {
  const a = CA.find((x) => x[0] == c),
    n = causeCount(c);
  showInfo(
    a[1],
    `<div class="icb">${ico(a[0], "big")}</div><b>${a[3]}</b><br>${a[4]}<br><br><b>Why it happens:</b> ${a[5]}<br><br><span class="mut">Tagged on ${n} month${n == 1 ? "" : "s"} in the record. Tags are placeholders inferred from season and level.</span>`,
  );
}
function paint() {
  document
    .querySelectorAll(".cb")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        b.id == "all" ? !act.size : act.has(b.dataset.c),
      ),
    );

  document.querySelectorAll(".sg:not(.e):not(.nw)").forEach((s) => {
    const c = s.dataset.c.split(" ").filter(Boolean);
    const hit = c.filter((x) => act.has(x));

    s.classList.toggle("dim", act.size > 0 && !hit.length);

    const show = act.size && hit.length ? hit : c;
    const icons = s.querySelector(".month-icons");

    if (icons) {
      icons.innerHTML = show.map((x) => ico(x)).join("");
    }
  });

  document
    .querySelectorAll(".yc[data-y]")
    .forEach(
      (c) =>
        (c.style.opacity =
          !act.size || c.querySelector(".sg:not(.e):not(.dim)") ? 1 : 0.25),
    );
}
document.addEventListener("click", (e) => {
  if (
    !e
      .composedPath()
      .some((n) => n.id == "map" || n.id == "hrs" || n.id == "rs") &&
    (selR || selH != null)
  )
    resetHM();
  const n = e.target.closest(".cn");
  if (n) {
    causeInfo(n.dataset.c);
    return;
  }
  const b = e.target.closest(".cb");
  if (b) {
    if (b.id == "all") act.clear();
    else act.has(b.dataset.c) ? act.delete(b.dataset.c) : act.add(b.dataset.c);
    paint();
    return;
  }
  const s = e.target.closest("button.sg");
  if (s) {
    if (s.dataset.news) {
      newsInfo(+s.dataset.news);
      return;
    }
    const y = +s.dataset.y,
      m = +s.dataset.m,
      q = MST[y][m],
      nm = CA.filter((a) => q.c.includes(a[0]));
    showInfo(
      `${MO[m]} ${y}`,
      `Average reading ${q.mean.toFixed(0)}.<br>` +
        `Haze days: ${q.over}.<br><br>` +
        (nm.length
          ? `<b>Likely causes</b> (placeholder tags):<br>${nm.map((a) => ico(a[0]) + " " + a[1] + " · " + a[3]).join("<br>")}`
          : "No notable cause tagged."),
      `View worst day ${q.pk} (${fmt(y, q.day)})`,
      () => {
        select(y, q.day);
        scrollTo({ top: 0, behavior: "smooth" });
      },
    );
    return;
  }
  const c = e.target.closest(".ci");
  if (c) {
    if (c.dataset.pre) newsInfo(+c.dataset.pre);
    else if (c.dataset.y) {
      const y = +c.dataset.y,
        s = ystat(y);
      showInfo(
        `${y}`,
        `<b>Peak ${s.pk}</b>: the highest single-day reading of the year (the day's highest 24-hour PSI).<br>` +
          (s.mn != null
            ? `<b>Lowest ${s.mn}</b>: the lowest reading of the year.<br>`
            : "") +
          `<b>${s.over} haze day${s.over == 1 ? "" : "s"}</b>:  when the reading went above 100, which NEA calls Unhealthy.<br>Year average ${s.mean.toFixed(0)}, from ${s.n} days of data.<br><br>Circle size and shade follow the year's peak PSI: smaller and lighter means a lower peak, while larger and darker means a higher peak.`,
      );
    }
  }
});
document.addEventListener("keydown", (e) => {
  if (
    (e.key == "Enter" || e.key == " ") &&
    e.target.classList &&
    e.target.classList.contains("ci")
  ) {
    e.preventDefault();
    e.target.click();
  }
});

$("bands2").innerHTML = $("bands").innerHTML;
$("lbls2").innerHTML = $("lbls").innerHTML;

function drawYears() {
  const sl = $("sc").scrollLeft;
  YRS.forEach((y) => (MST[y] = mstat(y)));
  $("sc").innerHTML =
    `<div class="ml"><div class="sp"></div>${MO.map((m) => `<div>${m[0]}</div>`).join("")}</div>` +
    [1961, 1997, 2013].map(pre).join("") +
    YRS.map((y) => ycol(y, MST[y])).join("");
  $("cbs").innerHTML =
    CA.map((c) => {
      const n = causeCount(c[0]);
      return `<span class="cg"><button class="cn" data-c="${c[0]}" aria-label="What is ${c[1]}?">${ico(c[0])}</button><button class="cb" data-c="${c[0]}">${c[1]} (${n})</button></span>`;
    }).join("") + '<button class="cb" id="all">Show all</button>';
  paint();
  $("sc").scrollLeft = first ? 1e5 : sl;
  first = 0;
}

async function loadNews() {
  try {
    const response = await fetch("./data/news.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const records = await response.json();

    console.log("Loaded news.json:", records);

    Object.assign(NEWS, records);

    console.log("1961 title:", NEWS[1961].t);

    drawYears();
  } catch (error) {
    console.error("Failed to load news.json:", error);
  }
}

loadNews();
