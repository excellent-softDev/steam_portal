// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.db = new AdminDatabase();
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
                
                // Update active menu item
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                link.closest('.menu-item').classList.add('active');
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.admin-sidebar').classList.toggle('show');
            });
        }

        // File upload area
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                this.handleFileUpload(e.dataTransfer.files);
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // Content filters
        const gradeFilter = document.getElementById('grade-filter');
        const categoryFilter = document.getElementById('category-filter');
        const contentSearch = document.getElementById('content-search');
        
        if (gradeFilter) gradeFilter.addEventListener('change', () => this.filterContent());
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterContent());
        if (contentSearch) contentSearch.addEventListener('input', () => this.filterContent());
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Load section-specific data
            this.loadSectionData(sectionName);
        }
    }

    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'content':
                this.loadContentData();
                break;
            case 'grades':
                this.loadGradesData();
                break;
            case 'categories':
                this.loadCategoriesData();
                break;
            case 'uploads':
                this.loadUploadsData();
                break;
            case 'metrics':
                this.loadMetricsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    // Database Operations
    loadDashboardData() {
        const stats = this.db.getDashboardStats();
        
        // Update stats cards
        document.getElementById('total-content').textContent = stats.totalContent;
        document.getElementById('total-grades').textContent = stats.totalGrades;
        document.getElementById('total-categories').textContent = stats.totalCategories;
        document.getElementById('total-files').textContent = stats.totalFiles;
        
        // Load recent uploads
        this.loadRecentUploads();
    }

    loadRecentUploads() {
        const recentUploads = this.db.getRecentUploads();
        const container = document.getElementById('recent-uploads');
        
        if (container) {
            container.innerHTML = recentUploads.map(upload => `
                <div class="upload-item">
                    <div class="upload-info">
                        <div class="upload-icon">
                            <i class="fas fa-file-${this.getFileIcon(upload.type)}"></i>
                        </div>
                        <div class="upload-details">
                            <h6>${upload.name}</h6>
                            <small>${this.formatFileSize(upload.size)} • ${this.formatDate(upload.uploadDate)}</small>
                        </div>
                    </div>
                    <button class="btn-action btn-delete" onclick="dashboard.deleteFile('${upload.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    async loadContentData() {
        console.log('=== LOAD CONTENT DATA DEBUG ===');
        
        try {
            // First check if API is accessible
            console.log('Checking API health...');
            const healthResponse = await fetch('http://localhost:3001/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Health check status:', healthResponse.status);
            
            if (!healthResponse.ok) {
                throw new Error(`API server not responding! Status: ${healthResponse.status}`);
            }
            
            const healthResult = await healthResponse.json();
            console.log('Health check result:', healthResult);
            
            // Use MySQL API instead of localStorage
            console.log('Fetching from: http://localhost:3001/api/content');
            
            const response = await fetch('http://localhost:3001/api/content', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API response:', result);
            
            if (result.success) {
                const content = result.data || [];
                console.log('Loading content:', content.length, 'items');
                console.log('Content sample:', content.slice(0, 2));
                
                // Load grades and categories for filters
                await this.loadGradesAndCategories();
                
                // Check if table body exists
                const tbody = document.getElementById('content-table-body');
                console.log('Table body element:', tbody);
                
                if (!tbody) {
                    console.error('Content table body not found!');
                    return;
                }
                
                // Populate content table
                this.renderContentTable(content);
                
                console.log('=== LOAD CONTENT DATA COMPLETE ===');
            } else {
                console.error('API error:', result.error);
                this.showToast('Error loading content: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Network error details:', error);
            console.error('Error stack:', error.stack);
            this.showToast('Network error loading content: ' + error.message, 'error');
            
            // Fallback to show error in table
            const tbody = document.getElementById('content-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger py-4">
                            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                            <h5>Connection Error</h5>
                            <p>Cannot connect to MySQL API server at localhost:3001</p>
                            <p class="small">Error: ${error.message}</p>
                            <div class="mt-3">
                                <button class="btn btn-primary btn-sm me-2" onclick="location.reload()">Retry</button>
                                <button class="btn btn-secondary btn-sm" onclick="testAPIConnection()">Test API</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    }

function testAPIConnection() {
    console.log('=== TESTING API CONNECTION ===');
    
    fetch('http://localhost:3001/api/health')
        .then(response => {
            console.log('Test response status:', response.status);
            return response.json();
        })
        .then(result => {
            console.log('Test result:', result);
            if (result.success) {
                alert('✅ API Connection Successful!\n\nServer is running and responding correctly.');
            } else {
                alert('❌ API Connection Failed!\n\nError: ' + (result.error || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Test error:', error);
            alert('❌ API Connection Failed!\n\nError: ' + error.message + '\n\nMake sure the MySQL server is running on port 3001.');
        });
}

async function loadGradesAndCategories() {
        console.log('=== LOAD GRADES AND CATEGORIES DEBUG ===');
        
        try {
            console.log('Fetching grades and categories...');
            
            const [gradesResponse, categoriesResponse] = await Promise.all([
                fetch('http://localhost:3001/api/grades', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }),
                fetch('http://localhost:3001/api/categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
            ]);
            
            console.log('Grades response status:', gradesResponse.status);
            console.log('Categories response status:', categoriesResponse.status);
            
            if (!gradesResponse.ok) {
                throw new Error(`Grades API error! status: ${gradesResponse.status}`);
            }
            
            if (!categoriesResponse.ok) {
                throw new Error(`Categories API error! status: ${categoriesResponse.status}`);
            }
            
            const gradesResult = await gradesResponse.json();
            const categoriesResult = await categoriesResponse.json();
            
            console.log('Grades result:', gradesResult);
            console.log('Categories result:', categoriesResult);
            console.error('Error stack:', error.stack);
            this.showToast('Error loading filters: ' + error.message, 'error');
        }
    }

    renderContentTable(content) {
        console.log('=== RENDER CONTENT TABLE DEBUG ===');
        console.log('Content to render:', content);
        
        const tbody = document.getElementById('content-table-body');
        console.log('Table body element for render:', tbody);
        
        if (!tbody) {
            console.error('Content table body not found in render!');
            return;
        }
        
        if (content.length === 0) {
            console.log('No content to display, showing empty message');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-folder-open fa-3x mb-3"></i>
                        <h5>No content found</h5>
                        <p>Start by adding your first educational content.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        console.log('Rendering', content.length, 'content items');
        
        tbody.innerHTML = content.map(item => {
            console.log('Rendering item:', item);
            
            const grade = this.getGradeById(item.gradeId);
            const category = this.getCategoryById(item.categoryId);
            const typeIcon = this.getTypeIcon(item.type);
            const typeColor = this.getTypeColor(item.type);
            
            console.log('Item details:', { grade, category, typeIcon, typeColor });
            
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <i class="fas ${typeIcon} me-2" style="color: ${typeColor}"></i>
                            <div>
                                <div class="fw-bold">${item.title}</div>
                                <small class="text-muted">${item.description || 'No description'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-primary text-white">${grade ? grade.name : 'Unknown'}</span>
                    </td>
                    <td>
                        <span class="badge bg-info text-white">${category ? category.name : 'Unknown'}</span>
                    </td>
                    <td>
                        <span class="badge" style="background-color: ${typeColor}; color: white;">${item.type}</span>
                    </td>
                    <td>
                        <span class="badge bg-secondary">${item.files ? item.files.length : 0} files</span>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editContent('${item.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteContent('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('=== RENDER CONTENT TABLE COMPLETE ===');
    }
    
    getGradeById(gradeId) {
        // Use cached grades from API call
        const gradeFilter = document.getElementById('grade-filter');
        if (gradeFilter) {
            const options = gradeFilter.querySelectorAll('option');
            for (let option of options) {
                if (option.value === gradeId && option.value !== '') {
                    return { id: gradeId, name: option.textContent };
                }
            }
        }
        return { id: gradeId, name: 'Unknown' };
    }
    
    getCategoryById(categoryId) {
        // Use cached categories from API call
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            const options = categoryFilter.querySelectorAll('option');
            for (let option of options) {
                if (option.value === categoryId && option.value !== '') {
                    return { id: categoryId, name: option.textContent };
                }
            }
        }
        return { id: categoryId, name: 'Unknown' };
    }

    createContent(data) {
        const db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
        const content = db.content || [];
        const newContent = {
            id: this.generateId(),
            title: data.title,
            description: data.description,
            gradeId: data.gradeId,
            categoryId: data.categoryId,
            type: data.type,
            files: data.files,
        };
        content.push(newContent);
        localStorage.setItem('steam_lms_db', JSON.stringify({ ...db, content }));
        this.showToast('Content created successfully', 'success');
        this.loadContentData();
    }

    updateContent(id, data) {
        const db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
        const content = db.content || [];
        const index = content.findIndex(c => c.id === id);
        if (index !== -1) {
            content[index] = {
                ...content[index],
                title: data.title,
                description: data.description,
                gradeId: data.gradeId,
                categoryId: data.categoryId,
                type: data.type,
                files: data.files,
            };
            localStorage.setItem('steam_lms_db', JSON.stringify({ ...db, content }));
            this.showToast('Content updated successfully', 'success');
            this.loadContentData();
        } else {
            this.showToast('Error updating content', 'error');
        }
    }

    deleteContent(id) {
        if (confirm('Are you sure you want to delete this content?')) {
            const db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
            const content = db.content || [];
            const index = content.findIndex(c => c.id === id);
            
            if (index !== -1) {
                content.splice(index, 1);
                localStorage.setItem('steam_lms_db', JSON.stringify({ ...db, content }));
                this.showToast('Content deleted successfully', 'success');
                this.loadContentData();
            } else {
                this.showToast('Content not found', 'error');
            }
        }
    }

    loadGradesData() {
        const grades = this.db.getAllGrades();
        const container = document.getElementById('grades-grid');
        
        if (container) {
            container.innerHTML = grades.map(grade => `
                <div class="grade-card">
                    <i class="fas fa-graduation-cap fa-2x text-primary mb-3"></i>
                    <h5>${grade.name}</h5>
                    <p>${grade.description || 'No description'}</p>
                    <div class="action-buttons justify-content-center">
                        <button class="btn-action btn-edit" onclick="dashboard.editGrade('${grade.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="dashboard.deleteGrade('${grade.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    loadCategoriesData() {
        const categories = this.db.getAllCategories();
        const container = document.getElementById('categories-list');
        
        if (container) {
            container.innerHTML = categories.map(category => `
                <div class="category-item">
                    <div class="category-info">
                        <h5>${category.name}</h5>
                        <p>${category.description || 'No description'}</p>
                        ${category.subcategories && category.subcategories.length > 0 ? 
                            `<small>Subcategories: ${category.subcategories.join(', ')}</small>` : ''}
                    </div>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="dashboard.editCategory('${category.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="dashboard.deleteCategory('${category.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
        this.renderCharts();
    }

    loadSettingsData() {
        const settings = this.db.getSettings();
        
        // Populate settings form
        document.getElementById('max-file-size').value = settings.maxFileSize || 100;
        document.getElementById('allowed-types').value = settings.allowedTypes || 'pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,mp4,mp3';
        document.getElementById('admin-email').value = settings.adminEmail || 'admin@steamlms.com';
    }

    // CRUD Operations
    createContent(data) {
        const result = this.db.createContent(data);
        if (result.success) {
            this.showToast('Content created successfully', 'success');
            this.loadContentData();
        } else {
            this.showToast('Error creating content', 'error');
        }
        return result;
    }

    updateContent(id, data) {
        const result = this.db.updateContent(id, data);
        if (result.success) {
            this.showToast('Content updated successfully', 'success');
            this.loadContentData();
        } else {
            this.showToast('Error updating content', 'error');
        }
        return result;
    }

    deleteContent(id) {
        if (confirm('Are you sure you want to delete this content?')) {
            const result = this.db.deleteContent(id);
            if (result.success) {
                this.showToast('Content deleted successfully', 'success');
                this.loadContentData();
            } else {
                this.showToast('Error deleting content', 'error');
            }
        }
    }

    createGrade(data) {
        const result = this.db.createGrade(data);
        if (result.success) {
            this.showToast('Grade created successfully', 'success');
            this.loadGradesData();
        } else {
            this.showToast('Error creating grade', 'error');
        }
        return result;
    }

    updateGrade(id, data) {
        const result = this.db.updateGrade(id, data);
        if (result.success) {
            this.showToast('Grade updated successfully', 'success');
            this.loadGradesData();
        } else {
            this.showToast('Error updating grade', 'error');
        }
        return result;
    }

    deleteGrade(id) {
        if (confirm('Are you sure you want to delete this grade?')) {
            const result = this.db.deleteGrade(id);
            if (result.success) {
                this.showToast('Grade deleted successfully', 'success');
                this.loadGradesData();
            } else {
                this.showToast('Error deleting grade', 'error');
            }
        }
    }

    createCategory(data) {
        const result = this.db.createCategory(data);
        if (result.success) {
            this.showToast('Category created successfully', 'success');
            this.loadCategoriesData();
        } else {
            this.showToast('Error creating category', 'error');
        }
        return result;
    }

    updateCategory(id, data) {
        const result = this.db.updateCategory(id, data);
        if (result.success) {
            this.showToast('Category updated successfully', 'success');
            this.loadCategoriesData();
        } else {
            this.showToast('Error updating category', 'error');
        }
        return result;
    }

    deleteCategory(id) {
        if (confirm('Are you sure you want to delete this category?')) {
            const result = this.db.deleteCategory(id);
            if (result.success) {
                this.showToast('Category deleted successfully', 'success');
                this.loadCategoriesData();
            } else {
                this.showToast('Error deleting category', 'error');
            }
        }
    }

    // File Operations
    handleFileUpload(files) {
        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showToast('No valid files selected', 'error');
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString(),
                    data: e.target.result
                };
                
                const result = this.db.saveFile(fileData);
                if (result.success) {
                    this.showToast(`${file.name} uploaded successfully`, 'success');
                } else {
                    this.showToast(`Error uploading ${file.name}`, 'error');
                }
            };
            reader.readAsDataURL(file);
        });

        // Refresh uploads section if active
        if (this.currentSection === 'uploads') {
            setTimeout(() => this.loadUploadsData(), 500);
        }
        
        // Refresh dashboard stats
        this.loadDashboardData();
    }

    validateFile(file) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'video/mp4',
            'audio/mpeg'
        ];
        
        const maxSize = 100 * 1024 * 1024; // 100MB
        
        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }

    deleteFile(id) {
        if (confirm('Are you sure you want to delete this file?')) {
            const result = this.db.deleteFile(id);
            if (result.success) {
                this.showToast('File deleted successfully', 'success');
                this.loadUploadsData();
                this.loadDashboardData();
            } else {
                this.showToast('Error deleting file', 'error');
            }
        }
    }

    // Utility Functions
    populateSelect(selectId, options, valueField, textField, placeholder = '') {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = placeholder ? `<option value="">${placeholder}</option>` : '';
            options.forEach(option => {
                select.innerHTML += `<option value="${option[valueField]}">${option[textField]}</option>`;
            });
        }
    }

    filterContent() {
        const gradeFilter = document.getElementById('grade-filter').value;
        const categoryFilter = document.getElementById('category-filter').value;
        const searchTerm = document.getElementById('content-search').value.toLowerCase();
        
        let content = this.db.getAllContent();
        
        if (gradeFilter) {
            content = content.filter(item => item.gradeId === gradeFilter);
        }
        
        if (categoryFilter) {
            content = content.filter(item => item.categoryId === categoryFilter);
        }
        
        if (searchTerm) {
            content = content.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderContentTable(content);
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

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'info') {
        this.toastManager.show(message, type);
    }

    renderCharts() {
        this.renderContentChart();
        this.renderGradeChart();
        this.renderFileChart();
        this.renderActivityChart();
    }

    renderContentChart() {
        const canvas = document.getElementById('content-chart');
        if (!canvas) return;
        
        const content = this.db.getAllContent();
        const categories = this.db.getAllCategories();
        
        // Count content by category
        const categoryData = categories.map(category => {
            const count = content.filter(item => item.categoryId === category.id).length;
            return {
                label: category.name,
                value: count,
                color: this.getRandomColor()
            };
        }).filter(item => item.value > 0);
        
        this.drawPieChart(canvas, categoryData, 'Content Distribution');
    }

    renderGradeChart() {
        const canvas = document.getElementById('grade-chart');
        if (!canvas) return;
        
        const content = this.db.getAllContent();
        const grades = this.db.getAllGrades();
        
        // Count content by grade
        const gradeData = grades.map(grade => {
            const count = content.filter(item => item.gradeId === grade.id).length;
            return {
                label: grade.name,
                value: count,
                color: this.getRandomColor()
            };
        }).filter(item => item.value > 0);
        
        this.drawBarChart(canvas, gradeData, 'Content by Grade');
    }

    renderFileChart() {
        const canvas = document.getElementById('file-chart');
        if (!canvas) return;
        
        const files = this.db.getAllFiles();
        
        // Group files by type
        const typeGroups = {};
        files.forEach(file => {
            const type = this.getFileTypeCategory(file.type);
            typeGroups[type] = (typeGroups[type] || 0) + 1;
        });
        
        const typeData = Object.entries(typeGroups).map(([type, count]) => ({
            label: type,
            value: count,
            color: this.getRandomColor()
        }));
        
        this.drawPieChart(canvas, typeData, 'File Types');
    }

    renderActivityChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;
        
        const files = this.db.getAllFiles();
        
        // Group uploads by date (last 7 days)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const count = files.filter(file => {
                const fileDate = new Date(file.uploadDate);
                return fileDate >= date && fileDate < nextDate;
            }).length;
            
            last7Days.push({
                label: date.toLocaleDateString('en', { weekday: 'short' }),
                value: count
            });
        }
        
        this.drawLineChart(canvas, last7Days, 'Upload Activity (Last 7 Days)');
    }

    drawPieChart(canvas, data, title) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 300;
        const height = canvas.height = 200;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        // Draw pie slices
        let currentAngle = -Math.PI / 2;
        data.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Rubik';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const percentage = Math.round((item.value / total) * 100);
            if (percentage > 5) { // Only show label if slice is big enough
                ctx.fillText(`${percentage}%`, labelX, labelY);
            }
            
            currentAngle += sliceAngle;
        });
        
        // Draw legend
        ctx.font = '11px Rubik';
        let legendY = 10;
        data.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(10, legendY, 10, 10);
            
            ctx.fillStyle = '#333';
            ctx.textAlign = 'left';
            ctx.fillText(`${item.label} (${item.value})`, 25, legendY + 8);
            
            legendY += 20;
        });
    }

    drawBarChart(canvas, data, title) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 300;
        const height = canvas.height = 200;
        const padding = 40;
        const barWidth = (width - padding * 2) / data.length - 10;
        const maxValue = Math.max(...data.map(item => item.value));
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw bars
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - padding * 2);
            const x = padding + index * (barWidth + 10);
            const y = height - padding - barHeight;
            
            // Draw bar
            ctx.fillStyle = item.color;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw value on top
            ctx.fillStyle = '#333';
            ctx.font = '10px Rubik';
            ctx.textAlign = 'center';
            ctx.fillText(item.value, x + barWidth / 2, y - 5);
            
            // Draw label
            ctx.save();
            ctx.translate(x + barWidth / 2, height - padding + 5);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'right';
            ctx.fillText(item.label, 0, 0);
            ctx.restore();
        });
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    }

    drawLineChart(canvas, data, title) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width = 300;
        const height = canvas.height = 200;
        const padding = 40;
        const pointSpacing = (width - padding * 2) / (data.length - 1);
        const maxValue = Math.max(...data.map(item => item.value), 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height - padding * 2) * i / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw line
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((item, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points and labels
        data.forEach((item, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            
            // Draw point
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw value
            ctx.fillStyle = '#333';
            ctx.font = '10px Rubik';
            ctx.textAlign = 'center';
            ctx.fillText(item.value, x, y - 10);
            
            // Draw label
            ctx.fillText(item.label, x, height - padding + 20);
        });
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
    }

    getRandomColor() {
        const colors = [
            '#3498db', '#e74c3c', '#f39c12', '#27ae60', 
            '#9b59b6', '#1abc9c', '#34495e', '#f1c40f',
            '#e67e22', '#95a5a6', '#d35400', '#c0392b'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getFileTypeCategory(mimeType) {
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'Documents';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Presentations';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheets';
        if (mimeType.includes('image')) return 'Images';
        if (mimeType.includes('video')) return 'Videos';
        if (mimeType.includes('audio')) return 'Audio';
        return 'Other';
    }
}

// MySQL Database Manager Class
class MySQLDatabase {
    constructor(config) {
        this.config = config;
        this.connection = null;
    }
    
    async connect() {
        try {
            // For browser-based MySQL, we'll use a simple approach
            // In a real implementation, this would connect to a MySQL server
            console.log('MySQL Database Selected');
            console.log('Config:', this.config);
            
            // Simulate successful connection
            this.connection = {
                host: this.config.host,
                database: this.config.database,
                username: this.config.username,
                connected: true
            };
            
            return { success: true, message: 'Connected to MySQL database' };
        } catch (error) {
            console.error('MySQL connection error:', error);
            return { success: false, error: error.message };
        }
    }
    
    async query(sql, params = []) {
        if (!this.connection) {
            return { success: false, error: 'Not connected to database' };
        }
        
        try {
            // In a real implementation, this would execute SQL queries
            console.log('Executing SQL:', sql, params);
            
            // For now, simulate with localStorage as fallback
            const data = this.executeQuery(sql, params);
            return { success: true, data };
        } catch (error) {
            console.error('Query error:', error);
            return { success: false, error: error.message };
        }
    }
    
    executeQuery(sql, params) {
        // Simulate MySQL queries using localStorage
        const db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
        
        // Simple query simulation based on SQL pattern
        if (sql.includes('SELECT') && sql.includes('content')) {
            return db.content || [];
        } else if (sql.includes('SELECT') && sql.includes('grades')) {
            return db.grades || [];
        } else if (sql.includes('SELECT') && sql.includes('categories')) {
            return db.categories || [];
        } else if (sql.includes('SELECT') && sql.includes('files')) {
            return db.files || [];
        } else if (sql.includes('INSERT') || sql.includes('UPDATE')) {
            // For INSERT/UPDATE, we'll use the existing localStorage logic
            return { affectedRows: 1 };
        }
        
        return [];
    }
    
    async disconnect() {
        if (this.connection) {
            console.log('Disconnecting from MySQL database');
            this.connection = null;
            return { success: true };
        }
    }
}

// Database Manager Factory
class DatabaseManager {
    static create(type, config) {
        switch(type) {
            case 'mysql':
                return new MySQLDatabase(config);
            case 'localStorage':
            default:
                return new AdminDatabase();
        }
    }
}

// Enhanced Toast Notification System
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

// Enhanced AdminDashboard with CRUD Operations
class AdminDashboard {
    constructor() {
        this.db = null;
        this.currentSection = 'dashboard';
        this.toastManager = ToastManager;
        this.initializeDatabase();
    }
    
    initializeDatabase() {
        // Check for database settings
        const dbSettings = JSON.parse(localStorage.getItem('steamlms_db_settings') || '{}');
        const dbType = dbSettings.type || 'localStorage';
        
        console.log('Initializing database type:', dbType);
        
        if (dbType === 'mysql' && dbSettings.config) {
            this.db = DatabaseManager.create('mysql', dbSettings.config);
        } else {
            this.db = DatabaseManager.create('localStorage', {});
        }
        
        // Initialize the database
        if (this.db.initializeDatabase) {
            this.db.initializeDatabase();
        }
        
        // Update current database display
        this.updateCurrentDatabaseDisplay(dbType);
    }
    
    updateCurrentDatabaseDisplay(type) {
        const element = document.getElementById('current-db-type');
        if (element) {
            const typeNames = {
                'localStorage': 'Browser Storage',
                'mysql': 'MySQL Database',
                'indexedDB': 'IndexedDB',
                'json': 'JSON File System',
                'firebase': 'Firebase Cloud',
                'mongodb': 'MongoDB',
                'sqlite': 'SQLite'
            };
            element.textContent = typeNames[type] || 'Unknown';
        }
    }
    
    async updateMetrics() {
        console.log('=== UPDATE METRICS DEBUG ===');
        
        try {
            // Fetch data from MySQL API
            const [contentResponse, gradesResponse, categoriesResponse, filesResponse] = await Promise.all([
                fetch('http://localhost:3001/api/content'),
                fetch('http://localhost:3001/api/grades'),
                fetch('http://localhost:3001/api/categories'),
                fetch('http://localhost:3001/api/files')
            ]);
            
            const contentResult = await contentResponse.json();
            const gradesResult = await gradesResponse.json();
            const categoriesResult = await categoriesResponse.json();
            const filesResult = await filesResponse.json();
            
            let totalContent = 0;
            let totalGrades = 0;
            let totalCategories = 0;
            let totalFiles = 0;
            
            if (contentResult.success) {
                totalContent = contentResult.data ? contentResult.data.length : 0;
            }
            
            if (gradesResult.success) {
                totalGrades = gradesResult.data ? gradesResult.data.length : 0;
            }
            
            if (categoriesResult.success) {
                totalCategories = categoriesResult.data ? categoriesResult.data.length : 0;
            }
            
            if (filesResult.success) {
                totalFiles = filesResult.data ? filesResult.data.length : 0;
            }
            
            console.log('Metrics:', { totalContent, totalGrades, totalCategories, totalFiles });
            
            // Update stats cards
            const contentElement = document.getElementById('total-content');
            const gradesElement = document.getElementById('total-grades');
            const categoriesElement = document.getElementById('total-categories');
            const filesElement = document.getElementById('total-files');
            
            if (contentElement) contentElement.textContent = totalContent;
            if (gradesElement) gradesElement.textContent = totalGrades;
            if (categoriesElement) categoriesElement.textContent = totalCategories;
            if (filesElement) filesElement.textContent = totalFiles;
            
            // Update system status
            const dbStatusElement = document.querySelector('[data-status="database"]');
            if (dbStatusElement) {
                dbStatusElement.textContent = 'Connected';
                dbStatusElement.className = 'status-active';
            }
            
            console.log('=== UPDATE METRICS COMPLETE ===');
            
        } catch (error) {
            console.error('Error updating metrics:', error);
            // Show error in metrics
            const contentElement = document.getElementById('total-content');
            if (contentElement) {
                contentElement.textContent = 'Error';
                contentElement.style.color = '#e74c3c';
            }
        }
    }

    initializeDatabase() {
        // Initialize localStorage if empty
        if (!localStorage.getItem('steam_lms_db')) {
            const defaultData = {
                grades: [
                    { id: 'kinder', name: 'Kindergarten', description: 'Early childhood education', ageRange: '4-5 years' },
                    { id: 'grade1', name: 'Grade 1', description: 'First grade', ageRange: '6-7 years' },
                    { id: 'grade2', name: 'Grade 2', description: 'Second grade', ageRange: '7-8 years' },
                    { id: 'grade3', name: 'Grade 3', description: 'Third grade', ageRange: '8-9 years' },
                    { id: 'grade4', name: 'Grade 4', description: 'Fourth grade', ageRange: '9-10 years' },
                    { id: 'grade5', name: 'Grade 5', description: 'Fifth grade', ageRange: '10-11 years' },
                    { id: 'grade6', name: 'Grade 6', description: 'Sixth grade', ageRange: '11-12 years' },
                    { id: 'grade7', name: 'Grade 7', description: 'Seventh grade', ageRange: '12-13 years' },
                    { id: 'grade8', name: 'Grade 8', description: 'Eighth grade', ageRange: '13-14 years' },
                    { id: 'grade9', name: 'Grade 9', description: 'Ninth grade', ageRange: '14-15 years' },
                    { id: 'grade10', name: 'Grade 10', description: 'Tenth grade', ageRange: '15-16 years' },
                    { id: 'grade11', name: 'Grade 11', description: 'Eleventh grade', ageRange: '16-17 years' },
                    { id: 'grade12', name: 'Grade 12', description: 'Twelfth grade', ageRange: '17-18 years' }
                ],
                categories: [
                    { 
                        id: 'math', 
                        name: 'Mathematics', 
                        description: 'Mathematical concepts and problem-solving',
                        icon: 'fa-calculator',
                        color: '#3498db',
                        subcategories: [
                            { id: 'math-arithmetic', name: 'Arithmetic' },
                            { id: 'math-algebra', name: 'Algebra' },
                            { id: 'math-geometry', name: 'Geometry' },
                            { id: 'math-statistics', name: 'Statistics' }
                        ]
                    },
                    { 
                        id: 'science', 
                        name: 'Science', 
                        description: 'Scientific inquiry and exploration',
                        icon: 'fa-flask',
                        color: '#27ae60',
                        subcategories: [
                            { id: 'science-biology', name: 'Biology' },
                            { id: 'science-chemistry', name: 'Chemistry' },
                            { id: 'science-physics', name: 'Physics' },
                            { id: 'science-earth', name: 'Earth Science' }
                        ]
                    },
                    { 
                        id: 'technology', 
                        name: 'Technology', 
                        description: 'Digital literacy and computational thinking',
                        icon: 'fa-laptop',
                        color: '#9b59b6',
                        subcategories: [
                            { id: 'tech-coding', name: 'Programming' },
                            { id: 'tech-robotics', name: 'Robotics' },
                            { id: 'tech-web', name: 'Web Development' },
                            { id: 'tech-digital', name: 'Digital Citizenship' }
                        ]
                    },
                    { 
                        id: 'engineering', 
                        name: 'Engineering', 
                        description: 'Design thinking and problem-solving',
                        icon: 'fa-cogs',
                        color: '#e67e22',
                        subcategories: [
                            { id: 'eng-civil', name: 'Civil Engineering' },
                            { id: 'eng-mechanical', name: 'Mechanical Engineering' },
                            { id: 'eng-electrical', name: 'Electrical Engineering' },
                            { id: 'eng-aerospace', name: 'Aerospace Engineering' }
                        ]
                    },
                    { 
                        id: 'arts', 
                        name: 'Arts', 
                        description: 'Creative expression and design',
                        icon: 'fa-palette',
                        color: '#e74c3c',
                        subcategories: [
                            { id: 'arts-visual', name: 'Visual Arts' },
                            { id: 'arts-music', name: 'Music' },
                            { id: 'arts-drama', name: 'Drama' },
                            { id: 'arts-dance', name: 'Dance' }
                        ]
                    }
                ],
                content: [],
                files: [],
                settings: {
                    maxFileSize: 100, // MB
                    allowedTypes: 'pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,mp4,mp3',
                    adminEmail: 'admin@steamlms.com'
                }
            };
            
            localStorage.setItem('steam_lms_db', JSON.stringify(defaultData));
        }
    }

    getDB() {
        return JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
    }

    saveDB(data) {
        localStorage.setItem('steam_lms_db', JSON.stringify(data));
    }

    // Dashboard Stats
    getDashboardStats() {
        const db = this.getDB();
        return {
            totalContent: db.content?.length || 0,
            totalGrades: db.grades?.length || 0,
            totalCategories: db.categories?.length || 0,
            totalFiles: db.files?.length || 0
        };
    }

    getRecentUploads() {
        const db = this.getDB();
        const files = db.files || [];
        return files
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 5);
    }

    // Content Management
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

    createContent(data) {
        try {
            const db = this.getDB();
            const newContent = {
                id: this.generateId(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (!db.content) db.content = [];
            db.content.push(newContent);
            this.saveDB(db);
            
            return { success: true, data: newContent };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateContent(id, data) {
        try {
            const db = this.getDB();
            const index = db.content?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Content not found' };
            }
            
            db.content[index] = {
                ...db.content[index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            
            this.saveDB(db);
            return { success: true, data: db.content[index] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteContent(id) {
        try {
            const db = this.getDB();
            const index = db.content?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Content not found' };
            }
            
            db.content.splice(index, 1);
            this.saveDB(db);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Grade Management
    getAllGrades() {
        const db = this.getDB();
        return db.grades || [];
    }

    createGrade(data) {
        try {
            const db = this.getDB();
            const newGrade = {
                id: this.generateId(),
                ...data,
                createdAt: new Date().toISOString()
            };
            
            if (!db.grades) db.grades = [];
            db.grades.push(newGrade);
            this.saveDB(db);
            
            return { success: true, data: newGrade };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateGrade(id, data) {
        try {
            const db = this.getDB();
            const index = db.grades?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Grade not found' };
            }
            
            db.grades[index] = { ...db.grades[index], ...data };
            this.saveDB(db);
            return { success: true, data: db.grades[index] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteGrade(id) {
        try {
            const db = this.getDB();
            const index = db.grades?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Grade not found' };
            }
            
            db.grades.splice(index, 1);
            this.saveDB(db);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Category Management
    getAllCategories() {
        const db = this.getDB();
        return db.categories || [];
    }

    createCategory(data) {
        try {
            const db = this.getDB();
            const newCategory = {
                id: this.generateId(),
                ...data,
                createdAt: new Date().toISOString()
            };
            
            if (!db.categories) db.categories = [];
            db.categories.push(newCategory);
            this.saveDB(db);
            
            return { success: true, data: newCategory };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateCategory(id, data) {
        try {
            const db = this.getDB();
            const index = db.categories?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Category not found' };
            }
            
            db.categories[index] = { ...db.categories[index], ...data };
            this.saveDB(db);
            return { success: true, data: db.categories[index] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteCategory(id) {
        try {
            const db = this.getDB();
            const index = db.categories?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'Category not found' };
            }
            
            db.categories.splice(index, 1);
            this.saveDB(db);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // File Management
    getAllFiles() {
        const db = this.getDB();
        return db.files || [];
    }

    saveFile(fileData) {
        try {
            const db = this.getDB();
            if (!db.files) db.files = [];
            db.files.push(fileData);
            this.saveDB(db);
            return { success: true, data: fileData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    deleteFile(id) {
        try {
            const db = this.getDB();
            const index = db.files?.findIndex(item => item.id === id);
            
            if (index === -1) {
                return { success: false, error: 'File not found' };
            }
            
            db.files.splice(index, 1);
            this.saveDB(db);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Settings
    getSettings() {
        const db = this.getDB();
        return db.settings || {};
    }

    updateSettings(settings) {
        try {
            const db = this.getDB();
            db.settings = { ...db.settings, ...settings };
            this.saveDB(db);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Global Functions for Modal Operations
let currentEditingId = null;

async function showContentModal(contentId = null) {
    currentEditingId = contentId;
    
    // Clear form
    document.getElementById('content-title').value = '';
    document.getElementById('content-description').value = '';
    document.getElementById('content-grade').value = '';
    document.getElementById('content-category').value = '';
    document.getElementById('content-type').value = 'lesson';
    document.getElementById('subcategory-selection').innerHTML = `
        <p class="text-muted">Select a category to see available subcategories</p>
    `;
    
    try {
        // Load grades and categories from API
        const [gradesResponse, categoriesResponse] = await Promise.all([
            fetch('http://localhost:3001/api/grades'),
            fetch('http://localhost:3001/api/categories')
        ]);
        
        const gradesResult = await gradesResponse.json();
        const categoriesResult = await categoriesResponse.json();
        
        if (gradesResult.success) {
            const grades = gradesResult.data || [];
            dashboard.populateSelect('content-grade', grades, 'id', 'name', 'Select Grade');
        }
        
        if (categoriesResult.success) {
            const categories = categoriesResult.data || [];
            dashboard.populateSelect('content-category', categories, 'id', 'name', 'Select Category');
        }
        
        // Load existing content if editing
        if (contentId) {
            const response = await fetch(`http://localhost:3001/api/content?id=${contentId}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const content = result.data[0];
                document.getElementById('content-title').value = content.title || '';
                document.getElementById('content-description').value = content.description || '';
                document.getElementById('content-grade').value = content.grade_id || '';
                document.getElementById('content-category').value = content.category_id || '';
                document.getElementById('content-type').value = content.type || 'lesson';
                
                // Load subcategories for the selected category
                await loadSubcategories();
                
                // Set subcategory selections (would need to load from API)
                // This would require additional API endpoint for content subcategories
            }
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('contentModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading modal data:', error);
        dashboard.showToast('Error loading content form', 'error');
    }
}

function setupContentFileUpload() {
    const uploadZone = document.getElementById('content-upload-zone');
    const fileInput = document.getElementById('content-file-input');
    const preview = document.getElementById('content-upload-preview');
    
    if (!uploadZone || !fileInput || !preview) return;
    
    // Clear previous uploads
    preview.innerHTML = '';
    
    // Drag and drop events
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#3498db';
        uploadZone.style.backgroundColor = '#e3f2fd';
    });
    
    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#dee2e6';
        uploadZone.style.backgroundColor = '#f8f9fa';
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#dee2e6';
        uploadZone.style.backgroundColor = '#f8f9fa';
        handleContentFiles(e.dataTransfer.files);
    });
    
    // File input change event
    fileInput.addEventListener('change', (e) => {
        handleContentFiles(e.target.files);
    });
}

