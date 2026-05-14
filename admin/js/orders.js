/**
 * Admin Orders Page Logic
 */

function initOrdersPage() {
    const orders = BrewscapeData.getData("orders");
    const users = BrewscapeData.getData("users");
    const tableBody = document.getElementById("order-table-body");
    const statusFilter = document.getElementById("statusFilter");
    const searchInput = document.getElementById("orderSearch");
    const addOrderForm = document.getElementById("addOrderForm");

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
                        <button class="btn-icon" onclick="viewOrderDetails('${order.id}')" title="Order Details"><i class="fas fa-eye"></i></button>
                
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

    // Add Order Logic
    if (addOrderForm) {
        addOrderForm.onsubmit = function (e) {
            e.preventDefault();
            const userId = document.getElementById('order-user').value;
            const productId = parseInt(document.getElementById('order-product').value);
            const qty = parseInt(document.getElementById('order-qty').value);
            const method = document.getElementById('order-payment').value;
            const address = document.getElementById('order-address').value;

            const products = BrewscapeData.getData('products');
            const product = products.find(p => p.id === productId);
            const total = product.price * qty;
            const orderId = "ORD-" + Math.random().toString(36).substr(2, 4).toUpperCase();
            const dateStr = new Date().toISOString().replace('T', ' ').split('.')[0];

            const newOrder = {
                id: orderId,
                userId: userId,
                date: dateStr,
                total: total,
                status: "Pending",
                itemsCount: qty,
                items: [{
                    productId: productId,
                    quantity: qty,
                    price: product.price
                }],
                address: address
            };

            const ordersList = BrewscapeData.getData('orders');
            ordersList.push(newOrder);
            BrewscapeData.saveData('orders', ordersList);

            const newPayment = {
                id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
                orderId: orderId,
                method: method,
                status: "Pending",
                date: dateStr,
                amount: total
            };
            const paymentsList = BrewscapeData.getData('payments');
            paymentsList.push(newPayment);
            BrewscapeData.saveData('payments', paymentsList);

            alert(`Order ${orderId} created successfully!`);
            closeAddOrderModal();
            initOrdersPage();
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

    const orderDetailsContent = document.getElementById('orderDetailsContent');
    const modalTitle = document.getElementById('modalTitle');
    if (!orderDetailsContent || !modalTitle) return; // Ensure elements exist

    modalTitle.innerText = `Order Details: #${order.id}`;
    orderDetailsContent.innerHTML = `
        <div class="order-modal-content-wrapper">
            <div class="d-flex justify-content-between align-items-center order-modal-sub-header">
                <h4 class="mb-0 fw-bold"><i class="fas fa-file-invoice me-2 text-warning"></i> Order Overview</h4>
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

    if (typeof toggleModal === 'function') toggleModal('modalOverlay');
}

function closeOrderDetailsModal() {
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    const modalTitle = document.getElementById('modalTitle');
    if (orderDetailsContent) orderDetailsContent.innerHTML = ''; // Clear content
    if (modalTitle) modalTitle.innerText = 'Order Details'; // Reset title
    if (typeof toggleModal === 'function') toggleModal('modalOverlay');
}

function openAddOrderModal() {
    const users = BrewscapeData.getData('users');
    const products = BrewscapeData.getData('products');

    const userSelect = document.getElementById('order-user');
    const productSelect = document.getElementById('order-product');

    if (userSelect) {
        userSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('');
    }

    if (productSelect) {
        productSelect.innerHTML = products.map(p => `<option value="${p.id}">${p.name} - $${p.price.toFixed(2)}</option>`).join('');
    }

    if (typeof toggleModal === 'function') toggleModal('addOrderModalOverlay');
}

function closeAddOrderModal() {
    if (typeof toggleModal === 'function') toggleModal('addOrderModalOverlay');
}

window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetailsModal = closeOrderDetailsModal;
window.openAddOrderModal = openAddOrderModal;
window.closeAddOrderModal = closeAddOrderModal;
window.initOrdersPage = initOrdersPage; // Ensure init is exposed for scripts.js
