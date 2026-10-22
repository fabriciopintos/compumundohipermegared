const DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

/** JS getDay(): 0=domingo … 6=sábado. Domingos cerrado → lunes. */
function todayDayLabel() {
  const map = ['LUN', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  return map[new Date().getDay()] || 'LUN';
}

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

  const selectorDias = document.getElementById('selectorDias');
  const flechas = selectorDias ? selectorDias.querySelectorAll('.flecha') : [];
  let dias = [];

  function rebuildDayButtons() {
    if (!selectorDias) return;
    const nextArrow = flechas[1] || null;
    selectorDias.querySelectorAll('.dia').forEach(function (el) { el.remove(); });
    DAYS.forEach(function (day) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dia';
      btn.dataset.day = day;
      btn.textContent = typeof t === 'function' ? t('dash.days.' + day) : day;
      if (nextArrow) selectorDias.insertBefore(btn, nextArrow);
      else selectorDias.appendChild(btn);
    });
    dias = Array.from(selectorDias.querySelectorAll('.dia'));
  }

  rebuildDayButtons();

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

    var sectionLinks = Array.from(navLinks.querySelectorAll('a[href^="#"]')).filter(function (link) {

      return !link.hasAttribute('data-open-settings')
        && !link.hasAttribute('data-open-notifications')
        && link.getAttribute('href') !== '#configuracion'
        && link.getAttribute('href') !== '#notificaciones';

    });

    if ('IntersectionObserver' in window && sectionLinks.length) {

      var byId = {};

      sectionLinks.forEach(function (link) {

        byId[link.getAttribute('href').slice(1)] = link;

      });

      var observer = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {

          var link = byId[entry.target.id];

          if (!link || !entry.isIntersecting) return;

          sectionLinks.forEach(function (item) { item.classList.remove('active'); });

          link.classList.add('active');

        });

      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.1 });

      Object.keys(byId).forEach(function (id) {

        var section = document.getElementById(id);

        if (section) observer.observe(section);

      });

    }

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

    return activo ? activo.dataset.day : todayDayLabel();

  }

  function setActiveDay(day) {

    const safe = DAYS.indexOf(day) >= 0 ? day : todayDayLabel();

    dias.forEach(function (el) {

      el.classList.toggle('activo', el.dataset.day === safe);

    });

  }

  setActiveDay(todayDayLabel());

  async function loadMe() {

    const payload = await API.request('/me');

    if (payload.status !== 'success') {

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

    if (typeof mountFitpowerSettings === 'function') {

      mountFitpowerSettings({

        role: 'usuario',

        user: user,

        onProfileSave: function (profile) {

          if (nombreUsuario) {

            nombreUsuario.textContent = '“' + (profile.name || 'USUARIO') + '”';

          }

        },

      });

    }

  }

  async function loadActivities() {

    if (!gridActividades) return;

    const payload = await API.request('/activities');

    if (payload.status !== 'success') {

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

    const payload = await API.request('/classes?day=' + encodeURIComponent(selectedDay()));

    if (payload.status !== 'success') {

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

        const payload = await API.request(isEnrolled ? '/enrollments/cancel' : '/enrollments', 'POST', {

          classSessionId: sessionId,

        });

        if (payload.status !== 'success') {

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

  function bindDayClicks() {
    dias.forEach(function (dia) {
      dia.addEventListener('click', function () {
        setActiveDay(dia.dataset.day);
        loadClasses();
      });
    });
  }

  bindDayClicks();

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

  const notifModal = document.getElementById('notifModal');
  const notifList = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge');
  const markAllNotifs = document.getElementById('markAllNotifs');
  let notifModalOpen = false;

  function formatNotifTime(iso) {
    if (!iso) return '';
    try {
      const raw = String(iso).trim();
      const d = new Date(raw.indexOf('T') === -1 ? raw.replace(' ', 'T') : raw);
      if (Number.isNaN(d.getTime())) return raw.slice(0, 16);
      const diff = Date.now() - d.getTime();
      if (Math.abs(diff) < 5 * 60 * 1000) return t('dash.notifJustNow');
      return d.toLocaleString(getLang && getLang() === 'en' ? 'en-US' : 'es-UY', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      return String(iso).slice(0, 16);
    }
  }

  function setUnreadBadge(count) {
    if (!notifBadge) return;
    const n = Number(count) || 0;
    if (n <= 0) {
      notifBadge.hidden = true;
      notifBadge.textContent = '0';
      return;
    }
    notifBadge.hidden = false;
    notifBadge.textContent = n > 99 ? '99+' : String(n);
  }

  function openNotifModal() {
    if (!notifModal) return;
    notifModalOpen = true;
    notifModal.hidden = false;
    document.body.classList.add('notif-modal-open');
    requestAnimationFrame(function () {
      notifModal.classList.add('is-open');
    });
    if (location.hash !== '#notificaciones') {
      history.replaceState(null, '', '#notificaciones');
    }
    loadNotifications(true);
  }

  function closeNotifModal() {
    if (!notifModal) return;
    notifModalOpen = false;
    notifModal.classList.remove('is-open');
    document.body.classList.remove('notif-modal-open');
    window.setTimeout(function () {
      if (!notifModalOpen) notifModal.hidden = true;
    }, 180);
    if (location.hash === '#notificaciones') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function renderNotifications(items, unreadCount) {
    setUnreadBadge(unreadCount);
    if (markAllNotifs) markAllNotifs.hidden = !(unreadCount > 0);
    if (!notifList) return;

    if (!items.length) {
      notifList.innerHTML = '<p class="empty-state">' + t('dash.notificationsEmpty') + '</p>';
      return;
    }

    notifList.innerHTML = items.map(function (item) {
      const unread = !item.isRead;
      const link = item.link || '/rutinas';
      return (
        '<article class="notif-item' + (unread ? ' is-unread' : '') + '" data-id="' + escapeHtml(item.id) + '">' +
          '<span class="notif-dot" aria-hidden="true"></span>' +
          '<div class="notif-body">' +
            '<strong>' + escapeHtml(item.title) +
              (unread ? ' <span class="notif-meta">· ' + t('dash.notifUnread') + '</span>' : '') +
            '</strong>' +
            '<p>' + escapeHtml(item.body) + '</p>' +
            '<div class="notif-meta">' + escapeHtml(formatNotifTime(item.createdAt)) + '</div>' +
          '</div>' +
          '<div class="notif-actions">' +
            '<a class="btn-morado" href="' + escapeHtml(link) + '">' + t('dash.notifOpenRoutine') + '</a>' +
            (unread
              ? '<button type="button" class="btn-morado" data-read-notif style="background:#2a2433">' + t('dash.markRead') + '</button>'
              : '') +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  async function loadNotifications(forceList) {
    const payload = await API.request('/notifications');
    if (payload.status !== 'success') {
      setUnreadBadge(0);
      if (notifList && (forceList || notifModalOpen)) {
        notifList.innerHTML = '<p class="empty-state is-error">' + t('dash.notificationsError') + '</p>';
      }
      return;
    }
    const items = (payload.data && payload.data.notifications) || [];
    const unread = (payload.data && payload.data.unreadCount) || 0;
    setUnreadBadge(unread);
    if (markAllNotifs) markAllNotifs.hidden = !(unread > 0);
    if (notifList && (forceList || notifModalOpen)) {
      renderNotifications(items, unread);
    }
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-open-notifications]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openNotifModal();
  }, true);

  if (notifModal) {
    notifModal.addEventListener('click', function (event) {
      if (event.target.closest('[data-notif-close]')) {
        closeNotifModal();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || !notifModalOpen) return;
    if (document.body.classList.contains('settings-drawer-open')) return;
    event.preventDefault();
    closeNotifModal();
  });

  if (notifList) {
    notifList.addEventListener('click', async function (event) {
      const btn = event.target.closest('[data-read-notif]');
      if (!btn) return;
      const card = btn.closest('.notif-item');
      if (!card) return;
      const id = Number(card.getAttribute('data-id'));
      if (!id) return;
      btn.disabled = true;
      await API.request('/notifications/' + id + '/read', 'POST');
      await loadNotifications(true);
    });
  }

  if (markAllNotifs) {
    markAllNotifs.addEventListener('click', async function () {
      markAllNotifs.disabled = true;
      await API.request('/notifications/read-all', 'POST');
      markAllNotifs.disabled = false;
      await loadNotifications(true);
    });
  }

  document.addEventListener('fitpower:langchange', function () {
    const current = selectedDay();
    rebuildDayButtons();
    setActiveDay(current);
    bindDayClicks();
    loadClasses();
    loadActivities();
    loadNotifications(notifModalOpen);
  });

  (async function init() {
    try {
      await Promise.all([loadMe(), loadActivities(), loadClasses(), loadNotifications(false)]);
    } catch (err) {
      showDashboardError(err.message || 'No se pudo cargar el panel.');
      if (typeof mountFitpowerSettings === 'function') {
        mountFitpowerSettings({ role: 'usuario', user: {} });
      }
    }

    if (typeof mountFitpowerChat === 'function') {
      mountFitpowerChat({ root: '#usuario-chat-root' });
    }

    if (location.hash === '#notificaciones') {
      openNotifModal();
    }
  })();

});

