import { storage } from './storage.js';

export function initProjectManager() {
    const form = document.getElementById('project-form');
    const container = document.getElementById('projects-grid');
    
    // Inputs
    const titleInp = document.getElementById('proj-title');
    const priorityInp = document.getElementById('proj-priority');
    const deadlineInp = document.getElementById('proj-deadline');
    const hoursInp = document.getElementById('proj-hours');

    if (!form || !container) return;

    let projects = storage.get('july_projects') || [];
    let editId = null;

    // Render Projects (Read)
    function renderProjects() {
        container.innerHTML = '';
        if (projects.length === 0) {
            container.innerHTML = `<p class="empty-text">No active projects found. Start building!</p>`;
            return;
        }

        projects.forEach(proj => {
            const card = document.createElement('div');
            card.className = `project-card priority-${proj.priority.toLowerCase()}`;
            card.innerHTML = `
                <div class="project-header">
                    <h3>${proj.title}</h3>
                    <span class="badge font-weight-bold">${proj.priority}</span>
                </div>
                <div class="project-details">
                    <p><strong>Deadline:</strong> ${proj.deadline}</p>
                    <p><strong>Logged Hours:</strong> ${proj.hours} hrs</p>
                </div>
                <div class="project-actions">
                    <button class="edit-proj-btn btn-sm" data-id="${proj.id}">Edit</button>
                    <button class="delete-proj-btn btn-sm btn-danger" data-id="${proj.id}">Delete</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Form Submit (Create & Update)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = titleInp.value.trim();
        const priority = priorityInp.value;
        const deadline = deadlineInp.value;
        const hours = hoursInp.value || 0;

        if (!title || !deadline) return;

        if (editId) {
            // Update
            projects = projects.map(p => p.id === editId ? { ...p, title, priority, deadline, hours } : p);
            editId = null;
            form.querySelector('button[type="submit"]').innerText = 'Create Project';
        } else {
            // Create
            const newProject = {
                id: Date.now().toString(),
                title,
                priority,
                deadline,
                hours
            };
            projects.push(newProject);
        }

        storage.set('july_projects', projects);
        renderProjects();
        form.reset();
    });

    // Handle Clicks (Edit & Delete)
    container.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        if (target.classList.contains('edit-proj-btn')) {
            const proj = projects.find(p => p.id === id);
            if (proj) {
                titleInp.value = proj.title;
                priorityInp.value = proj.priority;
                deadlineInp.value = proj.deadline;
                hoursInp.value = proj.hours;
                
                editId = id;
                form.querySelector('button[type="submit"]').innerText = 'Update Details';
                titleInp.focus();
            }
        }

        if (target.classList.contains('delete-proj-btn')) {
            if (confirm('Are you sure you want to remove this project?')) {
                projects = projects.filter(p => p.id !== id);
                storage.set('july_projects', projects);
                renderProjects();
            }
        }
    });

    // Initial Load
    renderProjects();
}