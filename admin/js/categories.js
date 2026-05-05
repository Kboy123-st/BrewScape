/**
 * Admin Categories Page Logic
 */

// Helper to update the preview in the drop zone for categories
function updateCategoryImagePreview(src) {
    const preview = document.getElementById('category-image-preview');
    const dropZone = document.getElementById('category-drop-zone');
    if (!preview || !dropZone) return;

    if (src && src.trim() !== '') {
        preview.src = src;
        preview.style.display = 'block';
        dropZone.querySelectorAll('i, p').forEach(el => el.style.display = 'none');
    } else {
        preview.src = '';
        preview.style.display = 'none';
        dropZone.querySelectorAll('i, p').forEach(el => el.style.display = 'block');
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

    updateCategoryImagePreview('');
    if (typeof toggleModal === 'function') toggleModal();
}
window.openAddCategoryModal = openAddCategoryModal;

function initCategoriesPage() {
    const categories = BrewscapeData.getData('categories');
    const tableBody = document.getElementById('category-table-body');
    const categoryForm = document.getElementById('categoryForm');

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
    const categoryUrlInput = document.getElementById('category-image-url-input');

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

        ['dragleave', 'dragend'].forEach(type => {
            categoryDropZone.addEventListener(type, () => categoryDropZone.classList.remove('drag-over'));
        });

        categoryDropZone.ondrop = (e) => {
            e.preventDefault();
            categoryDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleCategoryImageFile(e.dataTransfer.files[0]);
        };

        function handleCategoryImageFile(file) {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                categoryUrlInput.value = e.target.result;
                updateCategoryImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
        if (categoryUrlInput) categoryUrlInput.oninput = (e) => updateCategoryImagePreview(e.target.value);
    }

    if (categoryForm) {
        categoryForm.onsubmit = function (e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const newCat = {
                id: id ? parseInt(id) : Date.now(),
                name: document.getElementById('category-name').value,
                description: document.getElementById('category-desc').value,
                image: document.getElementById('category-image-url-input')?.value || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
            };

            let catList = BrewscapeData.getData('categories');
            if (id) {
                const index = catList.findIndex(c => c.id == id);
                catList[index] = newCat;
            } else {
                catList.push(newCat);
            }

            BrewscapeData.saveData('categories', catList);
            toggleModal();
            initCategoriesPage();
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

    const urlInput = document.getElementById('category-image-url-input');
    if (urlInput) urlInput.value = cat.image;
    updateCategoryImagePreview(cat.image);

    document.getElementById('modalTitle').innerText = "Edit Category";
    toggleModal();
}

function deleteCategory(id) {
    if (confirm('Delete this category? All associated products will be uncategorized.')) {
        let catList = BrewscapeData.getData('categories');
        catList = catList.filter(c => c.id != id);
        BrewscapeData.saveData('categories', catList);
        initCategoriesPage();
    }
}

window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
