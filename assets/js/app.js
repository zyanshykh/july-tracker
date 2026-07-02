// Persistent global components ko handle karne ke liye storage check karein
async function getStorage() {
    try {
        const storageMod = await import('./modules/storage.js');
        return storageMod.Storage;
    } catch (e) {
        // Fallback backup proxy object agar base storage missing ho
        return {
            get: (key, def) => localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : def,
            set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
        };
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize persistent global components immediately
    initDateTimeComponent();
    await initThemeEngine();
    
    // 2. Bootstrap application router engine
    initRouter();
});

/**
 * Universal Theme Switcher Integration (Fixes Toggle Button)
 */
async function initThemeEngine() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const Storage = await getStorage();

    // Set initial theme state from storage or system preferences
    let currentTheme = Storage.get('theme', 'light');
    htmlEl.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    if (themeToggleBtn) {
        // Purane listeners ko cleanup karne ke liye click direct overwrite
        themeToggleBtn.onclick = () => {
            currentTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            htmlEl.setAttribute('data-theme', currentTheme);
            Storage.set('theme', currentTheme);
            updateThemeIcon(currentTheme);
        };
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
        }
    }
}

/**
 * Date and Time Dynamic Core System
 */
function initDateTimeComponent() {
    const headerDate = document.getElementById('header-date');
    const headerTime = document.getElementById('header-time');

    function updateClock() {
        const now = new Date();
        if (headerDate) {
            headerDate.textContent = now.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
        }
        if (headerTime) {
            headerTime.textContent = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
            });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();
}

/**
 * Single Page Application Core Routing Engine
 */
function initRouter() {
    const navLinks = document.querySelectorAll('.nav-link');
    const viewContainer = document.getElementById('router-view');

    async function handleRoute(forcedTarget) {
        // Get navigation endpoint target string
        const hash = forcedTarget || window.location.hash.replace('#', '') || 'dashboard';
        
        console.log(`[Router] Attempting to load page view layout: ${hash}`);

        // Update active classes explicitly on DOM links
        navLinks.forEach(link => {
            if(link.getAttribute('data-target') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        try {
            // Dynamic page fragment fetch layer
            const response = await fetch(`./pages/${hash}.html`);
            if (!response.ok) throw new Error(`Status ${response.status}: Failed to read file component.`);
            
            const htmlContent = await response.text();
            viewContainer.innerHTML = htmlContent;

            // Strict Dynamic JS Lifecycle Execution
            if (hash === 'dashboard') {
                const dashboardMod = await import('./modules/dashboard.js');
                const checklistMod = await import('./modules/checklist.js');
                const quotesMod = await import('./modules/quotes.js');
                
                if(dashboardMod.initDashboard) dashboardMod.initDashboard();
                if(checklistMod.initChecklist) checklistMod.initChecklist();
                if(quotesMod.initQuotes) quotesMod.initQuotes();
                
            } else if (hash === 'projects') {
                const projectMod = await import('./modules/project.js');
                if(projectMod.initProjects) projectMod.initProjects();
                
            } else if (hash === 'analytics') {
                initRevenueTracker();
                
            } else if (hash === 'settings') {
                const notesMod = await import('./modules/notes.js');
                if(notesMod.initNotes) notesMod.initNotes();
            }

        } catch (error) {
            console.error("[Router Critical Failure Error Trace]:", error);
            viewContainer.innerHTML = `
                <div class="card" style="text-align:center; padding: 3rem; margin: 2rem; background: var(--bg-card); border-radius: 8px;">
                    <i class='bx bx-error-alt' style='font-size: 3.5rem; color: #ff4a5a;'></i>
                    <h2 style="margin: 1rem 0 0.5rem 0;">Navigation Routing Framework Crash</h2>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">
                        Could not display <strong>"${hash}"</strong> workspace panel layout.
                    </p>
                    <code style="display:block; background:rgba(0,0,0,0.05); padding: 0.5rem; margin-top: 1rem; font-size:0.8rem; border-radius:4px;">
                        Check if the file path "pages/${hash}.html" exists relative to root directory.
                    </code>
                </div>`;
        }
    }

    // Add explicit fallback pointer interceptors to bypass browser hash engine freezing
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('data-target');
            if(target) {
                window.location.hash = target;
                handleRoute(target);
            }
        });
    });

    // Register primary core framework listener monitors
    window.addEventListener('hashchange', () => handleRoute());
    window.addEventListener('load', () => handleRoute());
    
    // Execute default startup route immediately
    handleRoute();
}

/**
 * Earnings Management Module Engine
 */
async function initRevenueTracker() {
    const Storage = await getStorage();
    const earnForm = document.getElementById('earnings-form');
    const earnAmount = document.getElementById('earn-amount');
    const revenueTotalDisplay = document.getElementById('total-revenue');

    let currentRev = Storage.get('total_earnings', 0.00);
    if(revenueTotalDisplay) revenueTotalDisplay.textContent = `$${currentRev.toFixed(2)}`;

    if(earnForm) {
        earnForm.onsubmit = (e) => {
            e.preventDefault();
            const inputVal = parseFloat(earnAmount.value);
            if(!isNaN(inputVal)) {
                currentRev += inputVal;
                Storage.set('total_earnings', currentRev);
                if(revenueTotalDisplay) revenueTotalDisplay.textContent = `$${currentRev.toFixed(2)}`;
                earnForm.reset();
            }
        };
    }
}

// Example Router execution inside app.js
if (route === 'dashboard') {
    const { initChecklist } = await import('./modules/checklist.js');
    initChecklist();
} else if (route === 'projects') {
    const { initProjectManager } = await import('./modules/project.js');
    initProjectManager();
} else if (route === 'analytics') {
    const { initAnalytics } = await import('./modules/analytics.js');
    initAnalytics();
}