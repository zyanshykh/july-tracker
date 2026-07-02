import { storage } from './storage.js';

export function initChecklist() {
    const form = document.getElementById('checklist-form');
    const input = document.getElementById('checklist-input');
    const list = document.getElementById('checklist-container');

    if (!form || !input || !list) return;

    let tasks = storage.get('july_tasks') || [];
    let editId = null;

    // Render Function (Read)
    function renderTasks() {
        list.innerHTML = '';
        if (tasks.length === 0) {
            list.innerHTML = `<p class="empty-text">No missions added for today yet!</p>`;
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `checklist-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span>${task.text}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}">✏️</button>
                    <button class="delete-btn" data-id="${task.id}">🗑️</button>
                </div>
            `;
            list.appendChild(li);
        });
        
        // Update Dashboard Statistics Card dynamically if applicable
        updateDashboardStats();
    }

    // Handle Create & Update
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        if (editId) {
            // Update Mode
            tasks = tasks.map(t => t.id === editId ? { ...t, text } : t);
            editId = null;
            form.querySelector('button[type="submit"]').innerText = 'Add Mission';
        } else {
            // Create Mode
            const newTask = {
                id: Date.now().toString(),
                text: text,
                completed: false
            };
            tasks.push(newTask);
        }

        storage.set('july_tasks', tasks);
        renderTasks();
        input.value = '';
    });

    // Handle Actions (Toggle Complete, Edit, Delete)
    list.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (!id) return;

        // Toggle Complete
        if (target.type === 'checkbox') {
            tasks = tasks.map(t => t.id === id ? { ...t, completed: target.checked } : t);
            storage.set('july_tasks', tasks);
            renderTasks();
        }

        // Edit Trigger
        if (target.classList.contains('edit-btn')) {
            const taskToEdit = tasks.find(t => t.id === id);
            if (taskToEdit) {
                input.value = taskToEdit.text;
                editId = id;
                form.querySelector('button[type="submit"]').innerText = 'Update Mission';
                input.focus();
            }
        }

        // Delete Trigger
        if (target.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== id);
            storage.set('july_tasks', tasks);
            renderTasks();
        }
    });

    function updateDashboardStats() {
        const totalCard = document.getElementById('total-tasks-stat');
        if (totalCard) {
            const completed = tasks.filter(t => t.completed).length;
            totalCard.innerText = `${completed}/${tasks.length}`;
        }
    }

    // Initial Load
    renderTasks();
}