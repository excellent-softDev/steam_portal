// STEAM LMS Admin Dashboard - Clean Version
console.log('🚀 Loading STEAM LMS Admin Dashboard...');

// Global variables
let dashboard = null;
let currentEditingId = null;

// Toast Notification System
class ToastManager {
    static show(message, type = 'info', duration = 4000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${this.getIcon(type)}
                </div>
                <div class="toast-message">
                    <strong>${this.getTitle(type)}</strong>
                    <p>${message}</p>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add to container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
        
        console.log(`Toast [${type.toUpperCase()}]: ${message}`);
    }
    
    static getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    }
    
    static getTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }
}

// MySQL Database Manager
class MySQLManager {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
    }
    
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    async getContent() {
        return await this.request('/content');
    }
    
    async getGrades() {
        return await this.request('/grades');
    }
    
    async getCategories() {
        return await this.request('/categories');
    }
    
    async getFiles() {
        return await this.request('/files');
    }
    
    async createContent(data) {
        return await this.request('/content', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async updateContent(id, data) {
        return await this.request(`/content/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    async deleteContent(id) {
        return await this.request(`/content/${id}`, {
            method: 'DELETE'
        });
    }
}

// Main Dashboard Class
class AdminDashboard {
    constructor() {
        this.db = new MySQLManager();
        this.currentSection = 'dashboard';
        this.initializeEventListeners();
        this.loadInitialData();
    }
    
    initializeEventListeners() {
        console.log('🔧 Initializing event listeners...');
        
        // Navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.showSection(sectionId);
            });
        });
        
        // Content form
        const contentForm = document.getElementById('content-form');
        if (contentForm) {
            contentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContent();
            });
        }
        
        // Add content button
        const addContentBtn = document.getElementById('add-content-btn');
        if (addContentBtn) {
            addContentBtn.addEventListener('click', () => {
                this.openContentModal();
            });
        }
        
        console.log('✅ Event listeners initialized');
    }
    
    async loadInitialData() {
        console.log('📊 Loading initial data...');
        
        try {
            // Load dashboard metrics
            await this.updateMetrics();
            
            // Load content data
            await this.loadContentData();
            
            console.log('✅ Initial data loaded');
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            ToastManager.show('Error loading dashboard data', 'error');
        }
    }
    
    async updateMetrics() {
        console.log('📈 Updating dashboard metrics...');
        
        try {
            const [content, grades, categories, files] = await Promise.all([
                this.db.getContent(),
                this.db.getGrades(),
                this.db.getCategories(),
                this.db.getFiles()
            ]);
            
            // Update metric displays
            this.updateMetric('total-content', content.data?.length || 0);
            this.updateMetric('total-grades', grades.data?.length || 0);
            this.updateMetric('total-categories', categories.data?.length || 0);
            this.updateMetric('total-files', files.data?.length || 0);
            
            console.log('✅ Metrics updated');
        } catch (error) {
            console.error('❌ Error updating metrics:', error);
        }
    }
    
    updateMetric(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    async loadContentData() {
        console.log('📚 Loading content data...');
        
        try {
            const result = await this.db.getContent();
            
            if (result.success) {
                this.renderContentTable(result.data || []);
                console.log(`✅ Loaded ${result.data?.length || 0} content items`);
            } else {
                throw new Error(result.error || 'Failed to load content');
            }
        } catch (error) {
            console.error('❌ Error loading content:', error);
            ToastManager.show('Error loading content data', 'error');
        }
    }
    
    renderContentTable(content) {
        const tbody = document.getElementById('content-table-body');
        if (!tbody) return;
        
        if (content.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-folder-open fa-3x mb-3 text-muted"></i>
                            <h5 class="text-muted">No Content Found</h5>
                            <p class="text-muted">Start by adding your first content item.</p>
                            <button class="btn btn-primary mt-3" onclick="dashboard.openContentModal()">
                                <i class="fas fa-plus me-2"></i>Add Content
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = content.map(item => `
            <tr>
                <td>${item.title}</td>
                <td>${item.grade_name || 'N/A'}</td>
                <td>${item.category_name || 'N/A'}</td>
                <td>${item.content_type || 'N/A'}</td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.editContent('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="dashboard.deleteContent('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Update navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const sectionMap = {
            'dashboard': 'dashboard-section',
            'content': 'content-section',
            'grades': 'grades-section',
            'categories': 'categories-section',
            'uploads': 'uploads-section',
            'metrics': 'metrics-section',
            'settings': 'settings-section'
        };
        
        const targetSection = document.getElementById(sectionMap[sectionId]);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        // Load section-specific data
        this.loadSectionData(sectionId);
        
        // Update URL hash
        window.location.hash = sectionId;
    }
    
    async loadSectionData(sectionId) {
        switch(sectionId) {
            case 'dashboard':
                await this.updateMetrics();
                break;
            case 'content':
                await this.loadContentData();
                break;
            case 'grades':
                await this.loadGradesData();
                break;
            case 'categories':
                await this.loadCategoriesData();
                break;
            case 'uploads':
                await this.loadUploadsData();
                break;
        }
    }
    
    async loadGradesData() {
        console.log('🎓 Loading grades data...');
        
        try {
            const result = await this.db.getGrades();
            if (result.success) {
                this.renderGradesGrid(result.data || []);
                console.log(`✅ Loaded ${result.data?.length || 0} grades`);
            }
        } catch (error) {
            console.error('❌ Error loading grades:', error);
            ToastManager.show('Error loading grades', 'error');
        }
    }
    
    renderGradesGrid(grades) {
        const container = document.getElementById('grades-grid');
        if (!container) return;
        
        if (grades.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">No Grades Found</h5>
                    <p class="text-muted">Grades will be populated from the database.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = grades.map(grade => `
            <div class="grade-card">
                <div class="grade-header">
                    <h5>${grade.name}</h5>
                    <small class="text-muted">${grade.age_range || 'N/A'}</small>
                </div>
                <div class="grade-body">
                    <p>${grade.description || 'No description'}</p>
                </div>
                <div class="grade-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.editGrade('${grade.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteGrade('${grade.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadCategoriesData() {
        console.log('📂 Loading categories data...');
        
        try {
            const result = await this.db.getCategories();
            if (result.success) {
                this.renderCategoriesGrid(result.data || []);
                console.log(`✅ Loaded ${result.data?.length || 0} categories`);
            }
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            ToastManager.show('Error loading categories', 'error');
        }
    }
    
    renderCategoriesGrid(categories) {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">No Categories Found</h5>
                    <p class="text-muted">Categories will be populated from the database.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = categories.map(category => `
            <div class="category-card">
                <div class="category-header">
                    <h5><i class="${category.icon || 'fas fa-folder'} me-2"></i>${category.name}</h5>
                </div>
                <div class="category-body">
                    <p>${category.description || 'No description'}</p>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    async loadUploadsData() {
        console.log('📁 Loading uploads data...');
        
        try {
            const result = await this.db.getFiles();
            if (result.success) {
                this.renderUploadsGrid(result.data || []);
                console.log(`✅ Loaded ${result.data?.length || 0} files`);
            }
        } catch (error) {
            console.error('❌ Error loading uploads:', error);
            ToastManager.show('Error loading uploads', 'error');
        }
    }
    
    renderUploadsGrid(files) {
        const container = document.getElementById('uploads-grid');
        if (!container) return;
        
        if (files.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-upload fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">No Files Found</h5>
                    <p class="text-muted">Uploaded files will appear here.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = files.map(file => `
            <div class="file-card">
                <div class="file-header">
                    <h5><i class="fas fa-file me-2"></i>${file.name}</h5>
                    <small class="text-muted">${file.size || 'N/A'}</small>
                </div>
                <div class="file-body">
                    <p><strong>Type:</strong> ${file.type || 'N/A'}</p>
                    <p><strong>Uploaded:</strong> ${new Date(file.upload_date).toLocaleDateString()}</p>
                </div>
                <div class="file-actions">
                    <button class="btn btn-sm btn-primary" onclick="dashboard.downloadFile('${file.id}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    openContentModal() {
        currentEditingId = null;
        
        // Reset form
        const form = document.getElementById('content-form');
        if (form) {
            form.reset();
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('contentModal'));
        if (modal) {
            modal.show();
        }
    }
    
    async saveContent() {
        console.log('💾 Saving content...');
        
        try {
            const formData = new FormData(document.getElementById('content-form'));
            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                gradeId: formData.get('gradeId'),
                categoryId: formData.get('categoryId'),
                subcategoryId: formData.get('subcategoryId'),
                contentType: formData.get('contentType'),
                content: formData.get('content')
            };
            
            let result;
            if (currentEditingId) {
                result = await this.db.updateContent(currentEditingId, data);
            } else {
                result = await this.db.createContent(data);
            }
            
            if (result.success) {
                ToastManager.show('Content saved successfully!', 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Reload data
                await this.loadContentData();
                await this.updateMetrics();
            } else {
                throw new Error(result.error || 'Failed to save content');
            }
        } catch (error) {
            console.error('❌ Error saving content:', error);
            ToastManager.show('Error saving content', 'error');
        }
    }
    
    async editContent(id) {
        console.log(`✏️ Editing content: ${id}`);
        currentEditingId = id;
        
        try {
            // Load content data
            const result = await this.db.getContent();
            if (result.success) {
                const content = result.data.find(item => item.id === id);
                if (content) {
                    // Populate form
                    document.getElementById('title').value = content.title || '';
                    document.getElementById('description').value = content.description || '';
                    document.getElementById('gradeId').value = content.grade_id || '';
                    document.getElementById('categoryId').value = content.category_id || '';
                    document.getElementById('subcategoryId').value = content.subcategory_id || '';
                    document.getElementById('contentType').value = content.content_type || '';
                    document.getElementById('content').value = content.content || '';
                    
                    // Show modal
                    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
                    if (modal) {
                        modal.show();
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error loading content for edit:', error);
            ToastManager.show('Error loading content for edit', 'error');
        }
    }
    
    async deleteContent(id) {
        if (!confirm('Are you sure you want to delete this content?')) {
            return;
        }
        
        console.log(`🗑️ Deleting content: ${id}`);
        
        try {
            const result = await this.db.deleteContent(id);
            if (result.success) {
                ToastManager.show('Content deleted successfully!', 'success');
                await this.loadContentData();
                await this.updateMetrics();
            } else {
                throw new Error(result.error || 'Failed to delete content');
            }
        } catch (error) {
            console.error('❌ Error deleting content:', error);
            ToastManager.show('Error deleting content', 'error');
        }
    }
    
    editGrade(id) {
        console.log(`✏️ Editing grade: ${id}`);
        ToastManager.show('Grade editing coming soon!', 'info');
    }
    
    deleteGrade(id) {
        if (!confirm('Are you sure you want to delete this grade?')) {
            return;
        }
        
        console.log(`🗑️ Deleting grade: ${id}`);
        ToastManager.show('Grade deletion coming soon!', 'info');
    }
    
    editCategory(id) {
        console.log(`✏️ Editing category: ${id}`);
        ToastManager.show('Category editing coming soon!', 'info');
    }
    
    deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        console.log(`🗑️ Deleting category: ${id}`);
        ToastManager.show('Category deletion coming soon!', 'info');
    }
    
    downloadFile(id) {
        console.log(`⬇️ Downloading file: ${id}`);
        ToastManager.show('File download coming soon!', 'info');
    }
    
    deleteFile(id) {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }
        
        console.log(`🗑️ Deleting file: ${id}`);
        ToastManager.show('File deletion coming soon!', 'info');
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM ready, initializing dashboard...');
    
    // Check authentication
    const auth = JSON.parse(localStorage.getItem('steam_lms_admin') || '{}');
    if (!auth.email || !auth.isLoggedIn) {
        console.log('🔐 User not authenticated, redirecting to login...');
        window.location.href = 'admin-login.html';
        return;
    }
    
    console.log('✅ User authenticated, initializing dashboard...');
    
    // Initialize dashboard
    dashboard = new AdminDashboard();
    
    // Show initial section
    const initialSection = window.location.hash.substring(1) || 'dashboard';
    dashboard.showSection(initialSection);
    
    console.log('🚀 Dashboard initialization complete!');
});
