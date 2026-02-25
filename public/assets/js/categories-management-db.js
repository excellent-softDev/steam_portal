// Categories Management Controller - Database Version
class CategoriesManagementUI {
    constructor() {
        console.log('CategoriesManagementUI constructor called');
        
        this.selectedCategory = null;
        this.categories = {};
        this.subcategories = [];
        
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

    async loadCategories() {
        try {
            // Load categories from database
            const categoriesResponse = await fetch('/api/categories');
            const categoriesData = await categoriesResponse.json();
            
            if (categoriesData.success) {
                categoriesData.data.forEach(cat => {
                    this.categories[cat.id] = {
                        name: cat.name,
                        description: cat.description,
                        icon: cat.icon,
                        color: cat.color,
                        subcategories: [] // Will be populated below
                    };
                });
            }
            
            // Load subcategories from database
            const subcategoriesResponse = await fetch('/api/subcategories');
            const subcategoriesData = await subcategoriesResponse.json();
            
            if (subcategoriesData.success) {
                subcategoriesData.data.forEach(sub => {
                    if (this.categories[sub.category_id]) {
                        this.categories[sub.category_id].subcategories.push(sub.id);
                    }
                });
            }
            
            this.renderCategoriesList();
            this.populateCategoryDropdown();
            
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showToast('Error loading categories from database', 'error');
        }
    }

    renderCategoriesList() {
        console.log('renderCategoriesList called');
        
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) {
            console.log('categoriesList element not found');
            return;
        }
        
        const categories = Object.entries(this.categories);
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
        
        Object.entries(this.categories).forEach(([key, category]) => {
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

    async renderSubcategoriesList() {
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
        
        try {
            // Load subcategories for selected category from database
            const response = await fetch(`/api/subcategories?category_id=${this.selectedCategory}`);
            const data = await response.json();
            
            if (!data.success || data.data.length === 0) {
                subcategoriesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tags"></i>
                        <p>No subcategories found for ${this.categories[this.selectedCategory].name}</p>
                    </div>
                `;
                return;
            }
            
            subcategoriesList.innerHTML = '';
            
            data.data.forEach((subcategory) => {
                const subcategoryItem = document.createElement('div');
                subcategoryItem.className = 'subcategory-item';
                
                subcategoryItem.innerHTML = `
                    <div class="subcategory-info">
                        <div class="subcategory-name">${subcategory.name}</div>
                        <div class="subcategory-count">ID: ${subcategory.id}</div>
                    </div>
                    <div class="subcategory-actions">
                        <button type="button" class="btn btn-xs btn-outline-primary" 
                                onclick="categoriesUI.editSubcategory('${subcategory.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-xs btn-outline-danger" 
                                onclick="categoriesUI.deleteSubcategory('${subcategory.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                subcategoriesList.appendChild(subcategoryItem);
            });
            
        } catch (error) {
            console.error('Error loading subcategories:', error);
            subcategoriesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading subcategories</p>
                </div>
            `;
        }
    }

    updateStatistics() {
        const totalCategories = Object.keys(this.categories).length;
        const totalSubcategories = Object.values(this.categories)
            .reduce((total, cat) => total + (cat.subcategories ? cat.subcategories.length : 0), 0);
        const avgSubcategories = totalCategories > 0 ? (totalSubcategories / totalCategories).toFixed(1) : 0;
        
        document.getElementById('totalCategoriesCount').textContent = totalCategories;
        document.getElementById('totalSubcategoriesCount').textContent = totalSubcategories;
        document.getElementById('avgSubcategoriesCount').textContent = avgSubcategories;
        document.getElementById('contentItemsCount').textContent = '0'; // Will be updated later
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

    async addCategory() {
        console.log('addCategory called');
        
        const name = document.getElementById('newCategoryName').value.trim();
        const key = document.getElementById('newCategoryKey').value.trim().toLowerCase().replace(/\s+/g, '-');
        
        console.log('Category data:', { name, key });
        
        if (!name || !key) {
            this.showToast('Please enter both category name and key', 'error');
            return;
        }
        
        if (this.categories[key]) {
            this.showToast('Category with this key already exists', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: key,
                    name: name,
                    description: '',
                    icon: 'fa-folder',
                    color: '#00B2FF'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.categories[key] = {
                    name: name,
                    subcategories: []
                };
                
                this.hideAddCategoryForm();
                this.renderCategoriesList();
                this.populateCategoryDropdown();
                this.updateStatistics();
                this.showToast('Category added successfully!', 'success');
            } else {
                this.showToast('Error adding category: ' + data.error, 'error');
            }
            
        } catch (error) {
            console.error('Error adding category:', error);
            this.showToast('Error adding category', 'error');
        }
    }

    async editCategory(key) {
        const category = this.categories[key];
        if (!category) return;
        
        const newName = prompt('Edit category name:', category.name);
        if (newName && newName.trim()) {
            try {
                const response = await fetch(`/api/categories/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: newName.trim(),
                        description: category.description || '',
                        icon: category.icon || 'fa-folder',
                        color: category.color || '#00B2FF'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    category.name = newName.trim();
                    this.renderCategoriesList();
                    this.populateCategoryDropdown();
                    this.updateStatistics();
                    this.showToast('Category updated successfully!', 'success');
                } else {
                    this.showToast('Error updating category: ' + data.error, 'error');
                }
                
            } catch (error) {
                console.error('Error updating category:', error);
                this.showToast('Error updating category', 'error');
            }
        }
    }

