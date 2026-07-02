// Main Application Module Orchestrator
import { initTheme } from './modules/theme.js';
import { initDateTime } from './modules/datetime.js';
import { initChecklist } from './modules/checklist.js';
import { initDashboard } from './modules/dashboard.js';
import { initProjects } from './modules/project.js';
import { initNotes } from './modules/notes.js';
import { initQuotes } from './modules/quotes.js';
import { Storage } from './modules/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize System Architecture Layout configurations
    initTheme();
    initDateTime();
    
    // 2. Load Metric Data Blocks
    initDashboard();
    initChecklist();
    initProjects();
    initNotes();
    initQuotes();

    // 3. Freelancing Revenue Form Operations
    const earnForm = document.getElementById('earnings-form');
    const earnAmount = document.getElementById('earn-amount');
    const earnClient = document.getElementById('earn-client');
    const revenueTotalDisplay = document.getElementById('total-revenue');

    let currentRev = Storage.get('total_earnings', 0.00);
    revenueTotalDisplay.textContent = `$${currentRev.toFixed(2)}`;

    earnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputVal = parseFloat(earnAmount.value);
        if(!isNaN(inputVal)) {
            currentRev += inputVal;
            Storage.set('total_earnings', currentRev);
            revenueTotalDisplay.textContent = `$${currentRev.toFixed(2)}`;
            earnForm.reset();
        }
    });
});