/**
 * Admin Payments Page Logic
 */

function initPaymentsPage() {
    const payments = BrewscapeData.getData('payments');
    const tableBody = document.getElementById('payment-table-body');

    function renderPayments(list = payments) {
        if (!tableBody) return;
        tableBody.innerHTML = list.slice().reverse().map(pay => `
            <tr>
                <td><strong>${pay.id}</strong></td>
                <td>${pay.orderId}</td>
                <td><strong>$${Number(pay.amount).toFixed(2)}</strong></td>
                <td>${pay.method}</td>
                <td><span class="status-badge ${pay.status.toLowerCase()}">${pay.status}</span></td>
                <td>${pay.date}</td>
            </tr>
        `).join('');
        
        const countEl = document.getElementById('payment-count');
        if (countEl) countEl.innerText = `${list.length} payments total`;
    }

    renderPayments();

    const searchInput = document.getElementById('paymentSearch');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = payments.filter(p => p.id.toLowerCase().includes(term) || p.orderId.toLowerCase().includes(term));
            renderPayments(filtered);
        };
    }
}
