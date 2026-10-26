const menuButton = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

const pageName = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a:not(.btn)").forEach(link => {
  const href = link.getAttribute("href") || "";
  if ((pageName === "index.html" && href === "index.html") || (pageName !== "index.html" && href === "index.html#courses")) {
    link.classList.add("active");
  }
});

document.querySelectorAll("[data-year]").forEach(el => {
  el.textContent = new Date().getFullYear();
});

const revealItems = document.querySelectorAll(".course-card, .feature, .content-block, .course-visual");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealItems.forEach(item => item.classList.add("reveal"));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  revealItems.forEach(item => observer.observe(item));
}

/* ── Classroom Slider ── */
(function () {
  const slider = document.getElementById("classroomSlider");
  if (!slider) return;

  const track = document.getElementById("classroomTrack");
  const dotsWrap = document.getElementById("csDots");
  const prevBtn = slider.querySelector(".cs-prev");
  const nextBtn = slider.querySelector(".cs-next");
  const captionTitle = document.getElementById("captionTitle");
  const captionSub = document.getElementById("captionSub");

  const images = Array.from(track.querySelectorAll("img"));
  const total = images.length;
  let current = 0;
  let autoTimer = null;

  /* Build dots */
  const dots = images.map((_, i) => {
    const btn = document.createElement("button");
    btn.className = "cs-dot" + (i === 0 ? " active" : "");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", "Slide " + (i + 1));
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    btn.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(btn);
    return btn;
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === current);
      d.setAttribute("aria-selected", i === current ? "true" : "false");
    });
    /* Update caption */
    const img = images[current];
    if (captionTitle) captionTitle.textContent = img.dataset.title || "";
    if (captionSub) captionSub.textContent = img.dataset.sub || "";
    resetAuto();
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  /* Touch / swipe */
  let touchStartX = 0;
  slider.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* Mouse drag */
  let dragStartX = 0, dragging = false;
  slider.addEventListener("mousedown", e => { dragStartX = e.clientX; dragging = true; });
  slider.addEventListener("mouseup", e => {
    if (!dragging) return; dragging = false;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  });
  slider.addEventListener("mouseleave", () => { dragging = false; });

  /* Pause auto on hover */
  slider.addEventListener("mouseenter", () => clearInterval(autoTimer));
  slider.addEventListener("mouseleave", () => resetAuto());

  resetAuto();
})();

/* ── Home hero: background crossfade + header state ── */
(function () {
  const media = document.getElementById("heroMedia");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (media && !reduce) {
    const slides = Array.from(media.querySelectorAll("img"));
    let idx = 0;
    if (slides.length > 1) {
      setInterval(() => {
        if (document.hidden) return;
        slides[idx].classList.remove("is-active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("is-active");
      }, 6500);
    }
  }

  const header = document.getElementById("siteHeader");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const navMap = document.querySelectorAll(".ss-nav-main a[href^='#']");
  if (navMap.length && "IntersectionObserver" in window) {
    const sections = Array.from(navMap)
      .map(a => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navMap.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => sectionObserver.observe(s));
  }
})();

const dashboard = document.querySelector(".analytics-dashboard");
if (dashboard && "IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const dashboardObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    dashboard.classList.add("charts-ready");
    dashboard.querySelectorAll("[data-count]").forEach(counter => {
      const target = Number(counter.dataset.count);
      const prefix = counter.dataset.prefix || "";
      const suffix = counter.dataset.suffix || "";
      const start = performance.now();
      const duration = 1100;
      const update = now => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = prefix + Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString("en-IN") + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
    dashboardObserver.disconnect();
  }, { threshold: .2 });
  dashboardObserver.observe(dashboard);
}

/* ---------------------------------------------------------------------
   Enquiry form → Google Sheet + WhatsApp
   Paste your deployed Google Apps Script Web App URL below
   (see google-apps-script.gs for setup steps).
   --------------------------------------------------------------------- */
const ENQUIRY_SHEET_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
const ENQUIRY_WHATSAPP_NUMBER = "917289917922";

const enquiryForm = document.getElementById("enquiry-form");

if (enquiryForm) {
  const statusEl = document.getElementById("enquiry-status");
  const submitBtn = document.getElementById("enquiry-submit");
  const fields = {
    name: document.getElementById("enquiry-name"),
    course: document.getElementById("enquiry-course"),
    message: document.getElementById("enquiry-message")
  };

  const setStatus = (text, type = "") => {
    statusEl.textContent = text;
    statusEl.className = "ss-form-status" + (type ? " is-" + type : "");
  };

  Object.values(fields).forEach(field =>
    field.addEventListener("input", () => field.classList.remove("is-invalid"))
  );

  enquiryForm.addEventListener("submit", event => {
    event.preventDefault();

    const data = {
      name: fields.name.value.trim(),
      course: fields.course.value,
      message: fields.message.value.trim()
    };

    let firstInvalid = null;
    if (data.name.length < 2) { fields.name.classList.add("is-invalid"); firstInvalid ||= fields.name; }
    if (!data.course) { fields.course.classList.add("is-invalid"); firstInvalid ||= fields.course; }
    if (firstInvalid) {
      setStatus("Please enter your name and choose a course.", "error");
      firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…");

    // 1) Store in Google Sheet (fire-and-forget; no-cors means we can't read the response)
    if (ENQUIRY_SHEET_URL.startsWith("https://")) {
      const body = new URLSearchParams({ ...data, page: location.href, submittedAt: new Date().toISOString() });
      fetch(ENQUIRY_SHEET_URL, { method: "POST", mode: "no-cors", body, keepalive: true })
        .catch(err => console.warn("Sheet logging failed:", err));
    }

    // 2) Open WhatsApp with the details pre-filled (done synchronously so popup blockers allow it)
    const lines = [
      "Hi Skill Sphere Academy, I'd like to enquire about a course.",
      "",
      "*Name:* " + data.name,
      "*Course:* " + data.course
    ];
    if (data.message) lines.push("*Message:* " + data.message);
    const waUrl = "https://wa.me/" + ENQUIRY_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    const win = window.open(waUrl, "_blank");
    if (win) win.opener = null;
    else window.location.href = waUrl;

    setStatus("Thanks, " + data.name.split(" ")[0] + "! Your enquiry is ready in WhatsApp — just tap send.", "success");
    enquiryForm.reset();
    submitBtn.disabled = false;
  });
}
