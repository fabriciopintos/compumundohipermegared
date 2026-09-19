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

function authHeaders(extra) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
  const token = getToken();
  if (token) {
    headers.Authorization = 'Bearer ' + token;
  }
  return headers;
}

async function apiFetch(path, options) {
  const config = options ? Object.assign({}, options) : {};
  config.headers = authHeaders(config.headers);
  const response = await fetch('/api' + path, config);
  let payload = {};
  try {
    payload = await response.json();
  } catch (err) {
    payload = { status: 'error', message: 'No se pudo leer la respuesta del servidor.' };
  }
  if (response.status === 401) {
    clearToken();
    const path = window.location.pathname || '';
    const isPublic = path === '/' || path.endsWith('/login') || path.includes('login.html') || path.endsWith('index.html');
    if (!isPublic) {
      window.location.href = '/';
    }
  }
  return { ok: response.ok, status: response.status, payload };
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
      const { ok, payload } = await apiFetch('/me');
      if (ok && payload.data && payload.data.user) {
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

  let role = getRole();
  if (!role) {
    try {
      const { ok, payload } = await apiFetch('/me');
      if (ok && payload.data && payload.data.user) {
        role = payload.data.user.role || 'usuario';
        setRole(role);
      }
    } catch (err) {
      role = 'usuario';
    }
  }

  window.location.replace(dashboardPathForRole(role));
  return true;
}
