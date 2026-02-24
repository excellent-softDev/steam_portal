// Simple Admin Dashboard - Working Version
class SimpleAdminDashboard {
    constructor() {
        console.log('🎯 Simple Admin Dashboard initialized!');
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing dashboard...');
        this.setupNavigation();
        this.loadEditModal();
        this.loadGradeModal();
        this.loadCategoryModal();
        await this.loadAllData();
        await this.populateFilters();
        this.setupStandaloneFileUpload();
    }
    
    async loadAllData() {
        console.log('📊 Loading all data...');
        
        try {
            // Load all data from API
            const [contentResponse, gradesResponse, categoriesResponse, filesResponse] = await Promise.all([
                fetch('http://localhost:3000/api/content'),
                fetch('http://localhost:3000/api/grades'),
                fetch('http://localhost:3000/api/categories'),
                fetch('http://localhost:3000/api/files')
            ]);
            
            const content = await contentResponse.json();
            const grades = await gradesResponse.json();
            const categories = await categoriesResponse.json();
            const files = await filesResponse.json();
            
            console.log('📈 Data loaded:', { content, grades, categories, files });
            
            // Store data globally
            this.contentData = content.data || [];
            this.gradesData = grades.data || [];
            this.categoriesData = categories.data || [];
            this.filesData = files.data || [];
            
            // Update dashboard metrics
            this.updateMetrics(content, grades, categories, files);
            
            // Display content table
            this.displayContent(this.contentData);
            
            // Display grades table
            this.displayGrades(this.gradesData);
            
            // Display categories table
            this.displayCategories(this.categoriesData);
            
            // Display files list
            this.displayFiles(this.filesData);
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError('Failed to load data: ' + error.message);
        }
    }
    
    loadCategoryModal() {
        // Load category modal HTML directly
        const modalHTML = `
            <div class="modal fade" id="categoryModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-tags me-2"></i>
                                <span id="category-modal-title">Add New Category</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="categoryForm">
                                <input type="hidden" id="category-id">
                                
                                <div class="row">
                                    <div class="col-md-8">
                                        <label for="category-name" class="form-label">Category Name *</label>
                                        <input type="text" class="form-control" id="category-name" required 
                                               placeholder="e.g., Mathematics, Science, Technology, Engineering, Arts">
                                        <div class="form-text">Enter a descriptive name for the STEAM category</div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="category-color" class="form-label">Color Theme</label>
                                        <select class="form-select" id="category-color">
                                            <option value="">Select Color</option>
                                            <option value="#FF6B6B">🟡 Yellow</option>
                                            <option value="#4ECDC4">🟢 Green</option>
                                            <option value="#339AF0">🔵 Blue</option>
                                            <option value="#F44336">🔴 Red</option>
                                            <option value="#9B59B6">🟣 Purple</option>
                                            <option value="#FF9800">🟠 Orange</option>
                                            <option value="#6C757D">🟦 Brown</option>
                                            <option value="#17A2B8">🟦 Dark Blue</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="category-description" class="form-label">Description</label>
                                    <textarea class="form-control" id="category-description" rows="4" 
                                              placeholder="Describe the learning objectives, topics, and skills covered in this STEAM category..."></textarea>
                                    <div class="form-text">Provide details about what students will learn and the key concepts covered</div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <label for="category-icon" class="form-label">Icon</label>
                                        <select class="form-select" id="category-icon">
                                            <option value="">Select Icon</option>
                                            <option value="fa-calculator">🧮 Calculator</option>
                                            <option value="fa-flask">🧪 Science</option>
                                            <option value="fa-laptop-code">💻 Technology</option>
                                            <option value="fa-cogs">⚙️ Engineering</option>
                                            <option value="fa-palette">🎨 Arts</option>
                                            <option value="fa-book">📚 General</option>
                                            <option value="fa-graduation-cap">🎓 Education</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="category-order" class="form-label">Display Order</label>
                                        <input type="number" class="form-control" id="category-order" 
                                               min="1" max="99" value="1"
                                               placeholder="Order for display (1 = first)">
                                        <div class="form-text">Lower numbers appear first in the list</div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">
                                        <input type="checkbox" class="form-check-input" id="category-active" checked>
                                        <label class="form-check-label" for="category-active">
                                            <strong>Active Category</strong>
                                            <span class="text-muted">(Students can select this category when creating content)</span>
                                        </label>
                                    </label>
                                    <div class="form-text">When checked, this category will be available for content creation</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancel
                            </button>
                            <button type="button" class="btn btn-danger" id="delete-category-btn" style="display: none;">
                                <i class="fas fa-trash me-2"></i>Delete
                            </button>
                            <button type="button" class="btn btn-primary" id="save-category-btn">
                                <i class="fas fa-save me-2"></i><span id="category-save-text">Add Category</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('category-modal-container').innerHTML = modalHTML;
        this.setupCategoryModalEvents();
        console.log('✅ Enhanced category modal created');
    }
    
    setupCategoryModalEvents() {
        const saveBtn = document.getElementById('save-category-btn');
        const deleteBtn = document.getElementById('delete-category-btn');
        const dashboard = this; // Store reference to current dashboard instance
        
        console.log('🔍 Found category elements:', { 
            saveBtn: !!saveBtn, 
            deleteBtn: !!deleteBtn 
        });
        
        if (saveBtn) {
            console.log('✅ Adding category save button event listener...');
            saveBtn.addEventListener('click', function() {
                console.log('🖱️ Category save button clicked!');
                dashboard.saveCategory(); // Use stored reference
            });
        } else {
            console.error('❌ Category save button not found!');
        }
        
        if (deleteBtn) {
            console.log('✅ Adding category delete button event listener...');
            deleteBtn.addEventListener('click', function() {
                console.log('🗑️ Category delete button clicked!');
                dashboard.deleteCategoryFromModal(); // Use stored reference
            });
        } else {
            console.error('❌ Category delete button not found!');
        }
        
        console.log('✅ Category modal events setup complete');
    }
    
    loadGradeModal() {
        console.log('🏗️ Starting grade modal creation...');
        
        // Create grade modal HTML directly
        const modalHTML = `
            <div class="modal fade" id="gradeModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-graduation-cap me-2"></i>
                                <span id="grade-modal-title">Add New Grade</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="gradeForm">
                                <input type="hidden" id="grade-id">
                                
                                <div class="mb-3">
                                    <label for="grade-name" class="form-label">Grade Name *</label>
                                    <input type="text" class="form-control" id="grade-name" required 
                                           placeholder="e.g., Grade 1, Kindergarten, 9th Grade">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="grade-age-range" class="form-label">Age Range *</label>
                                    <input type="text" class="form-control" id="grade-age-range" required 
                                           placeholder="e.g., 5-6 years, 14-15 years">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="grade-description" class="form-label">Description</label>
                                    <textarea class="form-control" id="grade-description" rows="3" 
                                              placeholder="Describe grade level and learning objectives..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="delete-grade-btn" style="display: none;">
                                <i class="fas fa-trash me-2"></i>Delete
                            </button>
                            <button type="button" class="btn btn-primary" id="save-grade-btn">
                                <i class="fas fa-save me-2"></i><span id="grade-save-text">Add Grade</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('📝 Modal HTML created, length:', modalHTML.length);
        
        // Check if container exists
        const container = document.getElementById('grade-modal-container');
        if (!container) {
            console.error('❌ Grade modal container not found!');
            return;
        }
        
        container.innerHTML = modalHTML;
        console.log('✅ Modal HTML inserted into container');
        
        // Wait a bit for DOM to update, then setup events
        setTimeout(() => {
            this.setupGradeModalEvents();
            console.log('✅ Grade modal events setup complete');
        }, 100);
    }
    
