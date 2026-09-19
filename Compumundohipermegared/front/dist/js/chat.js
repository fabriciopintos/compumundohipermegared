(function (global) {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(name) {
    var parts = String(name || '?').trim().split(/\s+/);
    var a = (parts[0] || '?').charAt(0);
    var b = parts.length > 1 ? parts[1].charAt(0) : '';
    return (a + b).toUpperCase();
  }

  function roleLabel(role) {
    if (role === 'admin') return 'ADMIN';
    if (role === 'entrenador') return 'ENTRENADOR';
    return 'USUARIO';
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      return d.toLocaleString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
    } catch (err) {
      return '';
    }
  }

  function mountChat(options) {
    var root = typeof options.root === 'string'
      ? document.querySelector(options.root)
      : options.root;
    if (!root) return null;

    var state = {
      contacts: [],
      conversations: [],
      activeId: null,
      peer: null,
      messages: [],
      pollTimer: null,
      myId: null,
    };

    root.innerHTML =
      '<div class="chat-panel">' +
        '<aside class="chat-sidebar">' +
          '<div class="chat-sidebar-head">' +
            '<h3>CONTACTOS</h3>' +
            '<div class="chat-contacts" data-chat-contacts></div>' +
          '</div>' +
          '<div class="chat-sidebar-head" style="border-top:1px solid rgba(255,255,255,.08)">' +
            '<h3>CHATS</h3>' +
          '</div>' +
          '<div class="chat-threads" data-chat-threads></div>' +
        '</aside>' +
        '<section class="chat-main">' +
          '<div class="chat-main-head" data-chat-head><span class="muted">Seleccioná un contacto para chatear</span></div>' +
          '<div class="chat-messages" data-chat-messages>' +
            '<p class="chat-empty">Tus conversaciones aparecerán acá.</p>' +
          '</div>' +
          '<form class="chat-compose" data-chat-form>' +
            '<input type="text" data-chat-input maxlength="2000" placeholder="Escribí un mensaje..." disabled autocomplete="off">' +
            '<button type="submit" data-chat-send disabled>ENVIAR</button>' +
          '</form>' +
        '</section>' +
      '</div>' +
      '<p class="chat-error" data-chat-error hidden></p>';

    var els = {
      contacts: root.querySelector('[data-chat-contacts]'),
      threads: root.querySelector('[data-chat-threads]'),
      head: root.querySelector('[data-chat-head]'),
      messages: root.querySelector('[data-chat-messages]'),
      form: root.querySelector('[data-chat-form]'),
      input: root.querySelector('[data-chat-input]'),
      send: root.querySelector('[data-chat-send]'),
      error: root.querySelector('[data-chat-error]'),
    };

    function showError(msg) {
      if (!els.error) return;
      els.error.hidden = !msg;
      els.error.textContent = msg || '';
    }

    function setComposerEnabled(on) {
      els.input.disabled = !on;
      els.send.disabled = !on;
    }

    function renderContacts() {
      if (!state.contacts.length) {
        els.contacts.innerHTML = '<p class="chat-empty" style="padding:12px">Sin contactos.</p>';
        return;
      }
      els.contacts.innerHTML = state.contacts.map(function (c) {
        return (
          '<button type="button" class="chat-contact" data-peer-id="' + c.id + '">' +
            '<span class="chat-avatar">' + escapeHtml(initials(c.name)) + '</span>' +
            '<span class="chat-meta">' +
              '<strong>' + escapeHtml(c.name) + '</strong>' +
              '<span class="chat-role-tag">' + escapeHtml(roleLabel(c.role)) + '</span>' +
            '</span>' +
          '</button>'
        );
      }).join('');
    }

    function renderThreads() {
      if (!state.conversations.length) {
        els.threads.innerHTML = '<p class="chat-empty" style="padding:12px">Todavía no hay chats.</p>';
        return;
      }
      els.threads.innerHTML = state.conversations.map(function (c) {
        var active = state.activeId === c.id ? ' active' : '';
        var unread = c.unreadCount > 0
          ? '<span class="chat-unread">' + c.unreadCount + '</span>'
          : '';
        return (
          '<button type="button" class="chat-thread' + active + '" data-conv-id="' + c.id + '">' +
            '<span class="chat-avatar">' + escapeHtml(initials(c.peer.name)) + '</span>' +
            '<span class="chat-meta">' +
              '<strong>' + escapeHtml(c.peer.name) + '</strong>' +
              '<span>' + escapeHtml(c.lastMessage || 'Sin mensajes') + '</span>' +
            '</span>' +
            unread +
          '</button>'
        );
      }).join('');
    }

    function renderMessages() {
      if (!state.activeId) {
        els.messages.innerHTML = '<p class="chat-empty">Seleccioná un contacto o un chat.</p>';
        return;
      }
      if (!state.messages.length) {
        els.messages.innerHTML = '<p class="chat-empty">Decí hola para empezar la conversación.</p>';
        return;
      }
      els.messages.innerHTML = state.messages.map(function (m) {
        return (
          '<div class="chat-bubble ' + (m.mine ? 'mine' : 'theirs') + '">' +
            escapeHtml(m.body) +
            '<time>' + escapeHtml(formatTime(m.createdAt)) + '</time>' +
          '</div>'
        );
      }).join('');
      els.messages.scrollTop = els.messages.scrollHeight;
    }

    function renderHead() {
      if (!state.peer) {
        els.head.innerHTML = '<span class="muted">Seleccioná un contacto para chatear</span>';
        return;
      }
      els.head.innerHTML =
        '<span class="chat-avatar">' + escapeHtml(initials(state.peer.name)) + '</span>' +
        '<div>' +
          '<div>' + escapeHtml(state.peer.name) + '</div>' +
          '<div class="chat-role-tag">' + escapeHtml(roleLabel(state.peer.role)) + '</div>' +
        '</div>';
    }

    async function loadContacts() {
      var res = await apiFetch('/contacts');
      if (!res.ok) throw new Error(res.payload.message || 'No se pudieron cargar contactos.');
      state.contacts = (res.payload.data && res.payload.data.contacts) || [];
      renderContacts();
    }

    async function loadConversations() {
      var res = await apiFetch('/conversations');
      if (!res.ok) throw new Error(res.payload.message || 'No se pudieron cargar chats.');
      state.conversations = (res.payload.data && res.payload.data.conversations) || [];
      renderThreads();
    }

    async function openConversation(id) {
      state.activeId = id;
      setComposerEnabled(true);
      var res = await apiFetch('/conversations/' + id + '/messages');
      if (!res.ok) throw new Error(res.payload.message || 'No se pudieron cargar mensajes.');
      var data = res.payload.data || {};
      state.messages = data.messages || [];
      state.peer = data.peer || null;
      renderHead();
      renderMessages();
      await loadConversations();
    }

    async function startWithPeer(peerId) {
      var res = await apiFetch('/conversations', {
        method: 'POST',
        body: JSON.stringify({ peerUserId: Number(peerId) }),
      });
      if (!res.ok) throw new Error(res.payload.message || 'No se pudo abrir el chat.');
      var conv = res.payload.data && res.payload.data.conversation;
      if (!conv) throw new Error('Respuesta inválida del servidor.');
      state.peer = conv.peer;
      await loadConversations();
      await openConversation(conv.id);
      els.input.focus();
    }

    async function sendMessage(body) {
      if (!state.activeId) return;
      els.send.disabled = true;
      var res = await apiFetch('/conversations/' + state.activeId + '/messages', {
        method: 'POST',
        body: JSON.stringify({ body: body }),
      });
      els.send.disabled = false;
      if (!res.ok) {
        showError(res.payload.message || 'No se pudo enviar.');
        return;
      }
      var msg = res.payload.data && res.payload.data.message;
      if (msg) {
        state.messages.push(msg);
        renderMessages();
      } else {
        await openConversation(state.activeId);
      }
      await loadConversations();
    }

    els.contacts.addEventListener('click', async function (event) {
      var btn = event.target.closest('[data-peer-id]');
      if (!btn) return;
      showError('');
      try {
        await startWithPeer(btn.getAttribute('data-peer-id'));
      } catch (err) {
        showError(err.message || 'Error al abrir chat.');
      }
    });

    els.threads.addEventListener('click', async function (event) {
      var btn = event.target.closest('[data-conv-id]');
      if (!btn) return;
      showError('');
      try {
        await openConversation(Number(btn.getAttribute('data-conv-id')));
      } catch (err) {
        showError(err.message || 'Error al abrir chat.');
      }
    });

    els.form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var body = (els.input.value || '').trim();
      if (!body) return;
      els.input.value = '';
      showError('');
      try {
        await sendMessage(body);
      } catch (err) {
        showError(err.message || 'Error de red.');
      }
    });

    async function refresh() {
      try {
        await loadConversations();
        if (state.activeId) {
          var res = await apiFetch('/conversations/' + state.activeId + '/messages');
          if (res.ok) {
            var data = res.payload.data || {};
            var next = data.messages || [];
            if (next.length !== state.messages.length ||
                (next.length && state.messages.length &&
                 next[next.length - 1].id !== state.messages[state.messages.length - 1].id)) {
              state.messages = next;
              state.peer = data.peer || state.peer;
              renderHead();
              renderMessages();
            }
          }
        }
      } catch (err) {
        // silencioso en polling
      }
    }

    async function boot() {
      try {
        await Promise.all([loadContacts(), loadConversations()]);
        state.pollTimer = window.setInterval(refresh, 4000);
      } catch (err) {
        showError(err.message || 'No se pudo iniciar el chat.');
      }
    }

    boot();

    return {
      destroy: function () {
        if (state.pollTimer) window.clearInterval(state.pollTimer);
      },
    };
  }

  global.mountFitpowerChat = mountChat;
})(window);
