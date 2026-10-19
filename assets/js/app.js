import { initTheme } from './modules/theme.js';
import { initDateTime } from './modules/datetime.js';

/**
 * July Tracker - single page application entry point.
 * One router: reads the URL hash, loads pages/<route>.html into #router-view,
 * then starts the modules that belong to that page.
 */

const ROUTES = {
    dashboard: async () => {
        const { initDashboard } = await import('./modules/dashboard.js');
        const { initChecklist } = await import('./modules/checklist.js');
        const { initQuotes } = await import('./modules/quotes.js');
        initDashboard();
        initChecklist();
        initQuotes();
    },
    projects: async () => {
        const { initProjectManager } = await import('./modules/project.js');
        initProjectManager();
    },
    analytics: async () => {
        const { initAnalytics } = await import('./modules/analytics.js');
        initAnalytics();
    },
    settings: async () => {
        const { initNotes } = await import('./modules/notes.js');
        const { initBackup } = await import('./modules/backup.js');
        initNotes();
        initBackup();
    }
};

// Old / misspelled hashes still land on the right page
const ALIASES = {
    project: 'projects',
    analysis: 'analytics',
    setting: 'settings',
    home: 'dashboard'
};

function getRoute() {
    const raw = window.location.hash.replace('#', '').trim().toLowerCase();
    const route = ALIASES[raw] || raw || 'dashboard';
    return ROUTES[route] ? route : 'dashboard';
}

function setActiveLink(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.target === route);
    });
}

function showError(view, route, error) {
    view.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'card';
    box.style.cssText = 'text-align:center; padding:2rem;';
    const title = document.createElement('h3');
    title.textContent = 'Page could not be loaded';
    const msg = document.createElement('p');
    msg.style.color = 'var(--text-muted)';
    msg.textContent = `Route "${route}" failed: ${error.message}`;
    box.append(title, msg);
    view.appendChild(box);
}

let loadToken = 0;

async function handleRoute() {
    const view = document.getElementById('router-view');
    if (!view) return;

    const route = getRoute();
    const token = ++loadToken; // ignore results of an older, slower navigation
    setActiveLink(route);

    try {
        const response = await fetch(`./pages/${route}.html`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        if (token !== loadToken) return;

        view.innerHTML = html;
        await ROUTES[route]();
    } catch (error) {
        console.error('[Router]', error);
        if (token === loadToken) showError(view, route, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDateTime();
    initTheme();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
});
