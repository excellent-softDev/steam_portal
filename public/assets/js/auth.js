// Admin Authentication System
class AdminAuth {
    constructor() {
        this.initializeAuth();
    }

    initializeAuth() {
        // Set default admin credentials if not exists
        if (!localStorage.getItem('steam_lms_admin')) {
            const defaultAdmin = {
                email: 'admin@steamlms.com',
                password: this.hashPassword('admin123'),
                name: 'Administrator',
                role: 'admin',
                createdAt: new Date().toISOString(),
                lastLogin: null
            };
            localStorage.setItem('steam_lms_admin', JSON.stringify(defaultAdmin));
        }

        // Check if user is already logged in
        if (this.isLoggedIn()) {
            console.log('User already logged in, checking current page...');
            
            // If on login page and logged in, redirect to admin
            if (window.location.pathname.includes('admin-login')) {
                console.log('Redirecting to admin dashboard...');
                window.location.href = 'admin.html';
                return;
            }
        } else {
            console.log('User not logged in');
            
            // Protect admin pages
            if (!this.isLoggedIn() && window.location.pathname.includes('admin.html')) {
                console.log('Protecting admin page - redirecting to login');
                window.location.href = 'admin-login.html';
                return;
            }
        }
        
        this.setupEventListeners();
        console.log('=== AUTH INITIALIZATION COMPLETE ===');
    }

