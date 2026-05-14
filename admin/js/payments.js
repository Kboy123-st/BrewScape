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
                <td>
                    <select class="form-select form-select-sm d-inline-block w-auto" onchange="updatePaymentStatus('${pay.id}', this.value)">
                        <option value="Pending" ${pay.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Paid" ${pay.status === "Paid" ? "selected" : ""}>Paid</option>
                        <option value="Refunded" ${pay.status === "Refunded" ? "selected" : ""}>Refunded</option>
                        <option value="Failed" ${pay.status === "Failed" ? "selected" : ""}>Failed</option>
                    </select>
                </td>
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

function updatePaymentStatus(paymentId, newStatus) {
    let payments = BrewscapeData.getData("payments");
    const index = payments.findIndex(p => p.id === paymentId);
    if (index > -1) {
        payments[index].status = newStatus;
        BrewscapeData.saveData("payments", payments);

        // Optionally, you might want to update the associated order status here
        // if a payment status change should trigger an order status change.

        alert(`Payment ${paymentId} updated to ${newStatus}`);
        initPaymentsPage(); // Re-render the table to reflect changes
    }
}

window.updatePaymentStatus = updatePaymentStatus;
