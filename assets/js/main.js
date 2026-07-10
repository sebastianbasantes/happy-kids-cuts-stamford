/* =========================================================
   A & G Happy Kids Hair Cuts — main.js
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  function closeMenu() {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ---------- Image sets ---------- */
  // High-quality featured photos (carousel)
  const carouselImages = [];
  const carouselSkip = [2, 3]; // removed staff/team group photos
  for (let i = 1; i <= 20; i++) {
    if (carouselSkip.includes(i)) continue;
    carouselImages.push(`assets/images/slide-${String(i).padStart(2, "0")}.jpg`);
  }
  // Small matrix photos
  const galleryImages = [];
  for (let i = 1; i <= 19; i++) {
    galleryImages.push(`assets/images/gallery-${i}-598x399.jpg`);
  }

  /* ---------- Lightbox (generic: works with any image list) ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = lb ? lb.querySelector(".lb-img") : null;
  const btnClose = lb ? lb.querySelector(".lb-close") : null;
  const btnPrev = lb ? lb.querySelector(".lb-prev") : null;
  const btnNext = lb ? lb.querySelector(".lb-next") : null;
  let lbList = [];
  let lbIndex = 0;
  let lastFocus = null;

  function showImage(idx) {
    if (!lbList.length) return;
    lbIndex = (idx + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
    lbImg.alt = `Salon photo ${lbIndex + 1} of ${lbList.length}`;
  }
  function openLightbox(list, idx, trigger) {
    lbList = list;
    lastFocus = trigger || document.activeElement;
    showImage(idx);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    btnClose.focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  if (lb) {
    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", () => showImage(lbIndex - 1));
    btnNext.addEventListener("click", () => showImage(lbIndex + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showImage(lbIndex - 1);
      else if (e.key === "ArrowRight") showImage(lbIndex + 1);
    });
  }

  /* ---------- Gallery matrix ---------- */
  const grid = document.getElementById("gallery-grid");
  if (grid) {
    galleryImages.forEach(function (src, i) {
      const btn = document.createElement("button");
      btn.className = "gallery-item";
      btn.type = "button";
      btn.setAttribute("aria-label", `Open photo ${i + 1} of ${galleryImages.length}`);

      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 598;
      img.height = 399;
      img.alt = `Happy Kids Hair Cuts salon — photo ${i + 1}`;

      btn.appendChild(img);
      btn.addEventListener("click", () => openLightbox(galleryImages, i, btn));
      grid.appendChild(btn);
    });
  }

  /* ---------- Featured carousel ---------- */
  const track = document.getElementById("carousel-track");
  const dotsWrap = document.getElementById("carousel-dots");
  const carEl = document.getElementById("carousel");
  if (track && carEl) {
    let cIndex = 0;
    let autoTimer = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    carouselImages.forEach(function (src, i) {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";
      const img = document.createElement("img");
      img.src = src;
      img.loading = i === 0 ? "eager" : "lazy";
      img.decoding = "async";
      img.alt = `A & G Happy Kids Hair Cuts — featured photo ${i + 1}`;
      img.addEventListener("click", () => openLightbox(carouselImages, cIndex, img));
      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      cIndex = (i + carouselImages.length) % carouselImages.length;
      track.style.transform = `translateX(-${cIndex * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === cIndex));
    }
    function next() { goTo(cIndex + 1); }
    function prev() { goTo(cIndex - 1); }
    function restart() {
      if (reduce) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 5000);
    }

    document.getElementById("carousel-next").addEventListener("click", () => { next(); restart(); });
    document.getElementById("carousel-prev").addEventListener("click", () => { prev(); restart(); });
    carEl.addEventListener("mouseenter", () => clearInterval(autoTimer));
    carEl.addEventListener("mouseleave", restart);

    // Basic swipe support
    let startX = null;
    track.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); restart(); }
      startX = null;
    });

    goTo(0);
    restart();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Respect reduced-motion for the hero video ---------- */
  const heroVideo = document.getElementById("hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  /* ---------- Hero sound toggle ---------- */
  const soundBtn = document.getElementById("hero-sound");
  if (soundBtn && heroVideo) {
    const icon = soundBtn.querySelector(".hs-icon");
    const label = soundBtn.querySelector(".hs-label");
    soundBtn.addEventListener("click", function () {
      const turnOn = heroVideo.muted;      // currently muted -> turn sound on
      heroVideo.muted = !turnOn;
      if (turnOn) heroVideo.play().catch(function () {});
      soundBtn.classList.toggle("is-on", turnOn);
      soundBtn.setAttribute("aria-pressed", String(turnOn));
      soundBtn.setAttribute("aria-label", turnOn ? "Turn sound off" : "Turn sound on");
      icon.textContent = turnOn ? "🔊" : "🔇";
      label.textContent = turnOn ? "Sound on" : "Tap for sound";
    });
  }

  /* ---------- Floating book button (show after hero) ---------- */
  const fab = document.querySelector(".fab-book");
  const hero = document.getElementById("hero");
  if (fab && hero && "IntersectionObserver" in window) {
    const fabIo = new IntersectionObserver(function (entries) {
      fab.classList.toggle("show", !entries[0].isIntersecting);
    }, { threshold: 0 });
    fabIo.observe(hero);
  }
})();
