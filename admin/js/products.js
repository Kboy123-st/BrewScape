/**
 * Admin Products Page Logic
 */

function initProductsPage() {
    const products = BrewscapeData.getData('products');
    const categories = BrewscapeData.getData('categories');
    const tableBody = document.getElementById('product-table-body');
    const categorySelect = document.getElementById('category');
    const productForm = document.getElementById('productForm');

    // Render Category Options
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select Category</option>' +
            categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    function renderProducts(list = products) {
        if (!tableBody) return;
        tableBody.innerHTML = list.map(p => {
            const cat = categories.find(c => c.id == p.categoryId);
            return `
                <tr>
                    <td>
                        <div class="product-cell d-flex align-items-center gap-2">
                            <img src="${p.image}" class="product-img" width="40" height="40" style="border-radius: 4px; object-fit: cover;">
                            <div>
                                <strong>${p.name}</strong><br>
                                ${p.featured ? '<span class="badge bg-warning text-dark" style="font-size: 10px;">Featured</span>' : ''}
                            </div>
                        </div>
                    </td>
                    <td>${cat ? cat.name : 'Unknown'}</td>
                    <td><strong>$${Number(p.price).toFixed(2)}</strong></td>
                    <td>${p.stock}</td>
                    <td><span class="status-badge ${p.status.toLowerCase()}">${p.status}</span></td>
                    <td class="actions">
                        <i class="fa fa-edit action-edit" onclick="editProduct(${p.id})"></i>
                        <i class="fa fa-trash action-delete" onclick="deleteProduct(${p.id})"></i>
                    </td>
                </tr>
            `;
        }).join('');

        const countEl = document.getElementById('product-count');
        if (countEl) countEl.innerText = `${list.length} products total`;
    }

    renderProducts();

    // Search Logic
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(term));
            renderProducts(filtered);
        };
    }

    // Form Submit
    if (productForm) {
        productForm.onsubmit = function (e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const newProduct = {
                id: id ? parseInt(id) : Date.now(),
                name: document.getElementById('name').value,
                categoryId: parseInt(document.getElementById('category').value),
                price: parseFloat(document.getElementById('price').value),
                stock: parseInt(document.getElementById('stock').value),
                description: document.getElementById('description').value,
                image: document.getElementById('image-url-input')?.value || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
                status: 'Active',
                featured: document.getElementById('featured-toggle')?.checked || false
            };

            let productsList = BrewscapeData.getData('products');
            if (id) {
                const index = productsList.findIndex(p => p.id == id);
                productsList[index] = newProduct;
            } else {
                productsList.push(newProduct);
            }

            BrewscapeData.saveData('products', productsList);
            toggleModal();
            initProductsPage();
        };
    }
}

function editProduct(id) {
    const products = BrewscapeData.getData('products');
    const p = products.find(p => p.id == id);
    if (!p) return;

    document.getElementById('edit-id').value = p.id;
    document.getElementById('name').value = p.name;
    document.getElementById('category').value = p.categoryId;
    document.getElementById('price').value = p.price;
    document.getElementById('stock').value = p.stock;
    document.getElementById('description').value = p.description;

    const urlInput = document.getElementById('image-url-input');
    if (urlInput) urlInput.value = p.image;

    const featToggle = document.getElementById('featured-toggle');
    if (featToggle) featToggle.checked = p.featured;

    document.getElementById('modalTitle').innerText = "Edit Product";
    document.getElementById('submitBtn').innerText = "Update Product";
    toggleModal();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = BrewscapeData.getData('products');
        products = products.filter(p => p.id != id);
        BrewscapeData.saveData('products', products);
        initProductsPage();
    }
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
