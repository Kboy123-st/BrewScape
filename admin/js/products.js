/**
* Admin Products Page Logic
*/

// Global variable to store the image data (Base64)
let currentImageBase64 = '';

// Global function to reset image preview and form fields related to image
function resetImagePreview() {
    const imagePreview = document.getElementById('image-preview');
    const dropZone = document.getElementById('drop-zone');
    const imageFileInput = document.getElementById('image-file');

    if (imagePreview && dropZone && imageFileInput) {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        dropZone.classList.remove('has-image');
        imageFileInput.value = ''; // Clear selected file
    }
    currentImageBase64 = ''; // Clear stored Base64 data
}

function initProductsPage() {
    const products = BrewscapeData.getData('products');
    const categories = BrewscapeData.getData('categories');
    const tableBody = document.getElementById('product-table-body');
    const categorySelect = document.getElementById('category');
    const productForm = document.getElementById('productForm');
    if (!tableBody && !productForm) return;

    const dropZone = document.getElementById('drop-zone');
    const imageFileInput = document.getElementById('image-file');
    const imagePreview = document.getElementById('image-preview');

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

    // Image upload/drag-and-drop logic
    if (dropZone && imageFileInput && imagePreview) {
        // Handle file selection
        imageFileInput.onchange = function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    dropZone.classList.add('has-image');
                    currentImageBase64 = e.target.result; // Store Base64
                };
                reader.readAsDataURL(file);
            } else {
                resetImagePreview();
            }
        };

        // Handle drop zone click
        dropZone.onclick = () => {
            imageFileInput.click();
        };

        // Handle drag and drop events
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        };

        dropZone.ondragleave = (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        };

        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                imageFileInput.files = files; // Assign dropped files to input
                imageFileInput.dispatchEvent(new Event('change')); // Trigger change event
            }
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
                image: currentImageBase64 || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', // Use stored Base64 or default
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
            if (window.initProductsPage) window.initProductsPage(); // Re-render product list
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

    // Display existing image in preview
    const imagePreview = document.getElementById('image-preview');
    const dropZone = document.getElementById('drop-zone');
    if (p.image && imagePreview && dropZone) {
        imagePreview.src = p.image;
        imagePreview.style.display = 'block';
        dropZone.classList.add('has-image');
        currentImageBase64 = p.image; // Set currentImageBase64 for editing
    } else {
        resetImagePreview(); // Clear if no image or elements not found
    }

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
        if (window.initProductsPage) window.initProductsPage();
    }
}

// Modal control functions (defined here to ensure proper reset behavior)
function toggleModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.classList.toggle('active');
        if (!modalOverlay.classList.contains('active')) {
            // Modal is closing, reset form and image preview
            document.getElementById('productForm').reset();
            document.getElementById('edit-id').value = ''; // Clear hidden ID
            document.getElementById('modalTitle').innerText = "Add Product"; // Reset title
            document.getElementById('submitBtn').innerText = "Save Product"; // Reset button text
            resetImagePreview();
        }
    }
}

function openAddModal() {
    document.getElementById('productForm').reset();
    document.getElementById('edit-id').value = ''; // Ensure no ID is set for new product
    document.getElementById('modalTitle').innerText = "Add Product";
    document.getElementById('submitBtn').innerText = "Save Product";
    resetImagePreview(); // Clear any previous image
    toggleModal(); // Open the modal
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.toggleModal = toggleModal; // Expose to global scope as it's called from HTML
window.openAddModal = openAddModal; // Expose to global scope as it's called from HTML
window.initProductsPage = initProductsPage;

// Initialize the page logic if the product table is present in the DOM
if (document.getElementById('product-table-body')) {
    initProductsPage();
}