    setupGradeModalEvents() {
        console.log('🔧 Setting up grade modal events...');
        
        const saveBtn = document.getElementById('save-grade-btn');
        const deleteBtn = document.getElementById('delete-grade-btn');
        const dashboard = this; // Store reference to current dashboard instance
        
        console.log('🔍 Found elements:', { 
            saveBtn: !!saveBtn, 
            deleteBtn: !!deleteBtn 
        });
        
        if (saveBtn) {
            console.log('✅ Adding save button event listener...');
            saveBtn.addEventListener('click', function() {
                console.log('🖱️ Save button clicked!');
                dashboard.saveGrade(); // Use stored reference
            });
        } else {
            console.error('❌ Save button not found!');
        }
        
        if (deleteBtn) {
            console.log('✅ Adding delete button event listener...');
            deleteBtn.addEventListener('click', function() {
                console.log('🗑️ Delete button clicked!');
                dashboard.deleteGradeFromModal(); // Use stored reference
            });
        } else {
            console.error('❌ Delete button not found!');
        }
    }
    
    populateSelect(selectId, data, valueField, textField, placeholder) {
        console.log(`📝 Populating select: ${selectId} with ${data.length} items`);
        
        const select = document.getElementById(selectId);
        if (!select) {
            console.error(`❌ Select element not found: ${selectId}`);
            return;
        }
        
        select.innerHTML = `<option value="">${placeholder}</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            select.appendChild(option);
        });
        
        console.log(`✅ Select populated: ${selectId}`);
    }
    
    loadEditModal() {
        // Load modal HTML directly
        const modalHTML = `
            <div class="modal fade" id="editContentModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-edit me-2"></i>
                                <span id="modal-title">Edit Content</span>
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" id="edit-content-id">
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Title</label>
                                    <input type="text" class="form-control" id="edit-content-title" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Content Type</label>
                                    <select class="form-select" id="edit-content-type" required>
                                        <option value="">Select Type</option>
                                        <option value="lesson">Lesson</option>
                                        <option value="assignment">Assignment</option>
                                        <option value="resource">Resource</option>
                                        <option value="video">Video</option>
                                        <option value="quiz">Quiz</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="edit-content-description" rows="3"></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Grade</label>
                                    <select class="form-select" id="edit-content-grade" required>
                                        <option value="">Select Grade</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Category</label>
                                    <select class="form-select" id="edit-content-category" required>
                                        <option value="">Select Category</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Content Text</label>
                                <textarea class="form-control" id="edit-content-text" rows="4" placeholder="Enter main content text, instructions, or description..."></textarea>
                            </div>
                            
                            <!-- File Attachments Section -->
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="fas fa-paperclip me-2"></i>
                                    File Attachments
                                </label>
                                <div class="upload-zone" id="content-upload-zone">
                                    <div class="upload-content">
                                        <i class="fas fa-cloud-upload-alt"></i>
                                        <h6>Drag & Drop Files</h6>
                                        <p class="text-muted small">PDFs, Documents, Images, Videos, Audio</p>
                                        <input type="file" id="edit-content-file-input" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav">
                                        <button type="button" class="btn btn-outline-primary btn-sm" onclick="document.getElementById('edit-content-file-input').click()">
                                            <i class="fas fa-folder-open me-1"></i>Browse Files
                                        </button>
                                    </div>
                                </div>
                                <div id="selected-files-list" class="mt-2"></div>
                            </div>
                            
                            <!-- External Links Section -->
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="fas fa-link me-2"></i>
                                    External Links
                                </label>
                                <textarea class="form-control" id="edit-content-links" rows="3" placeholder="Enter external links (one per line):&#10;https://example.com/video&#10;https://example.com/document&#10;https://youtube.com/watch?v=..."></textarea>
                                <small class="text-muted">Add YouTube links, external resources, or reference materials</small>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveContent()">
                                <i class="fas fa-save me-2"></i>Save Content
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Setup file upload zone
        this.setupContentFileUpload();
    }
    
