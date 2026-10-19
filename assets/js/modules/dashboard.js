import { storage } from './storage.js';

/**
 * Dashboard: month progress bar, live revenue total and daily streak.
 * (Mission counter is updated by checklist.js.)
 */

function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function updateMonthProgress() {
    const bar = document.getElementById('monthly-progress-bar');
    const label = document.getElementById('progress-percent');
    const monthName = document.getElementById('month-name');

    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const percent = Math.round((now.getDate() / totalDays) * 100);
    const name = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (monthName) monthName.textContent = name;
    if (bar) bar.style.width = `${percent}%`;
    if (label) label.textContent = `${percent}% of ${name} elapsed (day ${now.getDate()} of ${totalDays})`;
}

function updateRevenue() {
    const el = document.getElementById('total-revenue-value');
    if (!el) return;
    const earnings = storage.get('july_earnings', []);
    const total = earnings.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    el.textContent = `$${total.toFixed(2)}`;
}

/** Streak = consecutive days the tracker was opened. */
function updateStreak() {
    const el = document.getElementById('stat-streak');
    const today = todayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const saved = storage.get('july_streak', { last: null, count: 0 });
    let { last, count } = saved;

    if (last !== today) {
        count = last === todayKey(yesterday) ? count + 1 : 1;
        storage.set('july_streak', { last: today, count });
    }

    if (el) el.textContent = `🔥 ${count} ${count === 1 ? 'Day' : 'Days'}`;
}

export function initDashboard() {
    updateMonthProgress();
    updateRevenue();
    updateStreak();
}
