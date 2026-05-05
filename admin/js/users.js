/**
 * Admin Users Page Logic
 */

function initUsersPage() {
    const users = BrewscapeData.getData('users');
    const tableBody = document.getElementById('user-table-body');
    const searchInput = document.getElementById('userSearch');
    const userForm = document.getElementById('userForm');

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
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td><span class="status-badge ${user.role === 'admin' ? 'status-confirmed' : 'status-preparing'}">${user.role.toUpperCase()}</span></td>
                <td><span class="status-badge ${user.status.toLowerCase()}">${user.status}</span></td>
                <td class="actions">
                    <i class="fa fa-edit action-edit" onclick="editUser('${user.id}')"></i>
                    <i class="fa fa-trash action-delete" onclick="deleteUser('${user.id}')"></i>
                </td>
            </tr>
        `).join('');
        
        const countEl = document.getElementById('user-count');
        if (countEl) countEl.innerText = `${list.length} users total`;
    }

    renderUsers();

    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
            renderUsers(filtered);
        };
    }

    if (userForm) {
        userForm.onsubmit = function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const newUser = {
                id: id || 'U' + Date.now().toString().slice(-4),
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                phone: document.getElementById('user-phone').value,
                role: document.getElementById('user-role').value,
                status: 'Active',
                joined: new Date().toISOString().split('T')[0]
            };

            let usersList = BrewscapeData.getData('users');
            if (id) {
                const index = usersList.findIndex(u => u.id === id);
                usersList[index] = { ...usersList[index], ...newUser };
            } else {
                usersList.push(newUser);
            }

            BrewscapeData.saveData('users', usersList);
            toggleModal();
            initUsersPage();
        };
    }
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
