import { Storage } from './storage.js';

export function initChecklist() {
    const form = document.getElementById('checklist-form');
    const input = document.getElementById('checklist-input');
    const listContainer = document.getElementById('checklist-items');

    let items = Storage.get('checklist_items', [
        { id: 1, text: 'Review July goals and targets', completed: false },
        { id: 2, text: 'Commit code changes to branch', completed: true }
    ]);

    function render() {
        listContainer.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = `todo-item ${item.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <input type="checkbox" ${item.completed ? 'checked' : ''} data-id="${item.id}">
                    <span>${item.text}</span>
                </div>
                <button class="btn-del" data-id="${item.id}"><i class='bx bx-trash'></i></button>
            `;
            listContainer.appendChild(li);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            text: input.value.trim(),
            completed: false
        };
        items.push(newItem);
        Storage.set('checklist_items', items);
        input.value = '';
        render();
    });

    listContainer.addEventListener('click', (e) => {
        const id = parseInt(e.target.closest('[data-id]')?.dataset.id);
        if (!id) return;

        if (e.target.type === 'checkbox') {
            items = items.map(item => item.id === id ? { ...item, completed: e.target.checked } : item);
        } else if (e.target.closest('.btn-del')) {
            items = items.filter(item => item.id !== id);
        }
        
        Storage.set('checklist_items', items);
        render();
    });

    render();
}