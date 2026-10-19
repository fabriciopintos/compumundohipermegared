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
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const nombreUsuario = document.getElementById('nombreUsuario');

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

  const RUTINA_DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  const rutinasTabs = document.getElementById('rutinasTabs');
  const rutinaTitle = document.getElementById('rutinaTitle');
  const rutinaDesc = document.getElementById('rutinaDesc');
  const rutinaVideo = document.getElementById('rutinaVideo');
  const rutinaDays = document.getElementById('rutinaDays');
  const rutinaExercises = document.getElementById('rutinaExercises');
  const rutinaHero = document.getElementById('rutinaHero');
  let activeRoutine = 'fuerza';
  let activeRoutineDay = 'LUN';

  function routinesCatalog() {
    return [
      {
        id: 'fuerza',
        label: t('dash.routine1'),
        title: t('dash.routine1'),
        desc: t('dash.routine1Text'),
        image: '/imagenes/Rectangle%203.png',
        videoUrl: 'https://www.youtube.com/watch?v=HE45jVN7XKM',
        exercises: [
          { name: t('dash.ex.squat'), detail: '4 x 10', rest: '90s' },
          { name: t('dash.ex.bench'), detail: '4 x 8', rest: '90s' },
          { name: t('dash.ex.row'), detail: '4 x 10', rest: '75s' },
          { name: t('dash.ex.ohp'), detail: '3 x 10', rest: '75s' },
          { name: t('dash.ex.curl'), detail: '3 x 12', rest: '60s' },
          { name: t('dash.ex.core'), detail: '3 x 40"', rest: '45s' },
        ],
      },
      {
        id: 'hipertrofia',
        label: t('dash.routineHyper'),
        title: t('dash.routineHyper'),
        desc: t('dash.routineHyperText'),
        image: '/imagenes/Rectangle%206.png',
        videoUrl: 'https://www.youtube.com/watch?v=nxisr1AalNc',
        exercises: [
          { name: t('dash.ex.lunges'), detail: '3 x 12', rest: '60s' },
          { name: t('dash.ex.fly'), detail: '3 x 12', rest: '60s' },
          { name: t('dash.ex.lat'), detail: '4 x 10', rest: '75s' },
          { name: t('dash.ex.lateral'), detail: '3 x 15', rest: '45s' },
          { name: t('dash.ex.tricep'), detail: '3 x 12', rest: '45s' },
          { name: t('dash.ex.core'), detail: '3 x 45"', rest: '40s' },
        ],
      },
      {
        id: 'cardio',
        label: t('dash.routine2'),
        title: t('dash.routine2'),
        desc: t('dash.routine2Text'),
        image: '/imagenes/Rectangle%208.png',
        videoUrl: 'https://www.youtube.com/watch?v=xSUXMwqZ3z0',
        exercises: [
          { name: t('dash.ex.warmup'), detail: '8 min', rest: '-' },
          { name: t('dash.ex.bag'), detail: '6 x 2\'', rest: '60s' },
          { name: t('dash.ex.jump'), detail: '4 x 45"', rest: '45s' },
          { name: t('dash.ex.burpee'), detail: '4 x 10', rest: '50s' },
          { name: t('dash.ex.bike'), detail: '10 min', rest: '-' },
          { name: t('dash.ex.stretch'), detail: '5 min', rest: '-' },
        ],
      },
      {
        id: 'movilidad',
        label: t('dash.routine3'),
        title: t('dash.routine3'),
        desc: t('dash.routine3Text'),
        image: '/imagenes/Rectangle%207.png',
        videoUrl: 'https://www.youtube.com/watch?v=2IcWJobNDck',
        exercises: [
          { name: t('dash.ex.breath'), detail: '3 min', rest: '-' },
          { name: t('dash.ex.catcow'), detail: '2 x 12', rest: '30s' },
          { name: t('dash.ex.hip'), detail: '2 x 10', rest: '30s' },
          { name: t('dash.ex.thoracic'), detail: '2 x 8', rest: '30s' },
          { name: t('dash.ex.hamstring'), detail: '2 x 40"', rest: '20s' },
          { name: t('dash.ex.flow'), detail: '6 min', rest: '-' },
        ],
      },
      {
        id: 'fullbody',
        label: t('dash.routineFull'),
        title: t('dash.routineFull'),
        desc: t('dash.routineFullText'),
        image: '/imagenes/Rectangle%2012.png',
        videoUrl: 'https://www.youtube.com/watch?v=Ag7Dui9Plys',
        exercises: [
          { name: t('dash.ex.squat'), detail: '3 x 12', rest: '70s' },
          { name: t('dash.ex.pushup'), detail: '3 x 15', rest: '60s' },
          { name: t('dash.ex.row'), detail: '3 x 12', rest: '60s' },
          { name: t('dash.ex.lunges'), detail: '3 x 10', rest: '60s' },
          { name: t('dash.ex.core'), detail: '3 x 40"', rest: '40s' },
          { name: t('dash.ex.stretch'), detail: '5 min', rest: '-' },
        ],
      },
      {
        id: 'recuperacion',
        label: t('dash.routineRecover'),
        title: t('dash.routineRecover'),
        desc: t('dash.routineRecoverText'),
        image: '/imagenes/Rectangle%2010.png',
        videoUrl: 'https://www.youtube.com/watch?v=ErsH0x5suiA',
        exercises: [
          { name: t('dash.ex.walk'), detail: '15 min', rest: '-' },
          { name: t('dash.ex.breath'), detail: '4 min', rest: '-' },
          { name: t('dash.ex.hip'), detail: '2 x 10', rest: '30s' },
          { name: t('dash.ex.hamstring'), detail: '2 x 45"', rest: '20s' },
          { name: t('dash.ex.foam'), detail: '8 min', rest: '-' },
          { name: t('dash.ex.stretch'), detail: '6 min', rest: '-' },
        ],
      },
    ];
  }

  function currentRoutine() {
    return routinesCatalog().find(function (item) { return item.id === activeRoutine; }) || routinesCatalog()[0];
  }

  function renderRutinaDays() {
    if (!rutinaDays) return;
    rutinaDays.innerHTML = RUTINA_DAYS.map(function (day) {
      const label = t('dash.days.' + day);
      const active = day === activeRoutineDay ? ' active' : '';
      return '<button type="button" class="rutina-day' + active + '" data-routine-day="' + day + '" aria-pressed="' +
        (day === activeRoutineDay ? 'true' : 'false') + '">' + escapeHtml(label) + '</button>';
    }).join('');
  }

  function renderRutinaExercises() {
    if (!rutinaExercises) return;
    const routine = currentRoutine();
    rutinaExercises.innerHTML = routine.exercises.map(function (item, index) {
      return (
        '<article class="rutina-exercise">' +
          '<div class="rutina-exercise-num">' + (index + 1) + '</div>' +
          '<div><strong>' + escapeHtml(item.name) + '</strong><span>' + escapeHtml(item.detail) +
            ' · ' + t('dash.rest') + ' ' + escapeHtml(item.rest) + '</span></div>' +
          '<div class="rutina-exercise-meta">' + escapeHtml(item.detail) + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderRutinas() {
    if (!rutinasTabs || !rutinaTitle || !rutinaDesc) return;
    const catalog = routinesCatalog();
    if (!catalog.some(function (item) { return item.id === activeRoutine; })) {
      activeRoutine = catalog[0].id;
    }
    rutinasTabs.innerHTML = catalog.map(function (item) {
      const active = item.id === activeRoutine ? ' active' : '';
      return '<button type="button" class="rutina-tab' + active + '" data-routine="' + item.id +
        '" role="tab" aria-selected="' + (item.id === activeRoutine ? 'true' : 'false') + '">' +
        escapeHtml(item.label) + '</button>';
    }).join('');

    const routine = currentRoutine();
    rutinaTitle.textContent = routine.title;
    rutinaDesc.textContent = routine.desc;
    if (rutinaVideo) {
      if (routine.videoUrl) {
        rutinaVideo.href = routine.videoUrl;
        rutinaVideo.textContent = t('dash.routineVideo');
        rutinaVideo.hidden = false;
        rutinaVideo.setAttribute('aria-label', t('dash.routineVideo') + ': ' + routine.title);
      } else {
        rutinaVideo.removeAttribute('href');
        rutinaVideo.hidden = true;
      }
    }
    if (rutinaHero) {
      rutinaHero.style.backgroundImage =
        'linear-gradient(90deg, rgba(0,0,0,.78) 8%, rgba(0,0,0,.2) 55%, transparent 78%),' +
        'radial-gradient(ellipse at 72% 55%, rgba(139,69,245,.55), transparent 42%),' +
        'url("' + routine.image + '")';
      rutinaHero.style.backgroundPosition = 'right center, center, right center';
      rutinaHero.style.backgroundSize = 'cover, cover, cover';
      rutinaHero.style.backgroundRepeat = 'no-repeat';
    }
    renderRutinaDays();
    renderRutinaExercises();
  }

  if (rutinasTabs) {
    rutinasTabs.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-routine]');
      if (!btn) return;
      activeRoutine = btn.getAttribute('data-routine');
      renderRutinas();
    });
  }

  if (rutinaDays) {
    rutinaDays.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-routine-day]');
      if (!btn) return;
      activeRoutineDay = btn.getAttribute('data-routine-day');
      renderRutinaDays();
    });
  }

  document.addEventListener('fitpower:langchange', function () {
    renderRutinas();
  });

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

  try {
    await loadMe();
  } catch (err) {
    if (typeof mountFitpowerSettings === 'function') {
      mountFitpowerSettings({ role: 'usuario', user: {} });
    }
  }

  renderRutinas();
});
