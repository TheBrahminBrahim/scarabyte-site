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
    function scrollToSection(id) {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    items.forEach(function (it) {
      var role = it.getAttribute('data-dock');
      it.addEventListener('click', function (e) {
        if (!isHome) return; // let hrefs work on other pages
        if (role === 'home')         { e.preventDefault(); scrollToTop(); }
        else if (role === 'about')   { e.preventDefault(); scrollToSection('about'); }
        else if (role === 'apps')    { e.preventDefault(); scrollToSection('products'); }
        else if (role === 'contact') { e.preventDefault(); scrollToSection('contact'); }
      });
    });

    /* — Active marker — */
    function setActive(role) {
      items.forEach(function (it) {
        it.classList.toggle('is-active', it.getAttribute('data-dock') === role);
      });
    }

    if (isHome) {
      var about    = document.getElementById('about');
      var products = document.getElementById('products');
      var contact  = document.getElementById('contact');
      var ticking = false;
      function updateActive() {
        ticking = false;
        var threshold = window.innerHeight * 0.45;
        var role = 'home';
        if (about    && about.getBoundingClientRect().top    <= threshold) role = 'about';
        if (products && products.getBoundingClientRect().top <= threshold) role = 'apps';
        if (contact  && contact.getBoundingClientRect().top  <= threshold) role = 'contact';
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
