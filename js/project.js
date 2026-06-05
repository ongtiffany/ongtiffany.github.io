async function loadProject() {
  const slug =
    window.PROJECT_SLUG ||
    new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    console.error("No slug found");
    return;
  }

  console.log("Slug:", slug);

  let projects = [];

  try {
    const res = await fetch("/data/projects.json");
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    console.error("Project not found:", slug);
    return;
  }

  const container = document.getElementById("project");

  if (!container) {
    console.error("#project container not found");
    return;
  }

  // ------------------------
  // MULTI FIELD PARSER
  // ------------------------

  function parseMultiField(cell = "") {
    return cell
      .split("||")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const parts = item.split("::").map((s) => s.trim());

        return {
          label: parts[0] || "",
          link: parts[1] || "",
        };
      });
  }

  const outputs = parseMultiField(project.output || "");
  const partners = parseMultiField(project.partners || "");
  const funders = parseMultiField(project.funders || "");

  // ------------------------
  // PARTNER PARSER
  // ------------------------

  function parsePartners(cell = "") {
    return cell
      .split("||")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [label] = item.split("::").map((s) => s.trim());
        return label;
      });
  }

  // ------------------------
  // PARTNER PREVIEW
  // ------------------------

  function renderPartnerPreview(cell = "") {
    const partners = parsePartners(cell);

    if (!partners.length) return "";

    const visible = partners.slice(0, 3);
    const remaining = partners.length - visible.length;

    let text = visible.join(", ");

    if (remaining > 0) {
      text += ` and ${remaining} more`;
    }

    return `
      <p class="proj-partners">
        ${text}
      </p>
    `;
  }

  // ------------------------
  // DETAIL PARSER
  // ------------------------

  function parse(cell = "") {
    const parts = cell.split("||").map((s) => (s || "").trim());

    return {
      title: parts[0] || "",
      body: parts[1] || "",
      img: parts[2] || "",
      alt: parts[3] || "",
      caption: parts[4] || "",
    };
  }

  function parseImage(cell = "") {
    const parts = cell.split("||").map((s) => (s || "").trim());

    return {
      src: parts[0] || "",
      alt: parts[1] || "",
    };
  }

  // ------------------------
  // DETAILS
  // ------------------------

  const detailKeys = Object.keys(project)
    .filter((k) => k.startsWith("detail_"))
    .sort((a, b) => {
      const na = parseInt(a.split("_")[1], 10);
      const nb = parseInt(b.split("_")[1], 10);
      return na - nb;
    });

  const detailsHTML = detailKeys
    .map((key) => {
      const d = parse(project[key]);

      if (!d.title && !d.body && !d.img) return "";

      return `
        <div class="detail-section">

          ${d.title ? `<h2 class="detail-section-title">${d.title}</h2>` : ""}

          <div class="detail-section-body">

            ${(d.body || "")
              .split("\n")
              .filter(Boolean)
              .map((p) => `<p>${p}</p>`)
              .join("")}

            ${
              d.img
                ? `
                  <figure>
                    <img src="${d.img}" alt="${d.alt || ""}">
                    ${d.caption ? `<figcaption>${d.caption}</figcaption>` : ""}
                  </figure>
                `
                : ""
            }

          </div>
        </div>
      `;
    })
    .join("");

  const heroParts = project.hero ? project.hero.split(" || ") : [];

  const heroImg = heroParts[0] || "";
  const heroAlt = heroParts[1] || "";

  // ------------------------
  // RENDER META INLINE
  // ------------------------

  function renderMetaInline(label, items) {
    if (!items.length) return "";

    const content = items
      .map((item) => {
        if (item.link) {
          return `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.label}</a>`;
        }

        return item.label;
      })
      .join(", ");

    return `
    <div class="proj-meta-item">
      <p class="proj-meta-label">${label}</p>
      <p class="proj-meta-value">${content}</p>
    </div>
  `;
  }

  function renderMetaList(label, items) {
    if (!items.length) return "";

    const content = items
      .map((item) => {
        if (item.link) {
          return `
          <li>
            <a href="${item.link}" target="_blank" rel="noopener noreferrer">
              ${item.label}<span class="cta" aria-hidden="true"></span>
            </a>
          </li> 
          
        `;
        }

        return `<li>${item.label}</li>`;
      })
      .join("");

    return `
    <div class="proj-meta-item">
      <p class="proj-meta-label">${label}</p>

      <ul class="proj-meta-value proj-meta-list">
        ${content}
      </ul>
    </div>
  `;
  }

  // ------------------------
  // RENDER MAIN PAGE
  // ------------------------

  container.innerHTML = `
    <main class="proj-page-body">

      <p class="proj-page-type">${project.category || ""}</p>

      <h1 class="proj-page-title">${project.title || ""}</h1>

      <p class="proj-page-lead">${project.lead || ""}</p>

      ${
        project.hero
          ? `
            <div class="proj-hero-img">
              <img src="${heroImg}" alt="${heroAlt}">
            </div>
          `
          : ""
      }

      <div class="proj-meta-row">

        ${
          project.role
            ? `
              <div class="proj-meta-item">
                <p class="proj-meta-label">Role</p>
                <p class="proj-meta-value">${project.role}</p>
              </div>
            `
            : ""
        }

        ${renderMetaInline("Partners", partners)}

        <!-- TEAM SECTION COMMENTED OUT -->

${renderMetaList("Outputs", outputs)}

        ${renderMetaInline("Funders", funders)}

      </div>

      ${
        project.context
          ? `
            <div class="proj-section-row">
              <h2 class="proj-section-label">Context</h2>
              <p class="proj-section-body">${project.context}</p>
            </div>
          `
          : ""
      }

      ${
        project.approach
          ? `
            <div class="proj-section-row">

              <h2 class="proj-section-label">Approach</h2>

              <p class="proj-section-body">${project.approach}</p>

              ${
                detailsHTML
                  ? `
                    <div class="detail-toggle">

                      <button
                        onclick="toggleDetail(this, 'details')"
                        class="detail-toggle-btn"
                        aria-expanded="false"
                      >
                        Read more details
                      </button>

                      <div id="details" class="detail-content">
                        ${detailsHTML}
                      </div>

                    </div>
                  `
                  : ""
              }

            </div>
          `
          : ""
      }

      ${
        project.impact
          ? `
            <div class="proj-impact">
              <h2 class="proj-impact-label">Impact</h2>
              <p class="proj-impact-body">${project.impact}</p>
            </div>
          `
          : ""
      }

      <!-- RELATED PROJECTS -->

      <div class="section related-projects">
        <p class="section-label">Related Projects</p>
        <ul class="proj-list" id="related-projects"></ul>
      </div>

    </main>
  `;

  // ------------------------
  // RELATED PROJECTS
  // ------------------------

  function parseRelated(input = "") {
    return input
      .split(/[\|,]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  const relatedSlugs = parseRelated(project.related);

  const relatedContainer = document.getElementById("related-projects");

  if (!relatedContainer || !relatedSlugs.length) {
    return;
  }

  const related = relatedSlugs
    .map((slug) => {
      const p = projects.find((p) => p.slug === slug);

      if (!p) {
        console.warn("Missing related project:", slug);
      }

      return p;
    })
    .filter(Boolean);

  const relatedHTML = related
    .map((p) => {
      const href = `../project/${p.slug}.html`;

      const thumb = parseImage(p.thumbnail);

      const imgSrc = thumb.src || `../img/project/preview/${p.slug}-thumb.jpg`;

      const imgAlt = thumb.alt || p.title;

      return `
        <li>

          <a href="${href}" class="proj-row">

            <div class="proj-img">
              <img src="${imgSrc}" alt="${imgAlt}">
            </div>

            <div class="proj-content">

              <div>

                <h3 class="proj-name">${p.title}</h3>

                <p class="proj-signal">
                  ${p.oneliner || ""}
                </p>

                ${renderPartnerPreview(p.partners)}

                <p class="proj-type">
                  ${p.category || ""}
                </p>

              </div>

              <span class="cta" aria-hidden="true"></span>

            </div>

          </a>

        </li>
      `;
    })
    .join("");

  relatedContainer.innerHTML = relatedHTML;
}

loadProject();
