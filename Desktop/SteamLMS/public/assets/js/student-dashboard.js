class StudentDashboard {
    constructor() {
        this.apiBase = 'http://localhost:3002/api';
        this.socket = null;
        this.charts = {};
        this.currentUser = {
            userId: 'student123',
            name: 'John Doe',
            grade: 'Grade 5'
        };
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initWebSocket();
        await this.loadStudentData();
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
    }

    switchSection(section) {
        document.querySelectorAll('.dashboard-section').forEach(s => s.style.display = 'none');
        document.getElementById(`${section}-section`).style.display = 'block';
        
        // Load section-specific data
        this.loadSectionData(section);
        this.trackAnalyticsEvent('page_view', { page: `student_dashboard_${section}` });
    }

    async initWebSocket() {
        try {
            this.socket = io('http://localhost:3002');
            
            this.socket.on('connect', () => {
                console.log('Connected to student dashboard WebSocket');
                this.updateConnectionStatus(true);
                this.socket.emit('subscribe-dashboard', { dashboardType: 'student' });
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from student dashboard WebSocket');
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

    async loadStudentData() {
        // Update student info
        document.getElementById('student-name').textContent = this.currentUser.name;
        document.getElementById('student-grade').textContent = this.currentUser.grade;
        document.getElementById('welcome-name').textContent = this.currentUser.name.split(' ')[0];
    }

    async loadDashboardData() {
        try {
            // Load overview data
            await this.loadOverviewData();
            await this.loadProgressData();
            await this.loadCoursesData();
            await this.loadAchievementsData();
            await this.loadActivityData();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadSectionData(section) {
        try {
            switch(section) {
                case 'overview':
                    await this.loadOverviewData();
                    break;
                case 'progress':
                    await this.loadProgressData();
                    break;
                case 'courses':
                    await this.loadCoursesData();
                    break;
                case 'achievements':
                    await this.loadAchievementsData();
                    break;
                case 'activity':
                    await this.loadActivityData();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${section} data:`, error);
            this.showError(`Failed to load ${section} data`);
        }
    }

    async loadOverviewData() {
        // Simulate loading overview data
        const overviewData = {
            coursesEnrolled: 5,
            completedLessons: 23,
            learningTime: 12.5,
            currentStreak: 7,
            recentActivity: [
                { title: 'Completed: Math Basics', time: '2 hours ago', type: 'completed' },
                { title: 'Started: Science Introduction', time: 'Yesterday', type: 'started' },
                { title: 'Quiz: Basic Algebra', time: '2 days ago', type: 'quiz', score: 85 }
            ]
        };

        // Update overview cards
        document.getElementById('courses-enrolled').textContent = overviewData.coursesEnrolled;
        document.getElementById('completed-lessons').textContent = overviewData.completedLessons;
        document.getElementById('learning-time').textContent = `${overviewData.learningTime}h`;
        document.getElementById('current-streak').textContent = overviewData.currentStreak;
        document.getElementById('streak-count').textContent = `${overviewData.currentStreak} Day Streak`;

        // Update recent activity
        const activityContainer = document.getElementById('recent-activity');
        activityContainer.innerHTML = '';
        
        overviewData.recentActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            let icon = '';
            switch(activity.type) {
                case 'completed':
                    icon = '<i class="fas fa-check-circle text-success"></i>';
                    break;
                case 'started':
                    icon = '<i class="fas fa-play-circle text-primary"></i>';
                    break;
                case 'quiz':
                    icon = `<i class="fas fa-trophy text-warning"></i>`;
                    break;
            }
            
            activityItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${activity.title}</strong>
                        ${activity.score ? `<div class="text-muted small">Score: ${activity.score}%</div>` : ''}
                        <div class="text-muted small">${activity.time}</div>
                    </div>
                    ${icon}
                </div>
            `;
            
            activityContainer.appendChild(activityItem);
        });
    }

    async loadProgressData() {
        // Progress Chart
        const progressCtx = document.getElementById('progressChart');
        if (progressCtx) {
            if (this.charts.progress) this.charts.progress.destroy();
            
            this.charts.progress = new Chart(progressCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: [{
                        label: 'Learning Progress',
                        data: [20, 35, 45, 60, 75, 85],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }

        // Subject Chart
        const subjectCtx = document.getElementById('subjectChart');
        if (subjectCtx) {
            if (this.charts.subject) this.charts.subject.destroy();
            
            this.charts.subject = new Chart(subjectCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Mathematics', 'Science', 'Technology', 'Arts'],
                    datasets: [{
                        data: [35, 25, 25, 15],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        // Weekly Activity Chart
        const weeklyCtx = document.getElementById('weeklyActivityChart');
        if (weeklyCtx) {
            if (this.charts.weekly) this.charts.weekly.destroy();
            
            this.charts.weekly = new Chart(weeklyCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Hours Spent',
                        data: [2, 3, 2.5, 4, 3.5, 1, 0.5],
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
    }

    async loadCoursesData() {
        const coursesData = [
            { title: 'Mathematics Basics', progress: 75, grade: 'Grade 5', icon: 'fa-calculator', color: 'primary' },
            { title: 'Science Introduction', progress: 45, grade: 'Grade 5', icon: 'fa-flask', color: 'success' },
            { title: 'Technology Fundamentals', progress: 30, grade: 'Grade 5', icon: 'fa-laptop', color: 'info' },
            { title: 'Creative Arts', progress: 60, grade: 'Grade 5', icon: 'fa-palette', color: 'warning' }
        ];

        const coursesGrid = document.getElementById('courses-grid');
        coursesGrid.innerHTML = '';

        coursesData.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-6 mb-3';
            courseCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <i class="fas ${course.icon} fa-2x text-${course.color} me-3"></i>
                            <div>
                                <h6 class="card-title mb-1">${course.title}</h6>
                                <small class="text-muted">${course.grade}</small>
                            </div>
                        </div>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-${course.color}" role="progressbar" style="width: ${course.progress}%">
                                ${course.progress}%
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-${course.color} w-100">Continue Learning</button>
                    </div>
                </div>
            `;
            coursesGrid.appendChild(courseCard);
        });
    }

    async loadAchievementsData() {
        const achievementsData = [
            { title: 'First Steps', description: 'Complete your first lesson', icon: 'fa-baby', earned: true },
            { title: 'Week Warrior', description: '7-day learning streak', icon: 'fa-fire', earned: true },
            { title: 'Math Master', description: 'Complete all math courses', icon: 'fa-calculator', earned: false },
            { title: 'Science Explorer', description: 'Complete 5 science lessons', icon: 'fa-microscope', earned: true },
            { title: 'Tech Savvy', description: 'Complete technology basics', icon: 'fa-laptop-code', earned: false },
            { title: 'Creative Genius', description: 'Complete arts module', icon: 'fa-paint-brush', earned: false }
        ];

        const achievementsGrid = document.getElementById('achievements-grid');
        achievementsGrid.innerHTML = '';

        achievementsData.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'col-md-4 mb-3';
            achievementCard.innerHTML = `
                <div class="card text-center ${achievement.earned ? '' : 'opacity-50'}">
                    <div class="card-body">
                        <div class="achievement-badge mb-3" style="${achievement.earned ? '' : 'background: #6c757d;'}">
                            <i class="fas ${achievement.icon}"></i>
                        </div>
                        <h6 class="card-title">${achievement.title}</h6>
                        <p class="card-text small">${achievement.description}</p>
                        ${achievement.earned ? '<span class="badge bg-success">Earned</span>' : '<span class="badge bg-secondary">Locked</span>'}
                    </div>
                </div>
            `;
            achievementsGrid.appendChild(achievementCard);
        });
    }

    async loadActivityData() {
        const activityData = [
            { date: '2024-01-15', activity: 'Math Basics - Lesson 3', duration: '45 min', score: 92 },
            { date: '2024-01-14', activity: 'Science Introduction - Quiz', duration: '20 min', score: 88 },
            { date: '2024-01-14', activity: 'Technology Fundamentals - Video', duration: '30 min', score: '-' },
            { date: '2024-01-13', activity: 'Math Basics - Lesson 2', duration: '50 min', score: 95 },
            { date: '2024-01-12', activity: 'Creative Arts - Drawing', duration: '60 min', score: 87 }
        ];

        const activityTable = document.getElementById('activityTable');
        const tbody = activityTable.querySelector('tbody');
        tbody.innerHTML = '';

        activityData.forEach(activity => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${activity.date}</td>
                <td>${activity.activity}</td>
                <td>${activity.duration}</td>
                <td>${activity.score}</td>
            `;
        });
    }

    async trackAnalyticsEvent(eventType, metadata = {}) {
        try {
            await fetch(`${this.apiBase}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.currentUser.userId,
                    eventType,
                    metadata: {
                        ...metadata,
                        grade: this.currentUser.grade,
                        timestamp: new Date().toISOString()
                    },
                    sessionId: 'student-session'
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

// Initialize student dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentDashboard();
});
