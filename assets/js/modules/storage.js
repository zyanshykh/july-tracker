/**
 * Central localStorage wrapper.
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

/** Escape user text before putting it into innerHTML (prevents broken markup / XSS). */
export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
