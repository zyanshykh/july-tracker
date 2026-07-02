import { storage } from './storage.js';

export function initAnalytics() {
    const form = document.getElementById('analytics-form');
    const tableBody = document.getElementById('earnings-table-body');
    
    // Inputs
    const clientInp = document.getElementById('earn-client');
    const amountInp = document.getElementById('earn-amount');
    const statusInp = document.getElementById('earn-status');

    if (!form || !tableBody) return;

    let earnings = storage.get('july_earnings') || [];
    let editId = null;

    // Render Earnings (Read)
    function renderEarnings() {
        tableBody.innerHTML = '';
        let totalRevenue = 0;

        if (earnings.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No transactions logged yet.</td></tr>`;
            updateTotalRevenueDisplay(0);
            return;
        }

        earnings.forEach(earn => {
            totalRevenue += parseFloat(earn.amount || 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${earn.client}</strong></td>
                <td>$${parseFloat(earn.amount).toFixed(2)}</td>
                <td><span class="status-tag status-${earn.status.toLowerCase()}">${earn.status}</span></td>
                <td>
                    <button class="edit-earn-btn btn-icon" data-id="${earn.id}">✏️</button>
                    <button class="delete-earn-btn btn-icon btn-danger" data-id="${earn.id}">🗑️</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        updateTotalRevenueDisplay(totalRevenue);
    }

    // Form Handling (Create & Update)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const client = clientInp.value.trim();
        const amount = amountInp.value.trim();
        const status = statusInp.value;

        if (!client || !amount) return;

        if (editId) {
            // Update
            earnings = earnings.map(e => e.id === editId ? { ...e, client, amount, status } : e);
            editId = null;
            form.querySelector('button[type="submit"]').innerText = 'Log Revenue';
        } else {
            // Create
            const newEarn = {
                id: Date.now().toString(),
                client,
                amount,
                status
            };
            earnings.push(newEarn);
        }

        storage.set('july_earnings', earnings);
        renderEarnings();
        form.reset();
    });

    // Table Interactions (Edit & Delete)
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        if (target.classList.contains('edit-earn-btn')) {
            const earn = earnings.find(item => item.id === id);
            if (earn) {
                clientInp.value = earn.client;
                amountInp.value = earn.amount;
                statusInp.value = earn.status;
                
                editId = id;
                form.querySelector('button[type="submit"]').innerText = 'Update Entry';
                clientInp.focus();
            }
        }

        if (target.classList.contains('delete-earn-btn')) {
            earnings = earnings.filter(item => item.id !== id);
            storage.set('july_earnings', earnings);
            renderEarnings();
        }
    });

    function updateTotalRevenueDisplay(total) {
        const revenueDisplay = document.getElementById('total-revenue-value');
        if (revenueDisplay) {
            revenueDisplay.innerText = `$${total.toFixed(2)}`;
        }
    }

    // Initial Load
    renderEarnings();
}