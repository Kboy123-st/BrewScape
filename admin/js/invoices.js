/**
 * Admin Invoices Page Logic
 */

// Global variable to track the order currently displayed in the modal
let currentInvoiceOrderId = null;

function initInvoicesPage() {
   const orders = BrewscapeData.getData('orders') || [];
   const users = BrewscapeData.getData('users') || [];
   const tableBody = document.getElementById('invoice-table-body');
   const searchInput = document.getElementById('invoiceSearch');
   const dateStartInput = document.getElementById('dateStart');
   const dateEndInput = document.getElementById('dateEnd');

   function renderInvoices(list = orders) {
      if (!tableBody) return;

      tableBody.innerHTML = list.slice().reverse().map(order => {
         const user = users.find(u => u.id === order.userId);
         const invoiceId = 'INV-' + order.id.toString().replace('ORD-', '').padStart(4, '0');

         return `
            <tr>
               <td><strong>${invoiceId}</strong></td>

               <td>#${order.id}</td>

               <td>
                  <div class="cust-name">${user ? user.name : 'Guest'}</div>
                  <div class="cust-email">${user ? user.email : 'N/A'}</div>
               </td>

               <td>
                  <strong>$${Number(order.total || 0).toFixed(2)}</strong>
               </td>

               <td>${order.date || 'N/A'}</td>

               <td>
                  <span class="status-badge status-${(order.status || 'pending').toLowerCase()}">
                     ${order.status || 'Pending'}
                  </span>
               </td>

               <td class="actions">
                  <button 
                     class="btn-create"
                     style="
                        padding: 6px 12px;
                        font-size: 12px;
                        border-radius: 4px;
                        background: #3b82f6;
                     "
                     onclick="printInvoice('${order.id}')"
                  >
                     <i class="fas fa-print me-1"></i>
                     Print
                  </button>
               </td>
            </tr>
         `;
      }).join('');

      const countEl = document.getElementById('invoice-count');

      if (countEl) {
         countEl.innerText = `${list.length} invoices total`;
      }
   }

   function applyFilters() {
      const term = searchInput ? searchInput.value.toLowerCase() : '';
      const start = dateStartInput ? dateStartInput.value : '';
      const end = dateEndInput ? dateEndInput.value : '';

      const filtered = orders.filter(o => {

         const user = users.find(u => u.id === o.userId);

         const invoiceId =
            'INV-' +
            o.id.toString().replace('ORD-', '').padStart(4, '0');

         const matchesSearch =
            o.id.toString().toLowerCase().includes(term) ||
            invoiceId.toLowerCase().includes(term) ||
            (user && user.name.toLowerCase().includes(term));

         const orderDate = new Date(o.date);

         const matchesDate =
            (!start || orderDate >= new Date(start + 'T00:00:00')) &&
            (!end || orderDate <= new Date(end + 'T23:59:59'));

         return matchesSearch && matchesDate;
      });

      renderInvoices(filtered);
   }

   if (searchInput) searchInput.oninput = applyFilters;
   if (dateStartInput) dateStartInput.onchange = applyFilters;
   if (dateEndInput) dateEndInput.onchange = applyFilters;

   renderInvoices();
}

/**
 * Generate Invoice HTML
 */
