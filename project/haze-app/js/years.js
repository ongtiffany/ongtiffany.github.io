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
const cl = (x) => Math.max(0, Math.min(1, x)),
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
  // Prefer annual statistics supplied by news.json.
  const annual = NEWS[y]?.psi;

  if (annual && typeof annual === "object") {
    const mn = annual.lowest;
    const pk = annual.highest;
    const mean = annual.average;
    const over = annual.haze_days;

    // Accept valid annual statistics even without DAILY data.
    if (
      Number.isFinite(mn) &&
      Number.isFinite(pk) &&
      Number.isFinite(mean) &&
      Number.isFinite(over)
    ) {
      return {
        n: null,
        mean,
        pk,
        mn,
        over,
      };
    }
  }

  // Backwards-compatible fallback to existing daily PSI data.
  const a = DAILY[y];

  if (!Array.isArray(a)) return null;

  const v = a.filter((x) => x != null);
  if (!v.length) return null;

  const mv = Array.isArray(DMIN[y]) ? DMIN[y].filter((x) => x != null) : [];

  return {
    n: v.length,
    mean: v.reduce((sum, value) => sum + value, 0) / v.length,
    pk: Math.max(...v),
    mn: mv.length ? Math.min(...mv) : null,
    over: v.filter((x) => x > 100).length,
  };
}
const NEWS = {};

const NEWS_BY_MONTH = {};

function rebuildNewsIndex() {
  for (const key of Object.keys(NEWS_BY_MONTH)) {
    delete NEWS_BY_MONTH[key];
  }

  for (const [yearKey, record] of Object.entries(NEWS)) {
    if (!/^\d{4}$/.test(yearKey)) continue;

    const year = Number(yearKey);
    const articles = Array.isArray(record?.articles) ? record.articles : [];

    for (const article of articles) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(article.date || "");

      // Only valid, explicit publication dates are assigned to months.
      if (!match) continue;

      const articleYear = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);

      const date = new Date(articleYear, month, day);
      if (
        date.getFullYear() !== articleYear ||
        date.getMonth() !== month ||
        date.getDate() !== day
      ) {
        continue;
      }

      const key = `${articleYear}-${String(month).padStart(2, "0")}`;

      if (!NEWS_BY_MONTH[key]) NEWS_BY_MONTH[key] = [];
      NEWS_BY_MONTH[key].push(article);
    }
  }

  for (const articles of Object.values(NEWS_BY_MONTH)) {
    articles.sort((a, b) => a.date.localeCompare(b.date));
  }
}

function articlesForMonth(year, month) {
  const key = `${year}-${String(month).padStart(2, "0")}`;
  return NEWS_BY_MONTH[key] || [];
}

function articlesForYear(year) {
  const record = NEWS[year];
  return Array.isArray(record?.articles) ? record.articles : [];
}

const CAUSE_EVIDENCE_VALUES = new Set([
  "supported_cause",
  "reported_cause",
  "inferred",
  "unknown",
]);

function normaliseCauseEvidence(value) {
  const aliases = {
    "supported-cause": "supported_cause",
    "reported-cause": "reported_cause",
    "inferred-cause": "inferred",
    provisional: "inferred",
    "provisional-cause": "inferred",
  };

  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  const normalised = aliases[key] || key;

  return CAUSE_EVIDENCE_VALUES.has(normalised) ? normalised : "unknown";
}

