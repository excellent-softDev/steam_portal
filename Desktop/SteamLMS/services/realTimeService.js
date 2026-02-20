const Analytics = require('../models/Analytics');
const ContentEngagement = require('../models/ContentEngagement');
const User = require('../models/User');

class RealTimeService {
    constructor(broadcastFunction) {
        this.updateInterval = null;
        this.sampleDataInterval = null;
        this.broadcastUpdate = broadcastFunction;
    }

    startRealTimeUpdates() {
        console.log('🔄 Starting real-time dashboard updates...');
        
        // Update every 30 seconds
        this.updateInterval = setInterval(async () => {
            await this.updateDashboardMetrics();
        }, 30000);

        // Generate sample data every 10 seconds for demonstration
        this.sampleDataInterval = setInterval(async () => {
            await this.generateSampleData();
        }, 10000);
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.sampleDataInterval) {
            clearInterval(this.sampleDataInterval);
            this.sampleDataInterval = null;
        }
        console.log('⏹️ Real-time updates stopped');
    }

    async updateDashboardMetrics() {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Get recent activity
            const recentActivity = await Analytics.aggregate([
                { $match: { timestamp: { $gte: oneHourAgo } } },
                {
                    $group: {
                        _id: '$eventType',
                        count: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$userId' }
                    }
                },
                {
                    $project: {
                        eventType: '$_id',
                        count: 1,
                        uniqueUsers: { $size: '$uniqueUsers' }
                    }
                }
            ]);

            // Get daily stats
            const dailyStats = await Analytics.aggregate([
                { $match: { timestamp: { $gte: oneDayAgo } } },
                {
                    $group: {
                        _id: {
                            hour: { $hour: '$timestamp' },
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                        },
                        events: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$userId' }
                    }
                },
                {
                    $project: {
                        hour: '$_id.hour',
                        date: '$_id.date',
                        events: 1,
                        uniqueUsers: { $size: '$uniqueUsers' }
                    }
                },
                { $sort: { date: -1, hour: -1 } },
                { $limit: 24 }
            ]);

            const updateData = {
                type: 'metrics_update',
                timestamp: now.toISOString(),
                data: {
                    recentActivity,
                    dailyStats,
                    activeUsers: recentActivity.reduce((acc, item) => Math.max(acc, item.uniqueUsers), 0)
                }
            };

            // Broadcast to admin dashboard
            this.broadcastUpdate('admin', updateData);
            
            console.log('📊 Real-time metrics updated and broadcasted');

        } catch (error) {
            console.error('❌ Error updating dashboard metrics:', error);
        }
    }

    async generateSampleData() {
        try {
            const sampleUsers = ['student1', 'student2', 'student3', 'student4', 'student5'];
            const eventTypes = ['login', 'page_view', 'content_access', 'quiz_attempt'];
            const pages = ['/dashboard', '/courses', '/math-basics', '/science-intro', '/tech-fundamentals'];
            const contentTypes = ['lesson', 'video', 'quiz', 'assignment'];

            // Generate random analytics event
            const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
            const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            const metadata = {};
            
            if (randomEventType === 'page_view') {
                metadata.page = pages[Math.floor(Math.random() * pages.length)];
            } else if (randomEventType === 'content_access') {
                metadata.contentId = `content_${Math.floor(Math.random() * 100)}`;
                metadata.contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
                metadata.duration = Math.floor(Math.random() * 60) + 10;
            } else if (randomEventType === 'quiz_attempt') {
                metadata.score = Math.floor(Math.random() * 40) + 60;
                metadata.contentId = `quiz_${Math.floor(Math.random() * 20)}`;
            }

            const analyticsEvent = new Analytics({
                userId: randomUser,
                eventType: randomEventType,
                metadata,
                sessionId: `session_${Date.now()}`,
                ipAddress: '127.0.0.1',
                userAgent: 'Sample Data Generator'
            });

            await analyticsEvent.save();

            // Update content engagement occasionally
            if (Math.random() > 0.7) {
                const randomContentId = `content_${Math.floor(Math.random() * 50)}`;
                await ContentEngagement.updateOne(
                    { contentId: randomContentId },
                    {
                        $inc: {
                            totalViews: 1,
                            averageTimeSpent: Math.random() * 10
                        },
                        $setOnInsert: {
                            contentId: randomContentId,
                            title: `Sample Content ${randomContentId}`,
                            contentType: 'lesson',
                            grade: 'Grade 5',
                            category: 'Mathematics',
                            engagementScore: Math.random() * 100
                        }
                    },
                    { upsert: true }
                );
            }

            console.log('🎲 Sample data generated');

        } catch (error) {
            console.error('❌ Error generating sample data:', error);
        }
    }

    async trackUserActivity(userId, eventType, metadata = {}) {
        try {
            const analyticsEvent = new Analytics({
                userId,
                eventType,
                metadata: {
                    ...metadata,
                    timestamp: new Date().toISOString()
                },
                sessionId: `session_${Date.now()}`,
                ipAddress: metadata.ipAddress || '127.0.0.1',
                userAgent: metadata.userAgent || 'Unknown'
            });

            await analyticsEvent.save();

            // Broadcast immediate update for significant events
            if (['login', 'content_access', 'quiz_attempt'].includes(eventType)) {
                const updateData = {
                    type: 'user_activity',
                    timestamp: new Date().toISOString(),
                    data: {
                        userId,
                        eventType,
                        metadata
                    }
                };

                this.broadcastUpdate('admin', updateData);
                this.broadcastUpdate('student', updateData);
            }

            return analyticsEvent;
        } catch (error) {
            console.error('❌ Error tracking user activity:', error);
            throw error;
        }
    }

    async getContentEngagementUpdates() {
        try {
            const topContent = await ContentEngagement.find()
                .sort({ engagementScore: -1 })
                .limit(10)
                .lean();

            const recentContent = await ContentEngagement.find()
                .sort({ lastUpdated: -1 })
                .limit(5)
                .lean();

            return {
                topContent,
                recentContent,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting content engagement updates:', error);
            throw error;
        }
    }
}

module.exports = (broadcastFunction) => new RealTimeService(broadcastFunction);
