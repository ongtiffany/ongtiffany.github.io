async function loadSelectedWork() {
  let projects = [];

  try {
    const res = await fetch("/data/projects.json");
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  const container = document.getElementById("selected-work");

  if (!container) {
    console.error("#selected-work not found");
    return;
  }

  // ------------------------
  // MANUAL FEATURED LIST
  // ------------------------
  const featuredSlugs = [
    "issa",
    "redesigningorg",
    "agec",
    "livingwithmachines",
    "digitalaccessibility",
    "illustratingimpact",
  ];

  function parseImage(cell = "") {
    const parts = cell.split("||").map((s) => (s || "").trim());

    return {
      src: parts[0] || "",
      alt: parts[1] || "",
    };
  }

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

  // map slugs → projects (preserves order)
  const featured = featuredSlugs
    .map((slug) => {
      const found = projects.find((p) => p.slug === slug);

      if (!found) {
        console.warn("Missing project for slug:", slug);
      }

      return found;
    })
    .filter(Boolean);

  // ------------------------
  // BUILD HTML
  // ------------------------
  const html = featured
    .map((project) => {
      const slug = project.slug;

      const href = `project/${slug}.html`;

      const img = parseImage(project.thumbnail);

      return `
        <li>
          <a href="${href}" class="proj-row" aria-label="View ${project.title} project">

            <div class="proj-img">
              <img src="${img.src}" alt="${img.alt}">
            </div>

            <div class="proj-content">

              <div>

                <h3 class="proj-name">
                  ${project.title || ""}
                </h3>

                <p class="proj-signal">
                  ${project.oneliner || ""}
                </p>

                ${renderPartnerPreview(project.partners)}

                <p class="proj-type">
                  ${project.category || ""}
                </p>

              </div>

              <span class="cta" aria-hidden="true"></span>

            </div>

          </a>
        </li>
      `;
    })
    .join("");

  container.innerHTML = html;
}

loadSelectedWork();
