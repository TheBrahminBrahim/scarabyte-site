/* ============================================================
   SCARABYTE DOCK — behaviour
   - macOS-style magnify on cursor proximity (desktop only)
   - navigation: smooth in-page scroll on the home page,
     real page links elsewhere
   - active-section / active-page highlight
   No dependencies, no build step.
   ============================================================ */
(function () {
  'use strict';

  function initDock() {
    var dock = document.getElementById('dock');
    if (!dock) return;

    var items = Array.prototype.slice.call(dock.querySelectorAll('.dock-item'));
    var isHome = document.body.classList.contains('home');

    /* — Navigation — */
    function scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function scrollToProducts() {
      var p = document.getElementById('products');
      if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    items.forEach(function (it) {
      var role = it.getAttribute('data-dock');
      it.addEventListener('click', function (e) {
        // On the home page, Home/Apps scroll in-page instead of reloading.
        if (isHome && role === 'home')      { e.preventDefault(); scrollToTop(); }
        else if (isHome && role === 'apps') { e.preventDefault(); scrollToProducts(); }
        /* About, Contact, and Home/Apps from other pages follow their hrefs. */
      });
    });

    /* — Active marker — */
    function setActive(role) {
      items.forEach(function (it) {
        it.classList.toggle('is-active', it.getAttribute('data-dock') === role);
      });
    }

    if (isHome) {
      var products = document.getElementById('products');
      var ticking = false;
      function updateActive() {
        ticking = false;
        var role = 'home';
        if (products && products.getBoundingClientRect().top <= window.innerHeight * 0.45) {
          role = 'apps';
        }
        setActive(role);
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
      }, { passive: true });
      updateActive();
    } else {
      var preset = dock.getAttribute('data-active');
      if (preset) setActive(preset);
    }

    /* — Magnify (desktop pointers, motion allowed) — */
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    var BASE = 52, MAX = 80, INF = 130;

    function magnify(clientX) {
      for (var i = 0; i < items.length; i++) {
        var r = items[i].getBoundingClientRect();
        var c = r.left + r.width / 2;
        var d = Math.abs(clientX - c);
        var t = Math.max(0, 1 - d / INF);
        t = t * t * (3 - 2 * t);                 // smoothstep for a softer wave
        var size = BASE + (MAX - BASE) * t;
        items[i].style.setProperty('--size', size.toFixed(1) + 'px');
      }
    }
    function reset() {
      for (var i = 0; i < items.length; i++) {
        items[i].style.setProperty('--size', BASE + 'px');
      }
    }

    dock.addEventListener('pointermove', function (e) { magnify(e.clientX); });
    dock.addEventListener('pointerleave', reset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDock);
  } else {
    initDock();
  }
})();
