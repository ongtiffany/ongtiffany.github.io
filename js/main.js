document.addEventListener("DOMContentLoaded", () => {
  // =====================================================
  // CUSTOM CURSOR
  // =====================================================

  const cursor = document.querySelector(".cursor");

  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .proj-row")) {
        cursor.classList.add("cursor--hover");
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .proj-row")) {
        cursor.classList.remove("cursor--hover");
      }
    });

    document.addEventListener(
      "touchstart",
      (e) => {
        const target = e.target.closest("a, button, .proj-row");

        if (!target) return;

        const touch = e.touches[0];

        cursor.style.left = touch.clientX + "px";
        cursor.style.top = touch.clientY + "px";

        cursor.classList.add("cursor--hover");
      },
      { passive: true },
    );

    document.addEventListener(
      "touchend",
      () => {
        setTimeout(() => {
          cursor.classList.remove("cursor--hover");
        }, 200);
      },
      { passive: true },
    );

    document.addEventListener(
      "touchcancel",
      () => {
        cursor.classList.remove("cursor--hover");
      },
      { passive: true },
    );
  }

  // =====================================================
  // NAV ACTIVE STATE
  // =====================================================

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(
    'nav[aria-label="Main navigation"] a',
  );

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // =====================================================
  // GENERAL REVEAL
  // =====================================================

  const revealElements = document.querySelectorAll(
    ".phil-item, .proj-row, .contrib-item, .orgs-list li, .proj-section, .detail-section, figure",
  );

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;

          setTimeout(() => {
            entry.target.classList.add("revealed");
          }, i * 60);

          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
      },
    );

    revealElements.forEach((el) => {
      el.classList.add("reveal-ready");
      revealObserver.observe(el);
    });
  }

  // =====================================================
  // IMAGE PARALLAX
  // =====================================================

  const parallaxImages = document.querySelectorAll(
    ".proj-img img, .work-item-img img",
  );

  function updateParallax() {
    parallaxImages.forEach((img) => {
      const rect = img.getBoundingClientRect();

      const offset = (window.innerHeight / 2 - rect.top) * 0.04;

      img.style.transform = `translateY(${offset}px) scale(1.05)`;
    });
  }

  // =====================================================
  // CASE STUDY TOGGLE
  // =====================================================

  window.toggleLong = function (btn, id) {
    const content = document.getElementById(id);

    if (!content) return;

    const isOpen = content.classList.contains("open");

    content.classList.toggle("open", !isOpen);

    btn.setAttribute("aria-expanded", String(!isOpen));
  };
});

// =====================================================
// DETAIL BUTTON LABELS
// =====================================================

document.querySelectorAll(".detail-toggle-btn").forEach((btn) => {
  btn.textContent = "More details";
});

// =====================================================
// DETAIL TOGGLE
// =====================================================

function toggleDetail(btn, id) {
  const el = document.getElementById(id);

  if (!el) return;

  const isOpen = el.classList.contains("open");

  if (!isOpen) {
    el.classList.add("open");
    el.style.maxHeight = el.scrollHeight + "px";
  } else {
    el.style.maxHeight = el.scrollHeight + "px";

    requestAnimationFrame(() => {
      el.style.maxHeight = "0px";
      el.classList.remove("open");
    });
  }

  btn.setAttribute("aria-expanded", String(!isOpen));

  btn.textContent = isOpen ? "More details" : "Hide details";
}

// =====================================================
// KEEP HEIGHTS IN SYNC
// =====================================================

window.addEventListener("resize", () => {
  document.querySelectorAll(".detail-content.open").forEach((el) => {
    el.style.maxHeight = el.scrollHeight + "px";
  });
});

// =====================================================
// DARK LIGHT MODE TOGGLE
// =====================================================

if (!localStorage.getItem("theme")) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  document.documentElement.setAttribute(
    "data-theme",
    prefersDark ? "dark" : "light",
  );
}

const toggle = document.getElementById("theme-toggle");

if (toggle) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");

    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);

    localStorage.setItem("theme", next);
  });
}
