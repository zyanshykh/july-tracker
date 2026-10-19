import { storage, escapeHtml, dayKey, monthKey, parseDay } from './storage.js';
import { barChart, donutChart } from './charts.js';

const STATUSES = ['Paid', 'Pending', 'Proposed'];

const money = n => `$${Number(n).toFixed(2)}`;
const moneyShort = n => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${Math.round(n)}`);

/** Older entries have no date and a string amount - normalise them. */
function normalizeEarning(e) {
    return {
        id: String(e.id),
        client: String(e.client ?? ''),
        amount: parseFloat(e.amount) || 0,
        status: STATUSES.includes(e.status) ? e.status : 'Pending',
        date: e.date || dayKey(new Date(Number(e.id) || Date.now()))
    };
}

export function initAnalytics() {
    const form = document.getElementById('analytics-form');
    const tableBody = document.getElementById('earnings-table-body');

    const clientInp = document.getElementById('earn-client');
    const amountInp = document.getElementById('earn-amount');
    const statusInp = document.getElementById('earn-status');
    const dateInp = document.getElementById('earn-date');

    if (!form || !tableBody) return;

    let earnings = storage.get('july_earnings', []).map(normalizeEarning);
    let editId = null;

    function save() {
        storage.set('july_earnings', earnings);
    }

    function setDefaultDate() {
        if (dateInp) dateInp.value = dayKey();
    }

    function renderTotals() {
        const total = earnings.reduce((s, e) => s + e.amount, 0);
        const totalEl = document.getElementById('total-revenue-value');
        if (totalEl) totalEl.innerText = money(total);

        const breakdown = document.getElementById('revenue-breakdown');
        if (breakdown) {
            breakdown.textContent = STATUSES
                .map(s => `${s}: ${money(earnings.filter(e => e.status === s).reduce((sum, e) => sum + e.amount, 0))}`)
                .join('  ·  ');
        }
    }

    function renderCharts() {
        // Last 6 months, oldest first
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: monthKey(d),
                label: d.toLocaleDateString('en-US', { month: 'short' }),
                value: 0
            });
        }
        earnings.forEach(e => {
            const m = months.find(x => x.key === e.date.slice(0, 7));
            if (m) m.value += e.amount;
        });
        barChart(document.getElementById('revenue-month-chart'), months, {
            format: moneyShort,
            emptyMessage: 'Log some revenue to see monthly totals.',
            ariaLabel: 'Revenue per month, last 6 months'
        });

        donutChart(
            document.getElementById('revenue-status-chart'),
            STATUSES.map(s => ({
                label: s,
                value: earnings.filter(e => e.status === s).reduce((sum, e) => sum + e.amount, 0),
                cls: `seg-${s.toLowerCase()}`
            })),
            { format: money, centerLabel: 'Total', emptyMessage: 'No transactions logged yet.', ariaLabel: 'Revenue by status' }
        );
    }

    function render() {
        tableBody.innerHTML = '';
        renderTotals();
        renderCharts();

        if (earnings.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No transactions logged yet.</td></tr>`;
            return;
        }

        [...earnings]
            .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
            .forEach(earn => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(parseDay(earn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</td>
                    <td><strong>${escapeHtml(earn.client)}</strong></td>
                    <td>${money(earn.amount)}</td>
                    <td><span class="status-tag status-${escapeHtml(earn.status.toLowerCase())}">${escapeHtml(earn.status)}</span></td>
                    <td>
                        <button class="edit-earn-btn btn-icon" data-id="${escapeHtml(earn.id)}" aria-label="Edit">✏️</button>
                        <button class="delete-earn-btn btn-icon btn-danger" data-id="${escapeHtml(earn.id)}" aria-label="Delete">🗑️</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const client = clientInp.value.trim();
        const amount = parseFloat(amountInp.value);
        const status = statusInp.value;
        const date = dateInp?.value || dayKey();

        if (!client || !(amount > 0)) return;

        if (editId) {
            earnings = earnings.map(x => x.id === editId ? { ...x, client, amount, status, date } : x);
            editId = null;
            form.querySelector('button[type="submit"]').innerText = 'Log Revenue';
        } else {
            earnings.push({ id: Date.now().toString(), client, amount, status, date });
        }

        save();
        render();
        form.reset();
        setDefaultDate();
    });

    tableBody.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id]');
        if (!target) return;
        const id = target.dataset.id;

        if (target.classList.contains('edit-earn-btn')) {
            const earn = earnings.find(item => item.id === id);
            if (!earn) return;
            clientInp.value = earn.client;
            amountInp.value = earn.amount;
            statusInp.value = earn.status;
            if (dateInp) dateInp.value = earn.date;
            editId = id;
            form.querySelector('button[type="submit"]').innerText = 'Update Entry';
            clientInp.focus();
        }

        if (target.classList.contains('delete-earn-btn')) {
            if (!confirm('Delete this transaction?')) return;
            earnings = earnings.filter(item => item.id !== id);
            if (editId === id) {
                editId = null;
                form.reset();
                setDefaultDate();
                form.querySelector('button[type="submit"]').innerText = 'Log Revenue';
            }
            save();
            render();
        }
    });

    setDefaultDate();
    render();
}
