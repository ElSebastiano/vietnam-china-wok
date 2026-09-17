/**
 * Scroll-gesteuerte Hero-Hintergrundanimation aus einer WebP-Frame-Sequenz
 * (Bami Goreng, 192 Frames). Zeichnet auf <canvas>, Fortschritt = Scrollposition
 * innerhalb von .hero-wrapper. Respektiert prefers-reduced-motion und liefert
 * einen statischen Poster-Fallback ohne JavaScript.
 */
(function () {
  var wrapper = document.querySelector(".hero-wrapper");
  var canvas = document.getElementById("hero-canvas");
  var poster = document.getElementById("hero-poster");
  if (!wrapper || !canvas) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    // Statischer Hintergrund reicht aus; Canvas bleibt ungenutzt.
    canvas.remove();
    return;
  }

  var isMobile = window.matchMedia("(max-width: 640px)").matches;
  var basePath = "assets/hero-frames/" + (isMobile ? "mobile" : "desktop") + "/";
  var frameCount = isMobile ? 96 : 192;
  var frameStep = isMobile ? 2 : 1; // mobile Set enthält nur ungerade Originalframes

  function frameName(i) {
    var n = (i * frameStep) + 1;
    return "f_" + String(n).padStart(4, "0") + ".webp";
  }

  var ctx = canvas.getContext("2d", { alpha: false });
  var images = new Array(frameCount);
  var loadedCount = 0;
  var currentFrame = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var visible = true;

  function sizeCanvas() {
    var rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }

  function drawFrame(index) {
    var img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    var cw = canvas.width, ch = canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    var dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function nearestLoadedIndex(target) {
    if (images[target] && images[target].complete) return target;
    for (var offset = 1; offset < frameCount; offset++) {
      var down = target - offset, up = target + offset;
      if (down >= 0 && images[down] && images[down].complete) return down;
      if (up < frameCount && images[up] && images[up].complete) return up;
    }
    return -1;
  }

  function renderCurrent() {
    var idx = nearestLoadedIndex(currentFrame);
    if (idx >= 0) drawFrame(idx);
  }

  function revealCanvasIfReady() {
    if (poster && !poster.hidden && loadedCount > 0) {
      canvas.hidden = false;
      poster.hidden = true;
    }
  }

  function loadFrame(i) {
    if (images[i]) return;
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      loadedCount++;
      if (i === currentFrame || loadedCount === 1) renderCurrent();
      revealCanvasIfReady();
    };
    img.src = basePath + frameName(i);
    images[i] = img;
  }

  // Erste Frames sofort laden (fürs LCP/Poster-Ablösen), Rest im Idle-Loop.
  var eagerCount = Math.min(10, frameCount);
  for (var e = 0; e < eagerCount; e++) loadFrame(e);

  var queueIndex = eagerCount;
  function idleLoadNext(deadline) {
    while (queueIndex < frameCount && (!deadline || deadline.timeRemaining() > 0)) {
      loadFrame(queueIndex);
      queueIndex++;
    }
    if (queueIndex < frameCount) {
      scheduleIdle();
    }
  }
  function scheduleIdle() {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(idleLoadNext, { timeout: 800 });
    } else {
      setTimeout(function () { idleLoadNext(null); }, 120);
    }
  }
  scheduleIdle();

  function updateFromScroll() {
    if (!visible) return;
    var rect = wrapper.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var scrolled = -rect.top;
    var progress = total > 0 ? scrolled / total : 0;
    progress = Math.max(0, Math.min(1, progress));
    var target = Math.round(progress * (frameCount - 1));
    if (target !== currentFrame) {
      currentFrame = target;
      renderCurrent();
    }

    revealCanvasIfReady();
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateFromScroll();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    sizeCanvas();
    renderCurrent();
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    });
    io.observe(wrapper);
  }

  sizeCanvas();
  updateFromScroll();
})();
