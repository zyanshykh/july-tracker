import { Storage } from './storage.js';

export function initNotes() {
    const textarea = document.getElementById('notes-textarea');
    const status = document.getElementById('notes-status');

    // Load previously saved logs
    textarea.value = Storage.get('daily_scratchpad', '');

    // Auto-save keyup implementation
    textarea.addEventListener('input', () => {
        status.textContent = 'Saving...';
        Storage.set('daily_scratchpad', textarea.value);
        
        setTimeout(() => {
            status.textContent = 'Auto-saved to LocalStorage';
        }, 500);
    });
}