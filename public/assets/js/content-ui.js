// Content Management UI Controller
class ContentManagementUI {
    constructor() {
        this.cms = steamCMS;
        this.selectedContents = new Set();
        this.currentEditingContent = null;
        this.uploadedFiles = [];
        this.bulkFiles = [];
        this.draggedElement = null;
        
        // Search and filtering
        this.searchIndex = new Map();
        this.currentFilters = {};
        this.lastSearchTime = 0;
        this.searchTimeout = null;
        
        // Advanced file management
        this.previewMode = 'grid';
        this.fileTypeLimits = {
            video: 4,
            document: 10,
            audio: 5,
            image: 10
        };
        this.currentFileTypeCounts = {
            video: 0,
            document: 0,
            audio: 0,
            image: 0
        };
        this.uploadProgress = 0;
        this.isUploading = false;
        
        // Categories management
        this.selectedCategory = null;
        this.editingCategory = null;
        this.editingSubcategory = null;
        
        this.initializeEventListeners();
        this.loadCategories();
        this.buildSearchIndex();
        this.renderContent();
        
        // Check if we should open categories modal
        this.checkUrlParameters();
    }

    // Search Indexing for Performance
    buildSearchIndex() {
        console.log('Building search index...');
        const startTime = performance.now();
        
        this.searchIndex.clear();
        
        this.cms.contents.forEach(content => {
            const indexData = {
                id: content.id,
                title: content.title.toLowerCase(),
                description: content.description.toLowerCase(),
                tags: (content.tags || []).map(tag => tag.toLowerCase()),
                categories: content.categories || [],
                subcategories: content.subcategories || [],
                gradeLevels: content.gradeLevels || [],
                state: content.state,
                featured: content.featured || false,
                createdAt: new Date(content.createdAt),
                updatedAt: new Date(content.updatedAt),
                fileTypes: this.extractFileTypes(content.files || [])
            };
            
            this.searchIndex.set(content.id, indexData);
        });
        
        const endTime = performance.now();
        console.log(`Search index built in ${(endTime - startTime).toFixed(2)}ms for ${this.cms.contents.length} items`);
    }

    extractFileTypes(files) {
        const types = new Set();
        files.forEach(file => {
            if (file.type) {
                types.add(file.type);
            }
        });
        return Array.from(types);
    }

    updateSearchIndex(contentId, content) {
        const indexData = {
            id: content.id,
            title: content.title.toLowerCase(),
            description: content.description.toLowerCase(),
            tags: (content.tags || []).map(tag => tag.toLowerCase()),
            categories: content.categories || [],
            subcategories: content.subcategories || [],
            gradeLevels: content.gradeLevels || [],
            state: content.state,
            featured: content.featured || false,
            createdAt: new Date(content.createdAt),
            updatedAt: new Date(content.updatedAt),
            fileTypes: this.extractFileTypes(content.files || [])
        };
        
        this.searchIndex.set(contentId, indexData);
    }

    removeFromSearchIndex(contentId) {
        this.searchIndex.delete(contentId);
    }

