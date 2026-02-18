(function() {
  'use strict';

  var demoScrollKey = 'mainLpScrollY';
  var rootStyle = document.documentElement.style;
  var copyVariant = 'A'; // 'A' | 'B' | 'C'
  var copyStorageKey = 'mainLpCopyVariant';
  var copySets = {
    A: {
      heroLabel: '建設業・士業専門 / IT初心者向け',
      heroTitle: '「何の会社か」が一目で伝わる<br>ホームページを、維持費0円で制作',
      heroSub: '難しい設定は不要です。全国800社の調査をもとに、<br>お問い合わせにつながる構成で制作します。',
      primaryCta: '料金とサービス内容を見る',
      ctaDesc: 'デモ確認後にそのままご相談できます。初めての方にも分かるよう、手順をシンプルにしています。',
      floatCta: 'HP制作の詳細・料金を見る'
    },
    B: {
      heroLabel: '建設業・士業専門 / 価格重視の方向け',
      heroTitle: '月額0円で運用できる<br>ホームページを制作',
      heroSub: 'サーバー代や管理費をかけずに、<br>必要な情報が伝わるページを作成します。',
      primaryCta: '費用感を確認する',
      ctaDesc: '制作費と維持費のバランスを重視したい方向けのプランです。まずは費用感から確認できます。',
      floatCta: '費用感を確認する'
    },
    C: {
      heroLabel: '建設業・士業専門 / はじめてでも安心',
      heroTitle: '相談から公開まで<br>迷わず進めるホームページ制作',
      heroSub: '「何を準備すればいいか分からない」状態でも問題ありません。<br>必要事項を一緒に整理して進めます。',
      primaryCta: 'まずは相談してみる',
      ctaDesc: '依頼前の相談だけでも可能です。難しい専門用語を使わず、分かりやすくご案内します。',
      floatCta: 'まずは相談してみる'
    }
  };

  function resolveCopyVariant() {
    var params = new URLSearchParams(window.location.search || '');
    var fromQuery = (params.get('ab') || '').toUpperCase();
    if (copySets[fromQuery]) {
      sessionStorage.setItem(copyStorageKey, fromQuery);
      return fromQuery;
    }

    var fromStorage = (sessionStorage.getItem(copyStorageKey) || '').toUpperCase();
    if (copySets[fromStorage]) return fromStorage;

    sessionStorage.setItem(copyStorageKey, copyVariant);
    return copyVariant;
  }

  function applyCopyVariant() {
    var selectedVariant = resolveCopyVariant();
    var selected = copySets[selectedVariant] || copySets.A;
    Object.keys(selected).forEach(function(key) {
      var el = document.querySelector('[data-copy-key="' + key + '"]');
      if (!el) return;
      el.innerHTML = selected[key];
    });
  }

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
  applyCopyVariant();
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

  // Floating CTA visibility
  var floatCta = document.querySelector('.float-cta');
  if (floatCta) {
    floatCta.style.opacity = '0';
    floatCta.style.transform = 'translateY(100%)';
    floatCta.style.transition = 'opacity 0.3s, transform 0.3s';
    var floatVisible = false;

    function checkFloatCta() {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      var shouldShow = scrollY > (window.innerHeight * 0.5);
      if (shouldShow && !floatVisible) {
        floatCta.style.opacity = '1';
        floatCta.style.transform = 'translateY(0)';
        floatVisible = true;
      } else if (!shouldShow && floatVisible) {
        floatCta.style.opacity = '0';
        floatCta.style.transform = 'translateY(100%)';
        floatVisible = false;
      }
    }

    window.addEventListener('scroll', checkFloatCta, { passive: true });
    checkFloatCta();
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
