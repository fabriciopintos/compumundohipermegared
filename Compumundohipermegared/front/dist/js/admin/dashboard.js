document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['admin']);
  if (!allowed) {
    return;
  }

  const usersTableBody = document.getElementById('usersTableBody');
  const trainersTableBody = document.getElementById('trainersTableBody');
  const usersError = document.getElementById('usersError');
  const searchUsers = document.getElementById('searchUsers');
  const statUsers = document.getElementById('statUsers');
  const statTrainers = document.getElementById('statTrainers');
  const modal = document.getElementById('userModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  const modalError = document.getElementById('modalError');
  const createUserForm = document.getElementById('createUserForm');
  const userRole = document.getElementById('userRole');
  const modalSubmit = document.getElementById('modalSubmit');

  let usersFilter = 'all';
  let searchTimer = null;

  function showError(el, message) {
    el.hidden = false;
    el.textContent = message;
  }

  function hideError(el) {
    el.hidden = true;
    el.textContent = '';
  }

  function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  function roleLabel(role) {
    if (role === 'admin') return 'Admin';
    if (role === 'entrenador') return 'Entrenador';
    return 'Usuario';
  }

  function initial(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  function openModal(role) {
    hideError(modalError);
    createUserForm.reset();
    userRole.value = role === 'entrenador' ? 'entrenador' : (role === 'admin' ? 'admin' : 'usuario');
    modalTitle.textContent = role === 'entrenador' ? 'Nuevo entrenador' : 'Nuevo usuario';
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
  }

  async function loadStats() {
    const payload = await API.request('/admin/stats');
    if (payload.status !== 'success') return;
    const data = payload.data || {};
    statUsers.textContent = String(data.users ?? 0);
    statTrainers.textContent = String(data.trainers ?? 0);
  }

  function renderUsers(rows) {
    if (!rows.length) {
      usersTableBody.innerHTML = '<tr><td colspan="6">No hay usuarios para mostrar.</td></tr>';
      return;
    }

    usersTableBody.innerHTML = rows.map(function (user) {
      return (
        '<tr>' +
          '<td data-label="USUARIO"><div class="user-cell"><span class="mini-av">' + initial(user.name) + '</span>' + user.name + '</div></td>' +
          '<td data-label="EMAIL">' + user.email + '</td>' +
          '<td data-label="ROL">' + roleLabel(user.role) + '</td>' +
          '<td data-label="ESTADO"><span class="status"><i></i>Activo</span></td>' +
          '<td data-label="REGISTRO">' + formatDate(user.createdAt) + '</td>' +
          '<td class="row-actions" data-label="ACCIONES">' +
            '<button type="button" class="circle edit" title="Editar" disabled>✎</button>' +
            '<button type="button" class="circle del" data-delete="' + user.id + '" data-name="' + user.name.replace(/"/g, '&quot;') + '" title="Eliminar">🗑</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderTrainers(rows) {
    if (!rows.length) {
      trainersTableBody.innerHTML = '<tr><td colspan="5">No hay entrenadores.</td></tr>';
      return;
    }

    trainersTableBody.innerHTML = rows.map(function (user) {
      return (
        '<tr>' +
          '<td data-label="ENTRENADOR"><div class="user-cell"><span class="mini-av">' + initial(user.name) + '</span>' + user.name + '</div></td>' +
          '<td data-label="EMAIL">' + user.email + '</td>' +
          '<td data-label="ESPECIALIDAD">General</td>' +
          '<td data-label="ESTADO"><span class="status"><i></i>Activo</span></td>' +
          '<td class="row-actions" data-label="ACCIONES">' +
            '<button type="button" class="circle edit" title="Editar" disabled>✎</button>' +
            '<button type="button" class="circle del" data-delete="' + user.id + '" data-name="' + user.name.replace(/"/g, '&quot;') + '" title="Eliminar">🗑</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');
  }

  async function loadUsers() {
    hideError(usersError);
    const q = (searchUsers.value || '').trim();
    const roleParam = usersFilter === 'all' ? '' : ('&role=' + encodeURIComponent(usersFilter));
    const payload = await API.request('/admin/users?q=' + encodeURIComponent(q) + roleParam);
    if (payload.status !== 'success') {
      showError(usersError, payload.message || 'No se pudieron cargar los usuarios.');
      usersTableBody.innerHTML = '<tr><td colspan="6">Error al cargar.</td></tr>';
      return;
    }
    const users = (payload.data && payload.data.users) || [];
    renderUsers(users);
  }

  async function loadTrainers() {
    const payload = await API.request('/admin/users?role=entrenador');
    if (payload.status !== 'success') {
      trainersTableBody.innerHTML = '<tr><td colspan="5">Error al cargar.</td></tr>';
      return;
    }
    renderTrainers((payload.data && payload.data.users) || []);
  }

  async function refreshAll() {
    await Promise.all([loadStats(), loadUsers(), loadTrainers()]);
  }

  document.querySelectorAll('[data-open-create]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-open-create'));
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeModal();
  });

  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      usersFilter = chip.getAttribute('data-filter') || 'all';
      loadUsers();
    });
  });

  searchUsers.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadUsers, 250);
  });

  usersTableBody.addEventListener('click', onDeleteClick);
  trainersTableBody.addEventListener('click', onDeleteClick);

  async function onDeleteClick(event) {
    const btn = event.target.closest('[data-delete]');
    if (!btn) return;
    const id = Number(btn.getAttribute('data-delete'));
    const name = btn.getAttribute('data-name') || 'este usuario';
    if (!id) return;
    if (!window.confirm('¿Eliminar a "' + name + '" de la base de datos?')) {
      return;
    }
    btn.disabled = true;
    const payload = await API.request('/admin/users/' + id, 'DELETE');
    if (payload.status !== 'success') {
      alert(payload.message || 'No se pudo eliminar.');
      btn.disabled = false;
      return;
    }
    await refreshAll();
  }

  createUserForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideError(modalError);
    modalSubmit.disabled = true;
    modalSubmit.textContent = 'CREANDO...';

    try {
      const body = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value,
      };
      const payload = await API.request('/admin/users', 'POST', body);
      if (payload.status !== 'success') {
        showError(modalError, payload.message || 'No se pudo crear el usuario.');
        return;
      }
      closeModal();
      await refreshAll();
    } catch (err) {
      showError(modalError, 'No se pudo crear el usuario.');
    } finally {
      modalSubmit.disabled = false;
      modalSubmit.textContent = 'CREAR USUARIO';
    }
  });

  async function bindLogout(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', async function (event) {
      event.preventDefault();
      try { await API.request('/logout', 'POST'); } catch (err) {}
      clearToken();
      window.location.href = '/';
    });
  }

  await bindLogout('logout-btn');
  await bindLogout('logout-btn-top');

  let currentUser = { name: 'Administrador', email: '', role: 'admin' };
  try {
    const me = await API.request('/me');
    if (me.status === 'success' && me.data && me.data.user) {
      currentUser = me.data.user;
      const sideName = document.querySelector('.sidebar-user strong');
      const sideAvatar = document.querySelector('.sidebar-user .avatar');
      if (sideName && currentUser.name) sideName.textContent = currentUser.name.toUpperCase();
      if (sideAvatar && currentUser.name) sideAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
  } catch (err) {
    // se mantiene el placeholder
  }

  if (typeof mountFitpowerSettings === 'function') {
    mountFitpowerSettings({
      role: 'admin',
      user: currentUser,
      onProfileSave: function (profile) {
        const sideName = document.querySelector('.sidebar-user strong');
        const sideAvatar = document.querySelector('.sidebar-user .avatar');
        if (sideName) sideName.textContent = (profile.name || 'ADMIN').toUpperCase();
        if (sideAvatar) sideAvatar.textContent = (profile.name || 'A').charAt(0).toUpperCase();
      },
    });
  }

  document.querySelectorAll('[data-jump]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = document.querySelector(btn.getAttribute('data-jump'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const payDetail = document.getElementById('payDetail');
  const pagos = document.getElementById('pagos');
  if (pagos && payDetail) {
    pagos.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-pay]');
      if (!btn) return;
      payDetail.hidden = false;
      payDetail.textContent = btn.getAttribute('data-pay');
    });
  }

  await refreshAll();

  if (typeof mountFitpowerChat === 'function') {
    mountFitpowerChat({ root: '#admin-chat-root' });
  }
});
