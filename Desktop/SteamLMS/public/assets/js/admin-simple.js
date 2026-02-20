// Simple Admin Dashboard - Fresh Database
console.log('🚀 Starting Fresh Dashboard...');

class SimpleDashboard {
    constructor() {
        this.initDatabase();
        this.initEventListeners();
        this.loadDashboard();
    }
    
    initDatabase() {
        // Create fresh database if not exists
        if (!localStorage.getItem('steam_lms_fresh')) {
            const freshDB = {
                content: [],
                grades: [
                    {id: 'kinder', name: 'Kindergarten', description: 'Early childhood'},
                    {id: 'grade1', name: 'Grade 1', description: 'First grade'},
                    {id: 'grade2', name: 'Grade 2', description: 'Second grade'},
                    {id: 'grade3', name: 'Grade 3', description: 'Third grade'}
                ],
                categories: [
                    {id: 'math', name: 'Mathematics', description: 'Math concepts'},
                    {id: 'science', name: 'Science', description: 'Science topics'},
                    {id: 'arts', name: 'Arts', description: 'Creative arts'}
                ],
                files: []
            };
            localStorage.setItem('steam_lms_fresh', JSON.stringify(freshDB));
            console.log('✅ Fresh database created');
        }
    }
    
    getDB() {
        return JSON.parse(localStorage.getItem('steam_lms_fresh') || '{}');
    }
    
    saveDB(db) {
        localStorage.setItem('steam_lms_fresh', JSON.stringify(db));
    }
    
    initEventListeners() {
        // Navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('href').substring(1);
                this.showSection(section);
            });
        });
        
        // Add content button
        const addBtn = document.getElementById('add-content-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.addContent());
        }
    }
    
    showSection(sectionId) {
        // Update nav
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
        
        // Hide sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target
        const targetId = sectionId + '-section';
        const target = document.getElementById(targetId);
        if (target) {
            target.style.display = 'block';
        }
        
        // Load data
        this.loadSectionData(sectionId);
    }
    
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.updateMetrics();
                break;
            case 'content':
                this.loadContent();
                break;
            case 'grades':
                this.loadGrades();
                break;
            case 'categories':
                this.loadCategories();
                break;
        }
    }
    
    loadDashboard() {
        this.updateMetrics();
        this.loadContent();
        
        // Show dashboard section
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.showSection(hash);
    }
    
    updateMetrics() {
        const db = this.getDB();
        
        document.getElementById('total-content').textContent = db.content?.length || 0;
        document.getElementById('total-grades').textContent = db.grades?.length || 0;
        document.getElementById('total-categories').textContent = db.categories?.length || 0;
        document.getElementById('total-files').textContent = db.files?.length || 0;
    }
    
    loadContent() {
        const db = this.getDB();
        const tbody = document.getElementById('content-table-body');
        
        if (!tbody) return;
        
        if (!db.content || db.content.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <h5>No Content Yet</h5>
                        <button class="btn btn-primary mt-2" onclick="dashboard.addContent()">
                            Add First Content
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = db.content.map(item => `
            <tr>
                <td>${item.title}</td>
                <td>${item.gradeName || 'N/A'}</td>
                <td>${item.categoryName || 'N/A'}</td>
                <td>${item.type || 'N/A'}</td>
                <td>${new Date(item.created).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="dashboard.editContent('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="dashboard.deleteContent('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    loadGrades() {
        const db = this.getDB();
        const grid = document.getElementById('grades-grid');
        
        if (!grid) return;
        
        grid.innerHTML = db.grades?.map(grade => `
            <div class="grade-card">
                <h5>${grade.name}</h5>
                <p>${grade.description}</p>
            </div>
        `).join('') || '<p>No grades found</p>';
    }
    
    loadCategories() {
        const db = this.getDB();
        const grid = document.getElementById('categories-grid');
        
        if (!grid) return;
        
        grid.innerHTML = db.categories?.map(cat => `
            <div class="category-card">
                <h5>${cat.name}</h5>
                <p>${cat.description}</p>
            </div>
        `).join('') || '<p>No categories found</p>';
    }
    
    addContent() {
        const title = prompt('Content Title:');
        if (!title) return;
        
        const description = prompt('Description:');
        if (!description) return;
        
        const db = this.getDB();
        const newContent = {
            id: Date.now().toString(),
            title,
            description,
            gradeId: 'grade1',
            categoryId: 'math',
            type: 'lesson',
            created: new Date().toISOString()
        };
        
        db.content = db.content || [];
        db.content.push(newContent);
        this.saveDB(db);
        
        alert('Content added successfully!');
        this.loadContent();
        this.updateMetrics();
    }
    
    editContent(id) {
        const db = this.getDB();
        const content = db.content?.find(c => c.id === id);
        
        if (!content) return;
        
        const title = prompt('Edit Title:', content.title);
        if (!title) return;
        
        const description = prompt('Edit Description:', content.description);
        if (!description) return;
        
        content.title = title;
        content.description = description;
        this.saveDB(db);
        
        alert('Content updated!');
        this.loadContent();
    }
    
    deleteContent(id) {
        if (!confirm('Delete this content?')) return;
        
        const db = this.getDB();
        db.content = db.content?.filter(c => c.id !== id) || [];
        this.saveDB(db);
        
        alert('Content deleted!');
        this.loadContent();
        this.updateMetrics();
    }
}

// Initialize
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SimpleDashboard();
    console.log('✅ Dashboard Ready!');
});