const UNIFIED_CAUSES = [
  {
    id: "regional_fires",
    label: "Regional forest and peat fires",
    icon: "regional_fires",
    psi: ["f", "k"],
    news: ["regional_fires"],
    description:
      "Forest, vegetation and peat fires across South-East Asia can release smoke that travels long distances. Sumatra and Kalimantan in Indonesia have been important sources during historical haze episodes, but they are not the only possible sources. The location and extent of fires vary from year to year.",
    mechanism:
      "Smoke contains fine particles that can remain airborne and travel across national borders. Peat fires can smoulder underground, making them difficult to extinguish and allowing smoke emissions to continue.",
  },
  {
    id: "land_clearing",
    label: "Land clearing and burning",
    icon: "land_clearing",
    psi: ["f", "k"],
    news: ["land_clearing"],
    description:
      "Fire has been used to clear vegetation for agriculture and other land uses in parts of South-East Asia. Some fires are deliberately started, while others may spread accidentally or become difficult to control. The purpose and responsibility for a particular fire cannot be assumed without supporting evidence.",
    mechanism:
      "When vegetation is burned, smoke and fine particles enter the atmosphere. Fires on drained or degraded peatland can become particularly persistent and produce substantial amounts of smoke.",
  },
  {
    id: "dry_conditions",
    label: "Dry weather and El Niño",
    icon: "dry_conditions",
    psi: ["d"],
    news: ["dry_conditions", "dry_conditions_el_nino"],
    description:
      "Extended dry spells and below-normal rainfall can occur naturally or be influenced by large-scale climate patterns such as El Niño. El Niño changes rainfall patterns in many parts of the world, including South-East Asia, but its effects vary between events.",
    mechanism:
      "Dry vegetation and peat ignite more readily and fires can become harder to control. Dry weather can therefore intensify a fire problem, but it does not by itself establish that a fire occurred or explain a particular haze reading.",
  },
  {
    id: "wind_transport",
    label: "Wind and atmospheric conditions",
    icon: "wind_transport",
    psi: ["w"],
    news: ["wind_transport"],
    description:
      "The direction and strength of winds influence whether smoke from regional fires reaches Singapore. Seasonal monsoon winds are relevant to many historical haze episodes, but the actual wind pattern varies. Rainfall, atmospheric stability and other weather conditions also affect how pollution disperses.",
    mechanism:
      "Winds can transport smoke towards Singapore or carry it elsewhere. Light winds and stable air can allow pollution to accumulate, while rainfall can remove particles from the air. Weather conditions influence the severity of haze but do not identify its source on their own.",
  },
  {
    id: "local_emissions",
    label: "Local and regional air pollution",
    icon: "local_emissions",
    psi: ["l"],
    news: ["local_emissions"],
    description:
      "Air pollution in Singapore also comes from sources such as motor vehicles, industries, power generation and shipping. Pollution can also be transported from other populated or industrial areas. These sources contribute to overall air quality, although their contribution varies over time.",
    mechanism:
      "Emissions release particles and gases into the atmosphere. Some gases can react to form additional particulate pollution. Local and regional emissions may contribute to poor air quality, but their presence alone does not establish that they caused a particular haze episode.",
  },
  {
    id: "unknown",
    label: "Unknown",
    icon: "unknown",
    psi: [],
    news: [],
    description:
      "The available information is insufficient to identify a cause.",
    mechanism:
      "More evidence may be needed, including dated news reports, fire observations, wind data and air-quality measurements.",
  },
];

let unifiedSelection = new Set();
let recordSources = "both";
let newsEvidence = "all";

function placeholderIcon(id) {
  const paths = {
    regional_fires:
      '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-4-8 0 3-2 4-2 4 0-5-4-9-4-9 1 5-4 7-4 13 0 4 3 7 7 7Z"/>',
    land_clearing:
      '<path d="M12 22V11M12 15 6 9M12 18l6-7M4 22h16M6 9l-2-5M18 11l2-6"/>',
    dry_conditions:
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
    wind_transport:
      '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a2 2 0 1 1-2 2M4 16h8a3 3 0 1 1-3 3"/>',
    local_emissions:
      '<path d="M5 21h14M7 21V10h10v11M9 10V5h6v5M10 14h1m3 0h1m-5 3h1m3 0h1"/>',
    unknown:
      '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.8c-1.1 1-1.8 1.3-1.8 3M12 17.5v.1"/>',
  };

  return `<svg class="cause-icon" viewBox="0 0 24 24"
    width="20" height="20" fill="none"
    stroke="currentColor" stroke-width="1.6"
    stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${paths[id] || paths.unknown}</svg>`;
}

function renderUnifiedLegend() {
  $("cbs").innerHTML = `
    <div class="possible-causes">
      <h3>Possible causes</h3>

      <p class="possible-causes-intro">
        Haze in Singapore can be influenced by several factors.
        The list below explain how these factors could contribute
        to haze, but they do not establish the cause of a particular
        event. Explore the historical PSI measurements and news
        records in the timeline to assess the available evidence.
      </p>

<div class="unified-causes">
  ${UNIFIED_CAUSES.filter((c) => c.id !== "unknown")
    .map(
      (c) => `
        <button type="button"
          class="unified-cause-info"
          data-cause-info="${c.id}"
          aria-label="Learn about possible causes: ${c.label}"
          title="Learn about ${c.label}">

          ${placeholderIcon(c.icon)}

          <span>${c.label}</span>
        </button>
      `,
    )
    .join("")}
</div>

      <p class="possible-causes-note">
        These are possible contributing factors, not confirmed
        explanations for individual haze events. Historical news
        records are provided for further investigation.
      </p>
    </div>`;
}

