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

  const RUTINA_DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  function todayRoutineDay() {
    const map = ['LUN', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    return map[new Date().getDay()] || 'LUN';
  }

  const rutinasTabs = document.getElementById('rutinasTabs');
  const rutinaTitle = document.getElementById('rutinaTitle');
  const rutinaDesc = document.getElementById('rutinaDesc');
  const rutinaKicker = document.querySelector('.rutina-kicker');
  const rutinaVideo = document.getElementById('rutinaVideo');
  const rutinaDays = document.getElementById('rutinaDays');
  const rutinaExercises = document.getElementById('rutinaExercises');
  const rutinaHero = document.getElementById('rutinaHero');

  const catalog = Array.isArray(window.FITPOWER_ROUTINES) ? window.FITPOWER_ROUTINES.slice() : [];
  let assignedRoutine = null;
  let activeRoutine = catalog[0] ? catalog[0].id : '';
  let activeRoutineDay = todayRoutineDay();

  function routinesCatalog() {
    const list = catalog.slice();
    if (assignedRoutine) {
      list.unshift({
        id: 'assigned-' + assignedRoutine.id,
        categoryId: 'asignada',
        category: 'ASIGNADA',
        label: assignedRoutine.title,
        title: String(assignedRoutine.title || '').toUpperCase(),
        desc: assignedRoutine.description || 'Rutina asignada por tu entrenador',
        image: assignedRoutine.imageUrl || '/assets/img/activities/hero.png',
        videoUrl: assignedRoutine.videoUrl || '',
        exercises: (assignedRoutine.exercises || []).map(function (item) {
          return {
            name: item.name,
            detail: item.detail || '',
            rest: item.rest || '-',
            videoUrl: item.videoUrl || item.video_url || assignedRoutine.videoUrl || '',
          };
        }),
      });
    }
    return list;
  }

  function currentRoutine() {
    const list = routinesCatalog();
    return list.find(function (item) { return item.id === activeRoutine; }) || list[0] || null;
  }

  function dayPlan(routine) {
    if (typeof getFitpowerExercisesForDay === 'function') {
      return getFitpowerExercisesForDay(routine, activeRoutineDay);
    }
    return { focus: activeRoutineDay, exercises: (routine && routine.exercises) || [] };
  }

  function dayName(code) {
    const names = {
      LUN: 'Lunes', MAR: 'Martes', MIE: 'Miércoles',
      JUE: 'Jueves', VIE: 'Viernes', SAB: 'Sábado',
    };
    return names[code] || code;
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

  function videoLabel() {
    return typeof t === 'function' ? t('dash.routineVideo') : 'Ver video';
  }

  function renderRutinaExercises() {
    if (!rutinaExercises) return;
    const routine = currentRoutine();
    if (!routine) {
      rutinaExercises.innerHTML = '<p class="rutina-empty">No hay rutinas disponibles.</p>';
      return;
    }
    const plan = dayPlan(routine);
    const restLabel = typeof t === 'function' ? t('dash.rest') : 'Descanso';
    const focusBanner =
      '<div class="rutina-day-focus">' +
        '<span>' + escapeHtml(dayName(activeRoutineDay)) + '</span>' +
        '<strong>' + escapeHtml(plan.focus || '') + '</strong>' +
      '</div>';

    if (!(plan.exercises || []).length) {
      rutinaExercises.innerHTML = focusBanner + '<p class="rutina-empty">No hay ejercicios para este día.</p>';
      return;
    }

    rutinaExercises.innerHTML = focusBanner + plan.exercises.map(function (item, index) {
      const video = item.videoUrl
        ? (
          '<a class="rutina-ex-video" href="' + escapeHtml(item.videoUrl) +
            '" target="_blank" rel="noopener noreferrer">' + escapeHtml(videoLabel()) + '</a>'
        )
        : '<span class="rutina-ex-video is-disabled" aria-disabled="true">Sin video</span>';
      const restPart = item.rest && item.rest !== '-'
        ? (' · ' + restLabel + ' ' + escapeHtml(item.rest))
        : '';
      return (
        '<article class="rutina-exercise">' +
          '<div class="rutina-exercise-num">' + (index + 1) + '</div>' +
          '<div class="rutina-exercise-body">' +
            '<strong>' + escapeHtml(item.name) + '</strong>' +
            '<span>' + escapeHtml(item.detail || '') + restPart + '</span>' +
          '</div>' +
          '<div class="rutina-exercise-actions">' +
            '<div class="rutina-exercise-meta">' + escapeHtml(item.detail || '') + '</div>' +
            video +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderRutinas() {
    if (!rutinasTabs || !rutinaTitle || !rutinaDesc) return;
    const list = routinesCatalog();
    if (!list.length) {
      rutinasTabs.innerHTML = '';
      rutinaTitle.textContent = '—';
      rutinaDesc.textContent = 'No hay rutinas cargadas.';
      return;
    }
    if (!list.some(function (item) { return item.id === activeRoutine; })) {
      activeRoutine = list[0].id;
    }

    const groups = [];
    const order = [];
    list.forEach(function (item) {
      const key = item.categoryId || 'otros';
      if (!order.includes(key)) {
        order.push(key);
        groups.push({ id: key, label: item.category || key, items: [] });
      }
      groups[order.indexOf(key)].items.push(item);
    });

    rutinasTabs.innerHTML = groups.map(function (group) {
      return (
        '<div class="rutinas-cat" data-cat="' + escapeHtml(group.id) + '">' +
          '<p class="rutinas-cat-label">' + escapeHtml(group.label) + '</p>' +
          group.items.map(function (item) {
            const active = item.id === activeRoutine ? ' active' : '';
            return (
              '<button type="button" class="rutina-tab' + active + '" data-routine="' +
                escapeHtml(item.id) + '" role="tab" aria-selected="' +
                (item.id === activeRoutine ? 'true' : 'false') + '">' +
                escapeHtml(item.label) +
              '</button>'
            );
          }).join('') +
        '</div>'
      );
    }).join('');

    const routine = currentRoutine();
    if (!routine) return;

    if (rutinaKicker) {
      rutinaKicker.textContent = routine.category || 'RUTINA';
    }
    const plan = dayPlan(routine);
    rutinaTitle.textContent = routine.title;
    rutinaDesc.textContent = routine.desc +
      (plan.focus ? (' · ' + dayName(activeRoutineDay) + ': ' + plan.focus) : '');

    if (rutinaVideo) {
      if (routine.videoUrl) {
        rutinaVideo.href = routine.videoUrl;
        rutinaVideo.textContent = videoLabel();
        rutinaVideo.hidden = false;
        rutinaVideo.setAttribute('aria-label', videoLabel() + ': ' + routine.title);
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
      renderRutinas();
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

  try {
    const routinesPayload = await API.request('/routines');
    if (routinesPayload.status === 'success' && routinesPayload.data && routinesPayload.data.assigned) {
      assignedRoutine = routinesPayload.data.assigned;
      activeRoutine = 'assigned-' + assignedRoutine.id;
    }
  } catch (err) {
    // catálogo local
  }

  renderRutinas();
});