function generateInvoiceHtml(orderId, orders, products, users, payments) {

   const order = orders.find(
      o => String(o.id) === String(orderId)
   );

   if (!order) return '';

   const invoiceNum =
      order.id.toString().replace('ORD-', '').padStart(4, '0');

   const user = users.find(u => u.id === order.userId);

   const payment = payments.find(
      p => p.orderId === order.id
   );

   let items = order.items || [];
   // Fallback for orders missing the items array (e.g. created via simple admin form)
   if (items.length === 0 && (order.itemsCount || 0) > 0) {
      items = [{
         productId: 'N/A',
         quantity: order.itemsCount,
         price: (order.total || 0) / order.itemsCount
      }];
   }

   const itemsHtml = items.map(item => {

      const prod = products.find(
         p => p.id == item.productId
      );

      const subtotal =
         (item.price || 0) * (item.quantity || 0);

      return `
         <tr>
            <td>
               <div style="font-weight:600;color:#333;">
                  ${prod ? prod.name : 'Product #' + item.productId}
               </div>
            </td>

            <td>$${Number(item.price || 0).toFixed(2)}</td>

            <td>${item.quantity}</td>

            <td style="text-align:right;font-weight:600;">
               $${subtotal.toFixed(2)}
            </td>
         </tr>
      `;
   }).join('');

   return `
      <div
         class="invoice-card"
         style="
            background:#fff;
            padding:40px;
            border:1px solid #eee;
            width:100%;
            box-sizing: border-box;
            color:#000;
            font-family:Arial,sans-serif;
         "
      >

         <div
            class="invoice-header"
            style="
               display:flex;
               justify-content:space-between;
               margin-bottom:30px;
            "
         >
            <div>
               <h1 style="margin:0;">BREWSCAPE</h1>

               <p
                  style="
                     margin:5px 0;
                     color:#777;
                     font-size:14px;
                  "
               >
                  123 Coffee Lane, Brew City<br>
                  contact@brewscape.com
               </p>
            </div>

            <div class="invoice-title" style="text-align:right;">
               <h2 style="margin:0;">Invoice</h2>

               <p style="margin:5px 0;">
                  #INV-${invoiceNum}
               </p>

               <div
                  style="
                     color:#777;
                     font-size:13px;
                  "
               >
                  Date: ${order.date}
               </div>
            </div>
         </div>

         <div
            class="invoice-grid"
            style="
               display:flex;
               justify-content:space-between;
               margin-bottom:30px;
            "
         >

            <div>
               <div
                  style="
                     font-size:13px;
                     color:#777;
                     margin-bottom:6px;
                  "
               >
                  Billed To
               </div>

               <p style="margin:0;font-size:16px;">
                  <strong>${user ? user.name : 'Guest'}</strong>
               </p>

               <p
                  style="
                     margin:2px 0;
                     font-size:14px;
                     color:#666;
                  "
               >
                  ${user ? user.email : 'No email provided'}
               </p>

               <p
                  style="
                     margin:10px 0;
                     font-size:14px;
                     color:#666;
                  "
               >
                  ${order.address || 'Standard Pickup'}
               </p>
            </div>

            <div style="text-align:right;">
               <div
                  style="
                     font-size:13px;
                     color:#777;
                     margin-bottom:6px;
                  "
               >
                  Payment Details
               </div>

               <p style="margin:0;font-size:14px;">
                  <strong>Method:</strong>
                  ${payment ? payment.method : 'N/A'}
               </p>

               <p
                  style="
                     margin:2px 0;
                     font-size:14px;
                     color:#666;
                  "
               >
                  Status:

                  <span
                     style="
                        color:${payment && payment.status === 'Paid'
         ? '#10b981'
         : '#f5a623'};
                        font-weight:600;
                     "
                  >
                     ${payment ? payment.status : 'Pending'}
                  </span>
               </p>

               <p
                  style="
                     margin:2px 0;
                     font-size:14px;
                     color:#666;
                  "
               >
                  Order Ref: #${order.id}
               </p>
            </div>
         </div>

         <table
            style="
               width:100%;
               border-collapse:collapse;
               margin-top:20px;
            "
         >
            <thead>
               <tr style="background:#f5f5f5;">
                  <th style="padding:12px;text-align:left;">
                     Item Description
                  </th>

                  <th style="padding:12px;text-align:left;">
                     Price
                  </th>

                  <th style="padding:12px;text-align:left;">
                     Qty
                  </th>

                  <th
                     style="
                        padding:12px;
                        text-align:right;
                     "
                  >
                     Total
                  </th>
               </tr>
            </thead>

            <tbody>
               ${itemsHtml}
            </tbody>
         </table>

         <div
            style="
               display:flex;
               justify-content:flex-end;
               margin-top:30px;
            "
         >
            <div style="width:300px;">

               <div
                  style="
                     display:flex;
                     justify-content:space-between;
                     margin-bottom:10px;
                  "
               >
                  <span>Subtotal</span>

                  <span>
                     $${Number(order.total || 0).toFixed(2)}
                  </span>
               </div>

               <div
                  style="
                     display:flex;
                     justify-content:space-between;
                     margin-bottom:10px;
                  "
               >
                  <span>Shipping</span>

                  <span>$0.00</span>
               </div>

               <div
                  style="
                     display:flex;
                     justify-content:space-between;
                     font-size:20px;
                     font-weight:bold;
                     border-top:2px solid #eee;
                     padding-top:15px;
                  "
               >
                  <span>Total Due</span>

                  <span>
                     $${Number(order.total || 0).toFixed(2)}
                  </span>
               </div>
            </div>
         </div>

         <div
            style="
               margin-top:40px;
               text-align:center;
               color:#777;
               font-size:13px;
            "
         >
            Thank you for your business!
         </div>
      </div>
   `;
}

