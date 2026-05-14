document.addEventListener('DOMContentLoaded', function () {
    // Initialize Data
    const categories = BrewscapeData.getData('categories');
    const products = BrewscapeData.getData('products');
    const currentUser = BrewscapeData.getCurrentUser();

    // UI Elements
    const categoriesContainer = document.getElementById('categories-container');
    const popularProductsContainer = document.getElementById('popular-products-container');
    const footerCategories = document.getElementById('footer-categories');
    const userNameDisplay = document.getElementById('user-name-display');
    const userEmailDisplay = document.getElementById('user-email-display');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const adminLinkContainer = document.getElementById('admin-link-container');
    const logoutBtn = document.getElementById('logout-btn');
    const cartCount = document.getElementById('cart-count');

    // Path adjustment for sub-pages (ensures connectivity from index.html vs page/ folder)
    const isSubPage = window.location.pathname.includes('/page/');
    const isInUserFolder = window.location.pathname.includes('/user/');

    const menuLinkBase = isSubPage ? 'menu.html' : (isInUserFolder ? 'page/menu.html' : 'user/page/menu.html');
    const adminLinkBase = isSubPage ? '../../admin/index.html' : (isInUserFolder ? '../admin/index.html' : 'admin/index.html');
    const loginLinkBase = isSubPage ? './login.html' : (isInUserFolder ? 'page/login.html' : 'user/page/login.html');
    const homeLinkBase = isSubPage ? '../../index.html' : (isInUserFolder ? '../index.html' : 'index.html');

    // Load Categories
    if (categoriesContainer) {
        categoriesContainer.innerHTML = categories.map(cat => `
            <div class="col-md-4">
                <div class="category-card" onclick="window.location.href='${menuLinkBase}?category=${cat.id}'">
                    <img src="${cat.image}" alt="${cat.name}">
                    <div class="category-overlay">
                        <h3>${cat.name}</h3>
                        <p>${cat.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Load Popular Products (Featured)
    if (popularProductsContainer) {
        const featuredProducts = products.filter(p => p.featured).slice(0, 4);
        const favorites = currentUser ? BrewscapeData.getData('favorites') : [];

        popularProductsContainer.innerHTML = featuredProducts.map(p => {
            const cat = categories.find(c => c.id === p.categoryId);
            const isFav = currentUser && favorites.some(f => f.userId === currentUser.id && f.productId === p.id);

            return `
                <div class="col-lg-3 col-md-6">
                    <div class="product-card">
                        <div class="product-img-wrapper">
                            ${p.featured ? '<span class="badge-featured">Featured</span>' : ''}
                            <img src="${p.image}" alt="${p.name}">
                        </div>
                        <div class="product-content">
                            <div class="product-category">${cat ? cat.name : 'Coffee'}</div>
                            <h3 class="product-title">${p.name}</h3>
                            <div class="stars mb-3 text-warning">
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                                <i class="fa-solid fa-star"></i>
                            </div>
                            <div class="product-footer">
                                <div class="product-price">$${p.price.toFixed(2)}</div>
                                <div class="d-flex gap-2">
                                    <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(this, ${p.id})">
                                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                                    </button>
                                    <button class="btn btn-primary-gold btn-sm" onclick="addToCart(${p.id})">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Load Footer Categories
    if (footerCategories) {
        footerCategories.innerHTML = categories.map(cat => `
            <li><a href="${menuLinkBase}?category=${cat.id}">${cat.name}</a></li>
        `).join('');
    }

    // Auth & User Info
    if (userNameDisplay) userNameDisplay.textContent = currentUser ? currentUser.name : 'Guest';

    if (userEmailDisplay) {
        if (currentUser) {
            userEmailDisplay.textContent = currentUser.email;
        } else {
            userEmailDisplay.innerHTML = `<a href="${loginLinkBase}" class="text-primary text-decoration-none">Sign in to order</a>`;
        }
    }

    if (currentUser) {
        if (currentUser.role === 'admin' && adminLinkContainer) {
            adminLinkContainer.innerHTML = `<a href="${adminLinkBase}"><i class="fa-solid fa-user-shield me-2"></i> Admin Panel</a>`;
        }
        updateCartCount();
    } else {
        // Hide protected links for guests to prevent "kick back" redirects
        const protectedLinks = document.querySelectorAll('.dropdown-content a:not([href*="index.html"]):not(#logout-btn)');
        protectedLinks.forEach(link => {
            link.style.opacity = '0.5';
            link.onclick = (e) => { e.preventDefault(); alert('Please login to access this feature.'); };
        });
    }

    // Toggle Profile Dropdown
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn && userDropdownMenu) {
        userMenuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function () {
            userDropdownMenu.classList.remove('active');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            BrewscapeData.logout();
            window.location.href = homeLinkBase;
        });
    }
});

function updateCartCount() {
    const currentUser = BrewscapeData.getCurrentUser();
    const cartCount = document.getElementById('cart-count');
    if (currentUser && cartCount) {
        const carts = BrewscapeData.getData('carts');
        const userCart = carts.find(c => c.userId === currentUser.id);
        const count = userCart ? userCart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        cartCount.textContent = count;
    }
}

function addToCart(productId) {
    const currentUser = BrewscapeData.getCurrentUser();
    if (!currentUser) {
        window.location.href = loginLinkBase; // Redirect to login page
        return;
    }

    let carts = BrewscapeData.getData('carts');
    let userCart = carts.find(c => c.userId === currentUser.id);

    if (!userCart) {
        userCart = { userId: currentUser.id, items: [] };
        carts.push(userCart);
    }

    const itemIndex = userCart.items.findIndex(i => i.productId === productId);
    if (itemIndex > -1) {
        userCart.items[itemIndex].quantity += 1;
    } else {
        userCart.items.push({ productId: productId, quantity: 1 });
    }

    BrewscapeData.saveData('carts', carts);
    updateCartCount();
}

function toggleFavorite(btn, productId) {
    const currentUser = BrewscapeData.getCurrentUser();
    if (!currentUser) {
        window.location.href = loginLinkBase; // Redirect to login page
        return;
    }

    let favorites = BrewscapeData.getData('favorites');
    const index = favorites.findIndex(f => f.userId === currentUser.id && f.productId === productId);
    const icon = btn.querySelector('i');

    if (index > -1) {
        favorites.splice(index, 1);
        if (icon) icon.className = 'fa-regular fa-heart';
        btn.classList.remove('active');
    } else {
        favorites.push({ userId: currentUser.id, productId: productId });
        if (icon) icon.className = 'fa-solid fa-heart';
        btn.classList.add('active');
    }

    BrewscapeData.saveData('favorites', favorites);
}
