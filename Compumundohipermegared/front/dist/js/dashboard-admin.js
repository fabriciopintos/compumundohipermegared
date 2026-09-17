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
    const { ok, payload } = await apiFetch('/admin/stats');
    if (!ok) return;
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
          '<td><div class="user-cell"><span class="mini-av">' + initial(user.name) + '</span>' + user.name + '</div></td>' +
          '<td>' + user.email + '</td>' +
          '<td>' + roleLabel(user.role) + '</td>' +
          '<td><span class="status"><i></i>Activo</span></td>' +
          '<td>' + formatDate(user.createdAt) + '</td>' +
          '<td class="row-actions">' +
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
          '<td><div class="user-cell"><span class="mini-av">' + initial(user.name) + '</span>' + user.name + '</div></td>' +
          '<td>' + user.email + '</td>' +
          '<td>General</td>' +
          '<td><span class="status"><i></i>Activo</span></td>' +
          '<td class="row-actions">' +
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
    const { ok, payload } = await apiFetch('/admin/users?q=' + encodeURIComponent(q) + roleParam);
    if (!ok) {
      showError(usersError, payload.message || 'No se pudieron cargar los usuarios.');
      usersTableBody.innerHTML = '<tr><td colspan="6">Error al cargar.</td></tr>';
      return;
    }
    const users = (payload.data && payload.data.users) || [];
    renderUsers(users);
  }

  async function loadTrainers() {
    const { ok, payload } = await apiFetch('/admin/users?role=entrenador');
    if (!ok) {
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
    const { ok, payload } = await apiFetch('/admin/users/' + id, { method: 'DELETE' });
    if (!ok) {
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
      const { ok, payload } = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!ok) {
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
      try { await apiFetch('/logout', { method: 'POST' }); } catch (err) {}
      clearToken();
      window.location.href = '/login';
    });
  }

  await bindLogout('logout-btn');
  await bindLogout('logout-btn-top');
  await refreshAll();
});
