(function () {
  var MIN_LOADER_MS = 320;
  var FADE_MS = 420;
  var PAGE_LEAVE_MS = 200;
  var shownAt = window.__fpLoaderAt || 0;
  var hideScheduled = false;
  var leaving = false;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function ensureFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/imagenes/favicon.svg';
    document.head.appendChild(link);
  }

  function ensureLoader() {
    if (document.getElementById('site-loader') || !document.body) return;
    var loader = document.createElement('div');
    loader.id = 'site-loader';
    loader.setAttribute('aria-busy', 'true');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML =
      '<div class="site-loader-inner">' +
        '<div class="site-loader-orb" aria-hidden="true"></div>' +
        '<div class="site-loader-brand">FITPOWER</div>' +
        '<div class="site-loader-bar" aria-hidden="true"><i></i></div>' +
      '</div>';
    document.body.prepend(loader);
    shownAt = Date.now();
  }

  function markLoaderShown() {
    if (!shownAt && document.getElementById('site-loader')) {
      shownAt = Date.now();
    }
  }

  function hideLoaderNow() {
    var loader = document.getElementById('site-loader');
    if (!loader || loader.classList.contains('is-done')) return;
    loader.classList.add('is-done');
    loader.setAttribute('aria-busy', 'false');
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, FADE_MS);
  }

  function scheduleHideLoader() {
    if (hideScheduled) return;
    hideScheduled = true;
    markLoaderShown();
    var elapsed = shownAt ? Date.now() - shownAt : 0;
    var wait = Math.max(0, MIN_LOADER_MS - elapsed);
    window.setTimeout(hideLoaderNow, wait);
  }

  function homeHref() {
    var role = '';
    try { role = localStorage.getItem('fitpower_role') || ''; } catch (err) {}
    if (role === 'entrenador') return '/dashboard-entrenador';
    if (role === 'admin') return '/dashboard-admin';
    if (role === 'usuario' || localStorage.getItem('fitpower_token')) return '/dashboard';
    return '/';
  }

  function footerHtml() {
    var brandHref = homeHref();
    return (
      '<footer class="site-footer fp-reveal" data-shared-footer>' +
        '<div class="pincelada izq"></div>' +
        '<div class="pincelada der"></div>' +
        '<div class="site-footer-inner">' +
          '<div><a class="site-footer-brand" href="' + brandHref + '">FITPOWER</a></div>' +
          '<div>' +
            '<h3 class="site-footer-title" data-i18n="footer.contact">CONTACTO</h3>' +
            '<p class="site-footer-text">contacto@fitpower.com</p>' +
            '<p class="site-footer-text">+099 88 77 66</p>' +
            '<p class="site-footer-text">Instagram: @fitpower</p>' +
          '</div>' +
          '<div>' +
            '<h3 class="site-footer-title" data-i18n="footer.hours">HORARIOS</h3>' +
            '<div class="site-footer-horario"><span data-i18n="footer.monFri">LUN - VIE</span><span>07:00 - 22:00</span></div>' +
            '<div class="site-footer-horario"><span data-i18n="footer.saturday">SÁBADO</span><span>08:00 - 20:00</span></div>' +
            '<div class="site-footer-horario"><span data-i18n="footer.sunday">DOMINGO</span><span data-i18n="footer.closed">CERRADO</span></div>' +
          '</div>' +
          '<div>' +
            '<h3 class="site-footer-title" data-i18n="footer.location">UBICACIÓN</h3>' +
            '<a class="site-footer-mapa" href="https://www.google.com/maps?q=Calle+4+y+Diagonal+Sur+America,+Atl%C3%A1ntida,+Canelones,+Uruguay" target="_blank" rel="noopener noreferrer" data-i18n="footer.mapAria" data-i18n-mode="aria" aria-label="Abrir ubicación de FitPower en el mapa">' +
              '<img src="/imagenes/Rectangle%2035.png" alt="Mapa de FitPower en Atlántida" data-i18n="footer.mapAlt" data-i18n-mode="alt" width="480" height="280" loading="lazy" decoding="async">' +
            '</a>' +
            '<p class="site-footer-text">Calle 4 y Diagonal Sur América, Atlántida, Canelones</p>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer-copy" data-i18n="footer.rights">© 2026 FITPOWER. Todos los derechos reservados. Design By UAtlan</div>' +
      '</footer>'
    );
  }

  function injectFooter() {
    var mount = document.querySelector('[data-site-footer]');
    if (!mount || document.querySelector('[data-shared-footer]')) return;
    mount.outerHTML = footerHtml();
    var footer = document.querySelector('[data-shared-footer]');
    if (typeof applyTranslations === 'function' && footer) {
      applyTranslations(footer);
    }
    document.dispatchEvent(new CustomEvent('fitpower:footer-ready'));
  }

  function markPageEnter() {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('fp-page-ready');
      return;
    }
    document.documentElement.classList.add('fp-page-enter');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add('fp-page-ready');
      });
    });
  }

  function setupReveal() {
    var nodes = document.querySelectorAll([
      'main > section',
      'main .hero',
      'main .panel',
      'main .stats > *',
      'main .info-card',
      'main .plan-card',
      'main .actividad-item',
      'main .routine-row',
      'main .activity-row',
      'main .today-card',
      'main .checkout-summary',
      'main .checkout-form',
      'main .rutinas-side',
      'main .rutinas-panel',
      '.landing-header .hero-grid > *',
      '.staff-card',
      '.faq-item',
      '.activities-grid > *',
      '.site-footer',
    ].join(','));

    if (!nodes.length) return;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('fp-reveal', 'is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    nodes.forEach(function (el, index) {
      el.classList.add('fp-reveal');
      var delay = Math.min(5, (index % 6));
      if (delay > 0) el.classList.add('fp-reveal-delay-' + delay);
      io.observe(el);
    });
  }

  function samePageHash(url) {
    return url.origin === location.origin
      && url.pathname === location.pathname
      && url.search === location.search
      && !!url.hash;
  }

  function setupPageTransitions() {
    if (prefersReducedMotion()) return;

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target.closest('a[href]');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      if (link.hasAttribute('data-open-settings')) return;
      if (link.hasAttribute('data-open-notifications')) return;
      if (link.hasAttribute('data-notif-close')) return;

      var raw = link.getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0 || raw.indexOf('tel:') === 0 || raw.indexOf('javascript:') === 0) {
        return;
      }

      var url;
      try { url = new URL(raw, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (samePageHash(url)) return;
      if (leaving) return;

      event.preventDefault();
      leaving = true;
      document.documentElement.classList.add('fp-page-leave');
      window.setTimeout(function () {
        location.href = url.href;
      }, PAGE_LEAVE_MS);
    }, true);
  }

  function boot() {
    markPageEnter();
    ensureFavicon();
    ensureLoader();
    markLoaderShown();
    injectFooter();
    setupReveal();
    setupPageTransitions();
    scheduleHideLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.setTimeout(scheduleHideLoader, 2500);
})();
