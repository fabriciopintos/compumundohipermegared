const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['usuario']);
  if (!allowed) {
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  const nombreUsuario = document.getElementById('nombreUsuario');
  const vecesSemana = document.getElementById('vecesSemana');
  const cantidadActividades = document.getElementById('cantidadActividades');
  const gridActividades = document.getElementById('gridActividades');
  const listaClases = document.getElementById('listaClases');
  const dashboardError = document.getElementById('dashboard-error');
  const dias = Array.from(document.querySelectorAll('#selectorDias .dia'));
  const flechas = document.querySelectorAll('#selectorDias .flecha');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  if (navBurger && navLinks) {
    navBurger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        await apiFetch('/logout', { method: 'POST' });
      } catch (err) {
        // cierre local
      }
      clearToken();
      window.location.href = '/';
    });
  }

  function showDashboardError(message) {
    if (!dashboardError) return;
    dashboardError.hidden = false;
    dashboardError.textContent = message;
  }

  function clearDashboardError() {
    if (!dashboardError) return;
    dashboardError.hidden = true;
    dashboardError.textContent = '';
  }

  function selectedDay() {
    const activo = document.querySelector('#selectorDias .dia.activo');
    return activo ? activo.dataset.day : 'LUN';
  }

  function setActiveDay(day) {
    dias.forEach(function (el) {
      el.classList.toggle('activo', el.dataset.day === day);
    });
  }

  async function loadMe() {
    const { ok, payload } = await apiFetch('/me');
    if (!ok) {
      throw new Error(payload.message || 'No se pudo cargar tu perfil.');
    }
    const data = payload.data || {};
    const user = data.user || {};
    setRole(user.role || 'usuario');
    if (nombreUsuario) {
      nombreUsuario.textContent = '“' + (user.name || 'USUARIO') + '”';
    }
    if (vecesSemana) {
      vecesSemana.textContent = String(data.weeklyLogins ?? '0');
    }
    if (cantidadActividades) {
      cantidadActividades.textContent = String(data.enrolledActivities ?? '0');
    }
  }

  async function loadActivities() {
    if (!gridActividades) return;
    const { ok, payload } = await apiFetch('/activities');
    if (!ok) {
      throw new Error(payload.message || 'No se pudieron cargar las actividades.');
    }
    const activities = (payload.data && payload.data.activities) || [];
    const order = ['boxeo', 'hidrogimnasia', 'pilates', 'zumba'];
    const featured = order
      .map(function (slug) {
        return activities.find(function (item) { return item.slug === slug; });
      })
      .filter(Boolean);
    const list = featured.length ? featured : activities.slice(0, 4);

    if (!list.length) {
      gridActividades.innerHTML = '<p class="empty-state">No hay actividades disponibles por ahora.</p>';
      return;
    }

    gridActividades.innerHTML = list.map(function (item) {
      const name = escapeHtml((item.name || '').toUpperCase());
      const image = item.imageUrl
        ? '<img src="' + escapeHtml(item.imageUrl) + '" alt="' + name + '" loading="lazy">'
        : '';
      return (
        '<article class="actividad-item">' +
          '<div class="card-actividad">' +
            image +
            '<div class="overlay">' +
              '<h3 class="card-titulo">' + name + '</h3>' +
              '<a class="btn-morado" href="#proximas">' + t('dash.joinHere') + '</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  async function loadClasses() {
    if (!listaClases) return;
    listaClases.innerHTML = '<p class="empty-state">' + t('dash.loadingClasses') + '</p>';
    const { ok, payload } = await apiFetch('/classes?day=' + encodeURIComponent(selectedDay()));
    if (!ok) {
      listaClases.innerHTML = '<p class="empty-state is-error">' + t('dash.errorClasses') + '</p>';
      return;
    }
    const classes = (payload.data && payload.data.classes) || [];
    if (!classes.length) {
      listaClases.innerHTML = '<p class="empty-state">' + t('dash.noClasses') + '</p>';
      return;
    }

    listaClases.innerHTML = classes.map(function (item) {
      const label = item.isEnrolled ? t('dash.enrolled') : t('dash.enroll');
      const enrolledClass = item.isEnrolled ? ' is-enrolled' : '';
      return (
        '<div class="clase-item">' +
          '<div class="clase-nombre">' + escapeHtml((item.name || '').toUpperCase()) +
            '<span class="clase-datos">' + escapeHtml(item.time) + ' &nbsp; ' +
            escapeHtml(item.enrolledCount) + '/' + escapeHtml(item.capacity) + '</span>' +
          '</div>' +
          '<div class="clase-profesor">' + t('dash.professor') + ':</div>' +
          '<button class="btn-anotame' + enrolledClass + '" data-id="' + escapeHtml(item.id) +
            '" data-enrolled="' + (item.isEnrolled ? '1' : '0') + '">' + label + '</button>' +
        '</div>'
      );
    }).join('');
  }

  if (listaClases) {
    listaClases.addEventListener('click', async function (event) {
      const button = event.target.closest('.btn-anotame');
      if (!button || button.disabled) {
        return;
      }

      const sessionId = Number(button.dataset.id);
      const isEnrolled = button.dataset.enrolled === '1';
      button.disabled = true;
      button.textContent = isEnrolled ? t('dash.unenrolling') : t('dash.enrolling');

      try {
        const { ok, payload } = await apiFetch(isEnrolled ? '/enrollments/cancel' : '/enrollments', {
          method: 'POST',
          body: JSON.stringify({ classSessionId: sessionId }),
        });

        if (!ok) {
          showDashboardError(
            payload.message || (isEnrolled ? t('dash.unenrollError') : t('dash.enrollError'))
          );
          button.disabled = false;
          button.textContent = isEnrolled ? t('dash.enrolled') : t('dash.enroll');
          return;
        }

        clearDashboardError();
        await Promise.all([loadMe(), loadClasses()]);
      } catch (err) {
        showDashboardError(isEnrolled ? t('dash.unenrollError') : t('dash.enrollError'));
        button.disabled = false;
        button.textContent = isEnrolled ? t('dash.enrolled') : t('dash.enroll');
      }
    });
  }

  dias.forEach(function (dia) {
    dia.addEventListener('click', function () {
      setActiveDay(dia.dataset.day);
      loadClasses();
    });
  });

  flechas.forEach(function (flecha, index) {
    flecha.addEventListener('click', function () {
      const current = DAYS.indexOf(selectedDay());
      const next = index === 0
        ? (current + DAYS.length - 1) % DAYS.length
        : (current + 1) % DAYS.length;
      setActiveDay(DAYS[next]);
      loadClasses();
    });
  });

  document.addEventListener('fitpower:langchange', function () {
    loadClasses();
    loadActivities();
  });

  (async function init() {
    try {
      await Promise.all([loadMe(), loadActivities(), loadClasses()]);
    } catch (err) {
      showDashboardError(err.message || 'No se pudo cargar el panel.');
    }

    if (typeof mountFitpowerChat === 'function') {
      mountFitpowerChat({ root: '#usuario-chat-root' });
    }
  })();
});
