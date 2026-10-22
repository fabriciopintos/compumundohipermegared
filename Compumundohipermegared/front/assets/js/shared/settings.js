(function (global) {
  var drawerState = {
    mounted: false,
    triggersBound: false,
    open: false,
    options: null,
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function splitName(full) {
    var parts = String(full || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { first: '', last: '' };
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }

  function initial(name) {
    return (name || '?').trim().charAt(0).toUpperCase() || '?';
  }

  function storageKey(role, key) {
    return 'fitpower_settings_' + (role || 'usuario') + '_' + key;
  }

  function loadPrefs(role) {
    try {
      return JSON.parse(localStorage.getItem(storageKey(role, 'prefs')) || '{}');
    } catch (err) {
      return {};
    }
  }

  function savePrefs(role, prefs) {
    localStorage.setItem(storageKey(role, 'prefs'), JSON.stringify(prefs || {}));
  }

  function notifItems(role) {
    if (role === 'entrenador') {
      return [
        { id: 'classReminders', label: 'Recordatorios de clases' },
        { id: 'studentMessages', label: 'Mensajes de alumnos' },
        { id: 'adminMessages', label: 'Mensajes de administración' },
        { id: 'scheduleChanges', label: 'Cambios de horarios' },
      ];
    }
    if (role === 'admin') {
      return [
        { id: 'paymentAlerts', label: 'Alertas de pagos' },
        { id: 'newUsers', label: 'Nuevos usuarios' },
        { id: 'trainerMessages', label: 'Mensajes de entrenadores' },
        { id: 'systemAlerts', label: 'Avisos del sistema' },
      ];
    }
    return [
      { id: 'trainingReminders', label: 'Recordatorios de entrenamiento' },
      { id: 'newClasses', label: 'Nuevas clases y horarios' },
      { id: 'trainerMessages', label: 'Mensajes del entrenador' },
    ];
  }

  function privacyItems(role) {
    if (role === 'admin') {
      return [
        { id: 'showEmailStaff', label: 'Mostrar mi email al staff' },
        { id: 'allowTrainerDm', label: 'Permitir mensajes de entrenadores' },
        { id: 'auditPublic', label: 'Compartir reportes resumidos' },
      ];
    }
    // Usuario y entrenador: sin sección de privacidad en configuración.
    return [];
  }

  function defaultToggles(role) {
    var prefs = {};
    notifItems(role).forEach(function (item, index) {
      prefs[item.id] = index < 3;
    });
    privacyItems(role).forEach(function (item) {
      prefs[item.id] = false;
    });
    return prefs;
  }

  function toggleHtml(items, prefs) {
    return items.map(function (item) {
      var on = !!prefs[item.id];
      return (
        '<label class="settings-toggle-row">' +
          '<span>' + escapeHtml(item.label) + '</span>' +
          '<span class="settings-switch">' +
            '<input type="checkbox" data-pref="' + escapeHtml(item.id) + '"' + (on ? ' checked' : '') + '>' +
            '<i aria-hidden="true"></i>' +
          '</span>' +
        '</label>'
      );
    }).join('');
  }

  function ensureDrawer() {
    var existing = document.getElementById('settings-drawer');
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.id = 'settings-drawer-root';
    wrap.innerHTML =
      '<div class="settings-drawer-backdrop" id="settings-drawer-backdrop" hidden></div>' +
      '<aside class="settings-drawer" id="settings-drawer" role="dialog" aria-modal="true" aria-labelledby="settings-drawer-title" aria-hidden="true">' +
        '<div class="settings-drawer-chrome">' +
          '<h2 class="settings-drawer-title" id="settings-drawer-title">Configuración</h2>' +
          '<button type="button" class="settings-drawer-close" id="settings-drawer-close" aria-label="Cerrar configuración">×</button>' +
        '</div>' +
        '<div class="settings-drawer-body" id="settings-drawer-body"></div>' +
      '</aside>';
    document.body.appendChild(wrap);

    var backdrop = document.getElementById('settings-drawer-backdrop');
    var closeBtn = document.getElementById('settings-drawer-close');
    if (backdrop) backdrop.addEventListener('click', closeSettings);
    if (closeBtn) closeBtn.addEventListener('click', closeSettings);

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !drawerState.open) return;
      if (document.body.classList.contains('fp-confirm-open')) return;
      event.preventDefault();
      event.stopPropagation();
      closeSettings();
    }, true);

    return document.getElementById('settings-drawer');
  }

  function resolveRole() {
    if (drawerState.options && drawerState.options.role) return drawerState.options.role;
    try {
      return localStorage.getItem('fitpower_role') || 'usuario';
    } catch (err) {
      return 'usuario';
    }
  }

  function openSettings() {
    ensureDrawer();
    if (!drawerState.mounted) {
      mountSettings({
        role: resolveRole(),
        user: (drawerState.options && drawerState.options.user) || {},
        skipHashOpen: true,
      });
    }
    var drawer = document.getElementById('settings-drawer');
    var backdrop = document.getElementById('settings-drawer-backdrop');
    if (!drawer) return;
    drawerState.open = true;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (backdrop) {
      backdrop.hidden = false;
      requestAnimationFrame(function () {
        backdrop.classList.add('is-visible');
      });
    }
    document.body.classList.add('settings-drawer-open');
    document.body.classList.remove('nav-lock');
    var sidebar = document.querySelector('[data-sidebar]');
    var layout = document.querySelector('.layout');
    var sbBackdrop = document.querySelector('[data-sidebar-backdrop]');
    if (sidebar) sidebar.classList.remove('is-open');
    if (layout) layout.classList.remove('is-collapsed');
    if (sbBackdrop) sbBackdrop.hidden = true;
    var closeBtn = document.getElementById('settings-drawer-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeSettings() {
    var drawer = document.getElementById('settings-drawer');
    var backdrop = document.getElementById('settings-drawer-backdrop');
    drawerState.open = false;
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      window.setTimeout(function () {
        if (!drawerState.open) backdrop.hidden = true;
      }, 220);
    }
    document.body.classList.remove('settings-drawer-open');
    if (location.hash === '#configuracion') {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function isSettingsTrigger(el) {
    if (!el) return false;
    if (el.hasAttribute && el.hasAttribute('data-open-settings')) return true;
    var href = el.getAttribute && el.getAttribute('href');
    return href === '#configuracion';
  }

  function bindOpenTriggers() {
    if (drawerState.triggersBound) return;
    drawerState.triggersBound = true;
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('a[href="#configuracion"], a[data-open-settings], button[data-open-settings], [data-open-settings]');
      if (!trigger || !isSettingsTrigger(trigger)) return;
      event.preventDefault();
      event.stopPropagation();
      openSettings();
    }, true);
  }

  function mountSettings(options) {
    options = options || {};
    ensureDrawer();
    var root = document.getElementById('settings-drawer-body');
    if (!root) return;

    drawerState.options = options;
    var role = options.role || 'usuario';
    var user = options.user || {};
    var prefs = Object.assign(defaultToggles(role), loadPrefs(role), user.prefs || {});
    var names = splitName(user.name || prefs.name || '');
    var first = prefs.firstName || user.firstName || names.first || '';
    var last = prefs.lastName || user.lastName || names.last || '';
    var email = user.email || prefs.email || '';
    var phone = prefs.phone || user.phone || '';
    var avatarLetter = initial(first || user.name || role);

    root.innerHTML =
      '<div class="settings-view">' +
        '<header class="settings-hero">' +
          '<h2>Configuración</h2>' +
          '<p>Personalizá tu experiencia en el gimnasio</p>' +
        '</header>' +
        '<div class="settings-stack">' +
          '<section class="settings-card">' +
            '<div class="settings-card-head">' +
              '<div class="settings-ico" aria-hidden="true">☺</div>' +
              '<div><h3>Perfil</h3><p>Editá tu información personal.</p></div>' +
            '</div>' +
            '<form id="settings-profile-form" class="settings-profile" novalidate>' +
              '<div class="settings-avatar-wrap">' +
                '<div class="settings-avatar" id="settings-avatar">' + escapeHtml(avatarLetter) + '</div>' +
                '<button type="button" class="settings-avatar-edit" id="settings-avatar-edit" title="Editar avatar" aria-label="Editar avatar">✎</button>' +
                '<input type="file" id="settings-avatar-file" accept="image/*" hidden>' +
              '</div>' +
              '<div class="settings-fields">' +
                '<div class="settings-field"><label for="settings-first">Nombre</label><input id="settings-first" name="first" autocomplete="given-name" value="' + escapeHtml(first) + '" required></div>' +
                '<div class="settings-field"><label for="settings-last">Apellido</label><input id="settings-last" name="last" autocomplete="family-name" value="' + escapeHtml(last) + '"></div>' +
                '<div class="settings-field"><label for="settings-email">Correo electrónico</label><input id="settings-email" name="email" type="email" autocomplete="email" value="' + escapeHtml(email) + '" required></div>' +
                '<div class="settings-field"><label for="settings-phone">Teléfono</label><input id="settings-phone" name="phone" type="tel" autocomplete="tel" value="' + escapeHtml(phone) + '" placeholder="+598 99 123 456"></div>' +
              '</div>' +
              '<div class="settings-actions" style="grid-column:1/-1">' +
                '<button type="submit" class="settings-btn settings-btn-outline">Guardar cambios</button>' +
              '</div>' +
              '<p class="settings-msg" id="settings-profile-msg" hidden></p>' +
            '</form>' +
          '</section>' +
          '<div class="settings-grid-2">' +
            '<section class="settings-card">' +
              '<div class="settings-card-head">' +
                '<div class="settings-ico" aria-hidden="true">🔒</div>' +
                '<div><h3>Cuenta</h3><p>Gestioná la seguridad de tu cuenta.</p></div>' +
              '</div>' +
              '<form id="settings-password-form" class="settings-account-fields" novalidate>' +
                '<div class="settings-field"><label for="settings-pass-current">Contraseña actual</label><input id="settings-pass-current" type="password" autocomplete="current-password" required></div>' +
                '<div class="settings-field"><label for="settings-pass-new">Nueva contraseña</label><input id="settings-pass-new" type="password" autocomplete="new-password" minlength="8" required></div>' +
                '<div class="settings-field"><label for="settings-pass-confirm">Confirmar nueva contraseña</label><input id="settings-pass-confirm" type="password" autocomplete="new-password" minlength="8" required></div>' +
                '<div class="settings-actions"><button type="submit" class="settings-btn settings-btn-outline">Cambiar contraseña</button></div>' +
                '<p class="settings-msg" id="settings-password-msg" hidden></p>' +
              '</form>' +
            '</section>' +
            '<section class="settings-card">' +
              '<div class="settings-card-head">' +
                '<div class="settings-ico" aria-hidden="true">🔔</div>' +
                '<div><h3>Notificaciones</h3><p>Elegí qué tipo de notificaciones querés recibir.</p></div>' +
              '</div>' +
              '<div class="settings-toggles" id="settings-notifs">' + toggleHtml(notifItems(role), prefs) + '</div>' +
            '</section>' +
          '</div>' +
          (privacyItems(role).length
            ? (
              '<section class="settings-card settings-span-2">' +
                '<div class="settings-card-head">' +
                  '<div class="settings-ico" aria-hidden="true">🛡</div>' +
                  '<div><h3>Privacidad</h3><p>Controlá quién puede ver tu información.</p></div>' +
                '</div>' +
                '<div class="settings-toggles" id="settings-privacy">' + toggleHtml(privacyItems(role), prefs) + '</div>' +
              '</section>'
            )
            : '') +
          '<section class="settings-card settings-danger">' +
            '<div class="settings-card-head">' +
              '<div class="settings-ico" aria-hidden="true">🗑</div>' +
              '<div><h3>Eliminar cuenta</h3><p>Si ya no querés usar tu cuenta, podés eliminarla de forma permanente.</p></div>' +
            '</div>' +
            '<button type="button" class="settings-btn settings-btn-danger" id="settings-delete">Eliminar cuenta</button>' +
            '<p class="settings-msg" id="settings-delete-msg" hidden></p>' +
          '</section>' +
        '</div>' +
      '</div>';

    var profileForm = root.querySelector('#settings-profile-form');
    var passwordForm = root.querySelector('#settings-password-form');
    var profileMsg = root.querySelector('#settings-profile-msg');
    var passwordMsg = root.querySelector('#settings-password-msg');
    var deleteMsg = root.querySelector('#settings-delete-msg');
    var avatarEl = root.querySelector('#settings-avatar');
    var avatarEdit = root.querySelector('#settings-avatar-edit');
    var avatarFile = root.querySelector('#settings-avatar-file');
    var deleteBtn = root.querySelector('#settings-delete');

    function showMsg(el, text, isError) {
      if (!el) return;
      el.hidden = false;
      el.textContent = text;
      el.classList.toggle('is-error', !!isError);
    }

    function persistToggles() {
      var next = Object.assign({}, loadPrefs(role));
      root.querySelectorAll('[data-pref]').forEach(function (input) {
        next[input.getAttribute('data-pref')] = !!input.checked;
      });
      var phoneInput = root.querySelector('#settings-phone');
      if (phoneInput) next.phone = phoneInput.value.trim();
      var firstInput = root.querySelector('#settings-first');
      var lastInput = root.querySelector('#settings-last');
      if (firstInput) next.firstName = firstInput.value.trim();
      if (lastInput) next.lastName = lastInput.value.trim();
      var emailInput = root.querySelector('#settings-email');
      if (emailInput) next.email = emailInput.value.trim();
      if (prefs.avatarDataUrl) next.avatarDataUrl = prefs.avatarDataUrl;
      savePrefs(role, next);
      prefs = next;
    }

    if (prefs.avatarDataUrl && avatarEl) {
      avatarEl.innerHTML = '<img src="' + prefs.avatarDataUrl + '" alt="Avatar">';
    }

    root.querySelectorAll('[data-pref]').forEach(function (input) {
      input.addEventListener('change', persistToggles);
    });

    if (avatarEdit && avatarFile) {
      avatarEdit.addEventListener('click', function () { avatarFile.click(); });
      avatarFile.addEventListener('change', function () {
        var file = avatarFile.files && avatarFile.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          showMsg(profileMsg, 'La imagen debe pesar menos de 2 MB.', true);
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          prefs.avatarDataUrl = String(reader.result || '');
          if (avatarEl) avatarEl.innerHTML = '<img src="' + prefs.avatarDataUrl + '" alt="Avatar">';
          persistToggles();
          showMsg(profileMsg, 'Avatar actualizado.', false);
        };
        reader.readAsDataURL(file);
      });
    }

    if (profileForm) {
      profileForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        var firstVal = root.querySelector('#settings-first').value.trim();
        var lastVal = root.querySelector('#settings-last').value.trim();
        var emailVal = root.querySelector('#settings-email').value.trim();
        var phoneVal = root.querySelector('#settings-phone').value.trim();
        if (!firstVal || !emailVal) {
          showMsg(profileMsg, 'Completá nombre y correo.', true);
          return;
        }
        var full = (firstVal + ' ' + lastVal).trim();
        var submitBtn = profileForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Guardando...';
        }
        try {
          if (typeof API === 'undefined' || typeof API.request !== 'function') {
            throw new Error('API no disponible');
          }
          var payload = await API.request('/me', 'PUT', {
            name: full,
            firstName: firstVal,
            lastName: lastVal,
            email: emailVal,
          });
          if (payload.status !== 'success') {
            showMsg(profileMsg, payload.message || 'No se pudieron guardar los cambios.', true);
            return;
          }
          var saved = (payload.data && payload.data.user) || {};
          var savedName = saved.name || full;
          var savedEmail = saved.email || emailVal;
          prefs.name = savedName;
          prefs.firstName = firstVal;
          prefs.lastName = lastVal;
          prefs.email = savedEmail;
          prefs.phone = phoneVal;
          persistToggles();
          if (typeof options.onProfileSave === 'function') {
            options.onProfileSave({
              name: savedName,
              firstName: firstVal,
              lastName: lastVal,
              email: savedEmail,
              phone: phoneVal,
            });
          }
          if (avatarEl && !prefs.avatarDataUrl) {
            avatarEl.textContent = initial(firstVal);
          }
          showMsg(profileMsg, 'Cambios guardados.', false);
        } catch (err) {
          showMsg(profileMsg, 'No se pudieron guardar los cambios.', true);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar cambios';
          }
        }
      });
    }

    if (passwordForm) {
      passwordForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        var current = root.querySelector('#settings-pass-current').value;
        var next = root.querySelector('#settings-pass-new').value;
        var confirm = root.querySelector('#settings-pass-confirm').value;
        if (!current || !next || !confirm) {
          showMsg(passwordMsg, 'Completá los tres campos.', true);
          return;
        }
        if (next.length < 8) {
          showMsg(passwordMsg, 'La nueva contraseña debe tener al menos 8 caracteres.', true);
          return;
        }
        if (next !== confirm) {
          showMsg(passwordMsg, 'La confirmación no coincide.', true);
          return;
        }
        var submitBtn = passwordForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Guardando...';
        }
        try {
          if (typeof API === 'undefined' || typeof API.request !== 'function') {
            throw new Error('API no disponible');
          }
          var payload = await API.request('/me/password', 'POST', {
            currentPassword: current,
            newPassword: next,
          });
          if (payload.status !== 'success') {
            showMsg(passwordMsg, payload.message || 'No se pudo cambiar la contraseña.', true);
            return;
          }
          passwordForm.reset();
          showMsg(passwordMsg, 'Contraseña actualizada.', false);
        } catch (err) {
          showMsg(passwordMsg, 'No se pudo cambiar la contraseña.', true);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Cambiar contraseña';
          }
        }
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async function () {
        var ask = typeof fitpowerConfirm === 'function'
          ? fitpowerConfirm({
              title: 'Eliminar cuenta',
              message: '¿Seguro que querés eliminar esta cuenta? Vas a tener que confirmar con tu contraseña. Esta acción es definitiva.',
              confirmText: 'Continuar',
              cancelText: 'Cancelar',
              danger: true,
            })
          : Promise.resolve(window.confirm('¿Seguro que querés eliminar esta cuenta?'));

        var ok = await ask;
        if (!ok) return;

        var password = window.prompt('Escribí tu contraseña para confirmar la eliminación:');
        if (password == null) return;
        password = String(password);
        if (!password) {
          showMsg(deleteMsg, 'Necesitás ingresar tu contraseña.', true);
          if (deleteMsg) deleteMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }

        deleteBtn.disabled = true;
        var prevLabel = deleteBtn.textContent;
        deleteBtn.textContent = 'Eliminando...';

        try {
          if (typeof options.onDeleteAccount === 'function') {
            await options.onDeleteAccount({ password: password });
            return;
          }
          if (typeof API === 'undefined' || typeof API.request !== 'function') {
            throw new Error('API no disponible');
          }
          var body = { password: password };
          var payload = await API.request('/me', 'DELETE', body);
          if (!payload || payload.status !== 'success') {
            // Fallback por si el hosting bloquea DELETE
            payload = await API.request('/me/delete', 'POST', body);
          }
          if (!payload || payload.status !== 'success') {
            showMsg(
              deleteMsg,
              (payload && payload.message) || 'No se pudo eliminar la cuenta.',
              true
            );
            if (deleteMsg) deleteMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
          }
          try { localStorage.removeItem(storageKey(role, 'prefs')); } catch (err) {}
          if (typeof clearToken === 'function') clearToken();
          else {
            try {
              localStorage.removeItem('fitpower_token');
              localStorage.removeItem('fitpower_role');
            } catch (err2) {}
          }
          window.location.href = '/login';
        } catch (err) {
          showMsg(deleteMsg, 'No se pudo eliminar la cuenta.', true);
          if (deleteMsg) deleteMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } finally {
          deleteBtn.disabled = false;
          deleteBtn.textContent = prevLabel || 'Eliminar cuenta';
        }
      });
    }

    drawerState.mounted = true;
    bindOpenTriggers();

    if (!options.skipHashOpen && location.hash === '#configuracion') {
      openSettings();
    }
  }

  bindOpenTriggers();

  global.mountFitpowerSettings = mountSettings;
  global.openFitpowerSettings = openSettings;
  global.closeFitpowerSettings = closeSettings;
})(window);
