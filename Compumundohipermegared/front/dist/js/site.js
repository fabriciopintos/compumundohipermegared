(function () {
  function ensureFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/imagenes/favicon.svg';
    document.head.appendChild(link);
  }

  function ensureLoader() {
    if (document.getElementById('site-loader') || !document.body) return;
    const loader = document.createElement('div');
    loader.id = 'site-loader';
    loader.setAttribute('aria-busy', 'true');
    loader.setAttribute('aria-live', 'polite');
    loader.innerHTML =
      '<div class="site-loader-inner">' +
        '<div class="site-loader-ring" aria-hidden="true"></div>' +
        '<div class="site-loader-brand">FITPOWER</div>' +
      '</div>';
    document.body.prepend(loader);
  }

  function hideLoader() {
    const loader = document.getElementById('site-loader');
    if (!loader || loader.classList.contains('is-done')) return;
    loader.classList.add('is-done');
    loader.setAttribute('aria-busy', 'false');
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 400);
  }

  function footerHtml() {
    return (
      '<footer class="site-footer" data-shared-footer>' +
        '<div class="pincelada izq"></div>' +
        '<div class="pincelada der"></div>' +
        '<div class="site-footer-inner">' +
          '<div><div class="site-footer-brand">FITPOWER</div></div>' +
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
            '<div class="site-footer-mapa">' +
              '<iframe src="https://www.google.com/maps?q=Calle+4+y+Diagonal+Sur+America,+Atl%C3%A1ntida,+Canelones,+Uruguay&output=embed" loading="lazy" title="Ubicación de FitPower"></iframe>' +
            '</div>' +
            '<p class="site-footer-text">Calle 4 y Diagonal Sur América, Atlántida, Canelones</p>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer-copy">© 2026 FITPOWER. Todos los derechos reservados.</div>' +
      '</footer>'
    );
  }

  function injectFooter() {
    const mount = document.querySelector('[data-site-footer]');
    if (!mount || document.querySelector('[data-shared-footer]')) return;
    mount.outerHTML = footerHtml();
  }

  function boot() {
    ensureFavicon();
    ensureLoader();
    injectFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', hideLoader);
  window.setTimeout(hideLoader, 2500);
})();
