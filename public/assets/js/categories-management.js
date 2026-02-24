// Categories Management Controller
class CategoriesManagementUI {
    constructor() {
        console.log('CategoriesManagementUI constructor called');
        
        this.cms = steamCMS;
        this.selectedCategory = null;
        
        console.log('CMS object:', this.cms);
        console.log('CMS categories:', this.cms.categories);
        console.log('CMS saveToStorage method:', typeof this.cms.saveToStorage);
        
        this.initializeEventListeners();
        this.loadCategories();
        this.updateStatistics();
        
        console.log('CategoriesManagementUI constructor completed');
    }

    initializeEventListeners() {
        // Category dropdown change event
        const categoryDropdown = document.getElementById('categoryForSubcategory');
        if (categoryDropdown) {
            categoryDropdown.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.updateSubcategoryButton();
                this.renderSubcategoriesList();
            });
        }
    }

    loadCategories() {
        this.renderCategoriesList();
        this.populateCategoryDropdown();
    }

    renderCategoriesList() {
        console.log('renderCategoriesList called');
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            console.log('categoriesList element not found');
            return;
        }
        
        const categories = Object.entries(this.cms.categories);
        console.log('Categories to render:', categories);
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No categories found. Add your first category to get started!</p>
                </div>
            `;
            return;
        }
        
        categoriesList.innerHTML = '';
        
        categories.forEach(([key, category]) => {
            console.log('Rendering category:', key, category);
            
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            if (this.selectedCategory === key) {
                categoryItem.classList.add('selected');
            }
            
            categoryItem.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-key">Key: ${key}</div>
                    <div class="subcategory-count">${category.subcategories ? category.subcategories.length : 0} subcategories</div>
                </div>
                <div class="category-actions">
                    <button type="button" class="btn btn-xs btn-outline-primary" 
                            onclick="categoriesUI.editCategory('${key}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-danger" 
                            onclick="categoriesUI.deleteCategory('${key}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-info" 
                            onclick="categoriesUI.selectCategory('${key}')" title="View Subcategories">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            
            categoriesList.appendChild(categoryItem);
        });
        
        console.log('Categories rendering completed');
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
        
        if (!this.selectedCategory) {
            subcategoriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>Select a category to view and manage its subcategories</p>
                </div>
            `;
            return;
        }
        
        const category = this.cms.categories[this.selectedCategory];
        if (!category || !category.subcategories || category.subcategories.length === 0) {
            subcategoriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>No subcategories found for ${category.name}</p>
                </div>
            `;
            return;
        }
        
        subcategoriesList.innerHTML = '';
        
        category.subcategories.forEach((subcategory, index) => {
            const subcategoryItem = document.createElement('div');
            subcategoryItem.className = 'subcategory-item';
            
            subcategoryItem.innerHTML = `
                <div class="subcategory-info">
                    <div class="subcategory-name">${this.formatSubcategoryName(subcategory)}</div>
                    <div class="subcategory-count">Index: ${index + 1}</div>
                </div>
                <div class="subcategory-actions">
                    <button type="button" class="btn btn-xs btn-outline-primary" 
                            onclick="categoriesUI.editSubcategory('${subcategory}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-xs btn-outline-danger" 
                            onclick="categoriesUI.deleteSubcategory('${subcategory}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            subcategoriesList.appendChild(subcategoryItem);
        });
    }

    updateStatistics() {
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
        console.log('addCategory called');
        
        const name = document.getElementById('newCategoryName').value.trim();
        const key = document.getElementById('newCategoryKey').value.trim().toLowerCase().replace(/\s+/g, '-');
        
        console.log('Category data:', { name, key });
        
        if (!name || !key) {
            this.showToast('Please enter both category name and key', 'error');
            return;
        }
        
        if (this.cms.categories[key]) {
            this.showToast('Category with this key already exists', 'error');
            return;
        }
        
        console.log('Adding category to CMS...');
        
        this.cms.categories[key] = {
            name: name,
            subcategories: []
        };
        
        console.log('Category added:', this.cms.categories[key]);
        
        this.cms.saveCategories();
        console.log('Saved to storage using saveCategories method');
        
        this.hideAddCategoryForm();
        this.renderCategoriesList();
        this.populateCategoryDropdown();
        this.updateStatistics();
        this.showToast('Category added successfully!', 'success');
        
        console.log('Category addition completed');
    }

    editCategory(key) {
        const category = this.cms.categories[key];
        if (!category) return;
        
        const newName = prompt('Edit category name:', category.name);
        if (newName && newName.trim()) {
            category.name = newName.trim();
            this.cms.saveCategories();
            this.renderCategoriesList();
            this.populateCategoryDropdown();
            this.updateStatistics();
            this.showToast('Category updated successfully!', 'success');
        }
    }

    deleteCategory(key) {
        const category = this.cms.categories[key];
        if (!category) return;
        
        const subcategoryCount = category.subcategories ? category.subcategories.length : 0;
        const confirmMessage = subcategoryCount > 0 
            ? `Are you sure you want to delete "${category.name}"? This will also remove ${subcategoryCount} subcategories.`
            : `Are you sure you want to delete "${category.name}"?`;
            
        if (!confirm(confirmMessage)) {
            return;
        }
        
        delete this.cms.categories[key];
        this.cms.saveCategories();
        
        // Clear selection if deleted category was selected
        if (this.selectedCategory === key) {
            this.selectedCategory = null;
            document.getElementById('categoryForSubcategory').value = '';
            this.renderSubcategoriesList();
        }
        
        this.renderCategoriesList();
        this.populateCategoryDropdown();
        this.updateStatistics();
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
        
        if (!category.subcategories) {
            category.subcategories = [];
        }
        
        category.subcategories.push(key);
        this.cms.saveCategories();
        this.hideAddSubcategoryForm();
        this.renderSubcategoriesList();
        this.updateStatistics();
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
                this.cms.saveCategories();
                this.renderSubcategoriesList();
                this.updateStatistics();
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
            this.cms.saveCategories();
            this.renderSubcategoriesList();
            this.updateStatistics();
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

    formatSubcategoryName(subcategory) {
        return subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.style.cssText = `
            margin-bottom: 10px;
            min-width: 250px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Categories Management Page Loaded');
    
    // Check if admin is logged in
    const session = localStorage.getItem('steam_admin_session');
    const token = localStorage.getItem('steam_admin_token');
    
    if (!session || !token) {
        console.log('User not logged in, redirecting to login');
        window.location.href = 'auth-login.html';
        return;
    }
    
    // Load CMS data and initialize categories management
    console.log('Loading CMS data...');
    steamCMS.loadFromStorage();
    console.log('CMS data loaded:', steamCMS);
    
    window.categoriesUI = new CategoriesManagementUI();
    console.log('Categories Management UI initialized');
});

// Global functions for HTML onclick handlers
window.showAddCategoryForm = () => {
    if (window.categoriesUI) {
        window.categoriesUI.showAddCategoryForm();
    }
};

window.hideAddCategoryForm = () => {
    if (window.categoriesUI) {
        window.categoriesUI.hideAddCategoryForm();
    }
};

window.addCategory = () => {
    if (window.categoriesUI) {
        window.categoriesUI.addCategory();
    }
};

window.showAddSubcategoryForm = () => {
    if (window.categoriesUI) {
        window.categoriesUI.showAddSubcategoryForm();
    }
};

window.hideAddSubcategoryForm = () => {
    if (window.categoriesUI) {
        window.categoriesUI.hideAddSubcategoryForm();
    }
};

window.addSubcategory = () => {
    if (window.categoriesUI) {
        window.categoriesUI.addSubcategory();
    }
};

window.exportCategories = () => {
    if (window.categoriesUI) {
        window.categoriesUI.exportCategories();
    }
};

window.testCategoryAdd = () => {
    console.log('Test function called');
    
    // Direct test - add a category programmatically
    if (window.categoriesUI && window.categoriesUI.cms) {
        const testKey = 'test-category-' + Date.now();
        window.categoriesUI.cms.categories[testKey] = {
            name: 'Test Category ' + new Date().getSeconds(),
            subcategories: []
        };
        
        console.log('Test category added:', testKey);
        console.log('Current categories:', window.categoriesUI.cms.categories);
        
        // Save and render
        window.categoriesUI.cms.saveCategories();
        
        window.categoriesUI.renderCategoriesList();
        window.categoriesUI.populateCategoryDropdown();
        window.categoriesUI.updateStatistics();
        
        console.log('Test completed');
    }
};

window.logout = () => {
    localStorage.removeItem('steam_admin_session');
    localStorage.removeItem('steam_admin_token');
    window.location.href = 'auth-login.html';
};
