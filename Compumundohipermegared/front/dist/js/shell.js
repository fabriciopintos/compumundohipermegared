(function () {
  /* shell v6 — hamburger + sidebar; skip #configuracion scroll; respect settings drawer */
  function initShell() {
    var layout = document.querySelector('.layout');
    var sidebar = document.querySelector('[data-sidebar]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var backdrop = document.querySelector('[data-sidebar-backdrop]');
    if (!layout || !sidebar || !toggle) return;

    var desktop = window.matchMedia('(min-width: 901px)');

    function isDesktop() {
      return desktop.matches;
    }

    function setOpen(open) {
      if (isDesktop()) {
        layout.classList.toggle('is-collapsed', !open);
        sidebar.classList.remove('is-open');
        if (backdrop) backdrop.hidden = true;
        document.body.classList.remove('nav-lock');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }

      layout.classList.remove('is-collapsed');
      sidebar.classList.toggle('is-open', !!open);
      if (backdrop) backdrop.hidden = !open;
      document.body.classList.toggle('nav-lock', !!open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function isOpen() {
      return isDesktop() ? !layout.classList.contains('is-collapsed') : sidebar.classList.contains('is-open');
    }

    toggle.setAttribute('aria-expanded', isDesktop() ? 'true' : 'false');

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!isOpen());
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        setOpen(false);
      });
    }

    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!isDesktop()) setOpen(false);
        var href = link.getAttribute('href') || '';
        if (href === '#configuracion' || link.hasAttribute('data-open-settings')) {
          return;
        }
        sidebar.querySelectorAll('.nav-item').forEach(function (item) {
          item.classList.toggle('active', item === link);
        });
        if (href.charAt(0) === '#' && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            window.setTimeout(function () {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, isDesktop() ? 0 : 180);
          }
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (document.body.classList.contains('settings-drawer-open')) return;
      setOpen(isDesktop());
    });

    desktop.addEventListener('change', function () {
      setOpen(isDesktop());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShell);
  } else {
    initShell();
  }
})();
