/**
 * Admin Panel Core Scripts
 * Integrated with BrewscapeData
 */

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-footer a');
    const mainContent = document.getElementById('target-page');
    const breadcrumb = document.querySelector('.breadcrumb');
    const userNameDisplay = document.getElementById('admin-user-display');

    // Auth Check
    const currentUser = BrewscapeData.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied. Admin privileges required.');
        window.location.href = '../user/index.html';
        return;
    }

    // Update Admin Info
    if (userNameDisplay) {
        userNameDisplay.innerHTML = `
            ${currentUser.name}
            <div class="role">${currentUser.role}</div>
        `;
    }

    // Page Loading Logic
    function loadPage(pagePath) {
        if (!mainContent) return;

        fetch(pagePath)
            .then(res => res.text())
            .then(html => {
                mainContent.innerHTML = html;

                // Update Breadcrumb
                const pageName = pagePath.split('/').pop().replace('.html', '');
                breadcrumb.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);

                // Initialize Page-Specific Logic
                if (pagePath.includes('dashboard.html')) initDashboardPage();
                else if (pagePath.includes('products.html')) initProductsPage();
                else if (pagePath.includes('categories.html')) initCategoriesPage();
                else if (pagePath.includes('orders.html')) initOrdersPage();
                else if (pagePath.includes('users.html')) initUsersPage();
                else if (pagePath.includes('payments.html')) initPaymentsPage();
                else if (pagePath.includes('invoices.html')) initInvoicesPage();
                else if (pagePath.includes('report.html')) initReports();
            })
            .catch(err => console.error('Error loading page:', err));
    }

    // Navigation Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === 'javascript:void(0)' || href.startsWith('#')) {
                e.preventDefault();
            }

            // Handle Logout
            if (this.id === 'logout-btn' || this.innerHTML.includes('Logout')) {
                BrewscapeData.logout();
                window.location.href = '../index.html';
                return;
            }

            // Handle Back to Shop
            if (this.innerHTML.includes('Back to Shop')) {
                return; // Let default link work
            }

            // Normal Navigation
            if (href.includes('.html') && !href.startsWith('..')) {
                e.preventDefault();
                document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
                this.parentElement.classList.add('active');
                loadPage(href);
                localStorage.setItem('bs_admin_current_page', href);
            }
        });
    });

    // Load Initial Page
    const savedPage = localStorage.getItem('bs_admin_current_page') || 'page/dashboard.html';
    loadPage(savedPage);

    // Set active link on load
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === savedPage) {
            link.parentElement.classList.add('active');
        }
    });
});

// Handle global overlay clicks to close modals
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modalId = e.target.id;
        toggleModal(modalId);
    }
});

// Global Modal Toggle Helper
function toggleModal(modalId = 'modalOverlay') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('active');
    }
}