    async deleteCategory(key) {
        const category = this.categories[key];
        if (!category) return;
        
        const subcategoryCount = category.subcategories ? category.subcategories.length : 0;
        const confirmMessage = subcategoryCount > 0 
            ? `Are you sure you want to delete "${category.name}"? This will also remove ${subcategoryCount} subcategories.`
            : `Are you sure you want to delete "${category.name}"?`;
            
        if (!confirm(confirmMessage)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/categories/${key}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                delete this.categories[key];
                
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
            } else {
                this.showToast('Error deleting category: ' + data.error, 'error');
            }
            
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Error deleting category', 'error');
        }
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
        document.getElementById('addSubcategoryForm').style.display = 'block';
        document.getElementById('newSubcategoryName').focus();
    }

    hideAddSubcategoryForm() {
        document.getElementById('addSubcategoryForm').style.display = 'none';
        document.getElementById('newSubcategoryName').value = '';
    }

    async addSubcategory() {
        const categoryId = document.getElementById('categoryForSubcategory').value;
        const name = document.getElementById('newSubcategoryName').value.trim();
        
        if (!categoryId) {
            this.showToast('Please select a category first', 'error');
            return;
        }
        
        if (!name) {
            this.showToast('Please enter subcategory name', 'error');
            return;
        }
        
        const category = this.categories[categoryId];
        if (!category) {
            this.showToast('Selected category not found', 'error');
            return;
        }
        
        const id = name.toLowerCase().replace(/\s+/g, '-');
        
        try {
            const response = await fetch('/api/subcategories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    name: name,
                    category_id: categoryId,
                    description: ''
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.hideAddSubcategoryForm();
                this.renderSubcategoriesList();
                this.renderCategoriesList(); // Update category count
                this.updateStatistics();
                this.showToast('Subcategory added successfully!', 'success');
            } else {
                this.showToast('Error adding subcategory: ' + data.error, 'error');
            }
            
        } catch (error) {
            console.error('Error adding subcategory:', error);
            this.showToast('Error adding subcategory', 'error');
        }
    }

    async editSubcategory(id) {
        try {
            // Get current subcategory data
            const response = await fetch(`/api/subcategories`);
            const data = await response.json();
            
            if (data.success) {
                const subcategory = data.data.find(sub => sub.id === id);
                if (subcategory) {
                    const newName = prompt('Edit subcategory name:', subcategory.name);
                    
                    if (newName && newName.trim()) {
                        const updateResponse = await fetch(`/api/subcategories/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: newName.trim(),
                                category_id: subcategory.category_id,
                                description: subcategory.description || ''
                            })
                        });
                        
                        const updateData = await updateResponse.json();
                        
                        if (updateData.success) {
                            this.renderSubcategoriesList();
                            this.updateStatistics();
                            this.showToast('Subcategory updated successfully!', 'success');
                        } else {
                            this.showToast('Error updating subcategory: ' + updateData.error, 'error');
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error editing subcategory:', error);
            this.showToast('Error editing subcategory', 'error');
        }
    }

    async deleteSubcategory(id) {
        if (!confirm(`Are you sure you want to delete this subcategory?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/subcategories/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.renderSubcategoriesList();
                this.updateStatistics();
                this.showToast('Subcategory deleted successfully!', 'success');
            } else {
                this.showToast('Error deleting subcategory: ' + data.error, 'error');
            }
            
        } catch (error) {
            console.error('Error deleting subcategory:', error);
            this.showToast('Error deleting subcategory', 'error');
        }
    }

    exportCategories() {
        const categoriesData = JSON.stringify(this.categories, null, 2);
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
        window.location.href = '/auth-login';
        return;
    }
    
    // Initialize categories management
    console.log('Initializing Categories Management UI...');
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

window.logout = () => {
    localStorage.removeItem('steam_admin_session');
    localStorage.removeItem('steam_admin_token');
    window.location.href = '/auth-login';
};
