(function() {
  "use strict";

  var demoScrollKey = "mainLpScrollY";
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var body = document.body;
  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var mobileLinks = document.querySelectorAll("[data-mobile-link]");
  var loadElements = document.querySelectorAll("[data-load]");
  var revealElements = document.querySelectorAll("[data-reveal]");
  var navLinks = document.querySelectorAll("[data-nav-link]");
  var observedSections = document.querySelectorAll("section[id]");
  var faqItems = document.querySelectorAll(".faq-item");
  var countupElements = document.querySelectorAll("[data-countup]");
  var heroTexture = document.querySelector(".hero__texture");
  var mobileCta = document.querySelector(".mobile-cta");
  var footer = document.querySelector("#footer");
  var lastScrollY = window.scrollY || 0;
  var footerVisible = false;
  var countupStarted = new WeakSet();

  function markLoaded() {
    if (reducedMotion.matches) {
      loadElements.forEach(function(element) {
        element.classList.add("is-visible");
      });
    }

    window.requestAnimationFrame(function() {
      body.classList.add("is-loaded");
      loadElements.forEach(function(element) {
        var delay = parseInt(element.style.getPropertyValue("--load-delay"), 10) || 0;
        window.setTimeout(function() {
          element.classList.add("is-visible");
        }, delay);
      });
    });
  }

  function saveMainScrollPosition() {
    sessionStorage.setItem(demoScrollKey, String(window.scrollY || window.pageYOffset || 0));
  }

  function restoreMainScrollPositionIfNeeded(event) {
    var saved = sessionStorage.getItem(demoScrollKey);
    if (!saved) return;

    var navEntry = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || null;
    var isBackForward = !!(event && event.persisted) || !!(navEntry && navEntry.type === "back_forward");
    if (!isBackForward) return;

    window.scrollTo(0, parseInt(saved, 10) || 0);
    sessionStorage.removeItem(demoScrollKey);
  }

  function toggleMobileNav(forceOpen) {
    if (!menuToggle || !mobileNav) return;

    var shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !mobileNav.classList.contains("is-open");
    mobileNav.classList.toggle("is-open", shouldOpen);
    menuToggle.classList.toggle("is-active", shouldOpen);
    menuToggle.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    body.classList.toggle("nav-open", shouldOpen);
  }

  function updateHeaderState() {
    var scrollY = window.scrollY || window.pageYOffset || 0;
    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 20);
    }
  }

  function setActiveNav(id) {
    navLinks.forEach(function(link) {
      var isActive = link.getAttribute("href") === "#" + id;
      link.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function observeSectionsForNav() {
    if (!("IntersectionObserver" in window)) return;

    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    }, {
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0.01
    });

    observedSections.forEach(function(section) {
      sectionObserver.observe(section);
    });
  }

  function animateCountup(element) {
    if (!element || countupStarted.has(element)) return;
    countupStarted.add(element);

    var target = parseInt(element.getAttribute("data-countup-target"), 10);
    if (!target) return;

    if (reducedMotion.matches) {
      element.textContent = target.toLocaleString("ja-JP");
      return;
    }

    var startTime = null;
    var duration = 1200;
    var formatter = new Intl.NumberFormat("ja-JP");

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatter.format(Math.round(target * eased));

      if (progress < 1) {
        window.requestAnimationFrame(frame);
      }
    }

    window.requestAnimationFrame(frame);
  }

  function observeReveals() {
    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      revealElements.forEach(function(element) {
        element.classList.add("is-visible");
        if (element.classList.contains("process-step")) {
          element.classList.add("is-visible");
        }
      });
      countupElements.forEach(animateCountup);
      return;
    }

    var revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        if (entry.target.classList.contains("section-heading")) {
          entry.target.classList.add("is-visible");
        }

        if (entry.target.classList.contains("process")) {
          entry.target.classList.add("is-visible");
        }

        if (entry.target.hasAttribute("data-countup")) {
          animateCountup(entry.target);
        }

        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(function(element) {
      revealObserver.observe(element);
    });

    countupElements.forEach(function(element) {
      revealObserver.observe(element);
    });

    var processSection = document.querySelector(".process");
    if (processSection) {
      revealObserver.observe(processSection);
    }
  }

  function setupFaq() {
    faqItems.forEach(function(item) {
      var button = item.querySelector(".faq-item__button");
      if (!button) return;

      button.addEventListener("click", function() {
        var willOpen = !item.classList.contains("is-open");

        if (window.innerWidth <= 600) {
          faqItems.forEach(function(otherItem) {
            if (otherItem === item) return;
            otherItem.classList.remove("is-open");
            var otherButton = otherItem.querySelector(".faq-item__button");
            if (otherButton) otherButton.setAttribute("aria-expanded", "false");
          });
        }

        item.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    });
  }

  function updateHeroParallax() {
    if (!heroTexture || reducedMotion.matches) return;
    var offset = (window.scrollY || window.pageYOffset || 0) * 0.3;
    heroTexture.style.transform = "translateY(" + Math.round(offset) + "px)";
  }

  function updateMobileCta() {
    if (!mobileCta || window.innerWidth > 600) {
      if (mobileCta) mobileCta.classList.remove("is-visible");
      return;
    }

    var currentY = window.scrollY || window.pageYOffset || 0;
    var scrollingDown = currentY > lastScrollY;
    var pastHero = currentY > window.innerHeight * 0.35;
    var shouldShow = pastHero && scrollingDown && !footerVisible;

    mobileCta.classList.toggle("is-visible", shouldShow);
    lastScrollY = currentY;
  }

  function observeFooter() {
    if (!("IntersectionObserver" in window) || !footer || !mobileCta) return;

    var footerObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        footerVisible = entry.isIntersecting;
        if (footerVisible) {
          mobileCta.classList.remove("is-visible");
        }
      });
    }, {
      threshold: 0.05
    });

    footerObserver.observe(footer);
  }

  function addScrollRestoreLinks() {
    document.querySelectorAll("[data-restore-scroll]").forEach(function(link) {
      link.addEventListener("click", saveMainScrollPosition);
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function() {
      toggleMobileNav();
    });
  }

  mobileLinks.forEach(function(link) {
    link.addEventListener("click", function() {
      toggleMobileNav(false);
    });
  });

  window.addEventListener("pageshow", restoreMainScrollPositionIfNeeded);
  window.addEventListener("scroll", function() {
    updateHeaderState();
    updateHeroParallax();
    updateMobileCta();
  }, { passive: true });
  window.addEventListener("resize", updateMobileCta);

  updateHeaderState();
  updateHeroParallax();
  updateMobileCta();
  observeFooter();
  observeSectionsForNav();
  observeReveals();
  setupFaq();
  addScrollRestoreLinks();

  if (document.readyState === "complete") {
    markLoaded();
  } else {
    window.addEventListener("load", markLoaded, { once: true });
  }
})();
