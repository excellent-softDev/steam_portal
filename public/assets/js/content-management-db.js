// STEAM Portal Content Management System - Database Version
class ContentManagementSystem {
    constructor() {
        this.categories = {}; // Will be loaded from database
        this.contents = [];
        this.isLoaded = false;
        this.initializeStorage();
        this.loadCategoriesFromDatabase();
    }

    // Load categories and subcategories from database
    async loadCategoriesFromDatabase() {
        try {
            // Load categories from database
            const categoriesResponse = await fetch('/api/categories');
            const categoriesData = await categoriesResponse.json();
            
            if (categoriesData.success) {
                // Initialize categories object
                this.categories = {};
                
                // Load each category and its subcategories
                for (const category of categoriesData.data) {
                    this.categories[category.id] = {
                        name: category.name,
                        subcategories: []
                    };
                }
                
                // Load subcategories for each category
                const subcategoriesResponse = await fetch('/api/subcategories');
                const subcategoriesData = await subcategoriesResponse.json();
                
                if (subcategoriesData.success) {
                    subcategoriesData.data.forEach(subcategory => {
                        if (this.categories[subcategory.category_id]) {
                            this.categories[subcategory.category_id].subcategories.push({
                                id: subcategory.id,
                                name: subcategory.name
                            });
                        }
                    });
                }
                
                this.isLoaded = true;
                console.log('Categories loaded from database:', this.categories);
                
                // Populate UI elements after loading
                this.populateCategoryDropdowns();
                this.populateSubcategoryCheckboxes();
            }
        } catch (error) {
            console.error('Error loading categories from database:', error);
            // Fallback to hardcoded categories if database fails
            this.categories = this.getFallbackCategories();
            this.isLoaded = true;
        }
    }

    // Fallback categories if database fails
    getFallbackCategories() {
        return {
            'math': {
                name: 'Mathematics',
                subcategories: [
                    { id: 'algebra', name: 'Algebra' },
                    { id: 'geometry', name: 'Geometry' },
                    { id: 'calculus', name: 'Calculus' }
                ]
            },
            'science': {
                name: 'Science',
                subcategories: [
                    { id: 'physics', name: 'Physics' },
                    { id: 'chemistry', name: 'Chemistry' },
                    { id: 'biology', name: 'Biology' }
                ]
            },
            'arts': {
                name: 'Arts',
                subcategories: [
                    { id: 'painting', name: 'Painting' },
                    { id: 'music', name: 'Music' },
                    { id: 'sculpture', name: 'Sculpture' }
                ]
            },
            'technology': {
                name: 'Technology',
                subcategories: [
                    { id: 'programming', name: 'Programming' },
                    { id: 'web-dev', name: 'Web Development' },
                    { id: 'robotics', name: 'Robotics' }
                ]
            },
            'engineering': {
                name: 'Engineering',
                subcategories: [
                    { id: 'mechanical', name: 'Mechanical Engineering' },
                    { id: 'civil', name: 'Civil Engineering' },
                    { id: 'electrical', name: 'Electrical Engineering' }
                ]
            }
        };
    }

    // Wait for categories to be loaded
    async waitForCategoriesLoad() {
        while (!this.isLoaded) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return this.categories;
    }

    // Populate category dropdowns in the UI
    populateCategoryDropdowns() {
        // Populate main category filter dropdown
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            Object.entries(this.categories).forEach(([key, category]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }

        // Populate category dropdown for subcategory management
        const categoryForSubcategory = document.getElementById('categoryForSubcategory');
        if (categoryForSubcategory) {
            categoryForSubcategory.innerHTML = '<option value="">Select Category</option>';
            Object.entries(this.categories).forEach(([key, category]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = category.name;
                categoryForSubcategory.appendChild(option);
            });
        }
    }

    // Populate subcategory checkboxes in the UI
    populateSubcategoryCheckboxes() {
        const subcategoryCheckboxes = document.getElementById('subcategoryCheckboxes');
        if (!subcategoryCheckboxes) return;

        subcategoryCheckboxes.innerHTML = '';

        Object.entries(this.categories).forEach(([categoryKey, category]) => {
            if (category.subcategories.length > 0) {
                // Create category group
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'subcategory-group';

                // Add category title
                const categoryTitle = document.createElement('div');
                categoryTitle.className = 'subcategory-group-title';
                categoryTitle.innerHTML = `
                    <strong>${category.name}</strong>
                    <div class="d-inline-block ms-2">
                        <button type="button" class="btn btn-xs btn-outline-primary" onclick="selectAllSubcategories('${categoryKey}')">
                            Select All
                        </button>
                        <button type="button" class="btn btn-xs btn-outline-secondary" onclick="clearAllSubcategories('${categoryKey}')">
                            Clear All
                        </button>
                    </div>
                `;
                categoryGroup.appendChild(categoryTitle);

                // Add subcategory checkboxes
                category.subcategories.forEach(subcategory => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'subcategory-checkbox';
                    checkboxDiv.innerHTML = `
                        <input type="checkbox" id="sub_${subcategory.id}" value="${subcategory.id}" name="subcategories">
                        <label for="sub_${subcategory.id}">${subcategory.name}</label>
                    `;
                    categoryGroup.appendChild(checkboxDiv);
                });

                subcategoryCheckboxes.appendChild(categoryGroup);
            }
        });
    }