function getNewsCauses(record) {
  return Array.isArray(record?.cause_tags)
    ? record.cause_tags.filter((tag) => typeof tag === "string" && tag.trim())
    : [];
}

function newsInfo(year) {
  const record = NEWS[year];
  if (!record) {
    console.warn("No news record for year:", year);
    return;
  }

  const articles = Array.isArray(record.articles) ? record.articles : [];

  const dated = articles.filter((a) =>
    /^\d{4}-\d{2}-\d{2}$/.test(a.date || ""),
  );

  const distinctDates = new Set(dated.map((a) => a.date)).size;

  const statusLabels = {
    documented_event: "Documented event",
    candidate_event: "Candidate event",
    documented_report: "Documented report",
    candidate_report: "Candidate report",
  };

  const causeLabels = {
    regional_fires: "Regional fires",
    land_clearing: "Land clearing",
    dry_conditions: "Dry conditions",
    dry_conditions_el_nino: "Dry conditions / El Niño",
    wind_transport: "Wind transport",
    local_emissions: "Local emissions",
  };

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );

  const status =
    statusLabels[record.event_status] ||
    statusLabels[record.report_status] ||
    "Status not classified";

  const causes = (record.cause_tags || [])
    .map((c) => causeLabels[c] || c)
    .map((c) => `<span class="news-tag">${esc(c)}</span>`)
    .join(" ");

  const sourceList = articles
    .map((a) => {
      const url = /^https?:\/\//i.test(a.url || "") ? a.url : null;

      return `
      <article class="news-article">
        <strong>${esc(a.title || "Untitled source")}</strong>
        <div>${esc(a.source || "Unknown source")}</div>
        <small>${esc(a.date || "Publication date unavailable")}</small>
        <div>${esc((a.source_type || "").replaceAll("_", " "))}</div>
        ${
          url
            ? `<a href="${esc(url)}" target="_blank"
               rel="noopener noreferrer">Open source ↗</a>`
            : ""
        }
      </article>`;
    })
    .join("");

  const duration =
    Number.isFinite(record.days) && record.days >= 0
      ? `${record.days} days (estimate)`
      : "Unknown";

  showInfo(
    `${year} · ${record.t || "Historical haze records"}`,
    `
      <p><strong>${esc(status)}</strong></p>
      <p>${esc(record.b || "")}</p>

      <div class="news-stats">
        <div><strong>${articles.length}</strong>
          <span>Source records</span></div>
        <div><strong>${dated.length}</strong>
          <span>Records with publication dates</span></div>
        <div><strong>${distinctDates}</strong>
          <span>Distinct publication dates</span></div>
        <div><strong>${esc(duration)}</strong>
          <span>Article-estimated haze duration</span></div>
      </div>

      ${causes ? `<h4>Cause categories</h4><div>${causes}</div>` : ""}

      <p><strong>Cause evidence:</strong>
        ${esc(record.cause_evidence || "unknown")}</p>

      <h4>Source records</h4>
      ${sourceList || "<p>No source records available.</p>"}

      <p class="news-disclaimer">
        Historical news records are not an exhaustive count of haze
        days. PSI measurements are shown independently.
      </p>
    `,
  );
}

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
}

function safeURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function articleHTML(article, index = 0) {
  const title = escapeHTML(article.title || "Untitled article");
  const source = escapeHTML(article.source || "Source unavailable");
  const url = safeURL(article.url);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(article.date || "");
  let date = "Publication date unavailable";

  if (match) {
    const [, year, month, day] = match;
    const parsed = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day)),
    );

    if (
      parsed.getUTCFullYear() === Number(year) &&
      parsed.getUTCMonth() === Number(month) - 1 &&
      parsed.getUTCDate() === Number(day)
    ) {
      date = parsed.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  }

  return `
    <details class="news-article">
      <summary>${title}</summary>

      <div class="news-article-details">
        <p><strong>Date:</strong> ${escapeHTML(date)}</p>
        <p><strong>Source:</strong> ${source}</p>

        ${
          url
            ? `<p>
                <a href="${escapeHTML(url)}"
                   target="_blank"
                   rel="noopener noreferrer">
                  Open original article ↗
                </a>
              </p>`
            : `<p>Link unavailable.</p>`
        }
      </div>
    </details>`;
}

