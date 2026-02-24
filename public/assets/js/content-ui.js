// Content Management UI Controller
class ContentManagementUI {
    constructor() {
        this.cms = steamCMS;
        this.selectedContents = new Set();
        this.currentEditingContent = null;
        this.uploadedFiles = [];
        this.bulkFiles = [];
        this.draggedElement = null;
        
        this.initializeEventListeners();
        this.loadCategories();
        this.renderContent();
    }

    initializeEventListeners() {
        // Search and filters
        document.getElementById('searchInput').addEventListener('input', this.debounce(() => this.applyFilters(), 300));
        document.getElementById('stateFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('gradeFilter').addEventListener('change', () => this.applyFilters());

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
        this.uploadedFiles = [];
        const preview = document.getElementById('filePreview');
        preview.innerHTML = '';

        files.forEach(file => {
            const fileInfo = this.processFile(file);
            this.uploadedFiles.push(fileInfo);
            preview.appendChild(this.createFilePreview(fileInfo));
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

    createFilePreview(fileInfo) {
        const preview = document.createElement('div');
        preview.className = 'd-inline-block position-relative me-2 mb-2';
        
        const previewContent = this.getPreviewContent(fileInfo);
        
        preview.innerHTML = `
            ${previewContent}
            <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                    onclick="contentUI.removeFile('${fileInfo.id}')" title="Remove">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return preview;
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
                this.cms.updateContent(this.currentEditingContent.id, formData);
                this.showToast('Content updated successfully!', 'success');
            } else {
                this.cms.createContent(formData);
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

        this.cms.createContent(duplicatedContent);
        this.renderContent();
        this.showToast('Content duplicated successfully!', 'success');
    }

    deleteContent(contentId) {
        if (confirm('Are you sure you want to delete this content?')) {
            this.cms.deleteContent(contentId);
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

    // Filtering
    applyFilters() {
        const filters = {
            search: document.getElementById('searchInput').value,
            state: document.getElementById('stateFilter').value,
            categories: Array.from(document.getElementById('categoryFilter').selectedOptions)
                .map(option => option.value),
            gradeLevels: document.getElementById('gradeFilter').value ? 
                [document.getElementById('gradeFilter').value] : []
        };

        const filteredContent = this.cms.filterContent(filters);
        this.renderContent(filteredContent);
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
