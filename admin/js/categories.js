/**
 * Admin Categories Page Logic
 */

// Global variable to store the image data (Base64)
let currentCategoryImageBase64 = '';

// Global function to reset image preview and form fields related to image
function resetCategoryImagePreview() {
    const preview = document.getElementById('category-image-preview');
    const dropZone = document.getElementById('category-drop-zone');
    const fileInput = document.getElementById('category-image-file');

    if (preview && dropZone) {
        preview.src = '';
        preview.style.display = 'none';
        dropZone.querySelectorAll('i, p').forEach(el => el.style.display = 'block');
    }
    if (fileInput) fileInput.value = '';
    currentCategoryImageBase64 = '';
}

// Helper to update the preview in the drop zone for categories
function updateCategoryImagePreview(src) {
    const preview = document.getElementById('category-image-preview');
    const dropZone = document.getElementById('category-drop-zone');
    if (!preview || !dropZone) return;

    if (src && src.trim() !== '') {
        preview.src = src;
        preview.style.display = 'block';
        dropZone.querySelectorAll('i, p').forEach(el => el.style.display = 'none');
        currentCategoryImageBase64 = src;
    } else {
        resetCategoryImagePreview();
    }
}

// Reset modal for adding a new category
function openAddCategoryModal() {
    const form = document.getElementById('categoryForm');
    if (form) form.reset();

    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';

    document.getElementById('modalTitle').innerText = "Add Category";
    document.getElementById('submitBtn').innerText = "Save Category";

    resetCategoryImagePreview();
    if (typeof toggleModal === 'function') toggleModal('modalOverlay'); // Open the modal using the global toggle
}
window.openAddCategoryModal = openAddCategoryModal;

function initCategoriesPage() {
    const categories = BrewscapeData.getData('categories');
    const tableBody = document.getElementById('category-table-body');
    const categoryForm = document.getElementById('categoryForm');
    if (!tableBody && !categoryForm) return;

    function renderCategories(list = categories) {
        if (!tableBody) return;
        tableBody.innerHTML = list.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${cat.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;">
                        <strong>${cat.name}</strong>
                    </div>
                </td>
                <td>${cat.description}</td>
                <td class="actions">
                    <i class="fa fa-edit action-edit" onclick="editCategory(${cat.id})"></i>
                    <i class="fa fa-trash action-delete" onclick="deleteCategory(${cat.id})"></i>
                </td>
            </tr>
        `).join('');

        const countEl = document.getElementById('category-count');
        if (countEl) countEl.innerText = `${list.length} categories total`;
    }

    renderCategories();

    // Search Logic
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = categories.filter(c => c.name.toLowerCase().includes(term));
            renderCategories(filtered);
        };
    }

    // Image Upload Logic (Drag and Drop) for Categories
    const categoryDropZone = document.getElementById('category-drop-zone');
    const categoryImageFile = document.getElementById('category-image-file');

    if (categoryDropZone && categoryImageFile) {
        categoryDropZone.onclick = () => categoryImageFile.click();

        categoryImageFile.onchange = () => {
            const file = categoryImageFile.files[0];
            if (file) handleCategoryImageFile(file);
        };

        categoryDropZone.ondragover = (e) => {
            e.preventDefault();
            categoryDropZone.classList.add('drag-over');
        };

        categoryDropZone.ondragleave = () => categoryDropZone.classList.remove('drag-over');
        categoryDropZone.ondragend = () => categoryDropZone.classList.remove('drag-over');
    };

    categoryDropZone.ondrop = (e) => {
        e.preventDefault();
        categoryDropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) handleCategoryImageFile(e.dataTransfer.files[0]);
    };

    function handleCategoryImageFile(file) {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            updateCategoryImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    if (categoryForm) {
        categoryForm.onsubmit = function (e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const newCat = {
                id: id ? parseInt(id) : Date.now(),
                name: document.getElementById('category-name').value,
                description: document.getElementById('category-desc').value,
                image: currentCategoryImageBase64 || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
            };

            let catList = BrewscapeData.getData('categories');
            if (id) {
                const index = catList.findIndex(c => c.id == id);
                catList[index] = newCat;
            } else {
                catList.push(newCat);
            }

            BrewscapeData.saveData('categories', catList);
            closeCategoryModal(); // Close and reset the modal
            if (window.initCategoriesPage) window.initCategoriesPage(); // Re-render categories
        };
    }
}

function editCategory(id) {
    const categories = BrewscapeData.getData('categories');
    const cat = categories.find(c => c.id == id);
    if (!cat) return;

    document.getElementById('edit-id').value = cat.id;
    document.getElementById('category-name').value = cat.name;
    document.getElementById('category-desc').value = cat.description;

    updateCategoryImagePreview(cat.image);

    document.getElementById('modalTitle').innerText = "Edit Category";
    document.getElementById('submitBtn').innerText = "Update Category";

    if (typeof toggleModal === 'function') toggleModal('modalOverlay'); // Open the modal using the global toggle
}

// Function to close the category modal and reset its state
function closeCategoryModal() {
    const form = document.getElementById('categoryForm');
    if (form) form.reset();
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    document.getElementById('modalTitle').innerText = "Add Category"; // Reset title
    document.getElementById('submitBtn').innerText = "Save Category"; // Reset button text
    resetCategoryImagePreview();
    if (typeof toggleModal === 'function') toggleModal('modalOverlay'); // Close the modal using the global toggle
}

function deleteCategory(id) {
    if (confirm('Delete this category? All associated products will be uncategorized.')) {
        let catList = BrewscapeData.getData('categories');
        catList = catList.filter(c => c.id != id);
        BrewscapeData.saveData('categories', catList);
        if (window.initCategoriesPage) window.initCategoriesPage();
    }
}

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.closeCategoryModal = closeCategoryModal; // Expose to global scope
window.initCategoriesPage = initCategoriesPage;

// Initialize the page logic if the category table is present
if (document.getElementById('category-table-body')) {
    initCategoriesPage();
}
