// API utilities for communicating with backend
class APIClient {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.authManager = new AuthManager();
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        const token = this.authManager.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Authentication endpoints
    async login(email, password) {
        return this.post('/auth/login', { email, password });
    }

    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async logout() {
        return this.post('/auth/logout', {});
    }

    // User endpoints
    async getUsers() {
        return this.get('/users');
    }

    async getUser(id) {
        return this.get(`/users/${id}`);
    }

    async createUser(userData) {
        return this.post('/users', userData);
    }

    async updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    // Product endpoints
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        return this.get(endpoint);
    }

    async getProduct(id) {
        return this.get(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.post('/products', productData);
    }

    async updateProduct(id, productData) {
        return this.put(`/products/${id}`, productData);
    }

    async deleteProduct(id) {
        return this.delete(`/products/${id}`);
    }

    // Category endpoints
    async getCategories() {
        return this.get('/categories');
    }

    async getCategory(id) {
        return this.get(`/categories/${id}`);
    }

    async createCategory(categoryData) {
        return this.post('/categories', categoryData);
    }

    async updateCategory(id, categoryData) {
        return this.put(`/categories/${id}`, categoryData);
    }

    async deleteCategory(id) {
        return this.delete(`/categories/${id}`);
    }
}

// Mock API for offline/demo mode
class MockAPIClient {
    constructor() {
        this.authManager = new AuthManager();
        this.initializeMockData();
    }

    initializeMockData() {
        // Mock users
        this.users = [
            { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString() },
            { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user', created_at: new Date().toISOString() }
        ];

        // Mock products
        this.products = [
            {
                id: 1,
                name: 'MacBook Pro',
                description: 'High-performance laptop for professionals',
                price: 1999.99,
                category: 'electronics',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Cotton T-Shirt',
                description: 'Comfortable cotton t-shirt',
                price: 29.99,
                category: 'clothing',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'JavaScript Guide',
                description: 'Complete guide to JavaScript programming',
                price: 39.99,
                category: 'books',
                created_at: new Date().toISOString()
            }
        ];

        // Mock categories
        this.categories = [
            { id: 1, name: 'Electronics', description: 'Electronic devices and gadgets' },
            { id: 2, name: 'Clothing', description: 'Apparel and fashion items' },
            { id: 3, name: 'Books', description: 'Books and educational materials' }
        ];
    }

    // Simulate network delay
    delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Authentication
    async login(email, password) {
        await this.delay();
        
        const validCredentials = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'user@example.com', password: 'user123' }
        ];

        const credential = validCredentials.find(c => c.email === email && c.password === password);
        
        if (credential) {
            const user = this.users.find(u => u.email === email);
            return {
                success: true,
                token: `mock-token-${Date.now()}`,
                user: user
            };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    async register(userData) {
        await this.delay();
        
        // Check if email already exists
        if (this.users.find(u => u.email === userData.email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            role: 'user',
            created_at: new Date().toISOString()
        };

        this.users.push(newUser);
        
        return {
            success: true,
            message: 'Registration successful',
            user: newUser
        };
    }

    async logout() {
        await this.delay(200);
        return { success: true, message: 'Logged out successfully' };
    }

    // Users
    async getUsers() {
        await this.delay();
        return { users: this.users };
    }

    async getUser(id) {
        await this.delay();
        const user = this.users.find(u => u.id == id);
        if (!user) throw new Error('User not found');
        return { user };
    }

    async createUser(userData) {
        await this.delay();
        const newUser = {
            id: Date.now(),
            ...userData,
            created_at: new Date().toISOString()
        };
        this.users.push(newUser);
        return { user: newUser };
    }

    async updateUser(id, userData) {
        await this.delay();
        const index = this.users.findIndex(u => u.id == id);
        if (index === -1) throw new Error('User not found');
        
        this.users[index] = { ...this.users[index], ...userData, updated_at: new Date().toISOString() };
        return { user: this.users[index] };
    }

    async deleteUser(id) {
        await this.delay();
        const index = this.users.findIndex(u => u.id == id);
        if (index === -1) throw new Error('User not found');
        
        this.users.splice(index, 1);
        return { success: true, message: 'User deleted successfully' };
    }

    // Products
    async getProducts(params = {}) {
        await this.delay();
        let products = [...this.products];

        // Apply filters
        if (params.search) {
            const search = params.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(search) || 
                p.description.toLowerCase().includes(search)
            );
        }

        if (params.category) {
            products = products.filter(p => p.category === params.category);
        }

        // Apply pagination
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const offset = (page - 1) * limit;
        
        const paginatedProducts = products.slice(offset, offset + limit);

        return {
            products: paginatedProducts,
            total: products.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(products.length / limit)
        };
    }

    async getProduct(id) {
        await this.delay();
        const product = this.products.find(p => p.id == id);
        if (!product) throw new Error('Product not found');
        return { product };
    }

    async createProduct(productData) {
        await this.delay();
        const newProduct = {
            id: Date.now(),
            ...productData,
            created_at: new Date().toISOString()
        };
        this.products.push(newProduct);
        return { product: newProduct };
    }

    async updateProduct(id, productData) {
        await this.delay();
        const index = this.products.findIndex(p => p.id == id);
        if (index === -1) throw new Error('Product not found');
        
        this.products[index] = { ...this.products[index], ...productData, updated_at: new Date().toISOString() };
        return { product: this.products[index] };
    }

    async deleteProduct(id) {
        await this.delay();
        const index = this.products.findIndex(p => p.id == id);
        if (index === -1) throw new Error('Product not found');
        
        this.products.splice(index, 1);
        return { success: true, message: 'Product deleted successfully' };
    }

    // Categories
    async getCategories() {
        await this.delay();
        return { categories: this.categories };
    }

    async getCategory(id) {
        await this.delay();
        const category = this.categories.find(c => c.id == id);
        if (!category) throw new Error('Category not found');
        return { category };
    }

    async createCategory(categoryData) {
        await this.delay();
        const newCategory = {
            id: Date.now(),
            ...categoryData,
            created_at: new Date().toISOString()
        };
        this.categories.push(newCategory);
        return { category: newCategory };
    }

    async updateCategory(id, categoryData) {
        await this.delay();
        const index = this.categories.findIndex(c => c.id == id);
        if (index === -1) throw new Error('Category not found');
        
        this.categories[index] = { ...this.categories[index], ...categoryData, updated_at: new Date().toISOString() };
        return { category: this.categories[index] };
    }

    async deleteCategory(id) {
        await this.delay();
        const index = this.categories.findIndex(c => c.id == id);
        if (index === -1) throw new Error('Category not found');
        
        this.categories.splice(index, 1);
        return { success: true, message: 'Category deleted successfully' };
    }
}

// Configuration for API client
const API_CONFIG = {
    // Set to true to use mock API (for demo/offline mode)
    USE_MOCK_API: true,
    
    // Backend URLs for different environments
    BACKEND_URLS: {
        node: 'http://localhost:3000/api',
        java: 'http://localhost:8080/api',
        python: 'http://localhost:5000/api',
        php: 'http://localhost:8000/api'
    },
    
    // Current backend (change this based on which backend you're using)
    CURRENT_BACKEND: 'node'
};

// Create API client instance
const api = API_CONFIG.USE_MOCK_API 
    ? new MockAPIClient() 
    : new APIClient(API_CONFIG.BACKEND_URLS[API_CONFIG.CURRENT_BACKEND]);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APIClient,
        MockAPIClient,
        API_CONFIG,
        api
    };
}