function handleContentFiles(files) {
    const preview = document.getElementById('content-upload-preview');
    if (!preview) return;
    
    const settings = dashboard.db.getSettings();
    const maxSize = settings.maxFileSize * 1024 * 1024;
    const allowedTypes = settings.allowedTypes.split(',').map(type => type.trim().toLowerCase());
    
    console.log('=== DEBUG FILE UPLOAD ===');
    console.log('Allowed types:', allowedTypes);
    
    Array.from(files).forEach(file => {
        console.log('---');
        console.log('File name:', file.name);
        console.log('File type:', file.type);
        
        // Simple extension test
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        console.log('Extension:', fileExtension);
        console.log('Is allowed?', allowedTypes.includes(fileExtension));
        
        // Just allow the file for now to test
        if (file.size > maxSize) {
            alert(`${file.name} exceeds maximum size limit (${settings.maxFileSize}MB)`);
            return;
        }
        
        // TEMPORARILY SKIP VALIDATION TO TEST
        // if (!allowedTypes.includes(fileExtension)) {
        //     alert(`${file.name} has an unsupported file type (${fileExtension}). Allowed: ${settings.allowedTypes}`);
        //     return;
        // }
        
        // Create preview item
        const previewItem = document.createElement('div');
        previewItem.className = 'upload-preview-item mb-2';
        previewItem.innerHTML = `
            <div class="d-flex align-items-center justify-content-between p-2 border rounded">
                <div class="d-flex align-items-center">
                    <i class="fas fa-file me-2 text-primary"></i>
                    <div>
                        <div class="fw-bold">${file.name}</div>
                        <small class="text-muted">${formatFileSize(file.size)}</small>
                    </div>
                </div>
                <div class="upload-status">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span class="visually-hidden">Uploading...</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="this.closest('.upload-preview-item').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        preview.appendChild(previewItem);
        
        // Read and save file
        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('FileReader completed for:', file.name);
            
            const fileData = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                uploadDate: new Date().toISOString()
            };
            
            console.log('File data created:', fileData);
            
            // Save to database with better error handling
            try {
                let db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
                console.log('Current DB before save:', db);
                
                if (!db.files) {
                    db.files = [];
                }
                
                // Check localStorage quota before saving
                const currentSize = new Blob([localStorage.getItem('steam_lms_db')]).size;
                const newItemSize = new Blob([JSON.stringify(fileData)]).size;
                console.log('Current storage size:', currentSize, 'bytes');
                console.log('New item size:', newItemSize, 'bytes');
                
                db.files.push(fileData);
                console.log('DB after adding file:', db.files.length, 'files');
                
                // Try to save with quota check
                try {
                    localStorage.setItem('steam_lms_db', JSON.stringify(db));
                    console.log('Database saved successfully');
                    
                    // Verify save
                    const verifyDB = JSON.parse(localStorage.getItem('steam_lms_db'));
                    console.log('Verification - file count:', verifyDB.files?.length || 0);
                    
                    // Update preview
                    const statusDiv = previewItem.querySelector('.upload-status');
                    statusDiv.innerHTML = `
                        <i class="fas fa-check-circle text-success me-2"></i>
                        <span class="text-success small">Uploaded</span>
                        <input type="checkbox" name="associated-files" value="${fileData.id}" checked style="margin-left: 10px;">
                    `;
                    
                    // Refresh file list
                    loadAvailableFiles();
                    
                    dashboard.showToast(`${file.name} uploaded successfully`, 'success');
                    
                } catch (storageError) {
                    console.error('Storage quota error:', storageError);
                    if (storageError.name === 'QuotaExceededError') {
                        throw new Error('Storage quota exceeded. File is too large for browser storage.');
                    } else {
                        throw storageError;
                    }
                }
                
            } catch (error) {
                console.error('Database save error:', error);
                const statusDiv = previewItem.querySelector('.upload-status');
                statusDiv.innerHTML = `
                    <i class="fas fa-exclamation-circle text-danger me-2"></i>
                    <span class="text-danger small">Save Error</span>
                `;
                
                dashboard.showToast(`Error saving ${file.name}: ${error.message}`, 'error');
            }
        };
        
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            console.error('File details:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            const statusDiv = previewItem.querySelector('.upload-status');
            statusDiv.innerHTML = `
                <i class="fas fa-exclamation-circle text-danger me-2"></i>
                <span class="text-danger small">File Read Error</span>
            `;
            
            dashboard.showToast(`Error reading ${file.name}: ${error.message || 'Unknown error'}`, 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showGradeModal(gradeId = null) {
    currentEditingId = gradeId;
    const modal = new bootstrap.Modal(document.getElementById('gradeModal'));
    
    if (gradeId) {
        const grade = dashboard.db.getAllGrades().find(g => g.id === gradeId);
        if (grade) {
            document.getElementById('grade-name').value = grade.name || '';
            document.getElementById('grade-description').value = grade.description || '';
            document.getElementById('grade-age-range').value = grade.ageRange || '';
        }
    } else {
        document.getElementById('grade-form').reset();
    }
    
    modal.show();
}

function showCategoryModal(categoryId = null) {
    currentEditingId = categoryId;
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    
    if (categoryId) {
        const category = dashboard.db.getAllCategories().find(c => c.id === categoryId);
        if (category) {
            document.getElementById('category-name').value = category.name || '';
            document.getElementById('category-description').value = category.description || '';
            document.getElementById('category-subcategories').value = 
                category.subcategories ? category.subcategories.join(', ') : '';
        }
    } else {
        document.getElementById('category-form').reset();
    }
    
    modal.show();
}

function showUploadModal() {
    dashboard.showSection('uploads');
}

function loadAvailableFiles() {
    const db = dashboard.db.getDB();
    const files = db.files || [];
    const container = document.getElementById('file-association');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="text-muted">No files available. Upload files first.</p>';
        return;
    }
    
    container.innerHTML = files.map(file => `
        <div class="file-checkbox-item">
            <label class="checkbox-label">
                <input type="checkbox" name="associated-files" value="${file.id}">
                <span class="checkmark"></span>
                <div class="file-info-small">
                    <i class="fas fa-file me-2 text-primary"></i>
                    <span>${file.name}</span>
                    <small>${formatFileSize(file.size)}</small>
                </div>
            </label>
        </div>
    `).join('');
}

function loadAssociatedFiles(associatedFileIds) {
    const db = dashboard.db.getDB();
    const files = db.files || [];
    const container = document.getElementById('file-association');
    
    container.innerHTML = files.map(file => `
        <div class="file-checkbox-item">
            <label class="checkbox-label">
                <input type="checkbox" name="associated-files" value="${file.id}" 
                    ${associatedFileIds.includes(file.id) ? 'checked' : ''}>
                <span class="checkmark"></span>
                <div class="file-info-small">
                    <i class="fas fa-file me-2 text-primary"></i>
                    <span>${file.name}</span>
                    <small>${formatFileSize(file.size)}</small>
                </div>
            </label>
        </div>
    `).join('');
}

function saveContent() {
    console.log('=== SAVE CONTENT DEBUG ===');
    
    try {
        const title = document.getElementById('content-title').value.trim();
        const description = document.getElementById('content-description').value.trim();
        const gradeId = document.getElementById('content-grade').value;
        const categoryId = document.getElementById('content-category').value;
        const subcategoryId = document.getElementById('content-subcategory').value;
        const contentType = document.getElementById('content-type').value;
        const contentText = document.getElementById('content-text').value.trim();
        
        console.log('Form data:', { title, description, gradeId, categoryId, subcategoryId, contentType, contentText });
        
        if (!title || !description || !gradeId || !categoryId || !contentType) {
            this.showToast('Please fill all required fields', 'warning');
            return;
        }
        
        // Get associated files
        const fileElements = document.querySelectorAll('.file-preview-item');
        const files = Array.from(fileElements).map(el => ({
            id: el.dataset.fileId,
            name: el.querySelector('.file-name').textContent,
            size: el.querySelector('.file-size').textContent,
            type: el.querySelector('.file-type').textContent
        }));
        
        console.log('Associated files:', files);
        
        const contentData = {
            id: currentEditingId || this.generateId(),
            title,
            description,
            gradeId,
            categoryId,
            subcategoryId,
            contentType,
            content: contentText,
            files,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Saving content data:', contentData);
        
        // Save to localStorage
        let result;
        if (currentEditingId) {
            result = this.db.updateContent(currentEditingId, contentData);
        } else {
            result = this.db.createContent(contentData);
        }
        
        console.log('Save result:', result);
        
        if (result.success) {
            console.log('Content saved successfully:', result.data);
            
            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
            if (modal) {
                modal.hide();
            }
            currentEditingId = null;
            
            // Refresh dashboard
            if (dashboard) {
                dashboard.updateMetrics();
                dashboard.loadContentData();
            }
            
            this.showToast('Content saved successfully!', 'success');
            console.log('=== SAVE CONTENT SUCCESS ===');
        } else {
            console.error('Save error:', result.error);
            this.showToast('Error saving content: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Unexpected error in saveContent:', error);
        this.showToast('Unexpected error: ' + error.message, 'error');
    }
}

function saveGrade() {
    const name = document.getElementById('grade-name').value.trim();
    const description = document.getElementById('grade-description').value.trim();
    const ageRange = document.getElementById('grade-age-range').value.trim();
    
    if (!name) {
        dashboard.showToast('Grade name is required', 'error');
        return;
    }
    
    const gradeData = {
        name,
        description,
        ageRange
    };
    
    let result;
    if (currentEditingId) {
        result = dashboard.updateGrade(currentEditingId, gradeData);
    } else {
        result = dashboard.createGrade(gradeData);
    }
    
    if (result.success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('gradeModal'));
        modal.hide();
        currentEditingId = null;
    }
}

function saveCategory() {
    const name = document.getElementById('category-name').value.trim();
    const description = document.getElementById('category-description').value.trim();
    const subcategoriesInput = document.getElementById('category-subcategories').value.trim();
    
    if (!name) {
        dashboard.showToast('Category name is required', 'error');
        return;
    }
    
    const subcategories = subcategoriesInput ? 
        subcategoriesInput.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const categoryData = {
        name,
        description,
        subcategories
    };
    
    let result;
    if (currentEditingId) {
        result = dashboard.updateCategory(currentEditingId, categoryData);
    } else {
        result = dashboard.createCategory(categoryData);
    }
    
    if (result.success) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();
        currentEditingId = null;
    }
}

async function loadSubcategories() {
    const categoryId = document.getElementById('content-category').value;
    const subcategoryContainer = document.getElementById('subcategory-selection');
    
    if (!categoryId) {
        // Hide everything when no category selected
        subcategoryContainer.innerHTML = `
            <p class="text-muted">Select a category to see available subcategories</p>
        `;
        return;
    }
    
    try {
        // Fetch subcategories from MySQL API
        const response = await fetch(`http://localhost:3001/api/subcategories?category_id=${categoryId}`);
        const result = await response.json();
        
        if (result.success) {
            const subcategories = result.data || [];
            
            if (subcategories.length === 0) {
                subcategoryContainer.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="all-categories" value="all">
                        <label class="form-check-label" for="all-categories">
                            <strong>All Categories (Content applies to all subcategories)</strong>
                        </label>
                    </div>
                    <p class="text-muted">No subcategories available for this category</p>
                `;
                return;
            }
            
            let html = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="all-categories" value="all" onchange="toggleAllSubcategories()">
                    <label class="form-check-label" for="all-categories">
                        <strong>All Categories (Content applies to all subcategories)</strong>
                    </label>
                </div>
                <hr>
                <div class="subcategory-list">
            `;
            
            subcategories.forEach(subcategory => {
                // Ensure subcategory has proper properties
                const subId = subcategory.id || `sub-${Math.random().toString(36).substr(2, 9)}`;
                const subName = subcategory.name || 'Unknown Subcategory';
                
                html += `
                    <div class="form-check">
                        <input class="form-check-input subcategory-checkbox" type="checkbox" 
                            id="sub-${subId}" value="${subId}" onchange="updateAllCheckbox()">
                        <label class="form-check-label" for="sub-${subId}">
                            ${subName}
                        </label>
                    </div>
                `;
            });
            
            html += `</div>`;
            subcategoryContainer.innerHTML = html;
        } else {
            console.error('API error:', result.error);
            subcategoryContainer.innerHTML = `
                <p class="text-danger">Error loading subcategories: ${result.error}</p>
            `;
        }
    } catch (error) {
        console.error('Network error:', error);
        subcategoryContainer.innerHTML = `
            <p class="text-danger">Network error loading subcategories</p>
        `;
    }
}

function toggleAllSubcategories() {
    const allCheckbox = document.getElementById('all-categories');
    const subcategoryCheckboxes = document.querySelectorAll('.subcategory-checkbox');
    
    subcategoryCheckboxes.forEach(checkbox => {
        checkbox.checked = allCheckbox.checked;
        checkbox.disabled = allCheckbox.checked;
    });
}

function updateAllCheckbox() {
    const allCheckbox = document.getElementById('all-categories');
    const subcategoryCheckboxes = document.querySelectorAll('.subcategory-checkbox');
    const checkedCount = document.querySelectorAll('.subcategory-checkbox:checked').length;
    
    // Uncheck "all" if any subcategory is manually unchecked
    if (checkedCount < subcategoryCheckboxes.length) {
        allCheckbox.checked = false;
    }
}

function getSelectedSubcategories() {
    const allCheckbox = document.getElementById('all-categories');
    if (allCheckbox && allCheckbox.checked) {
        return ['all'];
    }
    
    const subcategoryCheckboxes = document.querySelectorAll('.subcategory-checkbox:checked');
    return Array.from(subcategoryCheckboxes).map(cb => cb.value);
}

function editContent(contentId) {
    const db = JSON.parse(localStorage.getItem('steam_lms_db') || '{}');
    const content = db.content || [];
    const item = content.find(c => c.id === contentId);
    
    if (!item) {
        dashboard.showToast('Content not found', 'error');
        return;
    }
    
    // Populate form with existing data
    document.getElementById('content-title').value = item.title || '';
    document.getElementById('content-description').value = item.description || '';
    document.getElementById('content-grade').value = item.gradeId || '';
    document.getElementById('content-type').value = item.type || '';
    
    // Set category first, then load subcategories
    document.getElementById('content-category').value = item.categoryId || '';
    loadSubcategories();
    
    // Set subcategories after they're loaded
    setTimeout(() => {
        if (item.subcategories && item.subcategories.length > 0) {
            if (item.subcategories.includes('all')) {
                // Check "all categories"
                const allCheckbox = document.getElementById('all-categories');
                if (allCheckbox) {
                    allCheckbox.checked = true;
                    toggleAllSubcategories();
                }
            } else {
                // Check specific subcategories
                item.subcategories.forEach(subId => {
                    const checkbox = document.getElementById(`sub-${subId}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        }
    }, 100);
    
    // Load associated files
    if (item.files && item.files.length > 0) {
        loadAssociatedFiles(item.files);
    } else {
        loadAvailableFiles();
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
    modal.show();
    
    currentEditingId = contentId;
}

function viewFile(fileId) {
    const file = dashboard.db.getAllFiles().find(f => f.id === fileId);
    if (!file) {
        dashboard.showToast('File not found', 'error');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('fileViewerModal'));
    const contentDiv = document.getElementById('file-viewer-content');
    
    // Display file based on type
    if (file.type.includes('image')) {
        contentDiv.innerHTML = `
            <div class="text-center">
                <img src="${file.data}" alt="${file.name}" class="img-fluid" style="max-height: 500px;">
                <h5 class="mt-3">${file.name}</h5>
                <p class="text-muted">Size: ${dashboard.formatFileSize(file.size)}</p>
            </div>
        `;
    } else if (file.type.includes('text') || file.type.includes('pdf')) {
        contentDiv.innerHTML = `
            <div class="file-preview">
                <div class="file-icon-large">
                    <i class="fas fa-file-${dashboard.getFileIcon(file.type)}"></i>
                </div>
                <h4>${file.name}</h4>
                <p class="text-muted">Type: ${file.type}</p>
                <p class="text-muted">Size: ${dashboard.formatFileSize(file.size)}</p>
                <p class="text-muted">Uploaded: ${dashboard.formatDate(file.uploadDate)}</p>
            </div>
        `;
    } else {
        contentDiv.innerHTML = `
            <div class="file-preview">
                <div class="file-icon-large">
                    <i class="fas fa-file-${dashboard.getFileIcon(file.type)}"></i>
                </div>
                <h4>${file.name}</h4>
                <p class="text-muted">Type: ${file.type}</p>
                <p class="text-muted">Size: ${dashboard.formatFileSize(file.size)}</p>
                <p class="text-muted">Uploaded: ${dashboard.formatDate(file.uploadDate)}</p>
                <p class="text-info">Preview not available for this file type. Download to view.</p>
            </div>
        `;
    }
    
    // Setup download button
    const downloadBtn = document.getElementById('download-file-btn');
    downloadBtn.onclick = () => downloadFile(file);
    
    modal.show();
}

function downloadFile(file) {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    dashboard.showToast(`Downloading ${file.name}...`, 'success');
}

function showDatabaseModal() {
    const modal = new bootstrap.Modal(document.getElementById('databaseModal'));
    modal.show();
}

function showDatabaseOptions() {
    const dbType = document.getElementById('database-type').value;
    const optionsContainer = document.getElementById('database-options');
    
    const options = {
        localStorage: {
            description: 'Browser localStorage - Simple, no setup required',
            pros: 'No setup, works offline, instant',
            cons: 'Limited storage (~5MB), browser-specific',
            config: ''
        },
        indexedDB: {
            description: 'Browser IndexedDB - More storage, better performance',
            pros: 'Larger storage (~250MB), better performance, works offline',
            cons: 'Browser-specific, more complex API',
            config: ''
        },
        json: {
            description: 'JSON File System - Store data in JSON files',
            pros: 'Easy backup, version control, portable',
            cons: 'Requires server setup, file permissions',
            config: `
                <div class="mb-3">
                    <label class="form-label">JSON File Path</label>
                    <input type="text" class="form-control" id="json-path" placeholder="./data/database.json">
                </div>
            `
        },
        firebase: {
            description: 'Firebase Cloud Database - Real-time, cloud-based',
            pros: 'Real-time sync, cloud storage, easy setup',
            cons: 'Requires Firebase account, internet connection',
            config: `
                <div class="mb-3">
                    <label class="form-label">Firebase Config</label>
                    <textarea class="form-control" id="firebase-config" rows="3" placeholder="Paste Firebase configuration here"></textarea>
                </div>
            `
        },
        mysql: {
            description: 'MySQL Database - Professional relational database',
            pros: 'Robust, scalable, industry standard',
            cons: 'Requires MySQL server, setup complexity',
            config: `
                <div class="mb-3">
                    <label class="form-label">Database Host</label>
                    <input type="text" class="form-control" id="mysql-host" placeholder="localhost">
                </div>
                <div class="mb-3">
                    <label class="form-label">Database Name</label>
                    <input type="text" class="form-control" id="mysql-dbname" placeholder="steamlms">
                </div>
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="mysql-username" placeholder="root">
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" id="mysql-password">
                </div>
            `
        },
        mongodb: {
            description: 'MongoDB Database - NoSQL, flexible schema',
            pros: 'Flexible schema, scalable, modern',
            cons: 'Requires MongoDB server, different query language',
            config: `
                <div class="mb-3">
                    <label class="form-label">MongoDB URI</label>
                    <input type="text" class="form-control" id="mongodb-uri" placeholder="mongodb://localhost:27017/steamlms">
                </div>
            `
        },
        sqlite: {
            description: 'SQLite Database - Serverless, file-based',
            pros: 'No server needed, portable, reliable',
            cons: 'Limited concurrency, single file',
            config: `
                <div class="mb-3">
                    <label class="form-label">SQLite File Path</label>
                    <input type="text" class="form-control" id="sqlite-path" placeholder="./data/steamlms.db">
                </div>
            `
        }
    };
    
    const option = options[dbType];
    
    optionsContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${option.description}</h6>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Pros:</strong>
                        <ul class="small text-success">
                            <li>${option.pros}</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <strong>Cons:</strong>
                        <ul class="small text-warning">
                            <li>${option.cons}</li>
                        </ul>
                    </div>
                </div>
                ${option.config}
            </div>
        </div>
    `;
}

function saveDatabaseSettings() {
    const dbType = document.getElementById('database-type').value;
    
    // Get configuration based on type
    let config = {};
    
    switch(dbType) {
        case 'json':
            config.path = document.getElementById('json-path')?.value || './data/database.json';
            break;
        case 'firebase':
            config.firebase = document.getElementById('firebase-config')?.value || '';
            break;
        case 'mysql':
            config.host = document.getElementById('mysql-host')?.value || 'localhost';
            config.database = document.getElementById('mysql-dbname')?.value || 'steamlms';
            config.username = document.getElementById('mysql-username')?.value || 'root';
            config.password = document.getElementById('mysql-password')?.value || '';
            break;
        case 'mongodb':
            config.uri = document.getElementById('mongodb-uri')?.value || 'mongodb://localhost:27017/steamlms';
            break;
        case 'sqlite':
            config.path = document.getElementById('sqlite-path')?.value || './data/steamlms.db';
            break;
    }
    
    // Save database settings
    localStorage.setItem('steamlms_db_settings', JSON.stringify({
        type: dbType,
        config: config
    }));
    
    // Show migration message
    dashboard.showToast(`Database settings saved. Migration to ${dbType} will be implemented next.`, 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('databaseModal'));
    modal.hide();
    
    console.log('Database settings saved:', { type: dbType, config });
}

function saveSettings() {
    const settings = {
        maxFileSize: parseInt(document.getElementById('max-file-size').value),
        allowedTypes: document.getElementById('allowed-types').value,
        adminEmail: document.getElementById('admin-email').value
    };
    
    const result = dashboard.db.updateSettings(settings);
    if (result.success) {
        dashboard.showToast('Settings saved successfully', 'success');
    } else {
        dashboard.showToast('Error saving settings', 'error');
    }
}

// Enhanced file association styles
const additionalCSS = `
<style>
.file-checkbox-item {
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    transition: background-color 0.3s ease;
}

.file-checkbox-item:hover {
    background-color: #f8f9fa;
}

.file-info-small {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 2rem;
}

.file-info-small i {
    color: var(--admin-primary);
}

.file-preview {
    text-align: center;
    padding: 2rem;
}

.file-icon-large {
    font-size: 4rem;
    color: var(--admin-primary);
    margin-bottom: 1rem;
}

.file-preview h4 {
    color: var(--admin-primary);
    margin-bottom: 1rem;
}

.file-preview p {
    margin-bottom: 0.5rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalCSS);

// Initialize Dashboard
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    console.log('=== ADMIN INITIALIZATION ===');
    
    // Check authentication before initializing dashboard
    if (!auth.isLoggedIn()) {
        console.log('User not logged in, redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }
    
    console.log('User authenticated, initializing dashboard');
    
    // Initialize dashboard
    dashboard = new AdminDashboard();
    
    // Setup navigation
    setupNavigation();
    
    // Load initial data
    dashboard.loadContentData();
    

// Navigation setup
function setupNavigation() {
    console.log('=== SETUP NAVIGATION DEBUG ===');
    
    try {
        // Get all menu links
        const menuLinks = document.querySelectorAll('.menu-link');
        const sections = document.querySelectorAll('.content-section');
        
        console.log('Found menu links:', menuLinks.length);
        console.log('Found sections:', sections.length);
        
        if (menuLinks.length === 0) {
            console.error('No menu links found!');
            return;
        }
        
        if (sections.length === 0) {
            console.error('No sections found!');
            return;
        }
        
        // Add click handlers to menu links
        menuLinks.forEach((link, index) => {
            console.log(`Setting up menu link ${index}:`, link.getAttribute('href'));
            
            // Remove any existing event listeners
            link.removeEventListener('click', handleMenuClick);
            
            // Add new event listener
            link.addEventListener('click', handleMenuClick);
        });
        
        // Show initial section based on hash
        const initialSection = window.location.hash.substring(1) || 'dashboard';
        console.log('Initial section:', initialSection);
        showSection(initialSection);
        
        console.log('=== NAVIGATION SETUP COMPLETE ===');
    } catch (error) {
        console.error('Error setting up navigation:', error);
    }
}

// Handle menu click
function handleMenuClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    console.log('Navigation clicked:', targetId);
    showSection(targetId);
}

// Section management
function showSection(sectionId) {
    console.log('=== SHOW SECTION DEBUG ===');
    console.log('Target section ID:', sectionId);
    
    try {
        // Update active menu state
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
                console.log('Added active class to:', link.getAttribute('href'));
            }
        });
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        console.log('Found sections to hide:', sections.length);
        
        sections.forEach((section, index) => {
            section.style.display = 'none';
            console.log(`Hidden section ${index}:`, section.id);
        });
        
        // Fix section ID mapping
        const sectionIdMap = {
            'dashboard': 'dashboard-section',
            'content': 'content-section', 
            'grades': 'grades-section',
            'categories': 'categories-section',
            'uploads': 'uploads-section',
            'metrics': 'metrics-section',
            'settings': 'settings-section'
        };
        
        const actualSectionId = sectionIdMap[sectionId] || sectionId;
        console.log('Mapped section ID:', actualSectionId);
        
        // Show target section
        const targetSection = document.getElementById(actualSectionId);
        console.log('Target section found:', !!targetSection);
        
        if (targetSection) {
            console.log('Showing target section:', actualSectionId);
            targetSection.style.display = 'block';
            
            // Load section-specific data
            switch(sectionId) {
                case 'dashboard':
                    console.log('Loading dashboard section');
                    if (dashboard) {
                        dashboard.updateMetrics();
                        dashboard.renderCharts();
                    }
                    break;
                case 'content':
                    console.log('Loading content section');
                    if (dashboard) {
                        dashboard.loadContentData();
                    }
                    break;
                case 'grades':
                    console.log('Loading grades section');
                    if (dashboard) {
                        dashboard.loadGradesData();
                    }
                    break;
                case 'categories':
                    console.log('Loading categories section');
                    if (dashboard) {
                        dashboard.loadCategoriesData();
                    }
                    break;
                case 'uploads':
                    console.log('Loading uploads section');
                    if (dashboard) {
                        dashboard.loadUploadsData();
                    }
                    break;
                case 'metrics':
                    console.log('Loading metrics section');
                    if (dashboard) {
                        dashboard.updateMetrics();
                        dashboard.renderCharts();
                    }
                    break;
                case 'settings':
                    console.log('Loading settings section');
                    if (dashboard) {
                        dashboard.loadSettingsData();
                    }
                    break;
                default:
                    console.error('Unknown section:', sectionId);
                    ToastManager.show('Unknown section: ' + sectionId, 'error');
                    return;
            }
            
            // Update URL hash
            window.location.hash = sectionId;
            console.log('Updated URL hash to:', sectionId);
        } else {
            console.error('Section not found:', actualSectionId);
            ToastManager.show('Section not found: ' + actualSectionId, 'error');
        }
        
        console.log('=== SHOW SECTION COMPLETE ===');
    } catch (error) {
        console.error('Error showing section:', error);
        ToastManager.show('Error showing section: ' + error.message, 'error');
    }
}

window.clearDatabase = function() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.removeItem('steam_lms_db');
        console.log('Database cleared');
        location.reload();
    }
};
    
    // Add clear database shortcut
    window.clearDatabase = function() {
        if (confirm('Are you sure you want to clear the entire database? This cannot be undone!')) {
            localStorage.removeItem('steam_lms_db');
            console.log('Database cleared! Refresh the page to reinitialize.');
            alert('Database cleared! Refresh the page to start fresh.');
        }
    };
    
    console.log('Database shortcuts added!');
    console.log('Type viewDatabase() in console to see your data');
    console.log('Type clearDatabase() in console to clear all data');
});
