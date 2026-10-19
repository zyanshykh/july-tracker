import { storage, APP_KEYS } from './storage.js';

export function initNotes() {
    const textarea = document.getElementById('system-notes-area');
    const status = document.getElementById('auto-save-status');
    const clearBtn = document.getElementById('clear-notes-btn');
    const resetBtn = document.getElementById('factory-reset-btn');

    if (textarea) {
        textarea.value = storage.get('daily_scratchpad', '');

        let timer;
        textarea.addEventListener('input', () => {
            if (status) status.textContent = 'Saving...';
            storage.set('daily_scratchpad', textarea.value);
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (status) status.textContent = 'All edits saved locally';
            }, 500);
        });
    }

    if (clearBtn && textarea) {
        clearBtn.addEventListener('click', () => {
            if (!confirm('Wipe the whole notebook? This cannot be undone.')) return;
            textarea.value = '';
            storage.remove('daily_scratchpad');
            if (status) status.textContent = 'Notebook wiped';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!confirm('Delete ALL missions, projects, earnings, streak and notes? This cannot be undone. (Tip: export a backup first.)')) return;
            APP_KEYS.forEach(key => storage.remove(key));
            // replaceState does not fire "hashchange", so no half-finished page fetch gets cut off by the reload
            history.replaceState(null, '', '#dashboard');
            window.location.reload();
        });
    }
}