    setupEventListeners() {
        console.log('=== AUTH DEBUG: Setting up event listeners ===');
        
        const loginForm = document.getElementById('login-form');
        console.log('Login form found:', !!loginForm);
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('=== AUTH DEBUG: Form submitted ===');
                this.handleLogin();
            });
        } else {
            console.error('Login form not found!');
        }

        // Add enter key support for login
        const passwordInput = document.getElementById('password');
        console.log('Password input found:', !!passwordInput);
        
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('=== AUTH DEBUG: Enter key pressed ===');
                    this.handleLogin();
                }
            });
        }

        // Check if inputs are enabled and force enable them
        const emailInput = document.getElementById('email');
        if (emailInput) {
            console.log('Email input found:', !!emailInput);
            console.log('Email input disabled:', emailInput.disabled);
            console.log('Email input readonly:', emailInput.readOnly);
            
            // Force enable the input
            emailInput.disabled = false;
            emailInput.readOnly = false;
            emailInput.style.pointerEvents = 'auto';
            emailInput.style.userSelect = 'text';
            emailInput.style.webkitUserSelect = 'text';
            emailInput.style.mozUserSelect = 'text';
            emailInput.style.msUserSelect = 'text';
            emailInput.style.opacity = '1';
            emailInput.style.visibility = 'visible';
            emailInput.style.display = 'block';
            
            // Add click handler to ensure focus
            emailInput.addEventListener('click', () => {
                console.log('Email input clicked');
                emailInput.focus();
            });
        }
        
        if (passwordInput) {
            console.log('Password input disabled:', passwordInput.disabled);
            console.log('Password input readonly:', passwordInput.readOnly);
            
            // Force enable the input
            passwordInput.disabled = false;
            passwordInput.readOnly = false;
            passwordInput.style.pointerEvents = 'auto';
            passwordInput.style.userSelect = 'text';
            passwordInput.style.webkitUserSelect = 'text';
            passwordInput.style.mozUserSelect = 'text';
            passwordInput.style.msUserSelect = 'text';
            passwordInput.style.opacity = '1';
            passwordInput.style.visibility = 'visible';
            passwordInput.style.display = 'block';
            
            // Add click handler to ensure focus
            passwordInput.addEventListener('click', () => {
                console.log('Password input clicked');
                passwordInput.focus();
            });
        }
    }

    handleLogin() {
        console.log('=== AUTH DEBUG: Handling login ===');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        console.log('Login attempt:', { email, passwordLength: password.length, remember });
        
        // Validation
        if (!email || !password) {
            console.log('Validation failed: Missing email or password');
            this.showToast('Please enter both email and password', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            console.log('Validation failed: Invalid email format');
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Authenticate
        console.log('Attempting authentication...');
        const admin = this.getAdmin();
        console.log('Stored admin:', { email: admin.email, hasPassword: !!admin.password });
        
        if (admin.email === email && admin.password === this.hashPassword(password)) {
            console.log('Authentication successful!');
            
            // Update last login
            admin.lastLogin = new Date().toISOString();
            localStorage.setItem('steam_lms_admin', JSON.stringify(admin));

            // Create session
            const session = {
                email: admin.email,
                name: admin.name,
                role: admin.role,
                loginTime: new Date().toISOString(),
                expires: remember ? Date.now() + (7 * 24 * 60 * 60 * 1000) : Date.now() + (24 * 60 * 60 * 1000) // 7 days or 24 hours
            };
            localStorage.setItem('steam_lms_session', JSON.stringify(session));

            this.showToast('Login successful! Redirecting...', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                console.log('Redirecting to admin dashboard...');
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            console.log('Authentication failed: Invalid credentials');
            this.showToast('Invalid email or password', 'error');
            this.clearPassword();
        }
    }

    logout() {
        localStorage.removeItem('steam_lms_session');
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 1000);
    }

    isLoggedIn() {
        const session = this.getSession();
        return session && session.expires > Date.now();
    }

    getSession() {
        try {
            return JSON.parse(localStorage.getItem('steam_lms_session') || '{}');
        } catch {
            return null;
        }
    }

    getCurrentAdmin() {
        const session = this.getSession();
        if (session && this.isLoggedIn()) {
            return this.getAdmin();
        }
        return null;
    }

    getAdmin() {
        try {
            return JSON.parse(localStorage.getItem('steam_lms_admin') || '{}');
        } catch {
            return {};
        }
    }

    updateAdminCredentials(email, currentPassword, newPassword) {
        const admin = this.getAdmin();
        
        // Verify current password
        if (admin.password !== this.hashPassword(currentPassword)) {
            return { success: false, error: 'Current password is incorrect' };
        }

        // Update credentials
        admin.email = email;
        admin.password = this.hashPassword(newPassword);
        admin.updatedAt = new Date().toISOString();
        
        localStorage.setItem('steam_lms_admin', JSON.stringify(admin));
        
        // Update session if logged in
        if (this.isLoggedIn()) {
            const session = this.getSession();
            session.email = email;
            localStorage.setItem('steam_lms_session', JSON.stringify(session));
        }

        return { success: true };
    }

    // Utility Functions
    hashPassword(password) {
        // Simple hash for demo purposes
        // In production, use proper hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    clearPassword() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container') || document.createElement('div');
        if (!document.getElementById('toast-container')) {
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Security Functions
    checkSessionTimeout() {
        if (!this.isLoggedIn()) {
            this.logout();
            return false;
        }
        return true;
    }

    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expires = Date.now() + (24 * 60 * 60 * 1000); // Extend by 24 hours
            localStorage.setItem('steam_lms_session', JSON.stringify(session));
        }
    }
}

// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

// Forgot password functionality
function handleForgotPassword() {
    const email = prompt('Enter your admin email address:');
    if (email) {
        if (!auth.validateEmail(email)) {
            auth.showToast('Please enter a valid email address', 'error');
            return;
        }
        
        const admin = auth.getAdmin();
        if (admin.email === email) {
            // In a real application, send password reset email
            auth.showToast('Password reset instructions have been sent to your email', 'success');
        } else {
            auth.showToast('Email not found in our system', 'error');
        }
    }
}

// Initialize authentication
let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new AdminAuth();
    
    // Add forgot password handler
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
    
    // Auto-logout on session timeout
    setInterval(() => {
        if (auth.isLoggedIn()) {
            auth.checkSessionTimeout();
        }
    }, 60000); // Check every minute
    
    // Extend session on user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            if (auth.isLoggedIn()) {
                auth.extendSession();
            }
        });
    });
});

// Global logout function
function logout() {
    if (auth) {
        auth.logout();
    }
}
