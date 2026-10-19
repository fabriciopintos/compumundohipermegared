document.addEventListener('DOMContentLoaded', async function () {
  if (await redirectIfAuthenticated()) {
    return;
  }

  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');
  const usuario = document.getElementById('usuario');
  const password = document.getElementById('password');
  const togglePassword = document.getElementById('toggle-password');
  const eyeOpen = togglePassword.querySelector('.icon-eye');
  const eyeOff = togglePassword.querySelector('.icon-eye-off');
  const capsWarning = document.getElementById('caps-warning');

  function updateCaps(event) {
    if (!capsWarning) return;
    const on = event.getModifierState && event.getModifierState('CapsLock');
    capsWarning.hidden = !on;
  }

  password.addEventListener('keydown', updateCaps);
  password.addEventListener('keyup', updateCaps);
  password.addEventListener('focus', updateCaps);
  password.addEventListener('blur', function () {
    if (capsWarning) capsWarning.hidden = true;
  });

  function showError(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  togglePassword.addEventListener('click', function () {
    const showing = password.type === 'text';
    password.type = showing ? 'password' : 'text';
    eyeOpen.classList.toggle('d-none', !showing);
    eyeOff.classList.toggle('d-none', showing);
    togglePassword.setAttribute('aria-label', showing ? t('login.showPassword') : t('login.hidePassword'));
  });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    hideError();

    const loginValue = (usuario.value || '').trim();
    const passwordValue = password.value || '';

    if (!loginValue || !passwordValue) {
      showError(t('login.empty'));
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = t('login.loading');

    try {
      const payload = await API.request('/login', 'POST', {
        usuario: loginValue,
        password: passwordValue,
      });

      if (payload.status !== 'success' || !payload.data || !payload.data.token) {
        showError(payload.message || t('login.error'));
        return;
      }

      setToken(payload.data.token);
      const role = (payload.data.user && payload.data.user.role) || 'usuario';
      setRole(role);
      window.location.href = dashboardPathForRole(role);
    } catch (err) {
      showError(t('login.network'));
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('login.submit');
    }
  });
});