function viewInvoice(orderId) {

   const orders = BrewscapeData.getData('orders') || [];
   const products = BrewscapeData.getData('products') || [];
   const users = BrewscapeData.getData('users') || [];
   const payments = BrewscapeData.getData('payments') || [];

   const invoiceContent =
      document.getElementById('invoiceContent');

   if (!invoiceContent) return;

   currentInvoiceOrderId = orderId;

   invoiceContent.innerHTML =
      generateInvoiceHtml(
         orderId,
         orders,
         products,
         users,
         payments
      );

   toggleModal('invoiceModalOverlay');
}

/**
 * FIXED PDF DOWNLOAD
 */
function downloadInvoicePDF(orderId) {

   if (typeof html2pdf === 'undefined') {
      alert('Error: html2pdf library not found. Please ensure the script is included in your HTML.');
      return;
   }

   const id = orderId || currentInvoiceOrderId;

   if (!id) return;

   const orders = BrewscapeData.getData('orders') || [];
   const products = BrewscapeData.getData('products') || [];
   const users = BrewscapeData.getData('users') || [];
   const payments = BrewscapeData.getData('payments') || [];

   const invoiceHtml =
      generateInvoiceHtml(
         id,
         orders,
         products,
         users,
         payments
      );

   if (!invoiceHtml) return;

   const targetElement = document.createElement('div');

   Object.assign(targetElement.style, {
      position: 'absolute',
      left: '-9999px',
      top: '0',
      width: '794px',
      background: '#fff',
      padding: '0'
   });

   targetElement.innerHTML = invoiceHtml;

   document.body.appendChild(targetElement);

   const filenameInvoiceNum =
      targetElement.querySelector('.invoice-title p')
         ?.innerText || 'Invoice';

   const filename =
      `${filenameInvoiceNum.replace('#', '').trim()}.pdf`;

   const options = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
         scale: 2,
         useCORS: true,
         letterRendering: true
      },
      jsPDF: {
         unit: 'mm',
         format: 'a4',
         orientation: 'portrait'
      }
   };

   html2pdf()
      .from(targetElement)
      .set(options)
      .save()
      .then(() => {
         document.body.removeChild(targetElement);
      })
      .catch(err => {
         console.error('PDF Generation Error:', err);
         if (targetElement.parentNode) document.body.removeChild(targetElement);
      });
}

/**
 * Open Browser Print Dialog
 */
function printInvoice(orderId) {
   const orders = BrewscapeData.getData('orders') || [];
   const products = BrewscapeData.getData('products') || [];
   const users = BrewscapeData.getData('users') || [];
   const payments = BrewscapeData.getData('payments') || [];

   const order = orders.find(o => String(o.id) === String(orderId));
   const invoiceId = order ? 'INV-' + order.id.toString().replace('ORD-', '').padStart(4, '0') : 'Invoice';

   const invoiceHtml = generateInvoiceHtml(orderId, orders, products, users, payments);
   if (!invoiceHtml) return;

   const printWindow = window.open('', '_blank', 'height=800,width=900');
   if (!printWindow) {
      alert('Please allow popups to print the invoice.');
      return;
   }

   printWindow.document.write('<!DOCTYPE html><html><head><title>' + invoiceId + '</title>');
   printWindow.document.write(`
      <style>
         body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; }
         .invoice-card { 
            width: 100%; 
            max-width: 800px; 
            margin: 0 auto; 
            border: none !important; 
            box-shadow: none !important;
         }
         @media print {
            @page { size: A4; margin: 10mm; }
            body { padding: 0; }
         }
      </style>
   `);
   printWindow.document.write('</head><body>');
   printWindow.document.write(invoiceHtml);
   printWindow.document.write('</body></html>');
   printWindow.document.close();

   // Small delay to ensure rendering and images are loaded
   setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
   }, 500);
}

window.initInvoicesPage = initInvoicesPage;
window.viewInvoice = viewInvoice;
window.downloadInvoicePDF = downloadInvoicePDF;
window.printInvoice = printInvoice;