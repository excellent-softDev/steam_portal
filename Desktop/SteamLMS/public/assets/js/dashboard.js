class DashboardManager {
    constructor() {
        this.apiBase = 'http://localhost:3002/api';
        this.socket = null;
        this.charts = {};
        this.currentTimeRange = '7d';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initWebSocket();
        await this.loadDashboardData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
                
                // Update active state
                document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Time range selector
        document.getElementById('timeRange').addEventListener('change', (e) => {
            this.currentTimeRange = e.target.value;
            this.loadDashboardData();
        });
    }

    switchSection(section) {
        document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
        document.getElementById(`${section}-section`).style.display = 'block';
        
        // Load section-specific data
        this.loadSectionData(section);
    }

    async initWebSocket() {
        try {
            this.socket = io('http://localhost:3002');
            
            this.socket.on('connect', () => {
                console.log('Connected to dashboard WebSocket');
                this.updateConnectionStatus(true);
                this.socket.emit('subscribe-dashboard', { dashboardType: 'admin' });
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from dashboard WebSocket');
                this.updateConnectionStatus(false);
            });

            this.socket.on('dashboard-update', (data) => {
                console.log('Received dashboard update:', data);
                this.handleRealtimeUpdate(data);
            });
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (connected) {
            statusElement.textContent = 'Connected';
            statusIndicator.className = 'status-indicator status-online';
        } else {
            statusElement.textContent = 'Disconnected';
            statusIndicator.className = 'status-indicator status-offline';
        }
    }

    async loadDashboardData() {
        this.showLoading(true);
        try {
            await Promise.all([
                this.loadOverviewMetrics(),
                this.loadUserEngagementMetrics(),
                this.loadContentPerformanceMetrics(),
                this.loadSystemUsageMetrics()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        } finally {
            this.showLoading(false);
        }
    }

    async loadSectionData(section) {
        this.showLoading(true);
        try {
            switch(section) {
                case 'overview':
                    await this.loadOverviewMetrics();
                    break;
                case 'users':
                    await this.loadUserEngagementMetrics();
                    break;
                case 'content':
                    await this.loadContentPerformanceMetrics();
                    break;
                case 'system':
                    await this.loadSystemUsageMetrics();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${section} data:`, error);
            this.showError(`Failed to load ${section} data`);
        } finally {
            this.showLoading(false);
        }
    }

    async loadOverviewMetrics() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/overview?timeRange=${this.currentTimeRange}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateOverviewCards(result.data);
                this.trackAnalyticsEvent('page_view', { page: 'admin_dashboard_overview' });
            }
        } catch (error) {
            console.error('Error loading overview metrics:', error);
        }
    }

    async loadUserEngagementMetrics() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/user-engagement?timeRange=${this.currentTimeRange}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateUserEngagementCharts(result.data);
                this.trackAnalyticsEvent('page_view', { page: 'admin_dashboard_user_engagement' });
            }
        } catch (error) {
            console.error('Error loading user engagement metrics:', error);
        }
    }

    async loadContentPerformanceMetrics() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/content-performance?timeRange=${this.currentTimeRange}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateContentPerformanceCharts(result.data);
                this.trackAnalyticsEvent('page_view', { page: 'admin_dashboard_content_performance' });
            }
        } catch (error) {
            console.error('Error loading content performance metrics:', error);
        }
    }

    async loadSystemUsageMetrics() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/system-usage?timeRange=${this.currentTimeRange}`);
            const result = await response.json();
            
            if (result.success) {
                this.updateSystemUsageCharts(result.data);
                this.trackAnalyticsEvent('page_view', { page: 'admin_dashboard_system_usage' });
            }
        } catch (error) {
            console.error('Error loading system usage metrics:', error);
        }
    }

    updateOverviewCards(data) {
        document.getElementById('total-users').textContent = data.totalUsers.toLocaleString();
        document.getElementById('active-users').textContent = data.activeUsers.toLocaleString();
        document.getElementById('total-content').textContent = data.totalContent.toLocaleString();
        document.getElementById('total-sessions').textContent = data.totalSessions.toLocaleString();
    }

    updateUserEngagementCharts(data) {
        // Daily Activity Chart
        const dailyActivityCtx = document.getElementById('dailyActivityChart');
        if (dailyActivityCtx) {
            if (this.charts.dailyActivity) this.charts.dailyActivity.destroy();
            
            this.charts.dailyActivity = new Chart(dailyActivityCtx, {
                type: 'line',
                data: {
                    labels: data.dailyActivity.map(item => item._id),
                    datasets: [{
                        label: 'Total Events',
                        data: data.dailyActivity.map(item => item.total),
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Top Users Table
        const topUsersTable = document.getElementById('topUsersTable');
        if (topUsersTable) {
            const tbody = topUsersTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            data.topUsers.forEach(user => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.totalEvents}</td>
                    <td>${user.pageViews}</td>
                `;
            });
        }
    }

    updateContentPerformanceCharts(data) {
        // Content Category Chart
        const categoryCtx = document.getElementById('contentCategoryChart');
        if (categoryCtx) {
            if (this.charts.contentCategory) this.charts.contentCategory.destroy();
            
            this.charts.contentCategory = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: data.contentByCategory.map(item => item._id),
                    datasets: [{
                        data: data.contentByCategory.map(item => item.totalViews),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        // Content Grade Chart
        const gradeCtx = document.getElementById('contentGradeChart');
        if (gradeCtx) {
            if (this.charts.contentGrade) this.charts.contentGrade.destroy();
            
            this.charts.contentGrade = new Chart(gradeCtx, {
                type: 'bar',
                data: {
                    labels: data.contentByGrade.map(item => item._id),
                    datasets: [{
                        label: 'Total Views',
                        data: data.contentByGrade.map(item => item.totalViews),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Top Content Table
        const topContentTable = document.getElementById('topContentTable');
        if (topContentTable) {
            const tbody = topContentTable.querySelector('tbody');
            tbody.innerHTML = '';
            
            data.topContent.forEach(content => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${content.title}</td>
                    <td>${content.contentType}</td>
                    <td>${content.totalViews}</td>
                    <td>${content.engagementScore.toFixed(2)}</td>
                    <td>${(content.completionRate * 100).toFixed(1)}%</td>
                `;
            });
        }
    }

    updateSystemUsageCharts(data) {
        // Hourly Usage Chart
        const hourlyCtx = document.getElementById('hourlyUsageChart');
        if (hourlyCtx) {
            if (this.charts.hourlyUsage) this.charts.hourlyUsage.destroy();
            
            this.charts.hourlyUsage = new Chart(hourlyCtx, {
                type: 'line',
                data: {
                    labels: data.hourlyUsage.map(item => `${item.date} ${item.hour}:00`),
                    datasets: [{
                        label: 'Events',
                        data: data.hourlyUsage.map(item => item.events),
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        tension: 0.1
                    }, {
                        label: 'Unique Users',
                        data: data.hourlyUsage.map(item => item.uniqueUsers),
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Event Type Chart
        const eventTypeCtx = document.getElementById('eventTypeChart');
        if (eventTypeCtx) {
            if (this.charts.eventType) this.charts.eventType.destroy();
            
            this.charts.eventType = new Chart(eventTypeCtx, {
                type: 'pie',
                data: {
                    labels: data.eventTypeBreakdown.map(item => item.eventType),
                    datasets: [{
                        data: data.eventTypeBreakdown.map(item => item.count),
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }
    }

    async trackAnalyticsEvent(eventType, metadata = {}) {
        try {
            await fetch(`${this.apiBase}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'admin',
                    eventType,
                    metadata: {
                        ...metadata,
                        timestamp: new Date().toISOString()
                    },
                    sessionId: 'admin-session'
                })
            });
        } catch (error) {
            console.error('Error tracking analytics event:', error);
        }
    }

    handleRealtimeUpdate(data) {
        console.log('Handling real-time update:', data);
        // Refresh the current section data
        const activeSection = document.querySelector('.sidebar .nav-link.active').dataset.section;
        this.loadSectionData(activeSection);
    }

    showLoading(show) {
        const spinner = document.querySelector('.loading-spinner');
        spinner.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed top-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-header bg-danger text-white">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
