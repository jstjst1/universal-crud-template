// Main Application Logic
class CRUDApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.users = [];
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuth();
        
        // Load initial data
        this.loadProducts();
        this.loadUsers();
        
        // Set default page
        this.showPage('home');
    }

    checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.updateNavigation(true);
        }
    }

    updateNavigation(isLoggedIn) {
        const loginLink = document.getElementById('loginLink');
        const logoutLink = document.getElementById('logoutLink');
        
        if (isLoggedIn) {
            loginLink.style.display = 'none';
            logoutLink.style.display = 'block';
        } else {
            loginLink.style.display = 'block';
            logoutLink.style.display = 'none';
        }
    }

    showPage(pageId) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        
        // Show selected page
        const targetPage = document.getElementById(pageId + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Load page-specific data
            switch(pageId) {
                case 'products':
                    this.renderProducts();
                    break;
                case 'users':
                    if (this.currentUser && this.currentUser.role === 'admin') {
                        this.renderUsers();
                    } else {
                        this.showToast('Access denied. Admin only.', 'error');
                        this.showPage('home');
                    }
                    break;
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            container.removeChild(toast);
        }, 3000);
    }

    showLoading(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    loadProducts() {
        // Sample products data
        this.products = [
            {
                id: 1,
                name: 'MacBook Pro',
                description: 'High-performance laptop for professionals',
                price: 1999.99,
                category: 'electronics'
            },
            {
                id: 2,
                name: 'Cotton T-Shirt',
                description: 'Comfortable cotton t-shirt',
                price: 29.99,
                category: 'clothing'
            },
            {
                id: 3,
                name: 'JavaScript Guide',
                description: 'Complete guide to JavaScript programming',
                price: 39.99,
                category: 'books'
            }
        ];
    }

    loadUsers() {
        // Sample users data
        this.users = [
            {
                id: 1,
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin'
            },
            {
                id: 2,
                name: 'Regular User',
                email: 'user@example.com',
                role: 'user'
            }
        ];
    }

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            grid.innerHTML = '<p>No products found.</p>';
            return;
        }

        grid.innerHTML = this.products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="app.editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger" onclick="app.deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    renderUsers() {
        const container = document.getElementById('usersTable');
        
        if (this.users.length === 0) {
            container.innerHTML = '<p>No users found.</p>';
            return;
        }

        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="btn btn-primary" onclick="app.editUser(${user.id})">Edit</button>
                                <button class="btn btn-danger" onclick="app.deleteUser(${user.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            // Pre-fill form with product data
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            this.showPage('addProduct');
        }
    }

    deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== id);
            this.renderProducts();
            this.showToast('Product deleted successfully!', 'success');
        }
    }

    editUser(id) {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.showToast('Edit user functionality would be implemented here', 'info');
        }
    }

    deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== id);
            this.renderUsers();
            this.showToast('User deleted successfully!', 'success');
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.updateNavigation(false);
        this.showPage('home');
        this.showToast('Logged out successfully!', 'success');
    }
}

// Global functions for HTML event handlers
function showPage(pageId) {
    app.showPage(pageId);
}

function logout() {
    app.logout();
}

function toggleMenu() {
    const menu = document.getElementById('navMenu');
    menu.classList.toggle('active');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = app.products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter
        );
    }
    
    // Temporarily update products for rendering
    const originalProducts = app.products;
    app.products = filteredProducts;
    app.renderProducts();
    app.products = originalProducts;
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CRUDApp();
});

// Handle form submissions
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    app.showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // Mock authentication
        if ((email === 'admin@example.com' && password === 'admin123') ||
            (email === 'user@example.com' && password === 'user123')) {
            
            const user = {
                id: email === 'admin@example.com' ? 1 : 2,
                name: email === 'admin@example.com' ? 'Admin User' : 'Regular User',
                email: email,
                role: email === 'admin@example.com' ? 'admin' : 'user'
            };
            
            // Save to localStorage
            localStorage.setItem('token', 'mock-jwt-token');
            localStorage.setItem('user', JSON.stringify(user));
            
            app.currentUser = user;
            app.updateNavigation(true);
            app.showPage('home');
            app.showToast('Login successful!', 'success');
        } else {
            app.showToast('Invalid credentials!', 'error');
        }
        
        app.showLoading(false);
    }, 1000);
}

function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    app.showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // Mock registration
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            role: 'user'
        };
        
        app.users.push(newUser);
        app.showToast('Registration successful! Please login.', 'success');
        app.showPage('login');
        app.showLoading(false);
    }, 1000);
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    
    app.showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        const newProduct = {
            id: Date.now(),
            name: name,
            description: description,
            price: price,
            category: category
        };
        
        app.products.push(newProduct);
        app.showToast('Product added successfully!', 'success');
        app.showPage('products');
        
        // Reset form
        document.getElementById('addProductForm').reset();
        app.showLoading(false);
    }, 1000);
}
