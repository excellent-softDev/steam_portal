// STEAM Portal Content Management System
class ContentManagementSystem {
    constructor() {
        this.categories = this.initializeCategories();
        this.contents = [];
        this.initializeStorage();
    }

    // Initialize STEAM categories and subcategories
    initializeCategories() {
        return {
            'mathematics': {
                name: 'Mathematics',
                subcategories: [
                    'algebra',
                    'geometry', 
                    'statistics',
                    'calculus',
                    'arithmetic',
                    'trigonometry'
                ]
            },
            'science': {
                name: 'Science',
                subcategories: [
                    'physics',
                    'chemistry',
                    'biology',
                    'earth-science',
                    'environmental-science',
                    'astronomy'
                ]
            },
            'arts-creativity': {
                name: 'Arts & Creativity',
                subcategories: [
                    'visual-arts',
                    'music',
                    'drama',
                    'dance',
                    'digital-art',
                    'creative-writing'
                ]
            },
            'language-arts': {
                name: 'Language Arts',
                subcategories: [
                    'reading',
                    'writing',
                    'grammar',
                    'literature',
                    'poetry',
                    'public-speaking'
                ]
            },
            'technology': {
                name: 'Technology',
                subcategories: [
                    'computer-science',
                    'coding',
                    'robotics',
                    'digital-literacy',
                    'web-development',
                    'artificial-intelligence'
                ]
            }
        };
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
        if (!localStorage.getItem('steam_categories')) {
            localStorage.setItem('steam_categories', JSON.stringify(this.categories));
        }
        if (!localStorage.getItem('steam_contents')) {
            localStorage.setItem('steam_contents', JSON.stringify(this.contents));
        }
    }

