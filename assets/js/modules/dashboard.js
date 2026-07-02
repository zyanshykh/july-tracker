import { Storage } from './storage.js';

/**
 * Metric Card Operations & Monthly Progress Calculation Component
 */
export function initDashboard() {
    // Dynamic July Monthly Target Bar Logic
    const progressPercentEl = document.getElementById('progress-percent');
    const progressBarEl = document.getElementById('monthly-progress-bar');
    
    function calculateJulyProgress() {
        const now = new Date();
        // Target calculation restricted targeting current year
        if (now.getMonth() === 6) { // 6 is July in JS
            const totalDays = new Date(now.getFullYear(), 7, 0).getDate(); 
            const currentDay = now.getDate();
            const percentage = Math.round((currentDay / totalDays) * 100);
            
            progressBarEl.style.width = `${percentage}%`;
            progressPercentEl.textContent = `${percentage}% of Month Elapsed`;
        } else {
            progressBarEl.style.width = '100%';
            progressPercentEl.textContent = 'July cycle absolute/ended';
        }
    }

    // Static Mock Data configurations for Feature metrics
    document.getElementById('stat-streak').textContent = Storage.get('sys_streak', '5 Days');
    document.getElementById('stat-commits').textContent = Storage.get('sys_commits', '42');
    document.getElementById('stat-hours').textContent = Storage.get('sys_hours', '14.5 hrs');

    calculateJulyProgress();
}