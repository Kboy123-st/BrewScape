/**
 * Admin Dashboard Page Logic
 */

function initDashboardPage() {
    const orders = BrewscapeData.getData('orders');
    const products = BrewscapeData.getData('products');
    const users = BrewscapeData.getData('users');
    const payments = BrewscapeData.getData('payments');

    // Update Stats
    const totalRevenue = payments
        .filter(p => p.status === 'Paid' || p.status === 'Completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const revEl = document.getElementById('stat-revenue');
    const ordEl = document.getElementById('stat-orders');
    const usrEl = document.getElementById('stat-users');
    const prdEl = document.getElementById('stat-products');

    if (revEl) revEl.textContent = `$${totalRevenue.toFixed(2)}`;
    if (ordEl) ordEl.textContent = orders.length;
    if (usrEl) usrEl.textContent = users.length;
    if (prdEl) prdEl.textContent = products.length;

    // Render Recent Orders
    const recentOrdersBody = document.getElementById('recent-orders-body');
    if (recentOrdersBody) {
        const recentOrders = orders.slice(-5).reverse();
        recentOrdersBody.innerHTML = recentOrders.map(order => {
            const user = users.find(u => u.id === order.userId);
            return `
                <tr>
                    <td>${order.id}</td>
                    <td>${user ? user.name : 'Unknown'}</td>
                    <td>$${Number(order.total).toFixed(2)}</td>
                    <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Initialize Charts
    initCharts(orders, payments);
}

function initCharts(orders, payments) {
    const ctxRevenue = document.getElementById('revenueChart');
    const ctxStatus = document.getElementById('statusChart');

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Skipping chart initialization.');
        return;
    }

    if (ctxRevenue) {
        new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue',
                    data: [120, 190, 300, 250, 400, 350, 500],
                    borderColor: '#f5a623',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(245, 166, 35, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (ctxStatus) {
        const completed = orders.filter(o => o.status === 'Completed').length;
        const pending = orders.filter(o => o.status === 'Pending').length;
        const cancelled = orders.filter(o => o.status === 'Cancelled').length;

        new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Cancelled'],
                datasets: [{
                    data: [completed, pending, cancelled],
                    backgroundColor: ['#10b981', '#f5a623', '#ef4444']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}
