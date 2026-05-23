async function loadWork() {
  let projects = [];

  try {
    const res = await fetch("/data/projects.json");
    projects = await res.json();
  } catch (err) {
    console.error("Failed to load projects.json", err);
    return;
  }

  const container = document.getElementById("work-grid");

  if (!container) {
    console.error("#work-grid not found");
    return;
  }

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

    const visible = partners.slice(0, 1);
    const remaining = partners.length - visible.length;

    let text = visible.join(", ");

    if (remaining > 0) {
      text += ` & ${remaining} more`;
    }

    return `
      <p class="proj-partners">
        ${text}
      </p>
    `;
  }

  // ------------------------
  // SORT PROJECTS
  // ------------------------

  projects.sort((a, b) => (b.date || 0) - (a.date || 0));

  // ------------------------
  // BUILD HTML
  // ------------------------

  const html = projects
    .map((project) => {
      const slug = project.slug?.trim();
      const hasSlug = !!slug;

      const href = hasSlug ? `project/${slug}.html` : "";

      const img = parseImage(project.thumbnail);

      const content = `
      <div class="work-item-img">
        <img src="${img.src}" alt="${img.alt}">
      </div>

      <div class="work-item-content">

        <h2 class="work-item-name">
          ${project.title || ""}
        </h2>

        <p class="work-item-desc">
          ${project.oneliner || ""}
        </p>

        ${renderPartnerPreview(project.partners)}

        <p class="work-item-type">
          ${project.category || ""} · ${project.date || ""}
        </p>

        ${hasSlug ? `<span class="cta" aria-hidden="true"></span>` : ""}

      </div>
    `;

      return `
      <li>

        ${
          hasSlug
            ? `
              <a
                href="${href}"
                class="work-item"
                aria-label="View ${project.title} project"
              >
                ${content}
              </a>
            `
            : `
              <div class="work-item">
                ${content}
              </div>
            `
        }

      </li>
    `;
    })
    .join("");

  container.innerHTML = html;
}

loadWork();
