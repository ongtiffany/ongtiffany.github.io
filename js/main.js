document.addEventListener("DOMContentLoaded", () => {
  // ----- CUSTOM CURSOR -----
  const cursor = document.querySelector(".cursor");

  if (cursor) {
    // Desktop mouse movement
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    // Desktop hover
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

    // Touch devices
    document.addEventListener(
      "touchstart",
      (e) => {
        const target = e.target.closest("a, button, .proj-row");

        if (!target) return;

        const touch = e.touches[0];

        // Move cursor to tap position
        cursor.style.left = touch.clientX + "px";
        cursor.style.top = touch.clientY + "px";

        // Show hover effect
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

  // ----- STICKY NAV ACTIVE HIGHLIGHTING -----
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(
    'nav[aria-label="Main navigation"] a',
  );
  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + entry.target.id,
              );
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
  }

  // ----- SCROLL-TRIGGERED REVEAL -----
  const revealEls = document.querySelectorAll(
    ".phil-item, .proj-row, .contrib-item, .orgs-list li",
  );
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("revealed"), i * 60);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    revealEls.forEach((el) => {
      el.classList.add("reveal-ready");
      revealObserver.observe(el);
    });
  }

  // ----- HERO TEXT MAGNETIC EFFECT -----
  const heroLine = document.querySelector(".hero-line");
  if (heroLine) {
    heroLine.addEventListener("mousemove", (e) => {
      const rect = heroLine.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      heroLine.style.transform = `translate(${x * 6}px, ${y * 3}px)`;
    });
    heroLine.addEventListener("mouseleave", () => {
      heroLine.style.transform = "";
    });
  }

  // ----- TOGGLE LONG CASE STUDY -----
  window.toggleLong = function (btn, id) {
    const content = document.getElementById(id);
    if (!content) return;
    const isOpen = content.classList.contains("open");
    content.classList.toggle("open", !isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  };
});

// ----- DETAIL TOGGLE BUTTON LABEL INIT -----
document.querySelectorAll(".detail-toggle-btn").forEach((btn) => {
  btn.textContent = "More details";
});

// ----- IMPROVED DETAIL TOGGLE (DYNAMIC HEIGHT) -----
function toggleDetail(btn, id) {
  const el = document.getElementById(id);
  if (!el) return;

  const isOpen = el.classList.contains("open");

  if (!isOpen) {
    // OPEN
    el.classList.add("open");
    el.style.maxHeight = el.scrollHeight + "px";
  } else {
    // CLOSE (smooth)
    el.style.maxHeight = el.scrollHeight + "px"; // set current height first
    requestAnimationFrame(() => {
      el.style.maxHeight = "0px";
      el.classList.remove("open");
    });
  }

  btn.setAttribute("aria-expanded", String(!isOpen));
  btn.textContent = isOpen ? "More details" : "Hide details";
}

// ----- KEEP HEIGHT IN SYNC (RESIZE / IMAGE LOADS) -----
window.addEventListener("resize", () => {
  document.querySelectorAll(".detail-content.open").forEach((el) => {
    el.style.maxHeight = el.scrollHeight + "px";
  });
});

// ----- TITLE HOVER EFFECT -----
const title = document.querySelector(".proj-page-title");

if (title) {
  title.addEventListener("mousemove", (e) => {
    const rect = title.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

    title.style.transform = `translate(${x * 4}px, ${y * 2}px)`;
  });

  title.addEventListener("mouseleave", () => {
    title.style.transform = "";
  });
}

// ----- REVEAL ON SCROLL (PROJECT PAGE) -----
const elements = document.querySelectorAll(
  ".proj-section, .detail-section, figure",
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("revealed");
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);

elements.forEach((el) => {
  el.classList.add("reveal-ready");
  observer.observe(el);
});