function monthInfo(year, monthIndex) {
  const stats = MST[year]?.[monthIndex] ?? null;
  const title = `${MO[monthIndex]} ${year}`;

  const psiSection = stats
    ? `
      <div class="month-stats">
        <p><strong>Average PSI:</strong> ${stats.mean.toFixed(1)}</p>
        <p><strong>Peak daily PSI:</strong> ${stats.pk}</p>
        <p><strong>Haze days:</strong> ${stats.over}</p>
      </div>`
    : `
      <p>PSI measurements are unavailable for this month.</p>`;

  showInfo(title, psiSection);
}

const pre = (y) => {
  const record = NEWS[y];

  if (!record) return "";

  const days = record.days;
  const months = Array.isArray(record.m) ? record.m : [];
  const width = Number.isFinite(days) && days >= 0 ? days * 3 : 0;

  return `<div class="yc" data-pre-year="${y}">
    <div class="cc">
      <span class="ci hx"
        data-pre="${y}"
        role="button"
        tabindex="0"
        aria-label="${y}: haze recorded in historical sources. Tap for details">
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
      months.includes(m)
        ? `<button class="sg nw"
            data-news="${y}"
            aria-label="${MO[m]} ${y}. Tap for details"></button>`
        : '<i class="sg e"></i>',
    ).join("")}
  </div>`;
};

function yearRow(y, MS) {
  const annualArticles = articlesForYear(y);

  const newsRecord = NEWS[y];
  const stats = ystat(y);
  const articles = annualArticles;

  const newsMonths = new Set();

  for (const article of articles) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(article.date || "");

    if (!match) continue;

    const articleYear = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);

    const date = new Date(articleYear, month, day);

    if (
      date.getFullYear() === articleYear &&
      date.getMonth() === month &&
      date.getDate() === day &&
      articleYear === y
    ) {
      newsMonths.add(month);
    }
  }

  const psiMonths = Array.isArray(MS) ? MS : Array(12).fill(null);
  const hasNews = Boolean(newsRecord);
  const hasPSI = Boolean(stats);

  const peak = stats?.pk ?? null;
  const dm = peak == null ? 34 : 34 + cl((peak - 50) / 200) * 52 + 10;

  const psiHazeDays = stats?.over ?? 0;
  const annualArticleCount = articles.length;

  const annual = stats
    ? `<button type="button"
      class="ci annual-circle"
      data-y="${y}"
      aria-label="${y}, peak PSI ${peak}. Open annual summary"
      title="${y}: peak PSI ${peak}"
      style="${SW(bi(peak))};color:${TC(bi(peak))};width:${dm}px;height:${dm}px">
      ${stats.mn != null ? `<i>${stats.mn}–</i>` : ""}${peak}
    </button>`
    : hasNews
      ? `<button type="button"
        class="ci annual-circle no-psi-circle"
        data-y="${y}"
        aria-label="${y}, PSI unavailable, news articles available. Open annual summary"
        title="${y}: PSI unavailable; news articles available"
        style="width:44px;height:44px">
      </button>`
      : `<span class="ci e annual-circle"
        aria-label="${y}: PSI unavailable">–</span>`;

  const monthCells = MO.map((_, m) => {
    const q = psiMonths[m];
    const hasNewsMonth = newsMonths.has(m);

    if (!q && !hasNewsMonth) {
      return '<i class="sg e"></i>';
    }

    const codes = q?.c || [];

    // Convert the old PSI codes into the unified cause categories.
    const categories = UNIFIED_CAUSES.filter((category) =>
      category.psi.some((code) => codes.includes(code)),
    );

    const icons = categories
      .map(
        (category, index) =>
          `<span class="timeline-cause-icon"
        style="--icon-index:${index}"
        title="${category.label}">
        ${placeholderIcon(category.icon)}
      </span>`,
      )
      .join("");

    // Monthly background shade represents peak daily PSI,
    // not the monthly average.
    const style = q ? `${SW(bi(q.pk))};color:${TC(bi(q.pk))}` : "";

    return `<button type="button"
        class="sg timeline-month${q ? "" : " no-psi"}${hasNewsMonth ? " has-news" : ""}"
        data-y="${y}"
        data-m="${m}"
        data-c="${codes.join(" ")}"
        data-news-month="${hasNewsMonth ? "1" : "0"}"
aria-label="${MO[m]} ${y}${
      q
        ? `: mean PSI ${q.mean.toFixed(1)}, peak PSI ${q.pk}, ${q.over} haze days`
        : ": PSI data unavailable"
    }"
        style="${style}">
${
  q?.over > 0
    ? `<span class="month-haze-ring"
        style="--haze-angle:${Math.min(q.over, 30) * 12}deg">
      </span>
      <span class="month-haze-count">${q.over}</span>`
    : ""
}

<span class="month-icons"></span>

</button>`;
  }).join("");

  return `<div class="yc unified-year-row"
      data-year="${y}"
      data-y="${y}"
      data-pre-year="${y}"
      data-has-psi="${hasPSI}"
      data-has-news="${hasNews}">

<div class="cc annual-records">
  <span class="annual-circle-wrap"
        style="--circle-size:${dm}px">

    ${annual}

    ${
      hasPSI && psiHazeDays > 0
        ? `<span class="annual-haze-ring"
            style="--haze-angle:${Math.min(psiHazeDays, 60) * 6}deg"
            title="${psiHazeDays} PSI days above 100">
          </span>

          <span class="annual-haze-count">
            ${psiHazeDays}
          </span>`
        : ""
    }

  </span>
</div>

<div class="haze-label">
  <span class="annual-count">${hasNews ? annualArticleCount : "–"}</span>
</div>

<b class="year-label">${y}</b>

${monthCells}

    </div>`;
}