    initializeEventListeners() {
        // Search and filters
        document.getElementById('searchInput').addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        document.getElementById('stateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('gradeFilter').addEventListener('change', () => this.applyFilters());
        
        // Advanced filters
        document.getElementById('fileTypeFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('subcategoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateRangeFilter').addEventListener('change', (e) => {
            this.handleDateRangeChange(e.target.value);
            this.applyFilters();
        });
        document.getElementById('dateFrom').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateTo').addEventListener('change', () => this.applyFilters());
        document.getElementById('featuredFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortBy').addEventListener('change', () => this.applyFilters());

        // File upload
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        fileUploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        fileUploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Bulk upload
        const bulkDropZone = document.getElementById('bulkDropZone');
        const bulkFileInput = document.getElementById('bulkFileInput');
        
        bulkDropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        bulkDropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        bulkDropZone.addEventListener('drop', this.handleBulkFileDrop.bind(this));
        bulkFileInput.addEventListener('change', this.handleBulkFileSelect.bind(this));

        // Category selection
        document.getElementById('contentCategories').addEventListener('change', this.updateSubcategories.bind(this));

        // Form submission
        document.getElementById('contentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContent();
        });
    }

    // Load categories into selects
    loadCategories() {
        console.log('Loading categories...', this.cms.categories);
        
        const categorySelects = [
            'categoryFilter',
            'contentCategories', 
            'bulkDefaultCategories'
        ];

        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '';
                Object.entries(this.cms.categories).forEach(([key, category]) => {
                    console.log('Adding category:', key, category.name);
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            }
        });
    }

    // Update subcategories based on selected categories
    updateSubcategories() {
        const selectedCategories = Array.from(document.getElementById('contentCategories').selectedOptions)
            .map(option => option.value);
        
        console.log('Selected categories:', selectedCategories);
        
        const subcategoryContainer = document.getElementById('subcategoryCheckboxes');
        subcategoryContainer.innerHTML = '';
        
        if (selectedCategories.length === 0) {
            subcategoryContainer.innerHTML = '<p class="text-muted text-center py-3">Please select categories to see subcategories</p>';
            return;
        }
        
        // Group subcategories by their parent category
        selectedCategories.forEach(categoryKey => {
            const category = this.cms.categories[categoryKey];
            console.log('Processing category:', categoryKey, category);
            
            if (category && category.subcategories && category.subcategories.length > 0) {
                // Create category group
                const groupDiv = document.createElement('div');
                groupDiv.className = 'subcategory-group';
                
                // Add category title with select all for this category
                const titleDiv = document.createElement('div');
                titleDiv.className = 'subcategory-group-title';
                titleDiv.innerHTML = `
                    <i class="fas fa-folder-open me-2"></i>
                    ${category.name}
                    <button type="button" class="btn btn-xs btn-outline-primary ms-auto" 
                            onclick="contentUI.selectCategorySubcategories('${categoryKey}')"
                            title="Select all ${category.name} subcategories">
                        <i class="fas fa-check"></i>
                    </button>
                `;
                groupDiv.appendChild(titleDiv);
                
                // Add subcategories as checkboxes
                category.subcategories.forEach(sub => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'subcategory-checkbox';
                    
                    const checkboxId = `subcategory_${categoryKey}_${sub}`;
                    const isChecked = this.currentEditingContent && 
                                    this.currentEditingContent.subcategories && 
                                    this.currentEditingContent.subcategories.includes(sub);
                    
                    checkboxDiv.innerHTML = `
                        <input type="checkbox" 
                               id="${checkboxId}" 
                               value="${sub}" 
                               ${isChecked ? 'checked' : ''}
                               onchange="contentUI.updateSubcategorySelection()">
                        <label for="${checkboxId}">${this.formatSubcategoryName(sub)}</label>
                    `;
                    
                    groupDiv.appendChild(checkboxDiv);
                });
                
                subcategoryContainer.appendChild(groupDiv);
            }
        });
        
        // Add summary of selected subcategories
        this.updateSubcategorySummary();
    }

    formatSubcategoryName(subcategory) {
        return subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // New methods for enhanced subcategory handling
    selectAllSubcategories() {
        const checkboxes = document.querySelectorAll('#subcategoryCheckboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        this.updateSubcategorySummary();
    }

    clearAllSubcategories() {
        const checkboxes = document.querySelectorAll('#subcategoryCheckboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        this.updateSubcategorySummary();
    }

    selectCategorySubcategories(categoryKey) {
        const categoryCheckboxes = document.querySelectorAll(`input[id^="subcategory_${categoryKey}_"]`);
        categoryCheckboxes.forEach(checkbox => checkbox.checked = true);
        this.updateSubcategorySummary();
    }

    updateSubcategorySelection() {
        this.updateSubcategorySummary();
    }

    updateSubcategorySummary() {
        const selectedCount = document.querySelectorAll('#subcategoryCheckboxes input[type="checkbox"]:checked').length;
        const totalCount = document.querySelectorAll('#subcategoryCheckboxes input[type="checkbox"]').length;
        
        // Update the label to show selection count
        const label = document.querySelector('label[for*="Subcategories"]');
        if (label) {
            const labelText = label.querySelector('label') || label;
            if (selectedCount > 0) {
                labelText.innerHTML = `
                    Subcategories 
                    <span class="badge bg-primary ms-2">${selectedCount}/${totalCount}</span>
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-secondary" onclick="selectAllSubcategories()">
                            <i class="fas fa-check-double me-1"></i>Select All
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="clearAllSubcategories()">
                            <i class="fas fa-times me-1"></i>Clear All
                        </button>
                    </div>
                `;
            } else {
                labelText.innerHTML = `
                    Subcategories
                    <div class="btn-group btn-group-sm" role="group">
                        <button type="button" class="btn btn-outline-secondary" onclick="selectAllSubcategories()">
                            <i class="fas fa-check-double me-1"></i>Select All
                        </button>
                        <button type="button" class="btn btn-outline-secondary" onclick="clearAllSubcategories()">
                            <i class="fas fa-times me-1"></i>Clear All
                        </button>
                    </div>
                `;
            }
        }
    }

    // Render content grid
    renderContent(contents = null) {
        const contentGrid = document.getElementById('contentGrid');
        const contentToRender = contents || this.cms.contents;
        
        contentGrid.innerHTML = '';
        
        if (contentToRender.length === 0) {
            contentGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-folder-open fa-4x text-muted mb-3"></i>
                    <h4 class="text-muted">No content found</h4>
                    <p class="text-muted">Start by adding your first educational content</p>
                </div>
            `;
            return;
        }

        contentToRender.forEach(content => {
            const contentCard = this.createContentCard(content);
            contentGrid.appendChild(contentCard);
        });

        this.initializeDragAndDrop();
    }

    // Create content card
    createContentCard(content) {
        const card = document.createElement('div');
        card.className = 'content-card card h-100';
        card.dataset.contentId = content.id;
        card.draggable = true;

        const stateClass = `state-${content.state}`;
        const featuredBadge = content.featured ? '<span class="badge bg-warning ms-2"><i class="fas fa-star"></i></span>' : '';
        
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="card-title">${this.truncateText(content.title, 50)}${featuredBadge}</h6>
                    <span class="badge ${stateClass} state-badge">${content.state}</span>
                </div>
                
                <p class="card-text text-muted small">${this.truncateText(content.description, 100)}</p>
                
                <div class="mb-2">
                    ${content.categories.map(cat => `<span class="category-tag">${this.cms.categories[cat]?.name || cat}</span>`).join('')}
                </div>
                
                <div class="mb-2">
                    ${content.gradeLevels.map(grade => `<span class="badge bg-light text-dark me-1">${this.getGradeLevelName(grade)}</span>`).join('')}
                </div>
                
                <div class="mb-2">
                    ${this.renderFilePreviews(content.files)}
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${content.id}" 
                               onchange="contentUI.toggleContentSelection('${content.id}')">
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="contentUI.editContent('${content.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="contentUI.duplicateContent('${content.id}')" title="Duplicate">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="contentUI.deleteContent('${content.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Render file previews
    renderFilePreviews(files) {
        if (!files || files.length === 0) return '<small class="text-muted">No files</small>';
        
        return files.map(file => {
            const icon = this.getFileIcon(file.type);
            return `
                <span class="badge bg-light text-dark me-1 cursor-pointer" 
                      onclick="contentUI.previewFile('${file.url}', '${file.name}', '${file.type}')"
                      title="Click to preview">
                    <i class="${icon} me-1"></i>${file.name}
                </span>
            `;
        }).join('');
    }

    getFileIcon(fileType) {
        const icons = {
            'video': 'fas fa-video',
            'document': 'fas fa-file-pdf',
            'audio': 'fas fa-volume-up',
            'image': 'fas fa-image'
        };
        return icons[fileType] || 'fas fa-file';
    }

    // Initialize drag and drop
    initializeDragAndDrop() {
        const cards = document.querySelectorAll('.content-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
            card.addEventListener('dragover', this.handleCardDragOver.bind(this));
            card.addEventListener('drop', this.handleCardDrop.bind(this));
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }

    handleCardDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = this.getDragAfterElement(e.currentTarget.parentElement, e.clientY);
        if (afterElement == null) {
            e.currentTarget.parentElement.appendChild(this.draggedElement);
        } else {
            e.currentTarget.parentElement.insertBefore(this.draggedElement, afterElement);
        }
        
        return false;
    }

    handleCardDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        // Update content order
        const cards = Array.from(document.querySelectorAll('.content-card'));
        const newOrder = cards.map(card => card.dataset.contentId);
        this.cms.reorderContent(newOrder);
        
        return false;
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.content-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // File handling
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    handleBulkFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.processBulkFiles(files);
    }

    handleBulkFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processBulkFiles(files);
    }

    processFiles(files) {
        this.resetFileTypeCounts();
        this.uploadedFiles = [];
        const preview = document.getElementById('filePreviewGrid');
        preview.innerHTML = '';
        
        // Validate file limits
        const validFiles = this.validateFiles(files);
        if (validFiles.length === 0) {
            this.showToast('No valid files selected. Please check file type limits.', 'error');
            return;
        }
        
        // Process each file
        validFiles.forEach((file, index) => {
            const fileInfo = this.processFile(file);
            this.uploadedFiles.push(fileInfo);
            this.updateFileTypeCount(fileInfo.type, 1);
            
            // Add preview with delay for animation effect
            setTimeout(() => {
                preview.appendChild(this.createEnhancedFilePreview(fileInfo, index));
            }, index * 100);
        });
        
        this.updateFileCount();
        this.updateFileTypeLimits();
    }

    validateFiles(files) {
        const validFiles = [];
        const tempCounts = { video: 0, document: 0, audio: 0, image: 0 };
        
        Array.from(files).forEach(file => {
            const fileType = this.getFileType(file);
            
            // Check file type limits
            if (tempCounts[fileType] < this.fileTypeLimits[fileType]) {
                validFiles.push(file);
                tempCounts[fileType]++;
            } else {
                this.showToast(`File type limit exceeded: ${fileType} (max: ${this.fileTypeLimits[fileType]})`, 'error');
            }
        });
        
        return validFiles;
    }

    resetFileTypeCounts() {
        this.currentFileTypeCounts = { video: 0, document: 0, audio: 0, image: 0 };
    }

    updateFileTypeCount(type, delta) {
        this.currentFileTypeCounts[type] += delta;
    }

    updateFileCount() {
        const fileCount = document.getElementById('fileCount');
        if (fileCount) {
            fileCount.textContent = `${this.uploadedFiles.length} files`;
        }
    }

    updateFileTypeLimits() {
        // Update visual indicators for file type limits
        Object.keys(this.currentFileTypeCounts).forEach(type => {
            const limit = this.fileTypeLimits[type];
            const count = this.currentFileTypeCounts[type];
            const percentage = (count / limit) * 100;
            
            // Update UI to show接近 limits
            if (percentage >= 80) {
                this.showToast(`Warning: ${type} files near limit (${count}/${limit})`, 'warning');
            }
        });
    }

    processBulkFiles(files) {
        this.bulkFiles = [];
        const preview = document.getElementById('bulkUploadPreview');
        preview.innerHTML = '<h5>Files to Upload:</h5>';

        files.forEach(file => {
            const fileInfo = this.processFile(file);
            this.bulkFiles.push(fileInfo);
            preview.appendChild(this.createBulkFilePreview(fileInfo));
        });
    }

    processFile(file) {
        const fileType = this.getFileType(file);
        return {
            name: file.name,
            type: fileType,
            size: file.size,
            file: file,
            url: URL.createObjectURL(file),
            id: this.generateFileId()
        };
    }

    getFileType(file) {
        const types = {
            'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
            'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'audio': ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'],
            'image': ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
        };

        for (const [type, mimeTypes] of Object.entries(types)) {
            if (mimeTypes.includes(file.type)) {
                return type;
            }
        }
        return 'other';
    }

    createEnhancedFilePreview(fileInfo, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        previewItem.style.animationDelay = `${index * 0.1}s`;
        
        const previewContent = this.getPreviewContent(fileInfo);
        
        previewItem.innerHTML = `
            ${previewContent}
            <div class="file-info">
                <div class="file-name" title="${fileInfo.name}">${fileInfo.name}</div>
                <div class="file-size">${this.formatFileSize(fileInfo.size)}</div>
            </div>
            <button type="button" class="remove-file" 
                    onclick="contentUI.removeFile('${fileInfo.id}')" 
                    title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add click handler for preview modal
        previewItem.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-file')) {
                this.previewFile(fileInfo.url, fileInfo.name, fileInfo.type);
            }
        });
        
        return previewItem;
    }

    getPreviewContent(fileInfo) {
        switch (fileInfo.type) {
            case 'image':
                return `<img src="${fileInfo.url}" alt="${fileInfo.name}" loading="lazy">`;
            case 'video':
                return `
                    <video src="${fileInfo.url}" preload="metadata" muted>
                        Your browser does not support video preview.
                    </video>
                `;
            case 'audio':
                return `
                    <audio src="${fileInfo.url}" preload="metadata" controls>
                        Your browser does not support audio preview.
                    </audio>
                `;
            case 'document':
                return `
                    <div class="document-preview">
                        <i class="fas fa-file-pdf fa-3x text-danger mb-2"></i>
                        <div class="document-info">
                            <strong>PDF Document</strong>
                            <div class="document-name">${fileInfo.name}</div>
                            <small>${this.formatFileSize(fileInfo.size)}</small>
                        </div>
                    </div>
                `;
            default:
                return `
                    <div class="unknown-preview">
                        <i class="fas fa-file fa-3x text-muted mb-2"></i>
                        <div class="file-name">${fileInfo.name}</div>
                        <small>${this.formatFileSize(fileInfo.size)}</small>
                    </div>
                `;
        }
    }

    removeFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
        this.updateFileTypeCounts();
        this.refreshFilePreview();
        this.updateFileCount();
    }

    clearAllFiles() {
        this.uploadedFiles = [];
        this.resetFileTypeCounts();
        this.refreshFilePreview();
        this.updateFileCount();
        this.showToast('All files cleared', 'info');
    }

    refreshFilePreview() {
        const preview = document.getElementById('filePreviewGrid');
        if (!preview) return;
        
        preview.innerHTML = '';
        this.uploadedFiles.forEach((fileInfo, index) => {
            const previewItem = this.createEnhancedFilePreview(fileInfo, index);
            preview.appendChild(previewItem);
        });
    }

    // Preview mode toggle
    togglePreviewMode(mode) {
        this.previewMode = mode;
        const preview = document.getElementById('filePreviewGrid');
        if (!preview) return;
        
        preview.className = mode === 'grid' ? 'file-preview-grid' : 'file-preview-list';
        this.refreshFilePreview();
        
        // Update button states
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // Upload progress simulation
    simulateUploadProgress() {
        this.isUploading = true;
        this.uploadProgress = 0;
        
        const progressContainer = document.getElementById('uploadProgress');
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        const statusText = document.getElementById('uploadStatusText');
        
        progressContainer.style.display = 'block';
        
        const interval = setInterval(() => {
            this.uploadProgress += Math.random() * 15; // Simulate progress
            if (this.uploadProgress >= 100) {
                this.uploadProgress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    this.isUploading = false;
                    this.showToast('All files uploaded successfully!', 'success');
                }, 500);
            }
            
            progressBar.style.width = `${this.uploadProgress}%`;
            progressText.textContent = `${Math.round(this.uploadProgress)}%`;
            statusText.textContent = this.uploadProgress < 100 ? 'Uploading files...' : 'Upload complete!';
        }, 200);
    }

    // Cloud storage optimization
    optimizeFileForCloud(file) {
        return {
            ...file,
            cloudUrl: this.generateCloudUrl(file),
            cdnUrl: this.generateCdnUrl(file),
            thumbnailUrl: this.generateThumbnailUrl(file),
            optimized: true
        };
    }

    generateCloudUrl(file) {
        // Simulate cloud storage URL generation
        const timestamp = Date.now();
        const hash = btoa(file.name + timestamp).replace(/[^a-zA-Z0-9]/g, '');
        return `https://steam-cdn.example.com/files/${hash}/${file.name}`;
    }

    generateCdnUrl(file) {
        // Simulate CDN URL for faster delivery
        const timestamp = Date.now();
        return `https://steam-cdn.example.com/cdn/files/${timestamp}/${file.name}`;
    }

    generateThumbnailUrl(file) {
        // Simulate thumbnail generation
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        return `https://steam-cdn.example.com/thumbnails/${nameWithoutExt}.jpg`;
    }

    // Categories Management Methods
    showManageCategoriesModal() {
        this.selectedCategory = null;
        this.loadCategoriesForManagement();
        this.updateCategoryStatistics();
        
        const modal = new bootstrap.Modal(document.getElementById('manageCategoriesModal'));
        modal.show();
    }

    loadCategoriesForManagement() {
        this.renderCategoriesList();
        this.populateCategoryDropdown();
    }

    renderCategoriesList() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        categoriesList.innerHTML = '';
        
        Object.entries(this.cms.categories).forEach(([key, category]) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            if (this.selectedCategory === key) {
                categoryItem.classList.add('selected');
            }
            
            categoryItem.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-key">Key: ${key}</div>
                </div>
                <div class="category-actions">
                    <button type="button" class="btn btn-xs btn-outline-primary" 
                            onclick="contentUI.editCategory('${key}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-danger" 
                            onclick="contentUI.deleteCategory('${key}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-info" 
                            onclick="contentUI.selectCategory('${key}')" title="View Subcategories">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            
            categoriesList.appendChild(categoryItem);
        });
    }

    populateCategoryDropdown() {
        const dropdown = document.getElementById('categoryForSubcategory');
        if (!dropdown) return;
        
        dropdown.innerHTML = '<option value="">Select Category</option>';
        
        Object.entries(this.cms.categories).forEach(([key, category]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
        
        dropdown.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.updateSubcategoryButton();
            this.renderSubcategoriesList();
        });
    }

    updateSubcategoryButton() {
        const button = document.getElementById('addSubcategoryBtn');
        if (button) {
            button.disabled = !this.selectedCategory;
        }
    }

    renderSubcategoriesList() {
        const subcategoriesList = document.getElementById('subcategoriesList');
        if (!subcategoriesList) return;
        
        subcategoriesList.innerHTML = '';
        
        if (!this.selectedCategory) {
            subcategoriesList.innerHTML = `
                <div class="text-muted text-center py-4">
                    <i class="fas fa-info-circle me-2"></i>
                    Select a category to view and manage subcategories
                </div>
            `;
            return;
        }
        
        const category = this.cms.categories[this.selectedCategory];
        if (!category || !category.subcategories || category.subcategories.length === 0) {
            subcategoriesList.innerHTML = `
                <div class="text-muted text-center py-4">
                    <i class="fas fa-tags me-2"></i>
                    No subcategories found for ${category.name}
                </div>
            `;
            return;
        }
        
        category.subcategories.forEach((subcategory, index) => {
            const subcategoryItem = document.createElement('div');
            subcategoryItem.className = 'subcategory-item';
            
            subcategoryItem.innerHTML = `
                <div class="subcategory-info">
                    <div class="subcategory-name">${this.formatSubcategoryName(subcategory)}</div>
                    <div class="subcategory-count">Index: ${index}</div>
                </div>
                <div class="subcategory-actions">
                    <button type="button" class="btn btn-xs btn-outline-primary" 
                            onclick="contentUI.editSubcategory('${subcategory}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-danger" 
                            onclick="contentUI.deleteSubcategory('${subcategory}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            subcategoriesList.appendChild(subcategoryItem);
        });
    }

    updateCategoryStatistics() {
        const totalCategories = Object.keys(this.cms.categories).length;
        const totalSubcategories = Object.values(this.cms.categories)
            .reduce((total, cat) => total + (cat.subcategories ? cat.subcategories.length : 0), 0);
        const avgSubcategories = totalCategories > 0 ? (totalSubcategories / totalCategories).toFixed(1) : 0;
        const contentItems = this.cms.contents.length;
        
        document.getElementById('totalCategoriesCount').textContent = totalCategories;
        document.getElementById('totalSubcategoriesCount').textContent = totalSubcategories;
        document.getElementById('avgSubcategoriesCount').textContent = avgSubcategories;
        document.getElementById('contentItemsCount').textContent = contentItems;
    }

    // Category CRUD Operations
    showAddCategoryForm() {
        document.getElementById('addCategoryForm').style.display = 'block';
        document.getElementById('newCategoryName').focus();
    }

    hideAddCategoryForm() {
        document.getElementById('addCategoryForm').style.display = 'none';
        document.getElementById('newCategoryName').value = '';
        document.getElementById('newCategoryKey').value = '';
    }

    addCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        const key = document.getElementById('newCategoryKey').value.trim().toLowerCase().replace(/\s+/g, '-');
        
        if (!name || !key) {
            this.showToast('Please enter both category name and key', 'error');
            return;
        }
        
        if (this.cms.categories[key]) {
            this.showToast('Category with this key already exists', 'error');
            return;
        }
        
        this.cms.categories[key] = {
            name: name,
            subcategories: []
        };
        
        this.hideAddCategoryForm();
        this.renderCategoriesList();
        this.populateCategoryDropdown();
        this.updateCategoryStatistics();
        this.loadCategories(); // Update main form categories
        this.showToast('Category added successfully!', 'success');
    }

    editCategory(key) {
        const category = this.cms.categories[key];
        if (!category) return;
        
        const newName = prompt('Edit category name:', category.name);
        if (newName && newName.trim()) {
            category.name = newName.trim();
            this.renderCategoriesList();
            this.populateCategoryDropdown();
            this.updateCategoryStatistics();
            this.loadCategories();
            this.showToast('Category updated successfully!', 'success');
        }
    }

    deleteCategory(key) {
        const category = this.cms.categories[key];
        if (!category) return;
        
        if (!confirm(`Are you sure you want to delete "${category.name}"? This will also remove all subcategories.`)) {
            return;
        }
        
        delete this.cms.categories[key];
        this.renderCategoriesList();
        this.populateCategoryDropdown();
        this.updateCategoryStatistics();
        this.loadCategories();
        this.showToast('Category deleted successfully!', 'success');
    }

    selectCategory(key) {
        this.selectedCategory = key;
        document.getElementById('categoryForSubcategory').value = key;
        this.updateSubcategoryButton();
        this.renderCategoriesList();
        this.renderSubcategoriesList();
    }

    // Subcategory CRUD Operations
    showAddSubcategoryForm() {
        if (!this.selectedCategory) return;
        document.getElementById('addSubcategoryForm').style.display = 'block';
        document.getElementById('newSubcategoryName').focus();
    }

    hideAddSubcategoryForm() {
        document.getElementById('addSubcategoryForm').style.display = 'none';
        document.getElementById('newSubcategoryName').value = '';
    }

    addSubcategory() {
        const name = document.getElementById('newSubcategoryName').value.trim();
        if (!name) {
            this.showToast('Please enter subcategory name', 'error');
            return;
        }
        
        const category = this.cms.categories[this.selectedCategory];
        if (!category) return;
        
        const key = name.toLowerCase().replace(/\s+/g, '-');
        if (category.subcategories.includes(key)) {
            this.showToast('Subcategory already exists', 'error');
            return;
        }
        
        category.subcategories.push(key);
        this.hideAddSubcategoryForm();
        this.renderSubcategoriesList();
        this.updateCategoryStatistics();
        this.loadCategories();
        this.showToast('Subcategory added successfully!', 'success');
    }

    editSubcategory(oldKey) {
        const category = this.cms.categories[this.selectedCategory];
        if (!category) return;
        
        const currentName = this.formatSubcategoryName(oldKey);
        const newName = prompt('Edit subcategory name:', currentName);
        
        if (newName && newName.trim()) {
            const newKey = newName.trim().toLowerCase().replace(/\s+/g, '-');
            const index = category.subcategories.indexOf(oldKey);
            
            if (index !== -1) {
                category.subcategories[index] = newKey;
                this.renderSubcategoriesList();
                this.updateCategoryStatistics();
                this.loadCategories();
                this.showToast('Subcategory updated successfully!', 'success');
            }
        }
    }

    deleteSubcategory(key) {
        const category = this.cms.categories[this.selectedCategory];
        if (!category) return;
        
        if (!confirm(`Are you sure you want to delete "${this.formatSubcategoryName(key)}"?`)) {
            return;
        }
        
        const index = category.subcategories.indexOf(key);
        if (index !== -1) {
            category.subcategories.splice(index, 1);
            this.renderSubcategoriesList();
            this.updateCategoryStatistics();
            this.loadCategories();
            this.showToast('Subcategory deleted successfully!', 'success');
        }
    }

    exportCategories() {
        const categoriesData = JSON.stringify(this.cms.categories, null, 2);
        const blob = new Blob([categoriesData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'categories-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Categories exported successfully!', 'success');
    }

    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('manageCategories') === 'true') {
            // Open categories modal after a short delay to ensure page is loaded
            setTimeout(() => {
                this.showManageCategoriesModal();
            }, 500);
        }
    }

    createBulkFilePreview(fileInfo) {
        const preview = document.createElement('div');
        preview.className = 'card mb-2';
        
        preview.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="${this.getFileIcon(fileInfo.type)} me-2"></i>
                        <strong>${fileInfo.name}</strong>
                        <span class="text-muted ms-2">(${this.formatFileSize(fileInfo.size)})</span>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                            onclick="contentUI.removeBulkFile('${fileInfo.id}')" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        return preview;
    }

    getPreviewContent(fileInfo) {
        switch (fileInfo.type) {
            case 'image':
                return `<img src="${fileInfo.url}" class="file-preview" alt="${fileInfo.name}">`;
            case 'video':
                return `<video src="${fileInfo.url}" class="file-preview" controls></video>`;
            default:
                return `
                    <div class="file-preview d-flex align-items-center justify-content-center bg-light">
                        <i class="${this.getFileIcon(fileInfo.type)} fa-2x text-muted"></i>
                    </div>
                `;
        }
    }

    removeFile(fileId) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.id !== fileId);
        this.refreshFilePreview();
    }

    removeBulkFile(fileId) {
        this.bulkFiles = this.bulkFiles.filter(file => file.id !== fileId);
        this.refreshBulkFilePreview();
    }

    refreshFilePreview() {
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';
        this.uploadedFiles.forEach(file => {
            preview.appendChild(this.createFilePreview(file));
        });
    }

    refreshBulkFilePreview() {
        const preview = document.getElementById('bulkUploadPreview');
        preview.innerHTML = '<h5>Files to Upload:</h5>';
        this.bulkFiles.forEach(file => {
            preview.appendChild(this.createBulkFilePreview(file));
        });
    }

    // Content management
    saveContent() {
        const formData = this.getFormData();
        
        try {
            if (this.currentEditingContent) {
                const updatedContent = this.cms.updateContent(this.currentEditingContent.id, formData);
                this.updateSearchIndex(this.currentEditingContent.id, updatedContent);
                this.showToast('Content updated successfully!', 'success');
            } else {
                const newContent = this.cms.createContent(formData);
                this.updateSearchIndex(newContent.id, newContent);
                this.showToast('Content created successfully!', 'success');
            }
            
            this.closeModal();
            this.renderContent();
        } catch (error) {
            this.showToast('Error saving content: ' + error.message, 'error');
        }
    }

    getFormData() {
        const categories = Array.from(document.getElementById('contentCategories').selectedOptions)
            .map(option => option.value);
        const subcategories = Array.from(document.querySelectorAll('#subcategoryCheckboxes input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        const gradeLevels = Array.from(document.getElementById('contentGradeLevels').selectedOptions)
            .map(option => option.value);
        const tags = document.getElementById('contentTags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);

        return {
            title: document.getElementById('contentTitle').value,
            description: document.getElementById('contentDescription').value,
            state: document.getElementById('contentState').value,
            categories: categories,
            subcategories: subcategories,
            gradeLevels: gradeLevels,
            tags: tags,
            files: this.uploadedFiles.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url
            })),
            featured: document.getElementById('contentFeatured').checked
        };
    }

    editContent(contentId) {
        const content = this.cms.getContent(contentId);
        if (!content) return;

        this.currentEditingContent = content;
        this.populateForm(content);
        this.showModal();
    }

    populateForm(content) {
        document.getElementById('modalTitle').textContent = 'Edit Content';
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentDescription').value = content.description;
        document.getElementById('contentState').value = content.state;
        document.getElementById('contentFeatured').checked = content.featured;
        document.getElementById('contentTags').value = content.tags.join(', ');

        // Set categories
        const categorySelect = document.getElementById('contentCategories');
        Array.from(categorySelect.options).forEach(option => {
            option.selected = content.categories.includes(option.value);
        });

        // Update and set subcategories
        this.updateSubcategories();
        const subcategorySelect = document.getElementById('contentSubcategories');
        Array.from(subcategorySelect.options).forEach(option => {
            option.selected = content.subcategories.includes(option.value);
        });

        // Set grade levels
        const gradeSelect = document.getElementById('contentGradeLevels');
        Array.from(gradeSelect.options).forEach(option => {
            option.selected = content.gradeLevels.includes(option.value);
        });

        // Load files
        this.uploadedFiles = content.files.map(file => ({
            ...file,
            id: this.generateFileId()
        }));
        this.refreshFilePreview();
    }

    duplicateContent(contentId) {
        const content = this.cms.getContent(contentId);
        if (!content) return;

        const duplicatedContent = {
            ...content,
            title: content.title + ' (Copy)',
            state: 'draft'
        };
        delete duplicatedContent.id;
        delete duplicatedContent.createdAt;
        delete duplicatedContent.updatedAt;

        const newContent = this.cms.createContent(duplicatedContent);
        this.updateSearchIndex(newContent.id, newContent);
        this.renderContent();
        this.showToast('Content duplicated successfully!', 'success');
    }

    deleteContent(contentId) {
        if (confirm('Are you sure you want to delete this content?')) {
            this.cms.deleteContent(contentId);
            this.removeFromSearchIndex(contentId);
            this.renderContent();
            this.showToast('Content deleted successfully!', 'success');
        }
    }

    // Bulk operations
    processBulkUpload() {
        if (this.bulkFiles.length === 0) {
            this.showToast('Please select files to upload', 'warning');
            return;
        }

        const defaultState = document.getElementById('bulkDefaultState').value;
        const defaultCategories = Array.from(document.getElementById('bulkDefaultCategories').selectedOptions)
            .map(option => option.value);
        const defaultGradeLevels = Array.from(document.getElementById('bulkDefaultGradeLevels').selectedOptions)
            .map(option => option.value);

        const contentsData = this.bulkFiles.map(file => ({
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            description: `Bulk uploaded content: ${file.name}`,
            state: defaultState,
            categories: defaultCategories,
            subcategories: [],
            gradeLevels: defaultGradeLevels,
            files: [{
                name: file.name,
                type: file.type,
                size: file.size,
                url: file.url
            }],
            tags: ['bulk-upload']
        }));

        try {
            const uploadedContents = this.cms.bulkUpload(contentsData);
            this.showToast(`${uploadedContents.length} contents uploaded successfully!`, 'success');
            this.closeBulkUploadModal();
            this.renderContent();
        } catch (error) {
            this.showToast('Error uploading content: ' + error.message, 'error');
        }
    }

    // Selection management
    toggleContentSelection(contentId) {
        if (this.selectedContents.has(contentId)) {
            this.selectedContents.delete(contentId);
        } else {
            this.selectedContents.add(contentId);
        }
        
        this.updateBulkActions();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (this.selectedContents.size > 0) {
            bulkActions.classList.remove('d-none');
            selectedCount.textContent = this.selectedContents.size;
        } else {
            bulkActions.classList.add('d-none');
        }
    }

    clearSelection() {
        this.selectedContents.clear();
        document.querySelectorAll('.content-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateBulkActions();
    }

    bulkAssignCategories() {
        // Show modal for bulk category assignment
        this.showToast('Bulk category assignment feature coming soon!', 'info');
    }

    bulkPublish() {
        const contentIds = Array.from(this.selectedContents);
        const results = this.cms.bulkUpdateState(contentIds, 'published');
        this.showToast(`${results.length} contents published!`, 'success');
        this.clearSelection();
        this.renderContent();
    }

    bulkArchive() {
        const contentIds = Array.from(this.selectedContents);
        const results = this.cms.bulkUpdateState(contentIds, 'archived');
        this.showToast(`${results.length} contents archived!`, 'success');
        this.clearSelection();
        this.renderContent();
    }

    bulkDelete() {
        if (confirm(`Are you sure you want to delete ${this.selectedContents.size} contents?`)) {
            const contentIds = Array.from(this.selectedContents);
            contentIds.forEach(id => this.cms.deleteContent(id));
            this.showToast(`${contentIds.length} contents deleted!`, 'success');
            this.clearSelection();
            this.renderContent();
        }
    }

    // Advanced Filtering with Search Index
    applyFilters() {
        const startTime = performance.now();
        
        // Collect all filter values
        this.currentFilters = {
            search: document.getElementById('searchInput')?.value?.toLowerCase() || '',
            state: document.getElementById('stateFilter')?.value || '',
            categories: Array.from(document.getElementById('categoryFilter')?.selectedOptions || [])
                .map(option => option.value),
            gradeLevels: document.getElementById('gradeFilter')?.value ? 
                [document.getElementById('gradeFilter').value] : [],
            fileType: document.getElementById('fileTypeFilter')?.value || '',
            subcategories: Array.from(document.getElementById('subcategoryFilter')?.selectedOptions || [])
                .map(option => option.value),
            dateRange: document.getElementById('dateRangeFilter')?.value || '',
            dateFrom: document.getElementById('dateFrom')?.value || '',
            dateTo: document.getElementById('dateTo')?.value || '',
            featured: document.getElementById('featuredFilter')?.value || '',
            sortBy: document.getElementById('sortBy')?.value || 'updatedAt-desc'
        };

        // Apply filters using search index for performance
        const filteredContent = this.performAdvancedSearch();
        
        // Update UI
        this.renderContent(filteredContent);
        this.updateSearchResults(filteredContent.length, performance.now() - startTime);
        this.updateSubcategoryFilter();
    }

    performAdvancedSearch() {
        let results = [];
        
        // Use search index for fast filtering
        for (const [contentId, indexData] of this.searchIndex) {
            if (this.passesAllFilters(indexData)) {
                const content = this.cms.getContent(contentId);
                if (content) {
                    results.push(content);
                }
            }
        }
        
        // Apply sorting
        return this.sortResults(results, this.currentFilters.sortBy);
    }

    passesAllFilters(indexData) {
        // Search filter (title, description, tags)
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search;
            const inTitle = indexData.title.includes(searchTerm);
            const inDescription = indexData.description.includes(searchTerm);
            const inTags = indexData.tags.some(tag => tag.includes(searchTerm));
            
            if (!inTitle && !inDescription && !inTags) {
                return false;
            }
        }
        
        // State filter
        if (this.currentFilters.state && indexData.state !== this.currentFilters.state) {
            return false;
        }
        
        // Categories filter
        if (this.currentFilters.categories.length > 0) {
            const hasCategory = this.currentFilters.categories.some(cat => 
                indexData.categories.includes(cat));
            if (!hasCategory) return false;
        }
        
        // Grade levels filter
        if (this.currentFilters.gradeLevels.length > 0) {
            const hasGradeLevel = this.currentFilters.gradeLevels.some(grade => 
                indexData.gradeLevels.includes(grade));
            if (!hasGradeLevel) return false;
        }
        
        // File type filter
        if (this.currentFilters.fileType) {
            if (!indexData.fileTypes.includes(this.currentFilters.fileType)) {
                return false;
            }
        }
        
        // Subcategories filter
        if (this.currentFilters.subcategories.length > 0) {
            const hasSubcategory = this.currentFilters.subcategories.some(sub => 
                indexData.subcategories.includes(sub));
            if (!hasSubcategory) return false;
        }
        
        // Date range filter
        if (!this.passesDateFilter(indexData)) {
            return false;
        }
        
        // Featured filter
        if (this.currentFilters.featured) {
            if (this.currentFilters.featured === 'featured' && !indexData.featured) {
                return false;
            }
            if (this.currentFilters.featured === 'not-featured' && indexData.featured) {
                return false;
            }
        }
        
        return true;
    }

    passesDateFilter(indexData) {
        if (!this.currentFilters.dateRange) return true;
        
        const now = new Date();
        const contentDate = new Date(indexData.updatedAt);
        
        switch (this.currentFilters.dateRange) {
            case 'today':
                return contentDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return contentDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return contentDate >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                return contentDate >= quarterAgo;
            case 'year':
                const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                return contentDate >= yearAgo;
            case 'custom':
                if (this.currentFilters.dateFrom) {
                    const fromDate = new Date(this.currentFilters.dateFrom);
                    if (contentDate < fromDate) return false;
                }
                if (this.currentFilters.dateTo) {
                    const toDate = new Date(this.currentFilters.dateTo);
                    toDate.setHours(23, 59, 59, 999); // End of day
                    if (contentDate > toDate) return false;
                }
                return true;
            default:
                return true;
        }
    }

    sortResults(results, sortBy) {
        const sorted = [...results];
        
        switch (sortBy) {
            case 'updatedAt-desc':
                return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            case 'createdAt-desc':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'title-asc':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'title-desc':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'state-asc':
                return sorted.sort((a, b) => a.state.localeCompare(b.state));
            default:
                return sorted;
        }
    }

    updateSearchResults(count, searchTime) {
        document.getElementById('resultCount').textContent = count;
        
        if (searchTime > 0) {
            document.getElementById('searchTime').textContent = 
                `(${searchTime.toFixed(1)}ms)`;
        } else {
            document.getElementById('searchTime').textContent = '';
        }
    }

    updateSubcategoryFilter() {
        const selectedCategories = this.currentFilters.categories;
        const subcategoryFilter = document.getElementById('subcategoryFilter');
        
        if (!subcategoryFilter) return;
        
        // Clear current options
        subcategoryFilter.innerHTML = '<option value="">All Subcategories</option>';
        
        if (selectedCategories.length === 0) return;
        
        // Get all subcategories from selected categories
        const allSubcategories = new Set();
        selectedCategories.forEach(categoryKey => {
            const category = this.cms.categories[categoryKey];
            if (category && category.subcategories) {
                category.subcategories.forEach(sub => {
                    allSubcategories.add(sub);
                });
            }
        });
        
        // Add options to subcategory filter
        Array.from(allSubcategories).sort().forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            option.textContent = this.formatSubcategoryName(subcategory);
            subcategoryFilter.appendChild(option);
        });
    }

    handleDateRangeChange(value) {
        const customDateRange = document.getElementById('customDateRange');
        if (!customDateRange) return;
        
        if (value === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
        }
    }

    // File preview
    previewFile(url, name, type) {
        const modal = document.getElementById('previewModal');
        const modalTitle = document.getElementById('previewTitle');
        const modalBody = document.getElementById('previewBody');
        const downloadBtn = document.getElementById('downloadBtn');

        modalTitle.textContent = name;
        downloadBtn.onclick = () => this.downloadFile(url, name);

        let previewContent = '';
        switch (type) {
            case 'image':
                previewContent = `<img src="${url}" class="img-fluid" alt="${name}">`;
                break;
            case 'video':
                previewContent = `<video src="${url}" controls class="w-100"></video>`;
                break;
            case 'audio':
                previewContent = `
                    <div class="text-center">
                        <i class="fas fa-volume-up fa-4x text-primary mb-3"></i>
                        <audio src="${url}" controls class="w-100"></audio>
                    </div>
                `;
                break;
            case 'document':
                previewContent = `
                    <div class="text-center">
                        <i class="fas fa-file-pdf fa-4x text-danger mb-3"></i>
                        <p>PDF Document: ${name}</p>
                        <button class="btn btn-primary" onclick="window.open('${url}', '_blank')">
                            <i class="fas fa-external-link-alt me-2"></i>Open in New Tab
                        </button>
                    </div>
                `;
                break;
            default:
                previewContent = `
                    <div class="text-center">
                        <i class="fas fa-file fa-4x text-muted mb-3"></i>
                        <p>Cannot preview this file type</p>
                    </div>
                `;
        }

        modalBody.innerHTML = previewContent;
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    downloadFile(url, name) {
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Modal management
    showModal() {
        const modal = new bootstrap.Modal(document.getElementById('contentModal'));
        modal.show();
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
        if (modal) modal.hide();
        
        // Reset form
        document.getElementById('contentForm').reset();
        this.currentEditingContent = null;
        this.uploadedFiles = [];
        this.refreshFilePreview();
        document.getElementById('modalTitle').textContent = 'Add New Content';
    }

    closeBulkUploadModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('bulkUploadModal'));
        if (modal) modal.hide();
        
        this.bulkFiles = [];
        this.refreshBulkFilePreview();
    }

    // Utility functions
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatSubcategoryName(subcategory) {
        return subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getGradeLevelName(gradeId) {
        const gradeLabels = {
            grade1: 'Grade 1',
            grade2: 'Grade 2',
            grade3: 'Grade 3',
            grade4: 'Grade 4',
            grade5: 'Grade 5',
            grade6: 'Grade 6',
            grade7: 'Grade 7',
            grade8: 'Grade 8',
            grade9: 'Grade 9',
            grade10: 'Grade 10',
            grade11: 'Grade 11',
            grade12: 'Grade 12',
            postmatric: 'Post-Matric'
        };
        return gradeLabels[gradeId] || gradeId;
    }

    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showToast(message, type = 'info') {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for inline event handlers
window.contentUI = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing content UI...');
    
    // Ensure CMS is loaded
    if (typeof steamCMS !== 'undefined') {
        window.steamCMS.loadFromStorage();
        console.log('CMS loaded:', window.steamCMS);
        window.contentUI = new ContentManagementUI();
    } else {
        console.error('CMS not loaded!');
    }
});

// Global functions for HTML onclick handlers
window.showContentModal = () => window.contentUI.showModal();
window.showBulkUploadModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('bulkUploadModal'));
    modal.show();
};
window.saveContent = () => window.contentUI.saveContent();
window.processBulkUpload = () => window.contentUI.processBulkUpload();
window.applyFilters = () => window.contentUI.applyFilters();
window.clearSelection = () => window.contentUI.clearSelection();
window.bulkAssignCategories = () => window.contentUI.bulkAssignCategories();
window.bulkPublish = () => window.contentUI.bulkPublish();
window.bulkArchive = () => window.contentUI.bulkArchive();
window.bulkDelete = () => window.contentUI.bulkDelete();

// Debug function
window.debugCategories = () => {
    console.log('=== DEBUG INFO ===');
    console.log('CMS Object:', window.steamCMS);
    console.log('Categories:', window.steamCMS.categories);
    console.log('Language Arts Category:', window.steamCMS.categories['language-arts']);
    
    // Test subcategory extraction
    const categorySelect = document.getElementById('contentCategories');
    const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
    console.log('Selected categories in UI:', selectedCategories);
    
    selectedCategories.forEach(catKey => {
        const cat = window.steamCMS.categories[catKey];
        if (cat) {
            console.log(`Category ${catKey}:`, cat.name, 'Subcategories:', cat.subcategories);
        } else {
            console.log(`Category ${catKey} not found!`);
        }
    });
    
    alert('Debug info logged to console. Press F12 to view.');
};

// Global functions for subcategory selection
window.selectAllSubcategories = () => {
    if (window.contentUI) {
        window.contentUI.selectAllSubcategories();
    }
};

window.clearAllSubcategories = () => {
    if (window.contentUI) {
        window.contentUI.clearAllSubcategories();
    }
};

// Global functions for advanced filtering
window.toggleAdvancedFilters = () => {
    if (window.contentUI) {
        const advancedFilters = document.getElementById('advancedFilters');
        if (advancedFilters) {
            if (advancedFilters.style.display === 'none') {
                advancedFilters.style.display = 'block';
                event.target.innerHTML = '<i class="fas fa-cog me-1"></i>Basic';
            } else {
                advancedFilters.style.display = 'none';
                event.target.innerHTML = '<i class="fas fa-cog me-1"></i>Advanced';
            }
        }
    }
};

window.resetFilters = () => {
    if (window.contentUI) {
        // Reset all filter fields
        document.getElementById('searchInput').value = '';
        document.getElementById('stateFilter').value = '';
        document.getElementById('categoryFilter').selectedIndex = -1;
        document.getElementById('gradeFilter').value = '';
        document.getElementById('fileTypeFilter').value = '';
        document.getElementById('subcategoryFilter').value = '';
        document.getElementById('dateRangeFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('featuredFilter').value = '';
        document.getElementById('sortBy').value = 'updatedAt-desc';
        
        // Hide custom date range
        const customDateRange = document.getElementById('customDateRange');
        if (customDateRange) {
            customDateRange.style.display = 'none';
        }
        
        // Apply empty filters
        window.contentUI.applyFilters();
    }
};

window.handleSearchKeyup = (event) => {
    if (window.contentUI) {
        // Support Enter key for search
        if (event.key === 'Enter') {
            window.contentUI.applyFilters();
        }
    }
};

// Global functions for advanced file management
window.clearAllFiles = () => {
    if (window.contentUI) {
        window.contentUI.clearAllFiles();
    }
};

window.togglePreviewMode = (mode) => {
    if (window.contentUI) {
        window.contentUI.togglePreviewMode(mode);
    }
};

window.simulateUploadProgress = () => {
    if (window.contentUI) {
        window.contentUI.simulateUploadProgress();
    }
};

// Global functions for categories management
window.showManageCategoriesModal = () => {
    if (window.contentUI) {
        window.contentUI.showManageCategoriesModal();
    }
};

window.showAddCategoryForm = () => {
    if (window.contentUI) {
        window.contentUI.showAddCategoryForm();
    }
};

window.hideAddCategoryForm = () => {
    if (window.contentUI) {
        window.contentUI.hideAddCategoryForm();
    }
};

window.addCategory = () => {
    if (window.contentUI) {
        window.contentUI.addCategory();
    }
};

window.showAddSubcategoryForm = () => {
    if (window.contentUI) {
        window.contentUI.showAddSubcategoryForm();
    }
};

window.hideAddSubcategoryForm = () => {
    if (window.contentUI) {
        window.contentUI.hideAddSubcategoryForm();
    }
};

window.addSubcategory = () => {
    if (window.contentUI) {
        window.contentUI.addSubcategory();
    }
};

window.exportCategories = () => {
    if (window.contentUI) {
        window.contentUI.exportCategories();
    }
};
