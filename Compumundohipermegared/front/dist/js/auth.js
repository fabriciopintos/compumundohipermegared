const TOKEN_KEY = 'fitpower_token';
const ROLE_KEY = 'fitpower_role';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

function getRole() {
  return localStorage.getItem(ROLE_KEY) || '';
}

function setRole(role) {
  localStorage.setItem(ROLE_KEY, role || '');
}

function dashboardPathForRole(role) {
  if (role === 'entrenador') {
    return '/dashboard-entrenador';
  }
  if (role === 'admin') {
    return '/dashboard-admin';
  }
  return '/dashboard';
}

function requireAuth() {
  if (!getToken()) {
    window.location.replace('/login');
    return false;
  }
  return true;
}

async function requireRole(allowedRoles) {
  if (!requireAuth()) {
    return false;
  }

  let role = getRole();
  if (!role) {
    try {
      const payload = await API.request('/me');
      if (payload.status === 'success' && payload.data && payload.data.user) {
        role = payload.data.user.role || '';
        setRole(role);
      }
    } catch (err) {
      role = '';
    }
  }

  if (allowedRoles.indexOf(role) === -1) {
    window.location.replace(dashboardPathForRole(role));
    return false;
  }

  return true;
}

async function redirectIfAuthenticated() {
  if (!getToken()) {
    return false;
  }

  try {
    const payload = await API.request('/me');
    if (payload.status === 'success' && payload.data && payload.data.user) {
      const role = payload.data.user.role || getRole() || 'usuario';
      setRole(role);
      window.location.replace(dashboardPathForRole(role));
      return true;
    }
  } catch (err) {
    // la sesión no se pudo confirmar
  }

  clearToken();
  return false;
}
