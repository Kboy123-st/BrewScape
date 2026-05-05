/**
 * Core Data Management for Brewscape
 * Handles LocalStorage initialization and shared data logic between User and Admin
 */

const BrewscapeData = {
    // Initial Seed Data (matching the design in screenshots)
    seedData: {
        categories: [
            { id: 1, name: "Coffee", description: "Handcrafted espresso drinks and brewed coffee", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" },
            { id: 2, name: "Cakes & Pastries", description: "Freshly baked treats and artisanal desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
            { id: 3, name: "Tea", description: "Premium loose-leaf teas and signature blends", image: "https://images.unsplash.com/photo-1511920170033-f8396924c348" }
        ],
        products: [
            { id: 101, categoryId: 3, name: "Matcha Green Tea", description: "Premium ceremonial grade matcha whisked with steamed milk.", price: 5.00, stock: 50, status: "Active", featured: true, image: "https://images.unsplash.com/photo-1511920170033-f8396924c348" },
            { id: 102, categoryId: 2, name: "Chocolate Cake", description: "Rich, moist chocolate cake with dark chocolate ganache.", price: 6.50, stock: 25, status: "Active", featured: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
            { id: 103, categoryId: 2, name: "Blueberry Muffin", description: "Freshly baked muffin bursting with organic blueberries.", price: 3.95, stock: 40, status: "Active", featured: false, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93" },
            { id: 104, categoryId: 3, name: "Chamomile Herbal Tea", description: "Soothing chamomile flowers for a relaxing experience.", price: 3.75, stock: 45, status: "Active", featured: false, image: "https://images.unsplash.com/photo-1544787210-2211d7c309c7" },
            { id: 105, categoryId: 3, name: "English Breakfast Tea", description: "A robust, full-bodied black tea blend.", price: 3.25, stock: 70, status: "Active", featured: false, image: "https://images.unsplash.com/photo-1594631252845-29fc458695d1" },
            { id: 106, categoryId: 2, name: "Tiramisu", description: "Classic Italian dessert with coffee-soaked ladyfingers.", price: 7.50, stock: 20, status: "Active", featured: false, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9" }
        ],
        users: [
            { id: "U1001", name: "Sovath San", email: "sansovath0@gmail.com", password: "admin", phone: "+855 (012) 123-4567", role: "admin", status: "Active", joined: "2026-04-02" },
            { id: "U1002", name: "Demo Customer", email: "customer@example.com", password: "user", phone: "+855 (011) 999-8888", role: "user", status: "Active", joined: "2026-04-02" }
        ],
        orders: [
            { id: "ORD-9926", userId: "U1001", date: "2026-04-28 22:33:09", total: 151.75, status: "Pending", itemsCount: 44, address: "123 Coffee Lane, Brew City" },
            { id: "ORD-4f65", userId: "U1001", date: "2026-04-28 11:33:00", total: 3.75, status: "Completed", itemsCount: 1, address: "123 Coffee Lane, Brew City" },
            { id: "ORD-f305", userId: "U1001", date: "2026-04-27 15:20:00", total: 19.35, status: "Pending", itemsCount: 2, address: "123 Coffee Lane, Brew City" },
            { id: "ORD-af09", userId: "U1002", date: "2026-04-02 09:30:00", total: 12.75, status: "Completed", itemsCount: 2, address: "456 Main St, Demo Town" },
            { id: "ORD-af0b", userId: "U1002", date: "2026-04-02 10:15:00", total: 15.00, status: "Completed", itemsCount: 1, address: "456 Main St, Demo Town" }
        ],
        favorites: [
            { userId: "U1001", productId: 101 },
            { userId: "U1001", productId: 102 },
            { userId: "U1001", productId: 106 }
        ],
        carts: [
            { userId: "U1001", items: [{ productId: 101, quantity: 2 }] }
        ],
        payments: [
            { id: "PAY-001", orderId: "ORD-9926", method: "Cash", status: "Pending", date: "2026-04-28 22:33:09", amount: 151.75 },
            { id: "PAY-002", orderId: "ORD-4f65", method: "Online", status: "Paid", date: "2026-04-28 11:33:00", amount: 3.75 },
            { id: "PAY-003", orderId: "ORD-f305", method: "Cash", status: "Pending", date: "2026-04-27 15:20:00", amount: 19.35 },
            { id: "PAY-004", orderId: "ORD-af09", method: "Card", status: "Paid", date: "2026-04-02 09:30:00", amount: 12.75 },
            { id: "PAY-005", orderId: "ORD-af0b", method: "Online", status: "Paid", date: "2026-04-02 10:15:00", amount: 15.00 }
        ]
    },

    init() {
        if (!localStorage.getItem('bs_initialized')) {
            this.saveData('categories', this.seedData.categories);
            this.saveData('products', this.seedData.products);
            this.saveData('users', this.seedData.users);
            this.saveData('orders', this.seedData.orders);
            this.saveData('favorites', this.seedData.favorites);
            this.saveData('carts', this.seedData.carts);
            this.saveData('payments', this.seedData.payments);
            localStorage.setItem('bs_initialized', 'true');
        }
    },

    getData(key) {
        return JSON.parse(localStorage.getItem('bs_' + key)) || [];
    },

    saveData(key, data) {
        localStorage.setItem('bs_' + key, JSON.stringify(data));
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('bs_current_user'));
    },

    setCurrentUser(user) {
        localStorage.setItem('bs_current_user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('bs_current_user');
    }
};

BrewscapeData.init();
