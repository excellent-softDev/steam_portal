const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ContentEngagement = require('../models/ContentEngagement');
const DashboardMetric = require('../models/DashboardMetric');

class MongoDataSeeder {
    constructor() {
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/steamlms_dashboard';
    }

    async connect() {
        try {
            await mongoose.connect(this.connectionString);
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        await mongoose.disconnect();
        console.log('✅ MongoDB connection closed');
    }

    async seedAllData() {
        try {
            await this.connect();
            
            console.log('🌱 Starting MongoDB data seeding...');
            
            await this.seedUsers();
            await this.seedAnalytics();
            await this.seedContentEngagement();
            await this.seedDashboardMetrics();
            
            console.log('✅ MongoDB data seeding completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during MongoDB seeding:', error.message);
            throw error;
        } finally {
            await this.disconnect();
        }
    }

    async seedUsers() {
        console.log('👥 Seeding users...');
        
        const users = [
            // Students
            {
                userId: 'student001',
                email: 'alice.johnson@steamlms.edu',
                firstName: 'Alice',
                lastName: 'Johnson',
                role: 'student',
                grade: 'Grade 3',
                isActive: true,
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                userId: 'student002',
                email: 'bob.smith@steamlms.edu',
                firstName: 'Bob',
                lastName: 'Smith',
                role: 'student',
                grade: 'Grade 5',
                isActive: true,
                lastLogin: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            },
            {
                userId: 'student003',
                email: 'carol.davis@steamlms.edu',
                firstName: 'Carol',
                lastName: 'Davis',
                role: 'student',
                grade: 'Grade 7',
                isActive: true,
                lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
            },
            {
                userId: 'student004',
                email: 'david.wilson@steamlms.edu',
                firstName: 'David',
                lastName: 'Wilson',
                role: 'student',
                grade: 'Grade 8',
                isActive: true,
                lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                userId: 'student005',
                email: 'emma.brown@steamlms.edu',
                firstName: 'Emma',
                lastName: 'Brown',
                role: 'student',
                grade: 'Grade 10',
                isActive: true,
                lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                userId: 'student006',
                email: 'frank.miller@steamlms.edu',
                firstName: 'Frank',
                lastName: 'Miller',
                role: 'student',
                grade: 'Grade 4',
                isActive: true,
                lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            },
            {
                userId: 'student007',
                email: 'grace.taylor@steamlms.edu',
                firstName: 'Grace',
                lastName: 'Taylor',
                role: 'student',
                grade: 'Grade 6',
                isActive: true,
                lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            },
            {
                userId: 'student008',
                email: 'henry.anderson@steamlms.edu',
                firstName: 'Henry',
                lastName: 'Anderson',
                role: 'student',
                grade: 'Grade 9',
                isActive: true,
                lastLogin: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
            },
            
            // Teachers
            {
                userId: 'teacher001',
                email: 'ms.thompson@steamlms.edu',
                firstName: 'Sarah',
                lastName: 'Thompson',
                role: 'teacher',
                grade: 'Grade 5',
                isActive: true,
                lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
                userId: 'teacher002',
                email: 'mr.rodriguez@steamlms.edu',
                firstName: 'Carlos',
                lastName: 'Rodriguez',
                role: 'teacher',
                grade: 'Grade 8',
                isActive: true,
                lastLogin: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
            },
            
            // Admin
            {
                userId: 'admin001',
                email: 'admin@steamlms.edu',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'admin',
                isActive: true,
                lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            }
        ];

        for (const userData of users) {
            await User.findOneAndUpdate(
                { userId: userData.userId },
                userData,
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Seeded ${users.length} users`);
    }

    async seedAnalytics() {
        console.log('📊 Seeding analytics data...');
        
        const eventTypes = ['login', 'logout', 'page_view', 'content_access', 'assignment_complete', 'quiz_attempt', 'download'];
        const pages = ['/dashboard', '/courses', '/math-basics', '/science-intro', '/tech-fundamentals', '/engineering-projects', '/arts-creative'];
        const contentIds = ['sci_bio_cells_101', 'tech_code_basics_101', 'eng_simple_machines_101', 'arts_drawing_basics_101', 'math_fractions_101'];
        
        const analyticsData = [];
        const now = new Date();
        
        // Generate analytics for the last 30 days
        for (let day = 0; day < 30; day++) {
            const date = new Date(now);
            date.setDate(date.getDate() - day);
            
            // Generate 20-50 events per day
            const eventsPerDay = Math.floor(Math.random() * 30) + 20;
            
            for (let event = 0; event < eventsPerDay; event++) {
                const eventTime = new Date(date);
                eventTime.setHours(Math.floor(Math.random() * 24));
                eventTime.setMinutes(Math.floor(Math.random() * 60));
                
                const userId = `student00${Math.floor(Math.random() * 8) + 1}`;
                const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                
                let metadata = {};
                
                switch (eventType) {
                    case 'page_view':
                        metadata.page = pages[Math.floor(Math.random() * pages.length)];
                        metadata.duration = Math.floor(Math.random() * 60) + 5;
                        break;
                    case 'content_access':
                        metadata.contentId = contentIds[Math.floor(Math.random() * contentIds.length)];
                        metadata.contentType = 'lesson';
                        metadata.duration = Math.floor(Math.random() * 45) + 10;
                        metadata.grade = ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'][Math.floor(Math.random() * 8)];
                        metadata.category = ['science', 'technology', 'engineering', 'arts', 'mathematics'][Math.floor(Math.random() * 5)];
                        break;
                    case 'quiz_attempt':
                        metadata.contentId = `quiz_${Math.floor(Math.random() * 20) + 1}`;
                        metadata.score = Math.floor(Math.random() * 40) + 60; // 60-100
                        metadata.grade = ['Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'][Math.floor(Math.random() * 8)];
                        break;
                    case 'download':
                        metadata.fileName = `file_${Math.floor(Math.random() * 10) + 1}.pdf`;
                        metadata.fileSize = `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} MB`;
                        break;
                }
                
                analyticsData.push({
                    userId,
                    eventType,
                    metadata,
                    timestamp: eventTime,
                    sessionId: `session_${date.getTime()}_${Math.floor(Math.random() * 1000)}`,
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                });
            }
        }

        // Insert in batches for better performance
        const batchSize = 100;
        for (let i = 0; i < analyticsData.length; i += batchSize) {
            const batch = analyticsData.slice(i, i + batchSize);
            await Analytics.insertMany(batch, { ordered: false });
        }

        console.log(`✅ Seeded ${analyticsData.length} analytics events`);
    }

    async seedContentEngagement() {
        console.log('📈 Seeding content engagement data...');
        
        const contentItems = [
            {
                contentId: 'sci_bio_cells_101',
                title: 'Introduction to Cells',
                contentType: 'lesson',
                grade: 'Grade 5',
                category: 'science',
                totalViews: Math.floor(Math.random() * 200) + 50,
                uniqueViews: Math.floor(Math.random() * 100) + 20,
                averageTimeSpent: Math.floor(Math.random() * 30) + 15,
                completionRate: Math.random() * 0.5 + 0.3, // 0.3 to 0.8
                downloads: Math.floor(Math.random() * 50) + 10,
                shares: Math.floor(Math.random() * 20) + 5,
                ratings: {
                    average: Math.random() * 2 + 3, // 3.0 to 5.0
                    count: Math.floor(Math.random() * 30) + 10
                },
                engagementScore: Math.random() * 40 + 60 // 60 to 100
            },
            {
                contentId: 'tech_code_basics_101',
                title: 'Introduction to Coding',
                contentType: 'lesson',
                grade: 'Grade 6',
                category: 'technology',
                totalViews: Math.floor(Math.random() * 300) + 100,
                uniqueViews: Math.floor(Math.random() * 150) + 50,
                averageTimeSpent: Math.floor(Math.random() * 45) + 20,
                completionRate: Math.random() * 0.4 + 0.4,
                downloads: Math.floor(Math.random() * 80) + 20,
                shares: Math.floor(Math.random() * 30) + 10,
                ratings: {
                    average: Math.random() * 1.5 + 3.5,
                    count: Math.floor(Math.random() * 40) + 15
                },
                engagementScore: Math.random() * 35 + 65
            },
            {
                contentId: 'eng_simple_machines_101',
                title: 'Simple Machines',
                contentType: 'lesson',
                grade: 'Grade 4',
                category: 'engineering',
                totalViews: Math.floor(Math.random() * 150) + 40,
                uniqueViews: Math.floor(Math.random() * 80) + 20,
                averageTimeSpent: Math.floor(Math.random() * 25) + 10,
                completionRate: Math.random() * 0.6 + 0.2,
                downloads: Math.floor(Math.random() * 40) + 8,
                shares: Math.floor(Math.random() * 15) + 3,
                ratings: {
                    average: Math.random() * 2 + 3,
                    count: Math.floor(Math.random() * 25) + 8
                },
                engagementScore: Math.random() * 45 + 55
            },
            {
                contentId: 'arts_drawing_basics_101',
                title: 'Drawing Fundamentals',
                contentType: 'lesson',
                grade: 'Grade 3',
                category: 'arts',
                totalViews: Math.floor(Math.random() * 180) + 60,
                uniqueViews: Math.floor(Math.random() * 90) + 25,
                averageTimeSpent: Math.floor(Math.random() * 35) + 15,
                completionRate: Math.random() * 0.5 + 0.3,
                downloads: Math.floor(Math.random() * 60) + 12,
                shares: Math.floor(Math.random() * 25) + 8,
                ratings: {
                    average: Math.random() * 1.8 + 3.2,
                    count: Math.floor(Math.random() * 35) + 12
                },
                engagementScore: Math.random() * 40 + 60
            },
            {
                contentId: 'math_fractions_101',
                title: 'Understanding Fractions',
                contentType: 'lesson',
                grade: 'Grade 4',
                category: 'mathematics',
                totalViews: Math.floor(Math.random() * 250) + 80,
                uniqueViews: Math.floor(Math.random() * 120) + 35,
                averageTimeSpent: Math.floor(Math.random() * 40) + 18,
                completionRate: Math.random() * 0.4 + 0.4,
                downloads: Math.floor(Math.random() * 70) + 15,
                shares: Math.floor(Math.random() * 20) + 6,
                ratings: {
                    average: Math.random() * 1.5 + 3.5,
                    count: Math.floor(Math.random() * 30) + 10
                },
                engagementScore: Math.random() * 30 + 70
            }
        ];

        for (const content of contentItems) {
            await ContentEngagement.findOneAndUpdate(
                { contentId: content.contentId },
                content,
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Seeded ${contentItems.length} content engagement records`);
    }

    async seedDashboardMetrics() {
        console.log('📊 Seeding dashboard metrics...');
        
        const metrics = [
            {
                name: 'Total Active Users',
                description: 'Number of active users in the last 7 days',
                category: 'user_engagement',
                value: 156,
                unit: 'users',
                target: 200,
                trend: {
                    direction: 'up',
                    percentage: 12.5
                },
                timeRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                }
            },
            {
                name: 'Average Session Duration',
                description: 'Average time users spend on the platform',
                category: 'user_engagement',
                value: 28.5,
                unit: 'minutes',
                target: 30,
                trend: {
                    direction: 'up',
                    percentage: 8.3
                },
                timeRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                }
            },
            {
                name: 'Content Completion Rate',
                description: 'Percentage of content completed by users',
                category: 'content_performance',
                value: 67.8,
                unit: 'percent',
                target: 75,
                trend: {
                    direction: 'up',
                    percentage: 5.2
                },
                timeRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                }
            },
            {
                name: 'System Uptime',
                description: 'Platform availability percentage',
                category: 'system_usage',
                value: 99.9,
                unit: 'percent',
                target: 99.5,
                trend: {
                    direction: 'stable',
                    percentage: 0.1
                },
                timeRange: {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: new Date()
                }
            },
            {
                name: 'Quiz Average Score',
                description: 'Average score across all quizzes',
                category: 'learning_progress',
                value: 82.4,
                unit: 'points',
                target: 85,
                trend: {
                    direction: 'up',
                    percentage: 3.7
                },
                timeRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    end: new Date()
                }
            }
        ];

        for (const metric of metrics) {
            await DashboardMetric.findOneAndUpdate(
                { name: metric.name },
                metric,
                { upsert: true, new: true }
            );
        }

        console.log(`✅ Seeded ${metrics.length} dashboard metrics`);
    }
}

// Run seeder if this file is executed directly
if (require.main === module) {
    const seeder = new MongoDataSeeder();
    seeder.seedAllData().catch(console.error);
}

module.exports = MongoDataSeeder;
