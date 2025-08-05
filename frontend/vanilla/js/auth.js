// Authentication utilities
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    getUser() {
        return this.user;
    }

    getToken() {
        return this.token;
    }

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Mock API calls
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock authentication logic
                const users = [
                    { id: 1, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' },
                    { id: 2, email: 'user@example.com', password: 'user123', name: 'Regular User', role: 'user' }
                ];

                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const { password: _, ...userWithoutPassword } = user;
                    const token = 'mock-jwt-token-' + Date.now();
                    
                    resolve({
                        success: true,
                        token: token,
                        user: userWithoutPassword
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
            }, 1000);
        });
    }

    async register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Mock registration logic
                if (!userData.email || !userData.password || !userData.name) {
                    reject({
                        success: false,
                        message: 'All fields are required'
                    });
                    return;
                }

                // Check if email already exists (mock check)
                const existingEmails = ['admin@example.com', 'user@example.com'];
                if (existingEmails.includes(userData.email)) {
                    reject({
                        success: false,
                        message: 'Email already exists'
                    });
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    email: userData.email,
                    name: userData.name,
                    role: 'user'
                };

                resolve({
                    success: true,
                    message: 'Registration successful',
                    user: newUser
                });
            }, 1000);
        });
    }

    // Validate token (mock implementation)
    async validateToken() {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.token && this.token.startsWith('mock-jwt-token')) {
                    resolve({ valid: true, user: this.user });
                } else {
                    resolve({ valid: false });
                }
            }, 500);
        });
    }

    // Refresh token (mock implementation)
    async refreshToken() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.token) {
                    const newToken = 'mock-jwt-token-' + Date.now();
                    this.token = newToken;
                    localStorage.setItem('token', newToken);
                    resolve({ token: newToken });
                } else {
                    reject({ message: 'No token to refresh' });
                }
            }, 500);
        });
    }
}

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        // At least 6 characters
        return password && password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validatePrice(price) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice > 0;
    }

    static showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            // Remove existing error
            this.clearFieldError(fieldId);
            
            // Add error styling
            field.classList.add('error');
            
            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.id = fieldId + '-error';
            
            field.parentNode.appendChild(errorDiv);
        }
    }

    static clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const existingError = document.getElementById(fieldId + '-error');
        
        if (field) {
            field.classList.remove('error');
        }
        
        if (existingError) {
            existingError.remove();
        }
    }

    static clearAllErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const errorElements = form.querySelectorAll('.field-error');
            errorElements.forEach(error => error.remove());
            
            const errorFields = form.querySelectorAll('.error');
            errorFields.forEach(field => field.classList.remove('error'));
        }
    }
}

// Password utilities
class PasswordUtils {
    static generateStrengthMessage(password) {
        if (!password) return { strength: 'none', message: 'Enter a password' };
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        score = Object.values(checks).filter(Boolean).length;
        
        if (score < 2) return { strength: 'weak', message: 'Weak password' };
        if (score < 4) return { strength: 'medium', message: 'Medium strength' };
        return { strength: 'strong', message: 'Strong password' };
    }

    static showPasswordStrength(password, targetId) {
        const { strength, message } = this.generateStrengthMessage(password);
        const target = document.getElementById(targetId);
        
        if (target) {
            target.textContent = message;
            target.className = `password-strength ${strength}`;
        }
    }
}

// Session management
class SessionManager {
    static startSession() {
        // Set session timeout (mock implementation)
        this.sessionTimeout = setTimeout(() => {
            this.expireSession();
        }, 30 * 60 * 1000); // 30 minutes
    }

    static expireSession() {
        if (window.app) {
            window.app.showToast('Session expired. Please login again.', 'warning');
            window.app.logout();
        }
    }

    static refreshSession() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.startSession();
        }
    }

    static endSession() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AuthManager,
        FormValidator,
        PasswordUtils,
        SessionManager
    };
}
