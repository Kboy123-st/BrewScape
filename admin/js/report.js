// report.js

function initReports() {
   const orders = BrewscapeData.getData('orders') || [];
   const users = BrewscapeData.getData('users') || [];
   const payments = BrewscapeData.getData('payments') || [];

   const startInput = document.getElementById('reportStart');
   const endInput = document.getElementById('reportEnd');

   function updateAllReports() {
      const start = startInput ? startInput.value : '';
      const end = endInput ? endInput.value : '';

      const filteredOrders = orders.filter(o => {
         const d = new Date(o.date);
         // Using T00:00:00 / T23:59:59 to ensure full day coverage regardless of time strings
         return (!start || d >= new Date(start + 'T00:00:00')) &&
            (!end || d <= new Date(end + 'T23:59:59'));
      });

      renderSalesReport(filteredOrders, users);
      renderCustomerReport(filteredOrders, users);
      renderInvoiceReport(filteredOrders, users, payments);
   }

   if (startInput) startInput.onchange = updateAllReports;
   if (endInput) endInput.onchange = updateAllReports;

   updateAllReports();
}



// =====================================
// TAB SYSTEM
// =====================================

function showTab(event, tabId) {

   const sections =
      document.querySelectorAll('.report-section');

   sections.forEach(section => {
      section.classList.remove('active');
   });

   document.getElementById(tabId)
      .classList.add('active');


   const buttons =
      document.querySelectorAll('.tab-btn');

   buttons.forEach(button => {
      button.classList.remove('active');
   });

   event.target.classList.add('active');
}



// =====================================
// SALES REPORT
// =====================================

function renderSalesReport(orders, users) {
   const salesTableBody = document.getElementById('salesTableBody');
   if (!salesTableBody) return;

   salesTableBody.innerHTML = '';
   let totalRevenue = 0;

   orders.forEach(order => {
      const user = users.find(u => u.id === order.userId);
      const customerName = user ? user.name : (order.customerName || 'Guest');
      const invoiceId = 'INV-' + order.id.toString().replace('ORD-', '').padStart(4, '0');
      totalRevenue += Number(order.total || 0);

      const row = `
           <tr>
               <td><strong>${invoiceId}</strong></td>
               <td>${customerName}</td>
               <td>${order.date}</td>
               <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
               <td>$${Number(order.total).toFixed(2)}</td>
           </tr>
       `;
      salesTableBody.innerHTML += row;
   });

   document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
}

// =====================================
// CUSTOMER REPORT
// =====================================

function renderCustomerReport(orders, users) {
   const customerTableBody = document.getElementById('customerTableBody');
   if (!customerTableBody) return;

   customerTableBody.innerHTML = '';
   const customerStats = {};

   orders.forEach(order => {
      const uid = order.userId || 'guest';
      if (!customerStats[uid]) {
         customerStats[uid] = { count: 0, total: 0 };
      }
      customerStats[uid].count++;
      customerStats[uid].total += Number(order.total || 0);
   });

   users.forEach(user => {
      if (user.role === 'user') {
         const stats = customerStats[user.id] || { count: 0, total: 0 };
         const row = `
               <tr>
                   <td>${user.name}</td>
                   <td>${user.email}</td>
                   <td>${stats.count}</td>
                   <td>$${stats.total.toFixed(2)}</td>
               </tr>
           `;
         customerTableBody.innerHTML += row;
      }
   });
}

// =====================================
// INVOICE REPORT
// =====================================

function renderInvoiceReport(orders, users, payments) {
   const invoiceTableBody = document.getElementById('invoiceReportTableBody');
   if (!invoiceTableBody) return;

   invoiceTableBody.innerHTML = '';
   let totalInvoiced = 0;

   orders.forEach(order => {
      const user = users.find(u => u.id === order.userId);
      const payment = payments.find(p => p.orderId === order.id);
      const invoiceId = 'INV-' + order.id.toString().replace('ORD-', '').padStart(4, '0');
      totalInvoiced += Number(order.total || 0);

      const row = `
         <tr>
            <td><strong>${invoiceId}</strong></td>
            <td>${order.date}</td>
            <td>${user ? user.name : 'Guest'}</td>
            <td>${payment ? payment.method : 'N/A'}</td>
            <td><span class="status-badge status-${(payment ? payment.status : 'pending').toLowerCase()}">${payment ? payment.status : 'Pending'}</span></td>
            <td>$${Number(order.total).toFixed(2)}</td>
            <td style="text-align: right;">
               <button class="btn-create" style="padding: 6px 12px; font-size: 12px; border-radius: 4px; background: #3b82f6;" onclick="printInvoice('${order.id}')">
                  <i class="fas fa-print me-1"></i> Print
               </button>
            </td>
         </tr>
      `;
      invoiceTableBody.innerHTML += row;
   });

   document.getElementById('totalInvoiced').textContent = totalInvoiced.toFixed(2);
}

window.initReports = initReports;

// Initialize everything
document.addEventListener('DOMContentLoaded', initReports);
// Ensure it runs if loaded via SPA navigation
if (window.location.hash.includes('report')) initReports();