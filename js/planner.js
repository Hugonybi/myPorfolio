/* Academic planner.
   Tasks live in one array of plain objects. Each change goes through a small
   function that returns a new array; the array is then saved and re-rendered. */
(function () {
  'use strict';

  const STORAGE_KEY = 'academic-planner-tasks';

  const form = document.getElementById('task-form');
  if (!form) {
    return;
  }

  const textInput = document.getElementById('task-text');
  const dueInput = document.getElementById('task-due');
  const errorEl = document.getElementById('task-error');
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-state');
  const summaryEl = document.getElementById('summary-text');
  const progressEl = document.getElementById('progress');
  const progressBarEl = document.getElementById('progress-bar');
  const clearBtn = document.getElementById('clear-completed');
  const filterButtons = Array.from(document.querySelectorAll('[data-task-filter]'));

  let tasks = loadTasks();
  let currentFilter = 'all';
  let newestId = null;

  /* ---------- Small helpers ---------- */

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function isOverdue(task) {
    return !task.done && task.due !== '' && task.due < toIsoDate(new Date());
  }

  /* ---------- Task functions (data only, no DOM) ---------- */

  function addTask(list, text, due) {
    const task = { id: makeId(), text: text.trim(), due: due || '', done: false };
    return [...list, task];
  }

  function toggleTask(list, id) {
    return list.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  }

  function deleteTask(list, id) {
    return list.filter((task) => task.id !== id);
  }

  function clearCompleted(list) {
    return list.filter((task) => !task.done);
  }

  function visibleTasks(list, filter) {
    if (filter === 'active') return list.filter((task) => !task.done);
    if (filter === 'completed') return list.filter((task) => task.done);
    return list;
  }

  /* ---------- Storage (guarded, because browsers can block storage) ---------- */

  function isStoredTask(item) {
    return item !== null && typeof item === 'object' && typeof item.id === 'string' && typeof item.text === 'string';
  }

  function normaliseTask(item) {
    return {
      id: item.id,
      text: item.text,
      due: typeof item.due === 'string' ? item.due : '',
      done: Boolean(item.done),
    };
  }

  function loadTasks() {
    let raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return []; // storage is blocked: work in memory for this visit
    }

    if (raw === null) {
      return []; // first visit: start with an empty list
    }

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isStoredTask).map(normaliseTask) : [];
    } catch (error) {
      return []; // saved data is corrupt: start with an empty list
    }
  }

  function saveTasks() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      // Storage is full or blocked: the planner keeps working for this visit.
    }
  }

  /* ---------- Rendering (DOM manipulation) ---------- */

  function buildTaskItem(task) {
    const item = document.createElement('li');
    item.className = 'task';
    item.dataset.id = task.id;
    if (task.done) item.classList.add('is-done');
    if (task.id === newestId) item.classList.add('is-new');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.id = `task-check-${task.id}`;
    checkbox.checked = task.done;

    const body = document.createElement('div');
    body.className = 'task-body';

    const label = document.createElement('label');
    label.className = 'task-text';
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    body.appendChild(label);

    if (task.due) {
      const overdue = isOverdue(task);
      const due = document.createElement('span');
      due.className = overdue ? 'task-due is-overdue' : 'task-due';
      due.textContent = overdue
        ? `Overdue, was due ${formatDate(task.due)}`
        : `Due ${formatDate(task.due)}`;
      body.appendChild(due);
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'task-delete';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete task: ${task.text}`);

    item.append(checkbox, body, remove);
    return item;
  }

  function emptyMessage() {
    if (tasks.length === 0) return 'No tasks yet. Add your first task above.';
    if (currentFilter === 'completed') return 'Nothing is completed yet.';
    if (currentFilter === 'active') return 'Every task is done. Well done!';
    return 'No tasks to show.';
  }

  function updateSummary() {
    const total = tasks.length;
    const done = tasks.filter((task) => task.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    summaryEl.textContent = total === 0 ? 'No tasks yet' : `${done} of ${total} done`;
    progressBarEl.style.width = `${percent}%`;
    progressEl.setAttribute('aria-valuenow', String(percent));
    clearBtn.disabled = done === 0;
  }

  function updateFilterButtons() {
    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.taskFilter === currentFilter));
    });
  }

  /* focusId: element to focus after re-rendering, so keyboard users keep their place */
  function renderTasks(focusId) {
    const visible = visibleTasks(tasks, currentFilter);

    listEl.replaceChildren(...visible.map(buildTaskItem));
    emptyEl.hidden = visible.length > 0;
    emptyEl.textContent = emptyMessage();

    updateSummary();
    updateFilterButtons();
    newestId = null; // the newest task animates once, then stays still

    if (focusId) {
      const target = document.getElementById(focusId) || listEl;
      target.focus();
    }
  }

  /* ---------- Events ---------- */

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = textInput.value.trim();

    if (text === '') {
      errorEl.textContent = 'Please describe the task before adding it.';
      textInput.setAttribute('aria-invalid', 'true');
      textInput.focus();
      return;
    }

    errorEl.textContent = '';
    textInput.removeAttribute('aria-invalid');

    tasks = addTask(tasks, text, dueInput.value);
    newestId = tasks[tasks.length - 1].id;
    if (currentFilter === 'completed') currentFilter = 'all'; // make the new task visible
    saveTasks();
    form.reset();
    renderTasks(textInput.id);
  });

  textInput.addEventListener('input', () => {
    if (textInput.getAttribute('aria-invalid') === 'true' && textInput.value.trim() !== '') {
      errorEl.textContent = '';
      textInput.removeAttribute('aria-invalid');
    }
  });

  listEl.addEventListener('change', (event) => {
    if (!event.target.matches('.task-check')) return;

    const id = event.target.closest('.task').dataset.id;
    tasks = toggleTask(tasks, id);
    saveTasks();
    renderTasks(event.target.id);
  });

  listEl.addEventListener('click', (event) => {
    const button = event.target.closest('.task-delete');
    if (!button) return;

    const id = button.closest('.task').dataset.id;
    const before = visibleTasks(tasks, currentFilter);
    const position = before.findIndex((task) => task.id === id);

    tasks = deleteTask(tasks, id);
    saveTasks();

    // Move focus to the task that takes the deleted one's place, if there is one.
    const after = visibleTasks(tasks, currentFilter);
    const next = after[position] || after[position - 1];
    renderTasks(next ? `task-check-${next.id}` : 'task-list');
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.taskFilter;
      renderTasks();
    });
  });

  clearBtn.addEventListener('click', () => {
    tasks = clearCompleted(tasks);
    saveTasks();
    renderTasks('task-list');
  });

  renderTasks();
})();
