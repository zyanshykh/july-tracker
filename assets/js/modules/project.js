import { storage, escapeHtml, dayKey, parseDay } from './storage.js';

const STATUSES = ['Todo', 'In Progress', 'Done'];
const STATUS_CLASS = { 'Todo': 'todo', 'In Progress': 'doing', 'Done': 'done' };

/** Older saved projects have no status/progress - give them sensible defaults. */
function normalizeProject(p) {
    const status = STATUSES.includes(p.status) ? p.status : 'Todo';
    let progress = Math.min(100, Math.max(0, parseInt(p.progress, 10) || 0));
    if (status === 'Done') progress = 100;
    return {
        id: String(p.id),
        title: String(p.title ?? ''),
        priority: ['High', 'Medium', 'Low'].includes(p.priority) ? p.priority : 'Medium',
        deadline: p.deadline || '',
        hours: p.hours || 0,
        status,
        progress
    };
}

export function initProjectManager() {
    const form = document.getElementById('project-form');
    const container = document.getElementById('projects-grid');

    const titleInp = document.getElementById('proj-title');
    const priorityInp = document.getElementById('proj-priority');
    const deadlineInp = document.getElementById('proj-deadline');
    const hoursInp = document.getElementById('proj-hours');
    const statusInp = document.getElementById('proj-status');
    const progressInp = document.getElementById('proj-progress');
    const progressOut = document.getElementById('proj-progress-value');
    const filterSel = document.getElementById('project-filter');
    const summary = document.getElementById('projects-summary');

    if (!form || !container) return;

    let projects = storage.get('july_projects', []).map(normalizeProject);
    let editId = null;

    function save() {
        storage.set('july_projects', projects);
    }

    function showProgressValue() {
        if (progressOut && progressInp) progressOut.textContent = `${progressInp.value}%`;
    }

    function renderSummary() {
        if (!summary) return;
        if (projects.length === 0) {
            summary.textContent = '';
            return;
        }
        const hours = projects.reduce((s, p) => s + (parseFloat(p.hours) || 0), 0);
        const avg = Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length);
        const done = projects.filter(p => p.status === 'Done').length;
        summary.textContent = `${projects.length} projects · ${done} done · ${avg}% average progress · ${hours} hrs logged`;
    }

    function render() {
        container.innerHTML = '';
        renderSummary();

        if (projects.length === 0) {
            container.innerHTML = `<p class="empty-text">No active projects found. Start building!</p>`;
            return;
        }

        const filter = filterSel?.value || 'all';
        const shown = projects.filter(p => filter === 'all' || p.status === filter);
        if (shown.length === 0) {
            container.innerHTML = `<p class="empty-text">No projects with this status.</p>`;
            return;
        }

        const today = dayKey();
        shown.forEach(proj => {
            const overdue = proj.status !== 'Done' && proj.deadline && proj.deadline < today;
            const deadlineText = proj.deadline
                ? parseDay(proj.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : 'No deadline';

            const card = document.createElement('div');
            card.className = `project-card priority-${proj.priority.toLowerCase()}`;
            card.innerHTML = `
                <div class="project-header">
                    <h3>${escapeHtml(proj.title)}</h3>
                    <span class="badge font-weight-bold">${escapeHtml(proj.priority)}</span>
                </div>
                <div class="project-status-row">
                    <span class="status-pill status-${STATUS_CLASS[proj.status]}">${escapeHtml(proj.status)}</span>
                    <span class="progress-number">${proj.progress}%</span>
                </div>
                <div class="mini-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${proj.progress}">
                    <div class="mini-progress-fill" style="width:${proj.progress}%"></div>
                </div>
                <div class="project-details">
                    <p><strong>Deadline:</strong> ${escapeHtml(deadlineText)}${overdue ? ' <span class="overdue-flag">⚠️ Overdue</span>' : ''}</p>
                    <p><strong>Logged Hours:</strong> ${escapeHtml(proj.hours)} hrs</p>
                </div>
                <div class="project-actions">
                    <button class="edit-proj-btn btn-sm" data-id="${escapeHtml(proj.id)}">Edit</button>
                    <button class="delete-proj-btn btn-sm btn-danger" data-id="${escapeHtml(proj.id)}">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function resetForm() {
        form.reset();
        editId = null;
        showProgressValue();
        form.querySelector('button[type="submit"]').innerText = 'Create Project';
    }

    // Keep status and progress consistent: Done = 100%, 100% = Done.
    statusInp?.addEventListener('change', () => {
        if (statusInp.value === 'Done') progressInp.value = 100;
        showProgressValue();
    });
    progressInp?.addEventListener('input', () => {
        if (statusInp && Number(progressInp.value) === 100) statusInp.value = 'Done';
        else if (statusInp && statusInp.value === 'Done') statusInp.value = 'In Progress';
        showProgressValue();
    });
    form.addEventListener('reset', () => setTimeout(showProgressValue, 0));
    filterSel?.addEventListener('change', render);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInp.value.trim();
        const deadline = deadlineInp.value;
        if (!title || !deadline) return;

        const data = normalizeProject({
            id: editId || Date.now().toString(),
            title,
            priority: priorityInp.value,
            deadline,
            hours: hoursInp.value || 0,
            status: statusInp?.value,
            progress: progressInp?.value
        });

        if (editId) {
            projects = projects.map(p => p.id === editId ? data : p);
        } else {
            projects.push(data);
        }

        save();
        resetForm();
        render();
    });

    container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id]');
        if (!target) return;
        const id = target.dataset.id;

        if (target.classList.contains('edit-proj-btn')) {
            const proj = projects.find(p => p.id === id);
            if (!proj) return;
            titleInp.value = proj.title;
            priorityInp.value = proj.priority;
            deadlineInp.value = proj.deadline;
            hoursInp.value = proj.hours;
            if (statusInp) statusInp.value = proj.status;
            if (progressInp) progressInp.value = proj.progress;
            showProgressValue();
            editId = id;
            form.querySelector('button[type="submit"]').innerText = 'Update Details';
            titleInp.focus();
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        if (target.classList.contains('delete-proj-btn')) {
            if (confirm('Are you sure you want to remove this project?')) {
                projects = projects.filter(p => p.id !== id);
                if (editId === id) resetForm();
                save();
                render();
            }
        }
    });

    showProgressValue();
    render();
}
