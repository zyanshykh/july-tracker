/**
 * LocalStorage Wrapper Engine Utility
 */
export const Storage = {
    get(key, defaultValue = null) {
        const data = localStorage.getItem(key);
        try {
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return data || defaultValue;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};