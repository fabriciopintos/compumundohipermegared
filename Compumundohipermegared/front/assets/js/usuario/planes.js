document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['usuario']);
  if (!allowed) {
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  if (navBurger && navLinks) {
    function setNavOpen(open) {
      navLinks.classList.toggle('open', open);
      navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    navBurger.addEventListener('click', function () {
      setNavOpen(!navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    document.addEventListener('click', function (event) {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(event.target) || navBurger.contains(event.target)) return;
      setNavOpen(false);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        await API.request('/logout', 'POST');
      } catch (err) {
        // cierre local
      }
      clearToken();
      window.location.href = '/';
    });
  }

  async function loadMe() {
    const payload = await API.request('/me');
    if (payload.status !== 'success') {
      throw new Error(payload.message || 'No se pudo cargar tu perfil.');
    }
    const data = payload.data || {};
    const user = data.user || {};
    setRole(user.role || 'usuario');
    if (typeof mountFitpowerSettings === 'function') {
      mountFitpowerSettings({ role: 'usuario', user: user });
    }
  }

  try {
    await loadMe();
  } catch (err) {
    if (typeof mountFitpowerSettings === 'function') {
      mountFitpowerSettings({ role: 'usuario', user: {} });
    }
  }
});