let MST = {};

function drawYears() {
  const sc = $("sc");
  if (!sc) {
    console.error("[timeline] Missing #sc element");
    return;
  }

  const sl = sc.scrollLeft;

  // Calculate monthly PSI statistics.
  YRS.forEach((y) => {
    MST[y] = mstat(y);
  });

  // Combine PSI and news years.
  const years = [
    ...new Set([
      ...YRS.map(Number),
      ...Object.keys(NEWS)
        .filter((key) => /^\d{4}$/.test(key))
        .map(Number),
    ]),
  ].sort((a, b) => a - b);

  // Render the month/year heading column.
  const labels = `
  <div class="ml" aria-label="Timeline row labels">
    <div class="ml-year-label">Year</div>
    <div class="ml-heading">Annual PSI</div>
    <div class="ml-bar-label"></div>
    <div class="ml-count-labels">
      <span>Haze days</span>
    </div>
    <div class="ml-month-heading">Months</div>
    ${MO.map((m) => `<div class="ml-month">${m}</div>`).join("")}
  </div>`;

  // IMPORTANT: Render the actual timeline rows.
  sc.innerHTML = labels + years.map((y) => yearRow(y, MST[y])).join("");

  renderUnifiedLegend();
  sc.scrollLeft = first ? 1e5 : sl;
  first = 0;

  console.log("[timeline] Rendered rows:", years.length);
}

