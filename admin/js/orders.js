/**
 * Admin Orders Page Logic
 */

function initOrdersPage() {
    const orders = BrewscapeData.getData("orders");
    const users = BrewscapeData.getData("users");
    const tableBody = document.getElementById("order-table-body");
    const statusFilter = document.getElementById("statusFilter");
    const searchInput = document.getElementById("orderSearch");

    function renderOrders(list = orders) {
        if (!tableBody) return;
        tableBody.innerHTML = list.map(order => {
            const user = users.find(u => u.id === order.userId);
            return `
                <tr>
                    <td><strong>${order.id}</strong><br><small class="text-muted">${order.date}</small></td>
                    <td>${user ? user.name : "Unknown"}<br><small>${user ? user.email : ""}</small></td>
                    <td>${order.itemsCount} items</td>
                    <td><strong>$${Number(order.total).toFixed(2)}</strong></td>
                    <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="btn-icon" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i></button>
                        <select class="form-select form-select-sm d-inline-block w-auto ms-2" onchange="updateOrderStatus('${order.id}', this.value)">
                            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                            <option value="Preparing" ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
                            <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                            <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
    }

    renderOrders();

    // Filter Logic
    if (statusFilter) {
        statusFilter.onchange = (e) => {
            const val = e.target.value;
            const filtered = val === "All" ? orders : orders.filter(o => o.status === val);
            renderOrders(filtered);
        };
    }

    // Search Logic
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = orders.filter(o => o.id.toLowerCase().includes(term));
            renderOrders(filtered);
        };
    }
}

function updateOrderStatus(orderId, newStatus) {
    let orders = BrewscapeData.getData("orders");
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        orders[index].status = newStatus;
        BrewscapeData.saveData("orders", orders);

        // Update payment status if completed
        if (newStatus === "Completed") {
            let payments = BrewscapeData.getData("payments");
            const pIndex = payments.findIndex(p => p.orderId === orderId);
            if (pIndex > -1) {
                payments[pIndex].status = "Paid";
                BrewscapeData.saveData("payments", payments);
            }
        }

        alert(`Order ${orderId} updated to ${newStatus}`);
        initOrdersPage();
    }
}

function viewOrderDetails(orderId) {
    const orders = BrewscapeData.getData("orders");
    const users = BrewscapeData.getData("users");
    const payments = BrewscapeData.getData("payments");

    const order = orders.find(o => o.id === orderId);
    const user = users.find(u => u.id === order.userId);
    const payment = payments.find(p => p.orderId === orderId);

    if (!order) return;

    // Get or create modal overlay
    let modal = document.getElementById('modalOverlay');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalOverlay';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="order-modal">
            <div class="d-flex justify-content-between align-items-center order-modal-header">
                <h4 class="mb-0 fw-bold"><i class="fas fa-file-invoice me-2 text-warning"></i> Order Overview: #${order.id}</h4>
                <button class="btn-close btn-close-white" style="background:none; border:none; color:white; font-size: 20px;" onclick="toggleModal()"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="p-4">
                <div class="row mb-4 g-3">
                    <div class="col-md-6">
                        <div class="order-detail-card">
                            <h6><i class="fas fa-shopping-bag me-1"></i> Order Info</h6>
                            <div class="d-flex justify-content-between mb-2"><span>Date:</span> <span class="fw-bold">${order.date}</span></div>
                            <div class="d-flex justify-content-between mb-2"><span>Items:</span> <span class="fw-bold">${order.itemsCount} Products</span></div>
                            <div class="d-flex justify-content-between"><span>Status:</span> <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="order-detail-card">
                            <h6><i class="fas fa-user-circle me-1"></i> Customer Details</h6>
                            <div class="fw-bold mb-1">${user ? user.name : 'Guest User'}</div>
                            <div class="small text-muted mb-1"><i class="fas fa-envelope fa-fw"></i> ${user ? user.email : 'N/A'}</div>
                            <div class="small text-muted"><i class="fas fa-phone fa-fw"></i> ${user ? user.phone : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="row mb-4 g-3">
                    <div class="col-md-7">
                        <div class="order-detail-card">
                            <h6><i class="fas fa-map-marked-alt me-1"></i> Shipping Address</h6>
                            <div class="text-dark small" style="line-height: 1.6;">${order.address}</div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="order-detail-card">
                            <h6><i class="fas fa-credit-card me-1"></i> Payment</h6>
                            <div class="d-flex justify-content-between mb-2"><span>Method:</span> <span class="fw-bold">${payment ? payment.method : 'Cash'}</span></div>
                            <div class="d-flex justify-content-between"><span>Status:</span> <span class="badge ${payment && payment.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}">${payment ? payment.status : 'Pending'}</span></div>
                        </div>
                    </div>
                </div>

                <div class="total-banner mb-4">
                    <h5 class="mb-0 fw-bold text-uppercase" style="letter-spacing: 1px;">Amount Due</h5>
                    <h2 class="mb-0 fw-bold">$${Number(order.total).toFixed(2)}</h2>
                </div>

                <button class="btn btn-admin-close w-100 py-3 fw-bold shadow-sm" onclick="toggleModal()">
                    <i class="fas fa-check-circle me-2"></i> Dismiss View
                </button>
            </div>
        </div>
    `;

    toggleModal();
}

window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