    // Normalize category name to prevent duplicates
    normalizeCategoryName(name) {
        return name.toLowerCase()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/^-+|-+$/g, '');
    }

    // Check if category exists
    categoryExists(categoryName) {
        const normalized = this.normalizeCategoryName(categoryName);
        return this.categories.hasOwnProperty(normalized);
    }

    // Add new category
    addCategory(categoryName, subcategories = []) {
        const normalized = this.normalizeCategoryName(categoryName);
        
        if (this.categoryExists(categoryName)) {
            throw new Error(`Category "${categoryName}" already exists`);
        }

        this.categories[normalized] = {
            name: categoryName,
            subcategories: subcategories.map(sub => this.normalizeCategoryName(sub))
        };

        this.saveCategories();
        return this.categories[normalized];
    }

    // Add subcategory to existing category
    addSubcategory(categoryName, subcategoryName) {
        const normalizedCategory = this.normalizeCategoryName(categoryName);
        const normalizedSubcategory = this.normalizeCategoryName(subcategoryName);

        if (!this.categories[normalizedCategory]) {
            throw new Error(`Category "${categoryName}" does not exist`);
        }

        if (!this.categories[normalizedCategory].subcategories.includes(normalizedSubcategory)) {
            this.categories[normalizedCategory].subcategories.push(normalizedSubcategory);
            this.saveCategories();
        }

        return this.categories[normalizedCategory];
    }

    // Save categories to localStorage
    saveCategories() {
        localStorage.setItem('steam_categories', JSON.stringify(this.categories));
    }

    // Create content object
    createContent(contentData) {
        const content = {
            id: this.generateId(),
            title: contentData.title,
            description: contentData.description,
            state: contentData.state || 'draft',
            categories: contentData.categories || [],
            subcategories: contentData.subcategories || [],
            gradeLevels: contentData.gradeLevels || [],
            files: contentData.files || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: contentData.createdBy || 'admin',
            tags: contentData.tags || [],
            featured: contentData.featured || false
        };

        this.contents.push(content);
        this.saveContents();
        return content;
    }

    // Bulk content upload
    bulkUpload(contentsData) {
        const uploadedContents = [];
        
        contentsData.forEach(contentData => {
            try {
                const content = this.createContent(contentData);
                uploadedContents.push(content);
            } catch (error) {
                console.error('Error uploading content:', error);
            }
        });

        return uploadedContents;
    }

    // Bulk category assignment
    bulkAssignCategories(contentIds, categories, subcategories = []) {
        const results = [];
        
        contentIds.forEach(contentId => {
            const content = this.getContent(contentId);
            if (content) {
                content.categories = [...new Set([...content.categories, ...categories])];
                content.subcategories = [...new Set([...content.subcategories, ...subcategories])];
                content.updatedAt = new Date().toISOString();
                results.push(content);
            }
        });

        this.saveContents();
        return results;
    }

    // Get content by ID
    getContent(contentId) {
        return this.contents.find(content => content.id === contentId);
    }

    // Update content
    updateContent(contentId, updates) {
        const contentIndex = this.contents.findIndex(content => content.id === contentId);
        if (contentIndex !== -1) {
            this.contents[contentIndex] = {
                ...this.contents[contentIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveContents();
            return this.contents[contentIndex];
        }
        return null;
    }

    // Delete content
    deleteContent(contentId) {
        const contentIndex = this.contents.findIndex(content => content.id === contentId);
        if (contentIndex !== -1) {
            const deletedContent = this.contents.splice(contentIndex, 1)[0];
            this.saveContents();
            return deletedContent;
        }
        return null;
    }

    // Filter content
    filterContent(filters = {}) {
        return this.contents.filter(content => {
            // Filter by state
            if (filters.state && content.state !== filters.state) {
                return false;
            }

            // Filter by categories
            if (filters.categories && filters.categories.length > 0) {
                const hasCategory = filters.categories.some(cat => 
                    content.categories.includes(cat) || 
                    content.categories.includes(this.normalizeCategoryName(cat))
                );
                if (!hasCategory) return false;
            }

            // Filter by subcategories
            if (filters.subcategories && filters.subcategories.length > 0) {
                const hasSubcategory = filters.subcategories.some(sub => 
                    content.subcategories.includes(sub) || 
                    content.subcategories.includes(this.normalizeCategoryName(sub))
                );
                if (!hasSubcategory) return false;
            }

            // Filter by grade levels
            if (filters.gradeLevels && filters.gradeLevels.length > 0) {
                const hasGradeLevel = filters.gradeLevels.some(grade => 
                    content.gradeLevels.includes(grade)
                );
                if (!hasGradeLevel) return false;
            }

            // Filter by search term
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const inTitle = content.title.toLowerCase().includes(searchTerm);
                const inDescription = content.description.toLowerCase().includes(searchTerm);
                const inTags = content.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                if (!inTitle && !inDescription && !inTags) return false;
            }

            return true;
        });
    }

    // Reorder content
    reorderContent(contentIds) {
        const reorderedContents = [];
        
        contentIds.forEach(id => {
            const content = this.getContent(id);
            if (content) {
                reorderedContents.push(content);
            }
        });

        // Update contents array order
        this.contents = reorderedContents.concat(
            this.contents.filter(content => !contentIds.includes(content.id))
        );
        
        this.saveContents();
        return this.contents;
    }

    // Get content by state
    getContentByState(state) {
        return this.contents.filter(content => content.state === state);
    }

    // Get featured content
    getFeaturedContent() {
        return this.contents.filter(content => content.featured && content.state === 'published');
    }

    // Save contents to localStorage
    saveContents() {
        localStorage.setItem('steam_contents', JSON.stringify(this.contents));
    }

    // Generate unique ID
    generateId() {
        return 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Load from localStorage
    loadFromStorage() {
        const savedCategories = localStorage.getItem('steam_categories');
        const savedContents = localStorage.getItem('steam_contents');
        
        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }
        if (savedContents) {
            this.contents = JSON.parse(savedContents);
        }
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
        if (data.categories) {
            this.categories = data.categories;
            this.saveCategories();
        }
        if (data.contents) {
            this.contents = data.contents;
            this.saveContents();
        }
    }
}

// Initialize the CMS
const steamCMS = new ContentManagementSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManagementSystem;
} else {
    window.ContentManagementSystem = ContentManagementSystem;
    window.steamCMS = steamCMS;
}
