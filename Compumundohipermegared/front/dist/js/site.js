(function () {
  var MIN_LOADER_MS = 350;
  var FADE_MS = 450;
  var shownAt = window.__fpLoaderAt || 0;
  var hideScheduled = false;

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
        '<div class="site-loader-ring" aria-hidden="true"></div>' +
        '<div class="site-loader-brand">FITPOWER</div>' +
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

  function footerHtml() {
    return (
      '<footer class="site-footer" data-shared-footer>' +
        '<div class="pincelada izq"></div>' +
        '<div class="pincelada der"></div>' +
        '<div class="site-footer-inner">' +
          '<div><a class="site-footer-brand" href="/">FITPOWER</a></div>' +
          '<div>' +
            '<h3 class="site-footer-title">CONTACTO</h3>' +
            '<p class="site-footer-text">contacto@fitpower.com</p>' +
            '<p class="site-footer-text">+099 88 77 66</p>' +
            '<p class="site-footer-text">Instagram: @fitpower</p>' +
          '</div>' +
          '<div>' +
            '<h3 class="site-footer-title">HORARIOS</h3>' +
            '<div class="site-footer-horario"><span>LUN - VIE</span><span>07:00 - 22:00</span></div>' +
            '<div class="site-footer-horario"><span>SÁBADO</span><span>08:00 - 20:00</span></div>' +
            '<div class="site-footer-horario"><span>DOMINGO</span><span>CERRADO</span></div>' +
          '</div>' +
          '<div>' +
            '<h3 class="site-footer-title">UBICACION</h3>' +
            '<a class="site-footer-mapa" href="https://www.google.com/maps?q=Calle+4+y+Diagonal+Sur+America,+Atl%C3%A1ntida,+Canelones,+Uruguay" target="_blank" rel="noopener noreferrer" aria-label="Abrir ubicación de FitPower en el mapa">' +
              '<img src="/imagenes/Rectangle%2035.png" alt="Mapa de FitPower en Atlántida" width="480" height="280" loading="lazy" decoding="async">' +
            '</a>' +
            '<p class="site-footer-text">Calle 4 y Diagonal Sur América, Atlántida, Canelones</p>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer-copy">© 2026 FITPOWER. Todos los derechos reservados. Design By UAtlan</div>' +
      '</footer>'
    );
  }

  function injectFooter() {
    var mount = document.querySelector('[data-site-footer]');
    if (!mount || document.querySelector('[data-shared-footer]')) return;
    mount.outerHTML = footerHtml();
  }

  function boot() {
    ensureFavicon();
    ensureLoader();
    markLoaderShown();
    injectFooter();
    scheduleHideLoader();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.setTimeout(scheduleHideLoader, 2500);
})();
