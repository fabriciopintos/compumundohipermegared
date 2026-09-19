document.addEventListener('DOMContentLoaded', async function () {
  const allowed = await requireRole(['entrenador']);
  if (!allowed) {
    return;
  }

  const nombre = document.getElementById('nombreEntrenador');
  const logoutBtn = document.getElementById('logout-btn');

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

  if (nombre) {
    try {
      const { ok, payload } = await apiFetch('/me');
      if (ok && payload.data && payload.data.user) {
        const user = payload.data.user;
        setRole(user.role || 'entrenador');
        nombre.textContent = (user.name || 'ENTRENADOR').toUpperCase();
      }
    } catch (err) {
      // se mantiene el placeholder
    }
  }

  if (typeof mountFitpowerChat === 'function') {
    mountFitpowerChat({ root: '#entrenador-chat-root' });
  }
});
