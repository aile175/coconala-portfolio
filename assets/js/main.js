(function() {
  'use strict';

  var demoScrollKey = 'mainLpScrollY';
  var rootStyle = document.documentElement.style;

  function updateViewportHeightVar() {
    var vh = (window.innerHeight || document.documentElement.clientHeight || 0) * 0.01;
    if (!vh) return;
    rootStyle.setProperty('--app-height', vh + 'px');
  }

  function saveMainScrollPosition() {
    sessionStorage.setItem(demoScrollKey, String(window.scrollY || window.pageYOffset || 0));
  }

  function restoreMainScrollPositionIfNeeded(event) {
    var saved = sessionStorage.getItem(demoScrollKey);
    if (!saved) return;

    var navEntry = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
    var isBackForward = !!(event && event.persisted) || !!(navEntry && navEntry.type === 'back_forward');
    if (!isBackForward) return;

    window.scrollTo(0, parseInt(saved, 10) || 0);
    sessionStorage.removeItem(demoScrollKey);
  }

  updateViewportHeightVar();
  window.addEventListener('resize', updateViewportHeightVar);
  window.addEventListener('orientationchange', updateViewportHeightVar);
  window.addEventListener('pageshow', updateViewportHeightVar);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateViewportHeightVar);
  }

  window.addEventListener('pageshow', restoreMainScrollPositionIfNeeded);

  // Hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = mobileNav.querySelectorAll('a');

  hamburger.addEventListener('click', function() {
    const isOpen = mobileNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      mobileNav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Scroll fade-in (Intersection Observer)
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    fadeEls.forEach(function(el) {
      el.classList.add('is-ready');
      observer.observe(el);
    });
  } else {
    // Fallback: show all
    fadeEls.forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

  // Active nav highlight on scroll
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.header__nav a');

  function highlightNav() {
    var scrollY = window.scrollY + 100;
    sections.forEach(function(section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(function(link) {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--c-accent)';
          }
        });
      }
    });
  }
  window.addEventListener('scroll', highlightNav, { passive: true });

  // Make entire demo cards clickable without breaking inner links
  var demoCards = document.querySelectorAll('.demo-card');
  var demoCardLinks = document.querySelectorAll('.demo-card a[href]');
  demoCardLinks.forEach(function(link) {
    link.addEventListener('click', saveMainScrollPosition);
  });

  demoCards.forEach(function(card) {
    var link = card.querySelector('.demo-card__link');
    var fallbackLink = card.querySelector('.demo-card__placeholder');
    var targetUrl = link ? link.getAttribute('href') : (fallbackLink ? fallbackLink.getAttribute('href') : '');

    if (!targetUrl) return;

    card.style.cursor = 'pointer';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');

    card.addEventListener('click', function(event) {
      if (event.target.closest('a, button, input, textarea, select, label')) return;
      saveMainScrollPosition();
      window.location.href = targetUrl;
    });

    card.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        saveMainScrollPosition();
        window.location.href = targetUrl;
      }
    });
  });

})();
