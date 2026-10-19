/**
 * Central localStorage wrapper + small shared helpers.
 * Exported under both `storage` and `Storage` so every module works.
 * get(key, defaultValue) returns defaultValue when nothing is saved.
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data !== null ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error reading localStorage', e);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage', e);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage', e);
        }
    },
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage', e);
        }
    }
};

export const Storage = storage;

/** Every key the app owns. Used by backup (export/import) and purge. */
export const APP_KEYS = [
    'july_tasks',
    'july_projects',
    'july_earnings',
    'july_streak',
    'daily_scratchpad'
];

/** Escape user text before putting it into innerHTML (prevents broken markup / XSS). */
export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Local-time date as YYYY-MM-DD (not UTC, so "today" matches the user's clock). */
export function dayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** YYYY-MM for grouping by month. */
export function monthKey(date = new Date()) {
    return dayKey(date).slice(0, 7);
}

/** Turn a YYYY-MM-DD string into a local Date (avoids the UTC shift of new Date('YYYY-MM-DD')). */
export function parseDay(str) {
    const [y, m, d] = String(str).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}
