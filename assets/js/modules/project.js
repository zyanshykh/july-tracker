import { Storage } from './storage.js';

export function initProjects() {
    const form = document.getElementById('project-form');
    const titleIn = document.getElementById('proj-title');
    const priorityIn = document.getElementById('proj-priority');
    const deadlineIn = document.getElementById('proj-deadline');
    const listContainer = document.getElementById('project-list');

    let projects = Storage.get('project_items', [
        { id: 1, title: 'Build Track App Suite', priority: 'High', deadline: '2026-07-20', status: 'In Progress' }
    ]);

    function render() {
        listContainer.innerHTML = '';
        if(projects.length === 0) {
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align:center; color:gray;">No tracked projects yet.</td></tr>`;
            return;
        }
        projects.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${p.title}</strong></td>
                <td><span class="badge badge-${p.priority.toLowerCase()}">${p.priority}</span></td>
                <td>${p.deadline}</td>
                <td><span style="color: var(--accent); font-weight:500;">${p.status}</span></td>
                <td><button class="btn-del" data-id="${p.id}"><i class='bx bx-x-circle'></i></button></td>
            `;
            listContainer.appendChild(tr);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newProj = {
            id: Date.now(),
            title: titleIn.value.trim(),
            priority: priorityIn.value,
            deadline: deadlineIn.value,
            status: 'Active'
        };
        projects.push(newProj);
        Storage.set('project_items', projects);
        form.reset();
        render();
    });

    listContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-del');
        if (!btn) return;
        const id = parseInt(btn.dataset.id);
        projects = projects.filter(p => p.id !== id);
        Storage.set('project_items', projects);
        render();
    });

    render();
}