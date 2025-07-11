const API_URL = 'http://localhost:3000/api'; // Ganti jika API Anda berjalan di port lain

const authForm = document.getElementById('authForm');
const authUsernameInput = document.getElementById('authUsername');
const authPasswordInput = document.getElementById('authPassword');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const authMessage = document.getElementById('authMessage');
const loggedInUserSpan = document.getElementById('loggedInUser');
const logoutButton = document.getElementById('logoutButton');

const createPostForm = document.getElementById('createPostForm');
const postTitleInput = document.getElementById('postTitle');
const postContentInput = document.getElementById('postContent');
const createPostMessage = document.getElementById('createPostMessage');

const postsList = document.getElementById('postsList');

let token = localStorage.getItem('blog_token');
let currentUsername = localStorage.getItem('blog_username');
let currentUserId = localStorage.getItem('blog_user_id');

// --- Fungsi Helper ---
function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 3000);
}

function updateAuthUI() {
    if (token && currentUsername && currentUserId) {
        loggedInUserSpan.textContent = `Logged in as: ${currentUsername}`;
        logoutButton.style.display = 'inline-block';
        authForm.style.display = 'none'; // Hide auth form when logged in
        createPostForm.style.display = 'flex'; // Show create post form
    } else {
        loggedInUserSpan.textContent = '';
        logoutButton.style.display = 'none';
        authForm.style.display = 'flex'; // Show auth form when logged out
        createPostForm.style.display = 'none'; // Hide create post form
    }
    fetchPosts(); // Refresh posts to update visibility of edit/delete buttons
}

// --- Autentikasi ---
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Logic for login is handled by loginButton click
});

loginButton.addEventListener('click', async () => {
    const username = authUsernameInput.value;
    const password = authPasswordInput.value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUsername = data.username;
            currentUserId = data.userId;
            localStorage.setItem('blog_token', token);
            localStorage.setItem('blog_username', currentUsername);
            localStorage.setItem('blog_user_id', currentUserId);
            displayMessage(authMessage, data.message, 'success');
            updateAuthUI();
        } else {
            displayMessage(authMessage, data.message || 'Login gagal.', 'error');
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayMessage(authMessage, 'Terjadi kesalahan jaringan.', 'error');
    }
});

registerButton.addEventListener('click', async () => {
    const username = authUsernameInput.value;
    const password = authPasswordInput.value;
    const email = `${username}@example.com`; // Simplified for frontend example

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUsername = data.username;
            currentUserId = data.userId;
            localStorage.setItem('blog_token', token);
            localStorage.setItem('blog_username', currentUsername);
            localStorage.setItem('blog_user_id', currentUserId);
            displayMessage(authMessage, data.message, 'success');
            updateAuthUI();
        } else {
            displayMessage(authMessage, data.message || 'Registrasi gagal.', 'error');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        displayMessage(authMessage, 'Terjadi kesalahan jaringan.', 'error');
    }
});

logoutButton.addEventListener('click', () => {
    token = null;
    currentUsername = null;
    currentUserId = null;
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_username');
    localStorage.removeItem('blog_user_id');
    displayMessage(authMessage, 'Anda telah logout.', 'success');
    updateAuthUI();
});

// --- Postingan ---
async function fetchPosts() {
    postsList.innerHTML = '<p>Memuat postingan...</p>';
    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();

        postsList.innerHTML = ''; // Clear previous posts
        if (posts.length === 0) {
            postsList.innerHTML = '<p>Belum ada postingan.</p>';
            return;
        }

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <div class="post-meta">
                    <span>Oleh: ${post.author_username || 'Anonim'}</span>
                    <span>${new Date(post.created_at).toLocaleDateString()}</span>
                    <div class="post-actions">
                        ${(currentUserId == post.author_id) ? `<button class="edit-btn" data-id="${post.id}">Edit</button>` : ''}
                        ${(currentUserId == post.author_id) ? `<button class="delete-btn" data-id="${post.id}">Delete</button>` : ''}
                    </div>
                </div>
            `;
            postsList.appendChild(postCard);
        });

        addPostActionListeners();
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsList.innerHTML = '<p class="message error">Gagal memuat postingan. Pastikan API backend berjalan.</p>';
    }
}

createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = postTitleInput.value;
    const content = postContentInput.value;

    if (!token) {
        displayMessage(createPostMessage, 'Silakan login untuk membuat postingan.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content }),
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(createPostMessage, data.message, 'success');
            postTitleInput.value = '';
            postContentInput.value = '';
            fetchPosts(); // Refresh posts
        } else {
            displayMessage(createPostMessage, data.message || 'Gagal membuat postingan.', 'error');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        displayMessage(createPostMessage, 'Terjadi kesalahan jaringan.', 'error');
    }
});

// --- Edit & Delete Post ---
async function handleEditPost(postId) {
    // Untuk demo sederhana, kita akan langsung meminta input baru
    const newTitle = prompt('Masukkan judul baru:');
    const newContent = prompt('Masukkan konten baru:');

    if (!newTitle || !newContent) {
        displayMessage(createPostMessage, 'Judul dan konten tidak boleh kosong.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: newTitle, content: newContent }),
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(createPostMessage, data.message, 'success');
            fetchPosts(); // Refresh posts
        } else {
            displayMessage(createPostMessage, data.message || 'Gagal memperbarui postingan.', 'error');
        }
    } catch (error) {
        console.error('Error updating post:', error);
        displayMessage(createPostMessage, 'Terjadi kesalahan jaringan.', 'error');
    }
}

async function handleDeletePost(postId) {
    if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
        const data = await response.json();

        if (response.ok) {
            displayMessage(createPostMessage, data.message, 'success');
            fetchPosts(); // Refresh posts
        } else {
            displayMessage(createPostMessage, data.message || 'Gagal menghapus postingan.', 'error');
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        displayMessage(createPostMessage, 'Terjadi kesalahan jaringan.', 'error');
    }
}

function addPostActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.removeEventListener('click', (e) => handleEditPost(e.target.dataset.id)); // Hapus listener lama jika ada
        button.addEventListener('click', (e) => handleEditPost(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', (e) => handleDeletePost(e.target.dataset.id)); // Hapus listener lama jika ada
        button.addEventListener('click', (e) => handleDeletePost(e.target.dataset.id));
    });
}

// Inisialisasi: Panggil fungsi-fungsi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI(); // Perbarui UI otentikasi saat halaman dimuat
    fetchPosts(); // Muat postingan saat halaman dimuat
});