// Courses Page JavaScript
class CoursesPage {
    constructor() {
        this.db = new AdminDatabase();
        this.currentGrade = '';
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadFilters();
        this.loadContent();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Grade filter
        const gradeFilter = document.getElementById('grade-filter');
        if (gradeFilter) {
            gradeFilter.addEventListener('change', (e) => {
                this.currentGrade = e.target.value;
                this.loadContent();
            });
        }

        // Category filter buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-category]')) {
                // Remove active class from all buttons
                document.querySelectorAll('[data-category]').forEach(btn => {
                    btn.classList.remove('active');
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                e.target.classList.remove('btn-outline-primary');
                e.target.classList.add('btn-primary');
                
                this.currentCategory = e.target.dataset.category;
                this.loadContent();
            }
        });
    }

    loadFilters() {
        // Load grades into filter
        const grades = this.db.getAllGrades();
        const gradeFilter = document.getElementById('grade-filter');
        
        if (gradeFilter) {
            gradeFilter.innerHTML = '<option value="">All Grades</option>' +
                grades.map(grade => `<option value="${grade.id}">${grade.name}</option>`).join('');
        }

        // Load categories into filter buttons
        const categories = this.db.getAllCategories();
        const categoryFilters = document.getElementById('category-filters');
        
        if (categoryFilters) {
            // Keep "All Categories" button and add category buttons
            const allButton = categoryFilters.querySelector('[data-category="all"]');
            categoryFilters.innerHTML = '';
            categoryFilters.appendChild(allButton);
            
            categories.forEach(category => {
                const button = document.createElement('button');
                button.className = 'btn btn-outline-primary';
                button.dataset.category = category.id;
                button.textContent = category.name;
                categoryFilters.appendChild(button);
            });
        }
    }

    loadContent() {
        const allContent = this.db.getAllContent();
        const grades = this.db.getAllGrades();
        const categories = this.db.getAllCategories();
        
        // Filter content
        let filteredContent = allContent;
        
        if (this.currentGrade) {
            filteredContent = filteredContent.filter(item => item.gradeId === this.currentGrade);
        }
        
        if (this.currentCategory !== 'all') {
            filteredContent = filteredContent.filter(item => item.categoryId === this.currentCategory);
        }
        
        // Sort by creation date (newest first)
        filteredContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        this.renderContent(filteredContent, grades, categories);
    }

    renderContent(content, grades, categories) {
        const contentGrid = document.getElementById('content-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (content.length === 0) {
            contentGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        contentGrid.style.display = 'flex';
        emptyState.style.display = 'none';
        
        contentGrid.innerHTML = content.map(item => {
            const grade = grades.find(g => g.id === item.gradeId);
            const category = categories.find(c => c.id === item.categoryId);
            const typeIcon = this.getTypeIcon(item.type);
            const typeColor = this.getTypeColor(item.type);
            
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm content-card">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <div class="content-type-icon me-3" style="background-color: ${typeColor};">
                                    <i class="fas ${typeIcon}"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h5 class="card-title">${this.escapeHtml(item.title)}</h5>
                                    <p class="text-muted small mb-2">
                                        <i class="fas fa-graduation-cap me-1"></i>${grade ? grade.name : 'Unknown Grade'}
                                        <span class="mx-2">•</span>
                                        <i class="fas fa-tag me-1"></i>${category ? category.name : 'Unknown Category'}
                                    </p>
                                </div>
                            </div>
                            
                            ${item.description ? `
                                <p class="card-text text-muted small">${this.escapeHtml(item.description)}</p>
                            ` : ''}
                            
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="badge" style="background-color: ${typeColor}; color: white;">
                                    ${item.type}
                                </span>
                                ${item.files && item.files.length > 0 ? `
                                    <span class="text-muted small">
                                        <i class="fas fa-paperclip me-1"></i>${item.files.length} file(s)
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="card-footer bg-transparent">
                            <button class="btn btn-primary btn-sm w-100" onclick="coursesPage.viewContent('${item.id}')">
                                <i class="fas fa-eye me-2"></i>View Content
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    viewContent(contentId) {
        const content = this.db.getAllContent().find(c => c.id === contentId);
        if (!content) return;
        
        const grades = this.db.getAllGrades();
        const categories = this.db.getAllCategories();
        const files = this.db.getAllFiles();
        
        const grade = grades.find(g => g.id === content.gradeId);
        const category = categories.find(c => c.id === content.categoryId);
        const associatedFiles = files.filter(f => content.files && content.files.includes(f.id));
        
        const modal = new bootstrap.Modal(document.getElementById('contentModal'));
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        modalTitle.textContent = content.title;
        
        modalContent.innerHTML = `
            <div class="content-detail">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Grade:</strong> ${grade ? grade.name : 'Unknown'}
                    </div>
                    <div class="col-md-6">
                        <strong>Category:</strong> ${category ? category.name : 'Unknown'}
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-12">
                        <strong>Type:</strong> 
                        <span class="badge ms-2" style="background-color: ${this.getTypeColor(content.type)}; color: white;">
                            ${content.type}
                        </span>
                    </div>
                </div>
                
                ${content.description ? `
                    <div class="mb-3">
                        <strong>Description:</strong>
                        <p class="mt-2">${this.escapeHtml(content.description)}</p>
                    </div>
                ` : ''}
                
                ${associatedFiles.length > 0 ? `
                    <div class="mb-3">
                        <strong>Associated Files (${associatedFiles.length}):</strong>
                        <div class="mt-2">
                            ${associatedFiles.map(file => `
                                <div class="file-item d-flex align-items-center justify-content-between p-2 border rounded mb-2">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-file-${this.getFileIcon(file.type)} me-2 text-primary"></i>
                                        <div>
                                            <div class="fw-bold">${this.escapeHtml(file.name)}</div>
                                            <small class="text-muted">${this.formatFileSize(file.size)}</small>
                                        </div>
                                    </div>
                                    <button class="btn btn-sm btn-outline-primary" onclick="coursesPage.downloadFile('${file.id}')">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="text-muted small">
                    <i class="fas fa-clock me-1"></i>
                    Created: ${this.formatDate(content.createdAt)}
                </div>
            </div>
        `;
        
        modal.show();
    }

    downloadFile(fileId) {
        const file = this.db.getAllFiles().find(f => f.id === fileId);
        if (!file) return;
        
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Utility Functions
    getTypeIcon(type) {
        const icons = {
            lesson: 'fa-book',
            assignment: 'fa-tasks',
            resource: 'fa-folder',
            video: 'fa-video',
            quiz: 'fa-question-circle'
        };
        return icons[type] || 'fa-file';
    }

    getTypeColor(type) {
        const colors = {
            lesson: '#3498db',
            assignment: '#f39c12',
            resource: '#27ae60',
            video: '#e74c3c',
            quiz: '#9b59b6'
        };
        return colors[type] || '#95a5a6';
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'pdf';
        if (type.includes('word') || type.includes('document')) return 'word';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'powerpoint';
        if (type.includes('excel') || type.includes('spreadsheet')) return 'excel';
        if (type.includes('image')) return 'image';
        if (type.includes('video')) return 'video';
        if (type.includes('audio')) return 'audio';
        return 'alt';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Include AdminDatabase class (simplified version)
class AdminDatabase {
    constructor() {
        this.getDB();
    }

    getDB() {
        return JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
    }

    getAllContent() {
        const db = this.getDB();
        const content = db.content || [];
        const grades = db.grades || [];
        const categories = db.categories || [];
        
        return content.map(item => ({
            ...item,
            gradeName: grades.find(g => g.id === item.gradeId)?.name || 'Unknown',
            categoryName: categories.find(c => c.id === item.categoryId)?.name || 'Unknown'
        }));
    }

    getAllGrades() {
        const db = this.getDB();
        return db.grades || [];
    }

    getAllCategories() {
        const db = this.getDB();
        return db.categories || [];
    }

    getAllFiles() {
        const db = this.getDB();
        return db.files || [];
    }
}

// Initialize courses page
let coursesPage;
document.addEventListener('DOMContentLoaded', () => {
    coursesPage = new CoursesPage();
});