    // Get all selected subcategories
    getSelectedSubcategories() {
        const checkboxes = document.querySelectorAll('input[name="subcategories"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Select all subcategories for a category
    selectAllSubcategories(categoryKey) {
        const category = this.categories[categoryKey];
        if (!category) return;

        category.subcategories.forEach(subcategory => {
            const checkbox = document.getElementById(`sub_${subcategory.id}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Clear all subcategories for a category
    clearAllSubcategories(categoryKey) {
        const category = this.categories[categoryKey];
        if (!category) return;

        category.subcategories.forEach(subcategory => {
            const checkbox = document.getElementById(`sub_${subcategory.id}`);
            if (checkbox) checkbox.checked = false;
        });
    }

    // Grade levels
    getGradeLevels() {
        return [
            { id: 'grade1', name: 'Grade 1' },
            { id: 'grade2', name: 'Grade 2' },
            { id: 'grade3', name: 'Grade 3' },
            { id: 'grade4', name: 'Grade 4' },
            { id: 'grade5', name: 'Grade 5' },
            { id: 'grade6', name: 'Grade 6' },
            { id: 'grade7', name: 'Grade 7' },
            { id: 'grade8', name: 'Grade 8' },
            { id: 'grade9', name: 'Grade 9' },
            { id: 'grade10', name: 'Grade 10' },
            { id: 'grade11', name: 'Grade 11' },
            { id: 'grade12', name: 'Grade 12' },
            { id: 'postmatric', name: 'Post-Matric' }
        ];
    }

    // Content states
    getContentStates() {
        return ['draft', 'published', 'archived'];
    }

    // File types supported
    getSupportedFileTypes() {
        return {
            video: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
            document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
            audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac'],
            image: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
        };
    }

    // Initialize localStorage
    initializeStorage() {
        if (!localStorage.getItem('steam_contents')) {
            localStorage.setItem('steam_contents', JSON.stringify(this.contents));
        }
    }

    // Get categories as array for forms
    getCategoriesArray() {
        return Object.entries(this.categories).map(([key, category]) => ({
            key: key,
            name: category.name,
            subcategories: category.subcategories
        }));
    }

    // Get subcategories as flat array
    getAllSubcategories() {
        const allSubcategories = [];
        Object.entries(this.categories).forEach(([categoryKey, category]) => {
            category.subcategories.forEach(subcategory => {
                allSubcategories.push({
                    ...subcategory,
                    categoryKey: categoryKey,
                    categoryName: category.name
                });
            });
        });
        return allSubcategories;
    }

    // Content management methods (keeping existing functionality)
    generateId() {
        return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Load from localStorage
    loadFromStorage() {
        const savedContents = localStorage.getItem('steam_contents');
        if (savedContents) {
            this.contents = JSON.parse(savedContents);
        }
    }

    // Save contents to localStorage
    saveContents() {
        localStorage.setItem('steam_contents', JSON.stringify(this.contents));
    }

    // Export data
    exportData() {
        return {
            categories: this.categories,
            contents: this.contents,
            exportedAt: new Date().toISOString()
        };
    }

    // Import data
    importData(data) {
        if (data.contents) {
            this.contents = data.contents;
            this.saveContents();
        }
    }

    // Add content (keeping existing logic)
    addContent(contentData) {
        const content = {
            id: this.generateId(),
            ...contentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            state: contentData.state || 'draft'
        };

        this.contents.unshift(content);
        this.saveContents();
        return content;
    }

    // Get content by ID
    getContent(id) {
        return this.contents.find(content => content.id === id);
    }

    // Update content
    updateContent(id, updates) {
        const index = this.contents.findIndex(content => content.id === id);
        if (index !== -1) {
            this.contents[index] = {
                ...this.contents[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveContents();
            return this.contents[index];
        }
        return null;
    }

    // Delete content
    deleteContent(id) {
        const index = this.contents.findIndex(content => content.id === id);
        if (index !== -1) {
            this.contents.splice(index, 1);
            this.saveContents();
            return true;
        }
        return false;
    }

    // Get all content
    getAllContent() {
        return this.contents;
    }

    // Filter content
    filterContent(filters) {
        return this.contents.filter(content => {
            // Filter by state
            if (filters.state && content.state !== filters.state) return false;

            // Filter by categories
            if (filters.categories && filters.categories.length > 0) {
                const hasCategory = filters.categories.some(cat => 
                    content.categories && content.categories.includes(cat)
                );
                if (!hasCategory) return false;
            }

            // Filter by subcategories
            if (filters.subcategories && filters.subcategories.length > 0) {
                const hasSubcategory = filters.subcategories.some(sub => 
                    content.subcategories && content.subcategories.includes(sub)
                );
                if (!hasSubcategory) return false;
            }

            // Filter by grade levels
            if (filters.gradeLevels && filters.gradeLevels.length > 0) {
                const hasGradeLevel = filters.gradeLevels.some(grade => 
                    content.gradeLevels && content.gradeLevels.includes(grade)
                );
                if (!hasGradeLevel) return false;
            }

            return true;
        });
    }
}

// Initialize the CMS with async loading
async function initializeCMS() {
    const steamCMS = new ContentManagementSystem();
    await steamCMS.waitForCategoriesLoad();
    return steamCMS;
}

// Initialize the CMS
let steamCMS;
initializeCMS().then(cms => {
    steamCMS = cms;
    window.steamCMS = steamCMS; // Assign to window after initialization
    console.log('CMS initialized with database categories');
    console.log('window.steamCMS assigned:', window.steamCMS);
    // Trigger any dependent initialization
    if (typeof window.cmsInitialized === 'function') {
        window.cmsInitialized();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManagementSystem;
} else {
    window.ContentManagementSystem = ContentManagementSystem;
}
