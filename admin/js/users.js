/**
 * Admin Users Page Logic
 */

function initUsersPage() {
    const users = BrewscapeData.getData('users');
    const tableBody = document.getElementById('user-table-body');
    const searchInput = document.getElementById('userSearch');
    const dateStartInput = document.getElementById('dateStart');
    const dateEndInput = document.getElementById('dateEnd');
    const userForm = document.getElementById('userForm');
    const currentUser = BrewscapeData.getCurrentUser();

    function renderUsers(list = users) {
        if (!tableBody) return;
        tableBody.innerHTML = list.map(user => `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div class="avatar-sm" style="width:32px; height:32px; background:#eee; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px;">${user.name.charAt(0)}</div>
                        <div>
                            <strong>${user.name}</strong><br>
                            <small class="text-muted">${user.id}</small>
                        </div>
                    </div>
                </td>
                <td>
                    ${user.email}
                    ${currentUser && user.id === currentUser.id ? '<span class="badge bg-info ms-2" style="font-size: 10px;">You</span>' : ''}
                </td>
                <td>${user.phone}</td>
                <td><span class="status-badge ${user.role === 'admin' ? 'status-confirmed' : 'status-preparing'}">${user.role.toUpperCase()}</span></td>
                <td><span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span></td>
                <td class="actions">
                    <i class="fa fa-edit action-edit" onclick="editUser('${user.id}')"></i>
                    <i class="fa fa-trash action-delete" onclick="deleteUser('${user.id}')"></i>
                </td>
            </tr>
        `).join('');

        const countEl = document.getElementById('user-count');
        if (countEl) countEl.innerText = `${list.length} users total`;
    }

    function applyFilters() {
        const term = searchInput ? searchInput.value.toLowerCase() : "";
        const start = dateStartInput ? dateStartInput.value : "";
        const end = dateEndInput ? dateEndInput.value : "";

        const filtered = users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
            const joinedDate = new Date(u.joined);
            const matchesDate = (!start || joinedDate >= new Date(start + 'T00:00:00')) &&
                (!end || joinedDate <= new Date(end + 'T23:59:59'));
            return matchesSearch && matchesDate;
        });
        renderUsers(filtered);
    }

    if (searchInput) searchInput.oninput = applyFilters;
    if (dateStartInput) dateStartInput.onchange = applyFilters;
    if (dateEndInput) dateEndInput.onchange = applyFilters;

    renderUsers();

    if (userForm) {
        userForm.onsubmit = function (e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const userData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                role: document.getElementById('user-role').value,
            };

            let usersList = BrewscapeData.getData('users');
            if (id) {
                const index = usersList.findIndex(u => u.id === id);
                // Update existing user while preserving fields like password and joined date
                usersList[index] = { ...usersList[index], ...userData };
            } else {
                // Create new user
                const newUser = {
                    id: 'U' + Date.now().toString().slice(-4),
                    status: 'Active',
                    joined: new Date().toISOString().split('T')[0],
                    ...userData
                };
                usersList.push(newUser);
            }

            BrewscapeData.saveData('users', usersList);
            closeUserModal();
            initUsersPage();
        };
    }
}

function openAddUserModal() {
    const form = document.getElementById('userForm');
    if (form) form.reset();
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';

    document.getElementById('modalTitle').innerText = "Add User";
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.innerText = "Save User";

    toggleModal();
}

function editUser(id) {
    const users = BrewscapeData.getData('users');
    const u = users.find(u => u.id === id);
    if (!u) return;

    document.getElementById('edit-id').value = u.id;
    document.getElementById('user-name').value = u.name;
    document.getElementById('user-email').value = u.email;
    document.getElementById('user-phone').value = u.phone;
    document.getElementById('user-role').value = u.role;

    document.getElementById('modalTitle').innerText = "Edit User";
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.innerText = "Update User";
    toggleModal();
}

function closeUserModal() {
    const form = document.getElementById('userForm');
    if (form) form.reset();
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    document.getElementById('modalTitle').innerText = "Add User";
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.innerText = "Save User";
    toggleModal();
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        let users = BrewscapeData.getData('users');
        users = users.filter(u => u.id !== id);
        BrewscapeData.saveData('users', users);
        initUsersPage();
    }
}

window.editUser = editUser;
window.deleteUser = deleteUser;
window.closeUserModal = closeUserModal;
window.openAddUserModal = openAddUserModal;
window.initUsersPage = initUsersPage;

// Initialize the page logic if the user table is present in the DOM
if (document.getElementById('user-table-body')) {
    initUsersPage();
}
