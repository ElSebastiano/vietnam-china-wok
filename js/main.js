(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var heroWrapper = document.querySelector(".hero-wrapper");

  function onScroll() {
    if (!header) return;
    // On the homepage the header stays transparent for as long as the
    // scroll-jacked hero section still covers the viewport, not just the
    // first few pixels of scroll.
    var scrolledPastHero = heroWrapper
      ? heroWrapper.getBoundingClientRect().bottom <= 0
      : window.scrollY > 12;
    header.classList.toggle("is-scrolled", scrolledPastHero);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      toggle.setAttribute("aria-expanded", String(!open));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var track = document.getElementById("testimonial-track");
  if (track) {
    document.querySelectorAll(".carousel-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = track.querySelector(".testimonial-card");
        var step = card ? card.getBoundingClientRect().width + 22 : 300;
        track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: "smooth" });
      });
    });

    // Click-and-drag scrolling for mouse users (touch/trackpad already
    // scroll the track natively).
    var isDragging = false;
    var dragMoved = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      isDragging = true;
      dragMoved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
      track.classList.add("is-dragging");
    });

    track.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var delta = e.clientX - startX;
      if (Math.abs(delta) > 3) dragMoved = true;
      track.scrollLeft = startScroll - delta;
    });

    function endDrag() {
      isDragging = false;
      track.classList.remove("is-dragging");
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerleave", endDrag);

    // Prevent the drag from also triggering a click on whatever is under
    // the cursor (e.g. text selection) once the user has actually dragged.
    track.addEventListener("click", function (e) {
      if (dragMoved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }
})();