    setupContentFileUpload() {
        const uploadZone = document.getElementById('content-upload-zone');
        const fileInput = document.getElementById('edit-content-file-input');
        const filesList = document.getElementById('selected-files-list');
        
        if (!uploadZone || !fileInput || !filesList) return;
        
        // Click to browse
        uploadZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });
        
        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            this.updateSelectedFiles(files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.updateSelectedFiles(files);
        });
    }
    
    updateSelectedFiles(files) {
        const filesList = document.getElementById('selected-files-list');
        if (!filesList) return;
        
        if (files.length === 0) {
            filesList.innerHTML = '';
            return;
        }
        
        filesList.innerHTML = `
            <div class="selected-files">
                <h6 class="text-muted small mb-2">Selected Files:</h6>
                ${files.map((file, index) => `
                    <div class="selected-file-item d-flex align-items-center justify-content-between p-2 bg-light rounded mb-1">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-file me-2 text-primary"></i>
                            <span class="small">${file.name}</span>
                            <span class="text-muted small ms-2">(${this.formatFileSize(file.size)})</span>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        this.setupModalEvents();
        console.log('✅ Edit modal created');
    }
    
    setupStandaloneFileUpload() {
        console.log('📁 Setting up standalone file upload area...');
        
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (!uploadArea || !fileInput) {
            console.warn('⚠️ Upload area or file input not found');
            return;
        }
        
        // Click to browse
        uploadArea.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });
        
        // Drag and drop
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
            
            const files = Array.from(e.dataTransfer.files);
            console.log('📁 Dropped files:', files);
            
            // Validate and upload files
            this.handleStandaloneFileUpload(files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            console.log('📁 Selected files:', files);
            
            // Validate and upload files
            this.handleStandaloneFileUpload(files);
        });
        
        console.log('✅ Standalone file upload area setup complete');
    }
    
    async handleStandaloneFileUpload(files) {
        console.log('📁 Handling standalone file upload:', files.length, 'files');
        
        // Validate file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/avi',
            'video/mov',
            'audio/mp3',
            'audio/wav'
        ];
        
        const maxSize = 100 * 1024 * 1024; // 100MB
        
        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                ToastManager.error(`File type not supported: ${file.name} (${file.type})`);
                return;
            }
            
            if (file.size > maxSize) {
                ToastManager.error(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                return;
            }
        }
        
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            
            console.log('📤 Uploading files to server...');
            
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('📥 Upload result:', result);
            
            if (result.success) {
                ToastManager.success(`Successfully uploaded ${files.length} file(s)`);
                
                // Clear file input
                document.getElementById('file-input').value = '';
                
                // Reload files list
                await this.loadFiles();
                
                // Update metrics
                await this.loadAllData();
                
            } else {
                ToastManager.error('Upload failed: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Upload error:', error);
            ToastManager.error('Error uploading files: ' + error.message);
        }
    }
    
    setupModalEvents() {
        const saveBtn = document.getElementById('save-content-btn');
        const deleteBtn = document.getElementById('delete-content-btn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveContent());
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteContentFromModal());
        }
    }
    
    setupNavigation() {
        console.log('🧭 Setting up navigation...');
        
        // Get all menu links
        const menuLinks = document.querySelectorAll('.menu-link');
        const sections = document.querySelectorAll('.content-section');
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.showSection(targetId);
            });
        });
        
        console.log('✅ Navigation setup complete!');
    }
    
    showSection(sectionId) {
        console.log('📱 Showing section:', sectionId);
        
        // Update active menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMenuItem = document.querySelector(`[href="#${sectionId}"]`);
        if (activeMenuItem) {
            activeMenuItem.closest('.menu-item').classList.add('active');
        }
        
        // Show target section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('✅ Section displayed:', sectionId);
        } else {
            console.warn('⚠️ Section not found:', sectionId + '-section');
        }
    }
    
    async loadAllData() {
        console.log('📊 Loading all data...');
        
        try {
            // Load all data from API
            const [contentResponse, gradesResponse, categoriesResponse, filesResponse] = await Promise.all([
                fetch('http://localhost:3000/api/content'),
                fetch('http://localhost:3000/api/grades'),
                fetch('http://localhost:3000/api/categories'),
                fetch('http://localhost:3000/api/files')
            ]);
            
            const content = await contentResponse.json();
            const grades = await gradesResponse.json();
            const categories = await categoriesResponse.json();
            const files = await filesResponse.json();
            
            console.log('📈 Data loaded:', { content, grades, categories, files });
            
            // Store data globally
            this.contentData = content.data || [];
            this.gradesData = grades.data || [];
            this.categoriesData = categories.data || [];
            this.filesData = files.data || [];
            
            // Update dashboard metrics
            this.updateMetrics(content, grades, categories, files);
            
            // Display content table
            this.displayContent(this.contentData);
            
            // Display grades table
            this.displayGrades(this.gradesData);
            
            // Display categories table
            this.displayCategories(this.categoriesData);
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError('Failed to load data: ' + error.message);
        }
    }
    
    async populateFilters() {
        console.log('🔍 Populating filters...');
        
        // Populate grade filter
        const gradeFilter = document.getElementById('grade-filter');
        if (gradeFilter && this.gradesData) {
            this.gradesData.forEach(grade => {
                const option = document.createElement('option');
                option.value = grade.id;
                option.textContent = grade.name;
                gradeFilter.appendChild(option);
            });
        }
        
        // Populate category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && this.categoriesData) {
            this.categoriesData.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
        
        // Add filter event listeners
        if (gradeFilter) {
            gradeFilter.addEventListener('change', () => this.filterContent());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterContent());
        }
        
        const searchInput = document.getElementById('content-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterContent());
        }
        
        console.log('✅ Filters populated!');
    }
    
    filterContent() {
        console.log('🔍 Filtering content...');
        
        const gradeFilter = document.getElementById('grade-filter')?.value || '';
        const categoryFilter = document.getElementById('category-filter')?.value || '';
        const searchTerm = document.getElementById('content-search')?.value.toLowerCase() || '';
        
        let filteredContent = this.contentData;
        
        if (gradeFilter) {
            filteredContent = filteredContent.filter(item => item.grade_id === gradeFilter);
        }
        
        if (categoryFilter) {
            filteredContent = filteredContent.filter(item => item.category_id === categoryFilter);
        }
        
        if (searchTerm) {
            filteredContent = filteredContent.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
        }
        
        this.displayContent(filteredContent);
        console.log('🔍 Filter applied, showing:', filteredContent.length, 'items');
    }
    
    updateMetrics(content, grades, categories, files) {
        console.log('🔢 Updating metrics...');
        
        // Update metric cards
        this.updateElement('total-content', content.data?.length || 0);
        this.updateElement('total-grades', grades.data?.length || 0);
        this.updateElement('total-categories', categories.data?.length || 0);
        this.updateElement('total-files', files.data?.length || 0);
        
        console.log('✅ Metrics updated!');
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`📝 Updated ${id}: ${value}`);
        } else {
            console.warn(`⚠️ Element not found: ${id}`);
        }
    }
    
    displayContent(content) {
        console.log('📋 Displaying content:', content.length, 'items');
        
        const tbody = document.getElementById('content-table-body');
        if (!tbody) {
            console.warn('⚠️ Content table body not found');
            return;
        }
        
        if (content.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No content found</td></tr>';
            return;
        }
        
        tbody.innerHTML = content.map(item => {
            const gradeName = this.gradesData.find(g => g.id === item.grade_id)?.name || item.grade_id;
            const categoryName = this.categoriesData.find(c => c.id === item.category_id)?.name || item.category_id;
            
            return `
                <tr>
                    <td>
                        <div>
                            <strong>${item.title || 'Untitled'}</strong>
                            ${item.description ? `<br><small class="text-muted">${item.description.substring(0, 100)}...</small>` : ''}
                        </div>
                    </td>
                    <td><span class="badge bg-primary">${gradeName}</span></td>
                    <td><span class="badge bg-info">${categoryName}</span></td>
                    <td><span class="badge bg-secondary">${item.type || 'lesson'}</span></td>
                    <td>
                        <span class="badge bg-outline-secondary">
                            <i class="fas fa-file"></i> ${Math.floor(Math.random() * 5) + 1}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editContent('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteContent('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Content table populated!');
    }
    
    displayGrades(grades) {
        console.log('📋 Displaying grades:', grades.length, 'items');
        
        const tbody = document.getElementById('grades-table-body');
        if (!tbody) {
            console.warn('⚠️ Grades table body not found');
            return;
        }
        
        if (grades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No grades found</td></tr>';
            return;
        }
        
        tbody.innerHTML = grades.map(grade => `
            <tr>
                <td>
                    <strong>${grade.name}</strong>
                </td>
                <td>
                    <span class="badge bg-info">${grade.age_range}</span>
                </td>
                <td>
                    <small class="text-muted">${grade.description || 'No description available'}</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editGrade('${grade.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteGrade('${grade.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Grades table populated!');
    }
    
    // Grade Management Methods
    editGrade(id) {
        console.log('✏️ Editing grade:', id);
        
        const grade = this.gradesData.find(item => item.id === id);
        if (!grade) {
            ToastManager.error('Grade not found');
            return;
        }
        
        // Populate modal fields
        document.getElementById('grade-id').value = grade.id;
        document.getElementById('grade-name').value = grade.name || '';
        document.getElementById('grade-age-range').value = grade.age_range || '';
        document.getElementById('grade-description').value = grade.description || '';
        
        // Update modal title
        document.getElementById('grade-modal-title').textContent = 'Edit Grade';
        
        // Show delete button
        const deleteBtn = document.getElementById('delete-grade-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
        }
        
        // Change save button text
        const saveBtn = document.getElementById('save-grade-btn');
        if (saveBtn) {
            document.getElementById('grade-save-text').textContent = 'Save Changes';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('gradeModal'));
        modal.show();
        
        ToastManager.info('Edit mode activated for grade: ' + grade.name);
    }
    
    async saveGrade() {
        console.log('💾 Saving grade...');
        
        const id = document.getElementById('grade-id').value;
        const name = document.getElementById('grade-name').value.trim();
        const ageRange = document.getElementById('grade-age-range').value.trim();
        const description = document.getElementById('grade-description').value.trim();
        
        console.log('📝 Grade data:', { id, name, ageRange, description });
        
        // Validation
        if (!name || !ageRange) {
            ToastManager.warning('Please fill in all required fields');
            return;
        }
        
        try {
            const gradeData = {
                name,
                age_range: ageRange,
                description
            };
            
            console.log('📤 Sending grade data:', gradeData);
            
            let response, result, successMessage;
            
            if (id) {
                // Update existing grade
                response = await fetch(`http://localhost:3000/api/grades/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(gradeData)
                });
                successMessage = 'Grade updated successfully!';
            } else {
                // Create new grade
                response = await fetch('http://localhost:3000/api/grades', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(gradeData)
                });
                successMessage = 'Grade created successfully!';
            }
            
            console.log('📡 Response status:', response.status);
            result = await response.json();
            console.log('📥 API result:', result);
            
            if (result.success) {
                ToastManager.success(successMessage);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('gradeModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                ToastManager.error('Failed to save grade: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Save error:', error);
            ToastManager.error('Error saving grade: ' + error.message);
        }
    }
    
    async deleteGradeFromModal() {
        const id = document.getElementById('grade-id').value;
        const name = document.getElementById('grade-name').value;
        
        if (!id) {
            ToastManager.warning('No grade selected for deletion');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/grades/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Grade deleted successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('gradeModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                ToastManager.error('Failed to delete grade: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Delete error:', error);
            ToastManager.error('Error deleting grade: ' + error.message);
        }
    }
    
    async quickDeleteGrade(id) {
        console.log('🗑️ Quick delete grade:', id);
        
        try {
            const response = await fetch(`http://localhost:3000/api/grades/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Grade deleted successfully!');
                await this.loadAllData();
            } else {
                ToastManager.error('Failed to delete grade: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Quick delete error:', error);
            ToastManager.error('Error deleting grade: ' + error.message);
        }
    }
    
    // Category Management Methods
    displayCategories(categories) {
        console.log('📋 Displaying categories:', categories.length, 'items');
        
        const tbody = document.getElementById('categories-table-body');
        if (!tbody) {
            console.warn('⚠️ Categories table body not found');
            return;
        }
        
        if (categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found</td></tr>';
            return;
        }
        
        // Sort categories by display order
        const sortedCategories = [...categories].sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
        
        tbody.innerHTML = sortedCategories.map(category => {
            const colorStyle = category.color ? `background-color: ${category.color}; color: white;` : '';
            const activeBadge = category.active ? '<span class="badge bg-success ms-2">Active</span>' : '';
            
            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            ${category.icon ? `<i class="${category.icon} me-2" style="${colorStyle}"></i>` : ''}
                            <strong>${category.name}</strong>
                            ${activeBadge}
                        </div>
                    </td>
                    <td>
                        <small class="text-muted">${category.description || 'No description available'}</small>
                    </td>
                    <td>
                        <span class="badge bg-primary me-2">Order: ${category.display_order || 1}</span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory('${category.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${category.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log('✅ Enhanced categories table populated!');
    }
    
    editCategory(id) {
        console.log('✏️ Editing category:', id);
        
        const category = this.categoriesData.find(item => item.id === id);
        if (!category) {
            ToastManager.error('Category not found');
            return;
        }
        
        // Populate modal fields
        document.getElementById('category-id').value = category.id;
        document.getElementById('category-name').value = category.name || '';
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-color').value = category.color || '#FF6B6B';
        document.getElementById('category-icon').value = category.icon || 'fa-book';
        document.getElementById('category-order').value = category.display_order || 1;
        document.getElementById('category-active').checked = category.active === 1;
        
        // Update modal title
        document.getElementById('category-modal-title').textContent = 'Edit Category';
        
        // Show delete button
        const deleteBtn = document.getElementById('delete-category-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
        }
        
        // Change save button text
        const saveBtn = document.getElementById('save-category-btn');
        if (saveBtn) {
            document.getElementById('category-save-text').textContent = 'Save Changes';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
        
        ToastManager.info('Edit mode activated for category: ' + category.name);
    }
    
    async saveCategory() {
        console.log('💾 Saving category...');
        
        const id = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value.trim();
        const description = document.getElementById('category-description').value.trim();
        const color = document.getElementById('category-color').value;
        const icon = document.getElementById('category-icon').value;
        const order = document.getElementById('category-order').value;
        const active = document.getElementById('category-active').checked ? 1 : 0;
        
        // Validation
        if (!name) {
            ToastManager.warning('Please fill in category name');
            return;
        }
        
        try {
            const categoryData = {
                name,
                description,
                color,
                icon,
                display_order: order,
                active: active
            };
            
            let response, result, successMessage;
            
            if (id) {
                // Update existing category
                response = await fetch(`http://localhost:3000/api/categories/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(categoryData)
                });
                successMessage = 'Category updated successfully!';
            } else {
                // Create new category
                response = await fetch('http://localhost:3000/api/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(categoryData)
                });
                successMessage = 'Category created successfully!';
            }
            
            result = await response.json();
            
            if (result.success) {
                ToastManager.success(successMessage);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                ToastManager.error('Failed to save category: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Save error:', error);
            ToastManager.error('Error saving category: ' + error.message);
        }
    }
    
    async deleteCategoryFromModal() {
        const id = document.getElementById('category-id').value;
        const name = document.getElementById('category-name').value;
        
        if (!id) {
            ToastManager.warning('No category selected for deletion');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Category deleted successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                ToastManager.error('Failed to delete category: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Delete error:', error);
            ToastManager.error('Error deleting category: ' + error.message);
        }
    }
    
    async quickDeleteCategory(id) {
        console.log('🗑️ Quick delete category:', id);
        
        try {
            const response = await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Category deleted successfully!');
                await this.loadAllData();
            } else {
                ToastManager.error('Failed to delete category: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Quick delete error:', error);
            ToastManager.error('Error deleting category: ' + error.message);
        }
    }
    
    showError(message) {
        console.error('❌ Error:', message);
        ToastManager.error(message);
    }
    
    displayFiles(files) {
        console.log('📋 Displaying files:', files.length, 'items');
        console.log('📋 Files data:', files);
        
        const filesList = document.getElementById('files-list');
        if (!filesList) {
            console.warn('⚠️ Files list element not found');
            return;
        }
        
        if (files.length === 0) {
            filesList.innerHTML = '<div class="text-center text-muted py-4">No files uploaded yet</div>';
            console.log('📋 No files to display');
            return;
        }
        
        console.log('📋 Processing files for display...');
        filesList.innerHTML = files.map(file => {
            console.log('📋 Processing file:', file);
            
            const fileIcon = this.getFileIcon(file.mime_type || file.type);
            const fileSize = this.formatFileSize(file.size);
            const uploadDate = new Date(file.created_at || file.upload_date).toLocaleDateString();
            const previewBtn = this.getPreviewButton(file);
            
            console.log('📋 File details:', { icon: fileIcon, size: fileSize, date: uploadDate });
            
            return `
                <div class="file-item d-flex align-items-center justify-content-between p-3 border rounded mb-2">
                    <div class="d-flex align-items-center">
                        <i class="${fileIcon} me-3 text-primary" style="font-size: 1.5rem;"></i>
                        <div>
                            <h6 class="mb-1">${file.name || file.original_name}</h6>
                            <small class="text-muted">
                                ${fileSize} • ${file.mime_type || file.type} • ${uploadDate}
                            </small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        ${previewBtn}
                        <button class="btn btn-sm btn-outline-success me-2" onclick="downloadFile('${file.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteFile('${file.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('✅ Files list populated with', files.length, 'items');
    }
    
    getPreviewButton(file) {
        const fileType = (file.mime_type || file.type).toLowerCase();
        
        // Images - Preview in modal
        if (fileType.includes('image')) {
            return `
                <button class="btn btn-sm btn-outline-primary me-2" onclick="previewImage('${file.id}', '${file.name || file.original_name}')">
                    <i class="fas fa-eye"></i>
                </button>
            `;
        }
        
        // Videos - Preview in modal
        if (fileType.includes('video')) {
            return `
                <button class="btn btn-sm btn-outline-primary me-2" onclick="previewVideo('${file.id}', '${file.name || file.original_name}')">
                    <i class="fas fa-play"></i>
                </button>
            `;
        }
        
        // PDFs - Preview in modal
        if (fileType.includes('pdf')) {
            return `
                <button class="btn btn-sm btn-outline-primary me-2" onclick="previewPDF('${file.id}', '${file.name || file.original_name}')">
                    <i class="fas fa-file-pdf"></i>
                </button>
            `;
        }
        
        // Text files - Preview in modal
        if (fileType.includes('text') || fileType.includes('document')) {
            return `
                <button class="btn btn-sm btn-outline-primary me-2" onclick="previewText('${file.id}', '${file.name || file.original_name}')">
                    <i class="fas fa-file-alt"></i>
                </button>
            `;
        }
        
        // Audio - Preview in modal
        if (fileType.includes('audio')) {
            return `
                <button class="btn btn-sm btn-outline-primary me-2" onclick="previewAudio('${file.id}', '${file.name || file.original_name}')">
                    <i class="fas fa-headphones"></i>
                </button>
            `;
        }
        
        // Other files - No preview, just download
        return '';
    }
    
    getFileIcon(fileType) {
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fas fa-file-word';
        if (fileType.includes('excel') || fileType.includes('sheet')) return 'fas fa-file-excel';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
        if (fileType.includes('image')) return 'fas fa-file-image';
        if (fileType.includes('video')) return 'fas fa-file-video';
        if (fileType.includes('audio')) return 'fas fa-file-audio';
        return 'fas fa-file';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    async downloadFile(fileId) {
        console.log('📥 Downloading file:', fileId);
        
        try {
            const response = await fetch(`http://localhost:3000/api/files/${fileId}/download`);
            
            if (!response.ok) {
                throw new Error('File not found or download failed');
            }
            
            // Get filename from response headers
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Create download link
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            ToastManager.success(`File "${filename}" downloaded successfully!`);
            
        } catch (error) {
            console.error('❌ Download error:', error);
            ToastManager.error('Error downloading file: ' + error.message);
        }
    }
    
    async deleteFile(fileId) {
        console.log('🗑️ Deleting file:', fileId);
        
        if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/files/${fileId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('File deleted successfully');
                await this.loadFiles();
                await this.loadAllData();
            } else {
                ToastManager.error('Failed to delete file: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Delete error:', error);
            ToastManager.error('Error deleting file: ' + error.message);
        }
    }
    
    async loadFiles() {
        console.log('📁 Loading files...');
        
        try {
            const response = await fetch('http://localhost:3000/api/files');
            const result = await response.json();
            
            console.log('📥 Files API response:', result);
            
            if (result.success) {
                this.filesData = result.data;
                console.log('📁 Files loaded from API:', this.filesData.length, 'items');
                console.log('📁 Files data details:', this.filesData);
                this.displayFiles(this.filesData);
                console.log('✅ Files loaded and displayed');
            } else {
                console.error('❌ Failed to load files:', result.message);
            }
            
        } catch (error) {
            console.error('❌ Error loading files:', error);
        }
    }
    
    // Edit Content Methods
    editContent(id) {
        console.log('✏️ Editing content:', id);
        
        const content = this.contentData.find(item => item.id === id);
        if (!content) {
            ToastManager.error('Content not found');
            return;
        }
        
        // Populate grade dropdown
        const gradeSelect = document.getElementById('edit-content-grade');
        gradeSelect.innerHTML = '<option value="">Select Grade</option>';
        this.gradesData.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.id;
            option.textContent = grade.name;
            if (grade.id === content.grade_id) {
                option.selected = true;
            }
            gradeSelect.appendChild(option);
        });
        
        // Populate category dropdown
        const categorySelect = document.getElementById('edit-content-category');
        categorySelect.innerHTML = '<option value="">Select Category</option>';
        this.categoriesData.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            if (category.id === content.category_id) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
        
        // Populate modal fields
        document.getElementById('edit-content-id').value = content.id;
        document.getElementById('edit-content-title').value = content.title || '';
        document.getElementById('edit-content-description').value = content.description || '';
        document.getElementById('edit-content-type').value = content.type || 'lesson';
        document.getElementById('edit-content-text').value = content.content_text || '';
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Content';
        
        // Show delete button for editing
        const deleteBtn = document.getElementById('delete-content-btn');
        if (deleteBtn) {
            deleteBtn.style.display = 'inline-block';
        }
        
        // Reset save button text
        const saveBtn = document.getElementById('save-content-btn');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editContentModal'));
        modal.show();
        
        ToastManager.info('Edit mode activated for: ' + content.title);
    }
    
    async saveContent() {
        console.log('💾 Saving content...');
        
        const id = document.getElementById('edit-content-id').value;
        const title = document.getElementById('edit-content-title').value.trim();
        const description = document.getElementById('edit-content-description').value.trim();
        const type = document.getElementById('edit-content-type').value;
        const gradeId = document.getElementById('edit-content-grade').value;
        const categoryId = document.getElementById('edit-content-category').value;
        const contentText = document.getElementById('edit-content-text').value.trim();
        
        // Validation
        if (!title || !gradeId || !categoryId) {
            ToastManager.warning('Please fill in all required fields');
            return;
        }
        
        try {
            const contentData = {
                title,
                description,
                grade_id: gradeId,
                category_id: categoryId,
                type,
                content_text: contentText
            };
            
            // Handle file uploads
            const fileInput = document.getElementById('edit-content-file-input');
            if (fileInput && fileInput.files.length > 0) {
                const formData = new FormData();
                Array.from(fileInput.files).forEach(file => {
                    formData.append('files', file);
                });
                
                // Upload files first
                const uploadResponse = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const uploadResult = await uploadResponse.json();
                if (uploadResult.success) {
                    // Store uploaded file IDs
                    if (uploadResult.data && uploadResult.data.length) {
                        contentData.file_ids = uploadResult.data.map(file => file.id);
                    }
                } else {
                    ToastManager.error('File upload failed: ' + uploadResult.message);
                    return;
                }
            }
            
            // Handle external links
            const linksInput = document.getElementById('edit-content-links');
            if (linksInput && linksInput.value.trim()) {
                const links = linksInput.value.trim().split('\n').filter(link => link.trim());
                contentData.external_links = links;
            }
            
            let response, result, successMessage;
            
            if (id) {
                // Update existing content
                contentData.updated_at = new Date().toISOString();
                response = await fetch(`http://localhost:3000/api/content/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(contentData)
                });
                successMessage = 'Content updated successfully!';
            } else {
                // Create new content
                response = await fetch('http://localhost:3000/api/content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(contentData)
                });
                successMessage = 'Content created successfully!';
            }
            
            console.log('📡 Response status:', response.status);
            result = await response.json();
            console.log('📥 API result:', result);
            
            if (result.success) {
                ToastManager.success(successMessage);
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editContentModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                console.error('❌ API Error:', result);
                ToastManager.error('Failed to save content: ' + (result.error || result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Save error:', error);
            ToastManager.error('Error saving content: ' + error.message);
        }
    }
    
    async deleteContentFromModal() {
        const id = document.getElementById('edit-content-id').value;
        const title = document.getElementById('edit-content-title').value;
        
        if (!id) {
            ToastManager.warning('No content selected for deletion');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/api/content/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Content deleted successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editContentModal'));
                modal.hide();
                
                // Reload data
                await this.loadAllData();
                
            } else {
                ToastManager.error('Failed to delete content: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Delete error:', error);
            ToastManager.error('Error deleting content: ' + error.message);
        }
    }
    
    async quickDeleteContent(id) {
        console.log('🗑️ Quick delete content:', id);
        
        try {
            const response = await fetch(`http://localhost:3000/api/content/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                ToastManager.success('Content deleted successfully!');
                await this.loadAllData();
            } else {
                ToastManager.error('Failed to delete content: ' + (result.message || 'Unknown error'));
            }
            
        } catch (error) {
            console.error('❌ Quick delete error:', error);
            ToastManager.error('Error deleting content: ' + error.message);
        }
    }
}

// Global functions for content management
function editContent(id) {
    if (window.dashboard) {
        window.dashboard.editContent(id);
    } else {
        ToastManager.error('Dashboard not initialized');
    }
}

function deleteContent(id) {
    console.log('🗑️ Delete content:', id);
    if (confirm('Are you sure you want to delete this content?')) {
        // Quick delete from table (without modal)
        if (window.dashboard) {
            window.dashboard.quickDeleteContent(id);
        } else {
            ToastManager.error('Dashboard not initialized');
        }
    }
}

function showContentModal() {
    console.log('➕ Show content modal');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    // Clear modal fields for new content
    document.getElementById('edit-content-id').value = '';
    document.getElementById('edit-content-title').value = '';
    document.getElementById('edit-content-description').value = '';
    document.getElementById('edit-content-type').value = 'lesson';
    document.getElementById('edit-content-text').value = '';
    
    // Populate grade dropdown
    const gradeSelect = document.getElementById('edit-content-grade');
    gradeSelect.innerHTML = '<option value="">Select Grade</option>';
    window.dashboard.gradesData.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.id;
        option.textContent = grade.name;
        gradeSelect.appendChild(option);
    });
    
    // Populate category dropdown
    const categorySelect = document.getElementById('edit-content-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    window.dashboard.categoriesData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Create New Content';
    
    // Hide delete button for new content
    const deleteBtn = document.getElementById('delete-content-btn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
    
    // Change save button text
    const saveBtn = document.getElementById('save-content-btn');
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Create Content';
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editContentModal'));
    modal.show();
    
    ToastManager.info('Create new content mode activated');
}

function showGradeModal() {
    console.log('➕ Show grade modal');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    console.log('🔍 Clearing modal fields...');
    
    // Clear modal fields for new grade
    const gradeId = document.getElementById('grade-id');
    const gradeName = document.getElementById('grade-name');
    const gradeAgeRange = document.getElementById('grade-age-range');
    const gradeDescription = document.getElementById('grade-description');
    
    if (gradeId) gradeId.value = '';
    if (gradeName) gradeName.value = '';
    if (gradeAgeRange) gradeAgeRange.value = '';
    if (gradeDescription) gradeDescription.value = '';
    
    // Update modal title
    const modalTitle = document.getElementById('grade-modal-title');
    if (modalTitle) modalTitle.textContent = 'Add New Grade';
    
    // Hide delete button for new grade
    const deleteBtn = document.getElementById('delete-grade-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    // Change save button text
    const saveBtn = document.getElementById('save-grade-btn');
    const saveText = document.getElementById('grade-save-text');
    if (saveBtn && saveText) {
        saveText.textContent = 'Add Grade';
    }
    
    // Show modal
    const modalElement = document.getElementById('gradeModal');
    if (modalElement) {
        console.log('📱 Showing grade modal...');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        ToastManager.info('Create new grade mode activated');
    } else {
        console.error('❌ Grade modal element not found!');
        ToastManager.error('Grade modal not loaded properly');
    }
}

function editGrade(id) {
    if (window.dashboard) {
        window.dashboard.editGrade(id);
    } else {
        ToastManager.error('Dashboard not initialized');
    }
}

function deleteGrade(id) {
    console.log('🗑️ Delete grade:', id);
    if (confirm('Are you sure you want to delete this grade?')) {
        // Quick delete from table (without modal)
        if (window.dashboard) {
            window.dashboard.quickDeleteGrade(id);
        } else {
            ToastManager.error('Dashboard not initialized');
        }
    }
}

function showCategoryModal() {
    console.log('➕ Show category modal');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    console.log('🔍 Clearing modal fields...');
    
    // Clear modal fields for new category
    const categoryId = document.getElementById('category-id');
    const categoryName = document.getElementById('category-name');
    const categoryDescription = document.getElementById('category-description');
    const categoryColor = document.getElementById('category-color');
    const categoryIcon = document.getElementById('category-icon');
    const categoryOrder = document.getElementById('category-order');
    const categoryActive = document.getElementById('category-active');
    
    if (categoryId) categoryId.value = '';
    if (categoryName) categoryName.value = '';
    if (categoryDescription) categoryDescription.value = '';
    if (categoryColor) categoryColor.value = '#FF6B6B'; // Default yellow
    if (categoryIcon) categoryIcon.value = 'fa-book'; // Default general
    if (categoryOrder) categoryOrder.value = '1'; // Default first
    if (categoryActive) categoryActive.checked = true; // Default active
    
    // Update modal title
    const modalTitle = document.getElementById('category-modal-title');
    if (modalTitle) modalTitle.textContent = 'Add New Category';
    
    // Hide delete button for new category
    const deleteBtn = document.getElementById('delete-category-btn');
    if (deleteBtn) deleteBtn.style.display = 'none';
    
    // Change save button text
    const saveBtn = document.getElementById('save-category-btn');
    if (saveBtn) {
        document.getElementById('category-save-text').textContent = 'Add Category';
    }
    
    // Show modal
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
        console.log('📱 Showing enhanced category modal...');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        ToastManager.info('Create new category mode activated');
    } else {
        console.error('❌ Category modal element not found!');
        ToastManager.error('Category modal not loaded properly');
    }
}

function saveCategory() {
    console.log('💾 Save category called from global scope');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    // Call the dashboard's saveCategory method
    window.dashboard.saveCategory();
}

function editCategory(id) {
    if (window.dashboard) {
        window.dashboard.editCategory(id);
    } else {
        ToastManager.error('Dashboard not initialized');
    }
}

function deleteCategory(id) {
    console.log('🗑️ Delete category:', id);
    if (confirm('Are you sure you want to delete this category?')) {
        // Quick delete from table (without modal)
        if (window.dashboard) {
            window.dashboard.quickDeleteCategory(id);
        } else {
            ToastManager.error('Dashboard not initialized');
        }
    }
}

function showUploadModal() {
    console.log('➕ Show upload modal');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    // Show the uploads section directly
    const uploadsSection = document.getElementById('uploads-section');
    console.log('🔍 Found uploads section:', uploadsSection);
    
    if (uploadsSection) {
        // Hide all sections first
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            console.log('🔍 Hiding section:', section.id);
        });
        
        // Show only the uploads section
        uploadsSection.classList.add('active');
        uploadsSection.style.display = 'block';
        uploadsSection.style.visibility = 'visible';
        uploadsSection.style.position = 'relative';
        uploadsSection.style.zIndex = '10';
        uploadsSection.style.opacity = '1';
        uploadsSection.style.pointerEvents = 'auto';
        console.log('🔍 Activating uploads section');
        
        // Update menu active state
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the uploads menu item
        const uploadsMenuItem = document.querySelector('a[href="#uploads"]');
        if (uploadsMenuItem) {
            uploadsMenuItem.closest('.menu-item').classList.add('active');
            console.log('🔍 Activating uploads menu item');
        }
        
        // Check if upload area exists
        const uploadArea = document.getElementById('upload-area');
        console.log('🔍 Found upload area:', uploadArea);
        
        // Check if files list exists
        const filesList = document.getElementById('files-list');
        console.log('🔍 Found files list:', filesList);
        
        // Load files to show in the list
        if (window.dashboard && window.dashboard.loadFiles) {
            setTimeout(() => {
                window.dashboard.loadFiles();
            }, 200);
        }
        
        ToastManager.info('File Uploads section activated');
        console.log('✅ Uploads section should now be visible');
        
        // Force scroll with delay to ensure DOM updates
        setTimeout(() => {
            uploadsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('📍 Scrolled to uploads section');
        }, 300);
        
    } else {
        console.error('❌ Uploads section not found!');
        ToastManager.error('File Uploads section not found');
    }
}

function saveContent() {
    console.log('💾 Save content called from global scope');
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    // Call the dashboard's saveContent method
    window.dashboard.saveContent();
}

function editContent(id) {
    if (window.dashboard) {
        window.dashboard.editContent(id);
    } else {
        ToastManager.error('Dashboard not initialized');
    }
}

function deleteContent(id) {
    console.log('🗑️ Delete content:', id);
    if (confirm('Are you sure you want to delete this content?')) {
        // Quick delete from table (without modal)
        if (window.dashboard) {
            window.dashboard.quickDeleteContent(id);
        } else {
            ToastManager.error('Dashboard not initialized');
        }
    }
}

function deleteFile(fileId) {
    console.log('🗑️ Delete file:', fileId);
    
    if (!window.dashboard) {
        ToastManager.error('Dashboard not initialized');
        return;
    }
    
    // Call the dashboard's deleteFile method
    window.dashboard.deleteFile(fileId);
}

function removeFile(index) {
    console.log('🗑️ Removing file at index:', index);
    
    const fileInput = document.getElementById('edit-content-file-input');
    if (fileInput && fileInput.files.length > index) {
        // Create new FileList without the removed file
        const files = Array.from(fileInput.files);
        files.splice(index, 1);
        
        // Clear and reset file input
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        // Update display
        window.dashboard.updateSelectedFiles(files);
    }
}

// Preview functions
function previewImage(fileId, filename) {
    console.log('👁️ Previewing image:', filename);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📷 Image Preview: ${filename}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="http://localhost:3000/api/files/${fileId}/download" 
                         class="img-fluid" 
                         alt="${filename}"
                         style="max-height: 500px;">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="downloadFile('${fileId}')">
                        <i class="fas fa-download me-2"></i>Download
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function previewVideo(fileId, filename) {
    console.log('🎥 Previewing video:', filename);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🎥 Video Preview: ${filename}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <video controls class="img-fluid" style="max-height: 500px;">
                        <source src="http://localhost:3000/api/files/${fileId}/download" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="downloadFile('${fileId}')">
                        <i class="fas fa-download me-2"></i>Download
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function previewPDF(fileId, filename) {
    console.log('📄 Previewing PDF:', filename);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">📄 PDF Preview: ${filename}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" style="height: 70vh;">
                    <iframe src="http://localhost:3000/api/files/${fileId}/download" 
                            width="100%" 
                            height="100%" 
                            style="border: none;">
                    </iframe>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="downloadFile('${fileId}')">
                        <i class="fas fa-download me-2"></i>Download
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function previewAudio(fileId, filename) {
    console.log('🎵 Previewing audio:', filename);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🎵 Audio Preview: ${filename}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <audio controls class="w-100">
                        <source src="http://localhost:3000/api/files/${fileId}/download" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-success" onclick="downloadFile('${fileId}')">
                        <i class="fas fa-download me-2"></i>Download
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function previewText(fileId, filename) {
    console.log('📝 Previewing text:', filename);
    
    fetch(`http://localhost:3000/api/files/${fileId}/download`)
        .then(response => response.blob())
        .then(blob => blob.text())
        .then(text => {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">📝 Text Preview: ${filename}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <pre class="bg-light p-3 rounded" style="max-height: 400px; overflow-y: auto;">${text}</pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-success" onclick="downloadFile('${fileId}')">
                                <i class="fas fa-download me-2"></i>Download
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        })
        .catch(error => {
            console.error('❌ Preview error:', error);
            ToastManager.error('Error previewing file: ' + error.message);
        });
}

// Initialize when DOM is loaded
// Enhanced Content Management
window.showEnhancedContentModal = function(contentId = null) {
    console.log('📤 Show enhanced content modal');
    
    // Wait for dashboard to be ready
    const checkDashboard = () => {
        if (!window.dashboard) {
            console.log('⏳ Waiting for dashboard...');
            setTimeout(checkDashboard, 100);
            return;
        }
        
        console.log('✅ Dashboard ready, opening modal...');
        
        // Clear form
        document.getElementById('enhanced-content-id').value = '';
        document.getElementById('enhanced-content-title').value = '';
        document.getElementById('enhanced-content-description').value = '';
        document.getElementById('enhanced-content-grade').value = '';
        document.getElementById('enhanced-content-category').value = '';
        document.getElementById('enhanced-content-type').value = 'lesson';
        document.getElementById('make-files-public').checked = true;
        document.getElementById('enhanced-file-input').value = '';
        document.getElementById('files-list').innerHTML = '<p class="text-muted text-center">No files selected</p>';
        
        // Load grades and categories
        if (window.dashboard.gradesData && window.dashboard.categoriesData) {
            window.dashboard.populateSelect('enhanced-content-grade', window.dashboard.gradesData, 'id', 'name', 'Select Grade');
            window.dashboard.populateSelect('enhanced-content-category', window.dashboard.categoriesData, 'id', 'name', 'Select Category');
        }
        
        // Setup file input listeners
        setupEnhancedFileUpload();
        
        // Show modal
        const modalElement = document.getElementById('enhancedContentModal');
        console.log('🔍 Modal element found:', !!modalElement);
        
        if (modalElement) {
            try {
                const modal = new bootstrap.Modal(modalElement);
                console.log('📱 Opening modal...');
                modal.show();
                ToastManager.info('Enhanced content upload mode activated');
            } catch (error) {
                console.error('❌ Modal error:', error);
                ToastManager.error('Error opening modal: ' + error.message);
            }
        } else {
            console.error('❌ Modal element not found!');
            ToastManager.error('Enhanced content modal not found');
        }
    };
    
    checkDashboard();
}

window.setupEnhancedFileUpload = function() {
    const fileInput = document.getElementById('enhanced-file-input');
    const filesList = document.getElementById('files-list');
    
    fileInput.removeEventListener('change', handleFileSelection);
    fileInput.addEventListener('change', handleFileSelection);
}

window.handleFileSelection = function(event) {
    const files = event.target.files;
    const filesList = document.getElementById('files-list');
    
    console.log('📁 File selection event triggered');
    console.log('📁 Selected files:', files);
    console.log('📁 Files length:', files.length);
    
    if (files.length === 0) {
        filesList.innerHTML = '<p class="text-muted text-center">No files selected</p>';
        return;
    }
    
    let html = '';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        const fileIcon = getFileIcon(file.type);
        
        html += `
            <div class="d-flex justify-content-between align-items-center p-2 border-bottom">
                <div>
                    <i class="fas ${fileIcon} me-2"></i>
                    <span>${file.name}</span>
                    <small class="text-muted">(${fileSize} MB)</small>
                </div>
                <div>
                    <select class="form-select form-select-sm file-category-select" style="width: 120px;" data-file-index="${i}">
                        <option value="video">Video</option>
                        <option value="exercise">Exercise</option>
                        <option value="memo">Memo</option>
                        <option value="document">Document</option>
                        <option value="presentation">Presentation</option>
                        <option value="resource">Resource</option>
                        <option value="general">General</option>
                    </select>
                </div>
            </div>
        `;
    }
    
    filesList.innerHTML = html;
    console.log('✅ File list updated with', files.length, 'files');
}

window.getFileIcon = function(fileType) {
    if (fileType.startsWith('video/')) return 'fa-video text-danger';
    if (fileType.startsWith('audio/')) return 'fa-headphones text-warning';
    if (fileType.includes('pdf')) return 'fa-file-pdf text-danger';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word text-primary';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint text-orange';
    if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel text-green';
    if (fileType.startsWith('image/')) return 'fa-image text-info';
    return 'fa-file text-secondary';
}

window.saveEnhancedContent = async function() {
    console.log('💾 Saving enhanced content...');
    
    const contentId = document.getElementById('enhanced-content-id').value;
    const title = document.getElementById('enhanced-content-title').value.trim();
    const description = document.getElementById('enhanced-content-description').value.trim();
    const gradeId = document.getElementById('enhanced-content-grade').value;
    const categoryId = document.getElementById('enhanced-content-category').value;
    const contentType = document.getElementById('enhanced-content-type').value;
    const isPublic = document.getElementById('make-files-public').checked;
    
    // Validation
    if (!title || !gradeId || !categoryId) {
        ToastManager.warning('Please fill in all required fields');
        return;
    }
    
    const fileInput = document.getElementById('enhanced-file-input');
    const files = fileInput.files;
    
    console.log('💾 Save function - File input:', fileInput);
    console.log('💾 Save function - Files:', files);
    console.log('💾 Save function - Files length:', files.length);
    
    if (files.length === 0 && !contentId) {
        ToastManager.warning('Please select at least one file to upload');
        return;
    }
    
    try {
        // First create/update content
        const contentData = {
            title,
            description,
            grade_id: gradeId,
            category_id: categoryId,
            type: contentType,
            content_text: description
        };
        
        let response;
        if (contentId) {
            // Update existing content
            response = await fetch(`http://localhost:3000/api/content/${contentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(contentData)
            });
        } else {
            // Create new content
            response = await fetch('http://localhost:3000/api/content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(contentData)
            });
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to save content');
        }
        
        const newContentId = contentId || result.data.id;
        
        // Upload files if any
        if (files.length > 0) {
            const formData = new FormData();
            
            // Add files with categories
            const categorySelects = document.querySelectorAll('.file-category-select');
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
                if (categorySelects[i]) {
                    formData.append(`file_${i}_category`, categorySelects[i].value);
                }
            }
            
            formData.append('contentId', newContentId);
            formData.append('categoryId', categoryId);
            formData.append('isPublic', isPublic);
            
            const uploadResponse = await fetch('http://localhost:3000/api/upload/enhanced', {
                method: 'POST',
                body: formData
            });
            
            const uploadResult = await uploadResponse.json();
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Failed to upload files');
            }
        }
        
        // Close modal and refresh data
        const modal = bootstrap.Modal.getInstance(document.getElementById('enhancedContentModal'));
        modal.hide();
        
        await window.dashboard.loadAllData();
        
        ToastManager.success(contentId ? 'Content and files updated successfully!' : 'Content and files created successfully!');
        
    } catch (error) {
        console.error('❌ Save enhanced content error:', error);
        ToastManager.error('Error saving content: ' + error.message);
    }
}

// Setup event listeners for enhanced content modal
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const saveBtn = document.getElementById('save-enhanced-content-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveEnhancedContent);
        }
        
        // Setup file category checkboxes
        const categoryChecks = document.querySelectorAll('.file-category-check');
        categoryChecks.forEach(check => {
            check.addEventListener('change', function() {
                if (this.checked) {
                    // Auto-select file input for this category
                    document.getElementById('enhanced-file-input').focus();
                }
            });
        });
        
        console.log('🔧 Enhanced content modal event listeners setup complete');
    }, 1000);
});

// Fallback: Direct modal opening without dashboard dependency
window.openEnhancedModalDirect = function() {
    console.log('🚪 Opening enhanced modal directly...');
    
    // Clear form
    const elements = ['enhanced-content-id', 'enhanced-content-title', 'enhanced-content-description', 
                     'enhanced-content-grade', 'enhanced-content-category', 'enhanced-content-type'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'enhanced-content-type') {
                element.value = 'lesson';
            } else if (id === 'enhanced-content-id') {
                element.value = '';
            } else {
                element.value = '';
            }
        }
    });
    
    document.getElementById('make-files-public').checked = true;
    document.getElementById('enhanced-file-input').value = '';
    document.getElementById('files-list').innerHTML = '<p class="text-muted text-center">No files selected</p>';
    
    // Load grades and categories directly if dashboard is available
    if (window.dashboard && window.dashboard.gradesData) {
        window.dashboard.populateSelect('enhanced-content-grade', window.dashboard.gradesData, 'id', 'name', 'Select Grade');
        window.dashboard.populateSelect('enhanced-content-category', window.dashboard.categoriesData, 'id', 'name', 'Select Category');
    } else {
        // Load data via API
        Promise.all([
            fetch('http://localhost:3000/api/grades'),
            fetch('http://localhost:3000/api/categories')
        ]).then(([gradesRes, catsRes]) => 
            Promise.all([gradesRes.json(), catsRes.json()])
        ).then(([gradesData, catsData]) => {
            if (gradesData.success && catsData.success) {
                populateSelectDirect('enhanced-content-grade', gradesData.data, 'id', 'name', 'Select Grade');
                populateSelectDirect('enhanced-content-category', catsData.data, 'id', 'name', 'Select Category');
            }
        }).catch(error => {
            console.error('Error loading data:', error);
        });
    }
    
    // Open modal
    const modalElement = document.getElementById('enhancedContentModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        ToastManager.info('Enhanced content upload mode activated');
    }
};

window.populateSelectDirect = function(selectId, data, valueField, textField, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = `<option value="">${placeholder}</option>`;
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
    });
};

// Global test function for debugging
window.testGradeFunctionality = function() {
    console.log('🧪 Testing grade functionality...');
    
    // Check if dashboard exists
    if (!window.dashboard) {
        console.error('❌ Dashboard not found');
        return;
    }
    
    // Check modal elements
    const modal = document.getElementById('gradeModal');
    const saveBtn = document.getElementById('save-grade-btn');
    const deleteBtn = document.getElementById('delete-grade-btn');
    const gradeId = document.getElementById('grade-id');
    const gradeName = document.getElementById('grade-name');
    
    console.log('🔍 Elements found:', {
        modal: !!modal,
        saveBtn: !!saveBtn,
        deleteBtn: !!deleteBtn,
        gradeId: !!gradeId,
        gradeName: !!gradeName
    });
    
    // Test API connection
    fetch('http://localhost:3000/api/grades')
        .then(response => response.json())
        .then(data => {
            console.log('✅ API test successful:', data);
        })
        .catch(error => {
            console.error('❌ API test failed:', error);
        });
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM loaded, creating dashboard...');
    window.dashboard = new SimpleAdminDashboard();
    
    // Add test function to window
    setTimeout(() => {
        console.log('🧪 Grade functionality test ready. Run testGradeFunctionality() in console');
    }, 2000);
});
