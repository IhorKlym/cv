/*
  Ihor Klymenko / Ігор Клименко: CV
  Progressive enhancement only. The page is complete without this file:
  content is visible, links work, the theme follows the OS setting.
*/
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'cv-theme';
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  /* ------------------------------------------------------------
     Theme toggle (light / dark), persisted in localStorage
     ------------------------------------------------------------ */

  var toggle = document.querySelector('[data-theme-toggle]');

  function storedTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function activeTheme() {
    var forced = root.getAttribute('data-theme');
    if (forced === 'light' || forced === 'dark') return forced;
    return darkQuery && darkQuery.matches ? 'dark' : 'light';
  }

  function syncThemeUI() {
    if (toggle) toggle.setAttribute('aria-pressed', activeTheme() === 'dark' ? 'true' : 'false');

    // Keep the browser chrome colour in step with a manually chosen theme.
    if (root.hasAttribute('data-theme')) {
      var bg = getComputedStyle(root).getPropertyValue('--bg').trim();
      if (bg) {
        var metas = document.querySelectorAll('meta[name="theme-color"]');
        for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', bg);
      }
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = activeTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* storage unavailable: the choice lasts for this page view only */
      }
      syncThemeUI();
    });
  }

  if (darkQuery) {
    var onSchemeChange = function () {
      if (!storedTheme()) syncThemeUI();
    };
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSchemeChange);
    else if (darkQuery.addListener) darkQuery.addListener(onSchemeChange);
  }

  syncThemeUI();

  /* ------------------------------------------------------------
     Reveal on scroll: staggered fade-and-rise, runs once per item.
     Only active when the inline <head> script added .can-reveal
     (JS on, IntersectionObserver available, motion allowed).
     ------------------------------------------------------------ */

  if (root.classList.contains('can-reveal') && 'IntersectionObserver' in window) {
    window.__cvReveal = true;

    var STAGGER = 80;
    var MAX_DELAY = 480;

    // After the entrance finishes, drop the reveal classes so the element's
    // own hover transitions are not slowed down by the reveal timing.
    var settle = function (el, delay) {
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        el.classList.remove('reveal', 'is-visible');
        el.style.removeProperty('--reveal-delay');
      };
      var onEnd = function (event) {
        if (event.target !== el || event.propertyName !== 'opacity') return;
        el.removeEventListener('transitionend', onEnd);
        finish();
      };
      el.addEventListener('transitionend', onEnd);
      setTimeout(finish, delay + 1400);
    };

    var observer = new IntersectionObserver(function (entries) {
      var visible = [];
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) visible.push(entries[i].target);
      }
      // Stagger items that enter together, in document order.
      visible.sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
      visible.forEach(function (el, index) {
        var delay = Math.min(index * STAGGER, MAX_DELAY);
        observer.unobserve(el);
        el.style.setProperty('--reveal-delay', delay + 'ms');
        el.classList.add('is-visible');
        if (el.classList.contains('loop')) el.classList.add('is-drawn');
        settle(el, delay);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    var items = document.querySelectorAll('.reveal');
    for (var r = 0; r < items.length; r++) observer.observe(items[r]);
  }

  /* ------------------------------------------------------------
     Scroll progress line + active section in the nav
     ------------------------------------------------------------ */

  var progress = document.querySelector('.progress');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (link) {
    return document.getElementById(link.getAttribute('href').slice(1));
  });
  var activeId = null;
  var ticking = false;

  function update() {
    ticking = false;
    var scrollY = window.pageYOffset || root.scrollTop;
    var max = root.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (progress) progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';

    var current = null;
    var line = window.innerHeight * 0.35;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top <= line) current = sections[i].id;
    }
    if (max > 0 && scrollY >= max - 2 && sections.length && sections[sections.length - 1]) {
      current = sections[sections.length - 1].id;
    }

    if (current !== activeId) {
      activeId = current;
      navLinks.forEach(function (link, index) {
        var on = !!sections[index] && sections[index].id === current;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  /* ------------------------------------------------------------
     Language switch keeps your place: UA <-> EN lands on the same section.
     ------------------------------------------------------------ */

  var langLinks = document.querySelectorAll('[data-lang-link]');
  for (var l = 0; l < langLinks.length; l++) {
    langLinks[l].addEventListener('click', function (event) {
      var link = event.currentTarget;
      var base = link.getAttribute('href').split('#')[0];
      link.setAttribute('href', activeId ? base + '#' + activeId : base);
    });
  }
})();
