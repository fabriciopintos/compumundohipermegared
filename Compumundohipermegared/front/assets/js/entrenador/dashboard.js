document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['entrenador']);
  if (!allowed) {
    return;
  }

  if (typeof mountFitpowerSettings === 'function') {
    mountFitpowerSettings({ role: 'entrenador', user: { name: 'Entrenador', role: 'entrenador' } });
  }

  const nombre = document.getElementById('nombreEntrenador');
  const logoutBtn = document.getElementById('logout-btn');

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

  const heroName = document.querySelector('.hero h1 span');
  const avatarChip = document.querySelector('.profile-chip .avatar');
  let currentUser = { name: 'Entrenador', email: '', role: 'entrenador' };

  try {
    const payload = await API.request('/me');
    if (payload.status === 'success' && payload.data && payload.data.user) {
      currentUser = payload.data.user;
      setRole(currentUser.role || 'entrenador');
      const label = (currentUser.name || 'ENTRENADOR').toUpperCase();
      if (nombre) nombre.textContent = label;
      if (heroName) heroName.textContent = label;
      if (avatarChip) avatarChip.textContent = label.charAt(0);
    }
  } catch (err) {
    // se mantiene el placeholder
  }

  if (typeof mountFitpowerSettings === 'function') {
    mountFitpowerSettings({
      role: 'entrenador',
      user: currentUser,
      onProfileSave: function (profile) {
        const label = (profile.name || 'ENTRENADOR').toUpperCase();
        if (nombre) nombre.textContent = label;
        if (heroName) heroName.textContent = label;
        if (avatarChip) avatarChip.textContent = label.charAt(0);
      },
    });
  }

  const notifBtn = document.getElementById('notifBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', function () {
      const target = document.getElementById('notificaciones');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const studentSearch = document.getElementById('studentSearch');
  const studentTable = document.getElementById('studentTable');
  if (studentSearch && studentTable) {
    studentSearch.addEventListener('input', function () {
      const q = studentSearch.value.trim().toLowerCase();
      studentTable.querySelectorAll('tbody tr').forEach(function (row) {
        row.hidden = q.length > 0 && row.textContent.toLowerCase().indexOf(q) === -1;
      });
    });
  }

  const activityList = document.getElementById('activityList');
  const activitySheet = document.getElementById('activitySheet');
  const activityForm = document.getElementById('activityForm');
  const activityName = document.getElementById('activityName');
  const activitySchedule = document.getElementById('activitySchedule');
  const activityLevel = document.getElementById('activityLevel');
  const activityTitle = document.getElementById('activitySheetTitle');
  let editingRow = null;

  function openActivity(row) {
    editingRow = row;
    activityTitle.textContent = row ? 'Editar actividad' : 'Nueva actividad';
    if (row) {
      activityName.value = (row.querySelector('strong') || {}).textContent || '';
      const meta = row.querySelector('.activity-main span');
      activitySchedule.value = meta ? meta.textContent.trim() : '';
      const level = row.querySelector('.level');
      activityLevel.value = level ? level.textContent.trim() : 'NIVEL INTERMEDIO';
    } else {
      activityForm.reset();
    }
    activitySheet.hidden = false;
    activityName.focus();
  }

  function closeActivity() {
    activitySheet.hidden = true;
    editingRow = null;
  }

  const newActivityBtn = document.getElementById('newActivityBtn');
  if (newActivityBtn) newActivityBtn.addEventListener('click', function () { openActivity(null); });
  document.getElementById('activityCancel').addEventListener('click', closeActivity);
  activitySheet.addEventListener('click', function (event) {
    if (event.target === activitySheet) closeActivity();
  });

  activityForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const name = activityName.value.trim();
    const schedule = activitySchedule.value.trim();
    const level = activityLevel.value;
    if (editingRow) {
      editingRow.querySelector('strong').textContent = name.toUpperCase();
      editingRow.querySelector('.activity-main span').textContent = schedule;
      editingRow.querySelector('.level').textContent = level;
    } else if (activityList) {
      const article = document.createElement('article');
      article.className = 'activity-row';
      article.innerHTML =
        '<img src="/assets/img/activities/musculacion.png" alt="">' +
        '<div class="activity-main"><strong></strong><span></span></div>' +
        '<div class="level"></div>' +
        '<div class="row-actions">' +
          '<button type="button" class="circle purple" title="Editar">✎</button>' +
          '<button type="button" class="circle gray" title="Eliminar">🗑</button>' +
        '</div>';
      article.querySelector('strong').textContent = name.toUpperCase();
      article.querySelector('span').textContent = schedule;
      article.querySelector('.level').textContent = level;
      article.querySelector('img').alt = name;
      activityList.prepend(article);
    }
    closeActivity();
  });

  if (activityList) {
    activityList.addEventListener('click', function (event) {
      const edit = event.target.closest('.circle.purple');
      const del = event.target.closest('.circle.gray');
      const row = event.target.closest('.activity-row');
      if (!row) return;
      if (edit) openActivity(row);
      if (del) {
        const ask = typeof fitpowerConfirm === 'function'
          ? fitpowerConfirm({
              title: 'Quitar actividad',
              message: '¿Seguro que querés quitar esta actividad del listado?',
              confirmText: 'Sí, quitar',
              cancelText: 'Cancelar',
              danger: true,
            })
          : Promise.resolve(window.confirm('¿Quitar esta actividad del listado?'));
        ask.then(function (ok) { if (ok) row.remove(); });
      }
    });
  }

  const profileSheet = document.getElementById('profileSheet');
  const profileTitle = document.getElementById('profileTitle');
  const profileBody = document.getElementById('profileBody');
  document.getElementById('profileClose').addEventListener('click', function () {
    profileSheet.hidden = true;
  });
  profileSheet.addEventListener('click', function (event) {
    if (event.target === profileSheet) profileSheet.hidden = true;
  });
  if (studentTable) {
    studentTable.addEventListener('click', function (event) {
      const button = event.target.closest('.btn-sm');
      if (!button) return;
      const row = button.closest('tr');
      const cells = row.querySelectorAll('td');
      profileTitle.textContent = (cells[0].textContent || 'Alumno').trim();
      profileBody.textContent =
        'Actividad: ' + (cells[1].textContent || '').trim() +
        '. Asistencia: ' + (cells[2].textContent || '').trim() +
        '. Última clase: ' + (cells[3].textContent || '').trim() + '.';
      profileSheet.hidden = false;
    });
  }

  if (typeof mountFitpowerChat === 'function') {
    mountFitpowerChat({ root: '#entrenador-chat-root' });
  }
});
