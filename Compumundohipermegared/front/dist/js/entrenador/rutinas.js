(function () {
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initial(name) {
    return (name || '?').trim().charAt(0).toUpperCase() || '?';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const listEl = document.getElementById('routinesList');
    const errorEl = document.getElementById('routinesError');
    const newBtn = document.getElementById('newRoutineBtn');
    if (!listEl || !newBtn) return;

    const routineSheet = document.getElementById('routineSheet');
    const routineForm = document.getElementById('routineForm');
    const routineSheetTitle = document.getElementById('routineSheetTitle');
    const routineTitle = document.getElementById('routineTitle');
    const routineDescription = document.getElementById('routineDescription');
    const routineVideo = document.getElementById('routineVideo');
    const routineImage = document.getElementById('routineImage');
    const exerciseRows = document.getElementById('exerciseRows');
    const routineFormError = document.getElementById('routineFormError');
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    const routineCancel = document.getElementById('routineCancel');

    const assignSheet = document.getElementById('assignSheet');
    const assignSheetTitle = document.getElementById('assignSheetTitle');
    const assignSheetLead = document.getElementById('assignSheetLead');
    const assignGrid = document.getElementById('assignGrid');
    const assignSearch = document.getElementById('assignSearch');
    const assignError = document.getElementById('assignError');
    const assignCancel = document.getElementById('assignCancel');
    const assignConfirm = document.getElementById('assignConfirm');

    let routines = [];
    let students = [];
    let editingId = null;
    let assigningId = null;
    let selectedStudentIds = {};

    function showError(el, message) {
      if (!el) return;
      el.hidden = !message;
      el.textContent = message || '';
    }

    function addExerciseRow(data) {
      data = data || {};
      const row = document.createElement('div');
      row.className = 'exercise-row';
      row.innerHTML =
        '<input type="text" data-ex="name" placeholder="Ejercicio" maxlength="120" required>' +
        '<input type="text" data-ex="detail" placeholder="Series / reps" maxlength="80">' +
        '<input type="text" data-ex="rest" placeholder="Descanso" maxlength="40">' +
        '<button type="button" class="circle gray" data-remove-ex title="Quitar">🗑</button>';
      row.querySelector('[data-ex="name"]').value = data.name || '';
      row.querySelector('[data-ex="detail"]').value = data.detail || '';
      row.querySelector('[data-ex="rest"]').value = data.rest || '';
      exerciseRows.appendChild(row);
    }

    function collectExercises() {
      const items = [];
      exerciseRows.querySelectorAll('.exercise-row').forEach(function (row) {
        const name = row.querySelector('[data-ex="name"]').value.trim();
        if (!name) return;
        items.push({
          name: name,
          detail: row.querySelector('[data-ex="detail"]').value.trim(),
          rest: row.querySelector('[data-ex="rest"]').value.trim(),
        });
      });
      return items;
    }

    function openRoutineForm(routine) {
      editingId = routine ? routine.id : null;
      routineSheetTitle.textContent = routine ? 'Editar rutina' : 'Nueva rutina';
      routineTitle.value = routine ? routine.title : '';
      routineDescription.value = routine ? (routine.description || '') : '';
      routineVideo.value = routine ? (routine.videoUrl || '') : '';
      routineImage.value = routine ? (routine.imageUrl || '') : '/imagenes/Rectangle%203.png';
      exerciseRows.innerHTML = '';
      const exercises = (routine && routine.exercises && routine.exercises.length)
        ? routine.exercises
        : [{ name: '', detail: '', rest: '' }];
      exercises.forEach(addExerciseRow);
      showError(routineFormError, '');
      routineSheet.hidden = false;
      routineTitle.focus();
    }

    function closeRoutineForm() {
      routineSheet.hidden = true;
      editingId = null;
    }

    function renderRoutines() {
      if (!routines.length) {
        listEl.innerHTML = '<p class="empty-state">Todavía no hay rutinas. Creá la primera con “+ Nueva rutina”.</p>';
        return;
      }

      listEl.innerHTML = routines.map(function (item) {
        const count = item.assignedCount != null ? item.assignedCount : 0;
        const img = escapeHtml(item.imageUrl || '/imagenes/Rectangle%203.png');
        const title = escapeHtml(item.title || '');
        const desc = escapeHtml(item.description || 'Sin descripción');
        return (
          '<article class="routine-row" data-id="' + escapeHtml(item.id) + '">' +
            '<img src="' + img + '" alt="' + title + '" loading="lazy">' +
            '<div class="routine-main">' +
              '<strong>' + title + '</strong>' +
              '<span>' + desc + '</span>' +
              '<div class="routine-meta">' + count + ' alumno' + (count === 1 ? '' : 's') +
                ' · ' + escapeHtml((item.exercises || []).length) + ' ejercicios</div>' +
            '</div>' +
            '<div class="routine-actions">' +
              '<button type="button" class="btn-sm" data-assign>Asignar rutina</button>' +
              '<button type="button" class="circle purple" data-edit title="Editar">✎</button>' +
              '<button type="button" class="circle gray" data-delete title="Eliminar">🗑</button>' +
            '</div>' +
          '</article>'
        );
      }).join('');
    }

    async function loadRoutines() {
      showError(errorEl, '');
      const payload = await API.request('/routines');
      if (payload.status !== 'success') {
        showError(errorEl, payload.message || 'No se pudieron cargar las rutinas.');
        listEl.innerHTML = '<p class="empty-state is-error">Error al cargar rutinas.</p>';
        return;
      }
      routines = (payload.data && payload.data.routines) || [];
      renderRoutines();
    }

    async function loadStudents() {
      const payload = await API.request('/routines/students');
      if (payload.status !== 'success') {
        throw new Error(payload.message || 'No se pudieron cargar los alumnos.');
      }
      students = (payload.data && payload.data.students) || [];
    }

    function renderAssignGrid(filter) {
      const q = (filter || '').trim().toLowerCase();
      const filtered = students.filter(function (student) {
        if (!q) return true;
        return (student.name + ' ' + student.email).toLowerCase().indexOf(q) !== -1;
      });

      if (!filtered.length) {
        assignGrid.innerHTML = '<p class="empty-state">No hay alumnos para mostrar.</p>';
        return;
      }

      assignGrid.innerHTML = filtered.map(function (student) {
        const selected = !!selectedStudentIds[student.id];
        const current = student.routineTitle
          ? ('Actual: ' + student.routineTitle)
          : 'Sin rutina asignada';
        return (
          '<label class="assign-card' + (selected ? ' is-selected' : '') + '" data-student="' + escapeHtml(student.id) + '">' +
            '<input type="checkbox"' + (selected ? ' checked' : '') + '>' +
            '<span class="mini-av">' + escapeHtml(initial(student.name)) + '</span>' +
            '<strong>' + escapeHtml(student.name) + '</strong>' +
            '<small>' + escapeHtml(student.email) + '</small>' +
            '<small>' + escapeHtml(current) + '</small>' +
          '</label>'
        );
      }).join('');
    }

    async function openAssign(routine) {
      assigningId = routine.id;
      selectedStudentIds = {};
      assignSheetTitle.textContent = 'Asignar rutina';
      assignSheetLead.textContent = 'Asignar “' + routine.title + '” a los alumnos seleccionados.';
      showError(assignError, '');
      if (assignSearch) assignSearch.value = '';
      assignSheet.hidden = false;
      assignGrid.innerHTML = '<p class="empty-state">Cargando alumnos...</p>';
      try {
        await loadStudents();
        students.forEach(function (student) {
          if (student.routineId === routine.id) {
            selectedStudentIds[student.id] = true;
          }
        });
        renderAssignGrid('');
      } catch (err) {
        showError(assignError, err.message || 'No se pudieron cargar los alumnos.');
        assignGrid.innerHTML = '';
      }
    }

    function closeAssign() {
      assignSheet.hidden = true;
      assigningId = null;
      selectedStudentIds = {};
    }

    newBtn.addEventListener('click', function () {
      openRoutineForm(null);
    });

    if (routineCancel) routineCancel.addEventListener('click', closeRoutineForm);
    if (routineSheet) {
      routineSheet.addEventListener('click', function (event) {
        if (event.target === routineSheet) closeRoutineForm();
      });
    }

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener('click', function () {
        addExerciseRow({});
      });
    }

    if (exerciseRows) {
      exerciseRows.addEventListener('click', function (event) {
        const btn = event.target.closest('[data-remove-ex]');
        if (!btn) return;
        const row = btn.closest('.exercise-row');
        if (!row) return;
        if (exerciseRows.querySelectorAll('.exercise-row').length <= 1) {
          row.querySelectorAll('input').forEach(function (input) { input.value = ''; });
          return;
        }
        row.remove();
      });
    }

    if (routineForm) {
      routineForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        showError(routineFormError, '');
        const body = {
          title: routineTitle.value.trim(),
          description: routineDescription.value.trim(),
          videoUrl: routineVideo.value.trim(),
          imageUrl: routineImage.value.trim() || '/imagenes/Rectangle%203.png',
          exercises: collectExercises(),
        };
        if (!body.title) {
          showError(routineFormError, 'Completá el título.');
          return;
        }
        if (!body.exercises.length) {
          showError(routineFormError, 'Agregá al menos un ejercicio.');
          return;
        }

        const saveBtn = document.getElementById('routineSave');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.textContent = 'GUARDANDO...';
        }

        try {
          const endpoint = editingId ? ('/routines/' + editingId) : '/routines';
          const method = editingId ? 'PUT' : 'POST';
          const payload = await API.request(endpoint, method, body);
          if (payload.status !== 'success') {
            showError(routineFormError, payload.message || 'No se pudo guardar.');
            return;
          }
          closeRoutineForm();
          await loadRoutines();
        } catch (err) {
          showError(routineFormError, 'No se pudo guardar la rutina.');
        } finally {
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'GUARDAR';
          }
        }
      });
    }

    listEl.addEventListener('click', async function (event) {
      const row = event.target.closest('.routine-row');
      if (!row) return;
      const id = Number(row.getAttribute('data-id'));
      const routine = routines.find(function (item) { return item.id === id; });
      if (!routine) return;

      if (event.target.closest('[data-edit]')) {
        openRoutineForm(routine);
        return;
      }

      if (event.target.closest('[data-assign]')) {
        openAssign(routine);
        return;
      }

      if (event.target.closest('[data-delete]')) {
        if (!window.confirm('¿Eliminar la rutina “' + routine.title + '”? Se quitarán las asignaciones.')) {
          return;
        }
        const payload = await API.request('/routines/' + id, 'DELETE');
        if (payload.status !== 'success') {
          showError(errorEl, payload.message || 'No se pudo eliminar.');
          return;
        }
        await loadRoutines();
      }
    });

    if (assignCancel) assignCancel.addEventListener('click', closeAssign);
    if (assignSheet) {
      assignSheet.addEventListener('click', function (event) {
        if (event.target === assignSheet) closeAssign();
      });
    }

    if (assignGrid) {
      assignGrid.addEventListener('click', function (event) {
        const card = event.target.closest('.assign-card');
        if (!card) return;
        event.preventDefault();
        const id = Number(card.getAttribute('data-student'));
        if (!id) return;
        if (selectedStudentIds[id]) {
          delete selectedStudentIds[id];
        } else {
          selectedStudentIds[id] = true;
        }
        renderAssignGrid(assignSearch ? assignSearch.value : '');
      });
    }

    if (assignSearch) {
      assignSearch.addEventListener('input', function () {
        renderAssignGrid(assignSearch.value);
      });
    }

    if (assignConfirm) {
      assignConfirm.addEventListener('click', async function () {
        showError(assignError, '');
        const userIds = Object.keys(selectedStudentIds).map(Number).filter(Boolean);
        if (!userIds.length) {
          showError(assignError, 'Seleccioná al menos un alumno.');
          return;
        }
        assignConfirm.disabled = true;
        assignConfirm.textContent = 'ASIGNANDO...';
        try {
          const payload = await API.request('/routines/' + assigningId + '/assign', 'POST', { userIds: userIds });
          if (payload.status !== 'success') {
            showError(assignError, payload.message || 'No se pudo asignar.');
            return;
          }
          closeAssign();
          await loadRoutines();
        } catch (err) {
          showError(assignError, 'No se pudo asignar la rutina.');
        } finally {
          assignConfirm.disabled = false;
          assignConfirm.textContent = 'ASIGNAR RUTINA';
        }
      });
    }

    loadRoutines();
  });
})();
