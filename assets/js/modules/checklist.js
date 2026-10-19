import { storage, escapeHtml, dayKey, parseDay } from './storage.js';
import { barChart } from './charts.js';

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
const PRIORITY_ICON = { High: '🔴', Medium: '🟡', Low: '🟢' };

/** Older saved tasks only have id/text/completed - fill in the new v3 fields. */
function normalizeTask(t) {
    return {
        id: String(t.id),
        text: String(t.text ?? ''),
        completed: Boolean(t.completed),
        priority: PRIORITY_RANK[t.priority] !== undefined ? t.priority : 'Medium',
        dueDate: t.dueDate || '',
        createdAt: t.createdAt || dayKey(new Date(Number(t.id) || Date.now())),
        completedAt: t.completed ? (t.completedAt || dayKey()) : ''
    };
}

function sortTasks(list) {
    return [...list].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.dueDate !== b.dueDate) {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate < b.dueDate ? -1 : 1;
        }
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    });
}

function formatDue(dueDate) {
    return parseDay(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function initChecklist() {
    const form = document.getElementById('checklist-form');
    const input = document.getElementById('checklist-input');
    const prioritySel = document.getElementById('checklist-priority');
    const dueInput = document.getElementById('checklist-due');
    const searchInput = document.getElementById('checklist-search');
    const filterSel = document.getElementById('checklist-filter');
    const clearBtn = document.getElementById('clear-completed-btn');
    const list = document.getElementById('checklist-container');

    if (!form || !input || !list) return;

    let tasks = storage.get('july_tasks', []).map(normalizeTask);
    let editId = null;

    function save() {
        storage.set('july_tasks', tasks);
    }

    function updateStats() {
        const stat = document.getElementById('total-tasks-stat');
        if (stat) stat.innerText = `${tasks.filter(t => t.completed).length}/${tasks.length}`;
    }

    function renderWeeklyChart() {
        const container = document.getElementById('weekly-chart');
        if (!container) return;
        const items = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = dayKey(d);
            items.push({
                label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: tasks.filter(t => t.completed && t.completedAt === key).length
            });
        }
        barChart(container, items, {
            emptyMessage: 'Complete a mission to see your week here.',
            ariaLabel: 'Missions completed in the last 7 days'
        });
    }

    function visibleTasks() {
        const q = (searchInput?.value || '').trim().toLowerCase();
        const filter = filterSel?.value || 'all';
        return sortTasks(tasks).filter(t => {
            if (filter === 'active' && t.completed) return false;
            if (filter === 'done' && !t.completed) return false;
            return !q || t.text.toLowerCase().includes(q);
        });
    }

    function render() {
        updateStats();
        renderWeeklyChart();

        if (clearBtn) clearBtn.hidden = !tasks.some(t => t.completed);

        list.innerHTML = '';
        if (tasks.length === 0) {
            list.innerHTML = `<p class="empty-text">No missions added for today yet!</p>`;
            return;
        }

        const shown = visibleTasks();
        if (shown.length === 0) {
            list.innerHTML = `<p class="empty-text">No missions match your search or filter.</p>`;
            return;
        }

        const today = dayKey();
        shown.forEach(task => {
            const overdue = !task.completed && task.dueDate && task.dueDate < today;
            const li = document.createElement('li');
            li.className = `checklist-item priority-${task.priority.toLowerCase()}${task.completed ? ' completed' : ''}${overdue ? ' overdue' : ''}`;
            li.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${escapeHtml(task.id)}" aria-label="Mark complete">
                    <div class="task-text">
                        <span>${escapeHtml(task.text)}</span>
                        <small class="task-meta">
                            ${PRIORITY_ICON[task.priority]} ${escapeHtml(task.priority)}
                            ${task.dueDate ? ` · ${overdue ? '⚠️ Overdue' : '📅 Due'} ${escapeHtml(formatDue(task.dueDate))}` : ''}
                        </small>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${escapeHtml(task.id)}" aria-label="Edit">✏️</button>
                    <button class="delete-btn" data-id="${escapeHtml(task.id)}" aria-label="Delete">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        });
    }

    function resetForm() {
        form.reset();
        editId = null;
        form.querySelector('button[type="submit"]').innerText = 'Add Mission';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        const priority = prioritySel?.value || 'Medium';
        const dueDate = dueInput?.value || '';

        if (editId) {
            tasks = tasks.map(t => t.id === editId ? { ...t, text, priority, dueDate } : t);
        } else {
            tasks.push({
                id: Date.now().toString(),
                text,
                completed: false,
                priority,
                dueDate,
                createdAt: dayKey(),
                completedAt: ''
            });
        }
        save();
        resetForm();
        render();
    });

    list.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id]');
        if (!target) return;
        const id = target.dataset.id;

        if (target.type === 'checkbox') {
            tasks = tasks.map(t => t.id === id
                ? { ...t, completed: target.checked, completedAt: target.checked ? dayKey() : '' }
                : t);
            save();
            render();
        } else if (target.classList.contains('edit-btn')) {
            const t = tasks.find(x => x.id === id);
            if (!t) return;
            input.value = t.text;
            if (prioritySel) prioritySel.value = t.priority;
            if (dueInput) dueInput.value = t.dueDate;
            editId = id;
            form.querySelector('button[type="submit"]').innerText = 'Update Mission';
            input.focus();
        } else if (target.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== id);
            if (editId === id) resetForm();
            save();
            render();
        }
    });

    searchInput?.addEventListener('input', render);
    filterSel?.addEventListener('change', render);

    clearBtn?.addEventListener('click', () => {
        if (!confirm('Remove all completed missions?')) return;
        tasks = tasks.filter(t => !t.completed);
        save();
        render();
    });

    render();
}
