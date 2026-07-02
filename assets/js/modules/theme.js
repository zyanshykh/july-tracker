import { Storage } from './storage.js';

export function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    
    let currentTheme = Storage.get('theme', 'light');
    htmlEl.setAttribute('data-theme', currentTheme);
    updateIcon(currentTheme);

    toggleBtn.addEventListener('click', () => {
        currentTheme = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', currentTheme);
        Storage.set('theme', currentTheme);
        updateIcon(currentTheme);
    });

    function updateIcon(theme) {
        const icon = toggleBtn.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'bx bx-sun';
        } else {
            icon.className = 'bx bx-moon';
        }
    }
}