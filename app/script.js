const API_URL = 'http://localhost:3000/api';

// --- Auth Modal Elements ---
const navLoginButton = document.getElementById('navLoginButton');
const navLogoutButton = document.getElementById('navLogoutButton');
const authModal = document.getElementById('authModal');
const closeButton = document.querySelector('.auth-modal .close-button');
const authForm = document.getElementById('authForm');
const authUsernameInput = document.getElementById('authUsername');
const authPasswordInput = document.getElementById('authPassword');
const loginButton = document.getElementById('loginButton'); // Button inside modal
const registerButton = document.getElementById('registerButton'); // Button inside modal
const authMessage = document.getElementById('authMessage');
const loggedInUserSpan = document.getElementById('loggedInUser');

// --- Post Elements ---
const heroPostSection = document.getElementById('heroPost');
const postsGrid = document.getElementById('postsGrid');

let token = localStorage.getItem('blog_token');
let currentUsername = localStorage.getItem('blog_username');
let currentUserId = localStorage.getItem('blog_user_id');

// --- Helper Functions ---
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
        loggedInUserSpan.textContent = `Hello, ${currentUsername}!`;
        loggedInUserSpan.style.display = 'inline';
        navLogoutButton.style.display = 'inline-block';
        navLoginButton.style.display = 'none'; // Hide login button
        authModal.style.display = 'none'; // Hide modal if logged in
    } else {
        loggedInUserSpan.textContent = '';
        loggedInUserSpan.style.display = 'none';
        navLogoutButton.style.display = 'none';
        navLoginButton.style.display = 'inline-block'; // Show login button
    }
    // Refresh posts to potentially update action buttons (though not present in this design)
    fetchPosts();
}

// --- Auth Modal & Buttons ---
navLoginButton.addEventListener('click', () => {
    authModal.style.display = 'flex'; // Show modal
});

closeButton.addEventListener('click', () => {
    authModal.style.display = 'none'; // Hide modal
});

window.addEventListener('click', (event) => {
    if (event.target == authModal) {
        authModal.style.display = 'none'; // Hide modal if click outside
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Login logic is handled by the button clicks
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

navLogoutButton.addEventListener('click', () => {
    token = null;
    currentUsername = null;
    currentUserId = null;
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_username');
    localStorage.removeItem('blog_user_id');
    displayMessage(authMessage, 'Anda telah logout.', 'success'); // This message might not be seen if modal is closed immediately
    updateAuthUI();
});

// --- Post Rendering ---
async function fetchPosts() {
    postsGrid.innerHTML = '<p>Memuat postingan...</p>';
    heroPostSection.innerHTML = ''; // Clear hero section initially
    heroPostSection.style.backgroundImage = 'none'; // Remove background image

    try {
        const response = await fetch(`${API_URL}/posts`);
        const posts = await response.json();

        if (posts.length === 0) {
            postsGrid.innerHTML = '<p>Belum ada postingan.</p>';
            return;
        }

        // Separate the first post for the hero section
        const heroPost = posts[0];
        const otherPosts = posts.slice(1);

        // Render Hero Post
        if (heroPost) {
            const date = new Date(heroPost.created_at);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
            const imageUrl = `https://picsum.photos/seed/${heroPost.id}/1200/450`; // Dynamic image for hero

            heroPostSection.style.backgroundImage = `url('${imageUrl}')`;
            heroPostSection.innerHTML = `
                <div class="hero-content">
                    <div class="hero-tags">
                        <span class="hero-tag">MUSIC</span>
                        <span class="hero-tag">FAMOSE</span>
                    </div>
                    <div class="hero-date">${formattedDate}</div>
                    <h2 class="hero-title">${heroPost.title}</h2>
                    <p class="hero-description">${heroPost.content.substring(0, 200)}...</p>
                    <div class="hero-meta">
                        <span><i class="fas fa-comment"></i> 896</span>
                        <span><i class="fas fa-heart"></i> 5648</span>
                    </div>
                </div>
            `;
        }

        // Render Other Posts in Grid
        postsGrid.innerHTML = ''; // Clear previous posts
        otherPosts.forEach(post => {
            const date = new Date(post.created_at);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
            const imageUrl = `https://picsum.photos/seed/${post.id + 100}/400/200`; // Dynamic image for grid cards

            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <img src="${imageUrl}" alt="${post.title}" class="post-card-image">
                <div class="post-card-content">
                    <div class="post-card-date">${formattedDate}</div>
                    <h3 class="post-card-title">${post.title}</h3>
                    <p class="post-card-description">${post.content.substring(0, 100)}...</p>
                    <div class="post-card-category">
                        ${post.author_username ? post.author_username.toUpperCase() : 'UNKNOWN'}
                    </div>
                </div>
            `;
            postsGrid.appendChild(postCard);
        });

    } catch (error) {
        console.error('Error fetching posts:', error);
        postsGrid.innerHTML = '<p class="message error">Gagal memuat postingan. Pastikan API backend berjalan.</p>';
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    fetchPosts();
});