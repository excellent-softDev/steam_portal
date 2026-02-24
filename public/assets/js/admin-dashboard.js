// Admin Dashboard Controller
class AdminDashboard {
    constructor() {
        this.cms = steamCMS;
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.loadStatistics();
        this.loadRecentActivity();
        this.initializeCharts();
        this.setupAutoRefresh();
    }

    loadStatistics() {
        const contents = this.cms.contents;
        
        // Total content
        document.getElementById('totalContent').textContent = contents.length;
        
        // Published content
        const publishedCount = contents.filter(c => c.state === 'published').length;
        document.getElementById('publishedContent').textContent = publishedCount;
        
        // Draft content
        const draftCount = contents.filter(c => c.state === 'draft').length;
        document.getElementById('draftContent').textContent = draftCount;
        
        // Categories (from CMS)
        const categoryCount = Object.keys(this.cms.categories).length;
        document.getElementById('totalCategories').textContent = categoryCount;
    }

    loadRecentActivity() {
        const activities = this.generateRecentActivity();
        const activityContainer = document.getElementById('recentActivity');
        
        activityContainer.innerHTML = '';
        
        if (activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <p class="mb-1">${activity.message}</p>
                        <small class="text-muted">
                            <i class="fas fa-clock me-1"></i>${this.formatTimeAgo(activity.timestamp)}
                        </small>
                    </div>
                    <i class="${activity.icon} text-${activity.color}"></i>
                </div>
            `;
            activityContainer.appendChild(activityItem);
        });
    }

    generateRecentActivity() {
        const activities = [];
        const contents = this.cms.contents;
        
        // Get recent content (last 10 items)
        const recentContents = contents
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 10);

        recentContents.forEach(content => {
            let message, icon, color;
            
            if (content.state === 'published') {
                message = `Published "${content.title}"`;
                icon = 'fas fa-check-circle';
                color = 'success';
            } else if (content.state === 'draft') {
                message = `Updated draft "${content.title}"`;
                icon = 'fas fa-edit';
                color = 'warning';
            } else {
                message = `Archived "${content.title}"`;
                icon = 'fas fa-archive';
                color = 'secondary';
            }
            
            activities.push({
                message,
                icon,
                color,
                timestamp: content.updatedAt
            });
        });

        // Add some sample system activities
        activities.push({
            message: 'System backup completed successfully',
            icon: 'fas fa-shield-alt',
            color: 'info',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        });

        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    initializeCharts() {
        this.createCategoryChart();
        this.createGradeChart();
    }

    createCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const categoryData = this.getCategoryData();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#00B2FF',
                        '#003294',
                        '#889922',
                        '#E51717',
                        '#ffc107',
                        '#6c757d'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createGradeChart() {
        const ctx = document.getElementById('gradeChart').getContext('2d');
        const gradeData = this.getGradeData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: gradeData.labels,
                datasets: [{
                    label: 'Content Items',
                    data: gradeData.data,
                    backgroundColor: '#00B2FF',
                    borderColor: '#003294',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Content: ${context.parsed.y} items`;
                            }
                        }
                    }
                }
            }
        });
    }

    getCategoryData() {
        const contents = this.cms.contents;
        const categoryCount = {};
        
        // Initialize all categories with 0
        Object.keys(this.cms.categories).forEach(key => {
            categoryCount[key] = 0;
        });
        
        // Count content by category
        contents.forEach(content => {
            content.categories.forEach(category => {
                if (categoryCount[category] !== undefined) {
                    categoryCount[category]++;
                }
            });
        });
        
        return {
            labels: Object.keys(categoryCount).map(key => this.cms.categories[key].name),
            data: Object.values(categoryCount)
        };
    }

    getGradeData() {
        const contents = this.cms.contents;
        const gradeCount = {
            grade1: 0,
            grade2: 0,
            grade3: 0,
            grade4: 0,
            grade5: 0,
            grade6: 0,
            grade7: 0,
            grade8: 0,
            grade9: 0,
            grade10: 0,
            grade11: 0,
            grade12: 0,
            postmatric: 0
        };
        
        contents.forEach(content => {
            content.gradeLevels.forEach(grade => {
                if (gradeCount[grade] !== undefined) {
                    gradeCount[grade]++;
                }
            });
        });
        
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
        
        return {
            labels: Object.keys(gradeCount).map(key => gradeLabels[key]),
            data: Object.values(gradeCount)
        };
    }

    setupAutoRefresh() {
        // Refresh dashboard data every 30 seconds
        setInterval(() => {
            this.cms.loadFromStorage();
            this.loadStatistics();
            this.loadRecentActivity();
        }, 30000);
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    // Dashboard action methods
    manageCategories() {
        // This would open a category management modal or navigate to category page
        alert('Category management feature coming soon!');
    }

    viewUsers() {
        // This would navigate to user management page
        alert('User management feature coming soon!');
    }

    viewAnalytics() {
        // This would show detailed analytics
        alert('Detailed analytics feature coming soon!');
    }

    exportData() {
        const data = this.cms.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `steam-portal-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('steam_admin_session');
    localStorage.removeItem('steam_admin_token');
    window.location.href = 'auth-login.html';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    const session = localStorage.getItem('steam_admin_session');
    const token = localStorage.getItem('steam_admin_token');
    
    if (!session || !token) {
        window.location.href = 'auth-login.html';
        return;
    }
    
    // Load CMS data and initialize dashboard
    steamCMS.loadFromStorage();
    window.adminDashboard = new AdminDashboard();
});

// Global functions for HTML onclick handlers
window.manageCategories = () => window.adminDashboard.manageCategories();
window.viewUsers = () => window.adminDashboard.viewUsers();
window.viewAnalytics = () => window.adminDashboard.viewAnalytics();
window.exportData = () => window.adminDashboard.exportData();
window.logout = logout;