function yearInfo(year) {
  const stats = ystat(year);
  const record = NEWS[year];
  const articles = articlesForYear(year);

  const isValidDate = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!match) return false;

    const [, yy, mm, dd] = match;
    const date = new Date(Date.UTC(Number(yy), Number(mm) - 1, Number(dd)));

    return (
      date.getUTCFullYear() === Number(yy) &&
      date.getUTCMonth() === Number(mm) - 1 &&
      date.getUTCDate() === Number(dd)
    );
  };

  const datedArticles = articles.filter((article) => isValidDate(article.date));

  const undatedCount = articles.length - datedArticles.length;

  const psiSection = `
    <h4>Annual PSI</h4>

    ${
      stats
        ? `
          <p>
            <strong>Lowest – Highest daily PSI:</strong>
            ${escapeHTML(stats.mn ?? "Unavailable")} –
            ${escapeHTML(stats.pk ?? "Unavailable")}
          </p>

          <p>
            <strong>Average PSI:</strong>
            ${
              Number.isFinite(stats.mean)
                ? stats.mean.toFixed(1)
                : "Unavailable"
            }
          </p>

          <p>
            <strong>Haze days (PSI above 100):</strong>
            ${escapeHTML(stats.over ?? "Unavailable")}
          </p>
        `
        : `<p>PSI measurements are unavailable for this year.</p>`
    }
  `;

  const newsSection = `
    <h4>News records (${articles.length})</h4>

    ${
      record?.event_status
        ? `<p><strong>Event status:</strong>
            ${escapeHTML(record.event_status)}</p>`
        : ""
    }

    ${
      record?.cause_evidence
        ? `<p><strong>Cause evidence:</strong>
            ${escapeHTML(record.cause_evidence)}</p>`
        : ""
    }

    <p><strong>Dated articles:</strong> ${datedArticles.length}</p>
    <p><strong>Undated articles:</strong> ${undatedCount}</p>
    <p><strong>Total articles:</strong> ${articles.length}</p>

    <div class="annual-articles">
      ${
        articles.length
          ? articles
              .map((article, index) => articleHTML(article, index))
              .join("")
          : "<p>No linked news articles available.</p>"
      }
    </div>
  `;

  showInfo(
    `${year} · Annual PSI and news summary`,
    `
      ${psiSection}
      ${newsSection}

      <p class="news-disclaimer">
        ${escapeHTML(
          NEWS_NOTICE ||
            "PSI measurements and historical news records are independent sources. News coverage does not establish the number of haze days or prove the cause of a particular PSI reading.",
        )}
      </p>
    `,
  );
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  // Monthly PSI circle: open the corresponding month popup.
  const monthButton = target.closest(".timeline-month[data-y][data-m]");

  if (monthButton) {
    monthInfo(Number(monthButton.dataset.y), Number(monthButton.dataset.m));
    return;
  }

  // Information buttons never toggle the filter.
  const info = target.closest("[data-cause-info]");

  if (info) {
    unifiedCauseInfo(info.dataset.causeInfo);
    return;
  }

  // Cause buttons toggle the unified filter.
  const cause = target.closest(".unified-cause");
  if (cause) {
    const id = cause.dataset.unifiedCause;

    if (unifiedSelection.has(id)) unifiedSelection.delete(id);
    else unifiedSelection.add(id);

    return;
  }

  if (target.closest(".unified-clear")) {
    unifiedSelection.clear();
    return;
  }

  // Annual PSI circle: open one combined annual summary.
  const annual = target.closest(".annual-circle[data-y]");
  if (annual && !annual.classList.contains("e")) {
    yearInfo(Number(annual.dataset.y));
    return;
  }

  // Legacy historical news markers, if any remain.
  const historicalNews = target.closest(".ci[data-pre], .sg.nw[data-news]");

  if (historicalNews) {
    newsInfo(Number(historicalNews.dataset.pre || historicalNews.dataset.news));
    return;
  }
});

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

function unifiedCauseInfo(id) {
  const category = UNIFIED_CAUSES.find((c) => c.id === id);
  if (!category) return;

  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );

  showInfo(
    category.label,
    `

      <p>${esc(category.description)}</p>

      <h4>How it could contribute to haze</h4>

      <p>${esc(category.mechanism)}</p>

      <p class="mut">
        This describes a possible contributing factor, not a
        confirmed cause of a specific haze event. Historical PSI
        measurements and news records should be assessed separately.
      </p>
    `,
  );
}

function paint() {
  // Cause icons are now rendered by yearRow().
  // Do not overwrite them with the legacy image icons.
}

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

let NEWS_NOTICE = "";

async function loadNews() {
  console.log("[news] Loading started");

  try {
    const response = await fetch("./data/news.json");

    console.log("[news] HTTP status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    NEWS_NOTICE = data._notice || "";

    console.log("[news] Years in JSON:", Object.keys(data));

    // Support both the simplified schema and the original schema.
    for (const [year, original] of Object.entries(data)) {
      if (!/^\d{4}$/.test(year)) continue;
      if (!original || typeof original !== "object") continue;

      const nestedNews = original.news || {};

      // Flatten nested news fields so existing timeline functions
      // can continue using NEWS[year].articles.
      const record = {
        ...original,
        ...nestedNews,
        psi: original.psi || null,
        articles: Array.isArray(nestedNews.articles)
          ? nestedNews.articles
          : Array.isArray(original.articles)
            ? original.articles
            : [],
      };

      record.cause_evidence = normaliseCauseEvidence(record.cause_evidence);

      for (const article of record.articles) {
        if (!article || typeof article !== "object") continue;

        article.cause_evidence = normaliseCauseEvidence(article.cause_evidence);
      }

      NEWS[year] = record;
    }

    rebuildNewsIndex();
    drawYears();

    console.log("[news] NEWS keys:", Object.keys(NEWS));
    console.log("[news] 2015 record:", NEWS[2015]);
    console.log("[news] Timeline redrawn");
  } catch (error) {
    console.error("[news] Loading failed:", error);
  }
}

loadNews();
