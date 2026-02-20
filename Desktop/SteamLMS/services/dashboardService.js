const DashboardMetric = require('../models/DashboardMetric');
const Analytics = require('../models/Analytics');
const ContentEngagement = require('../models/ContentEngagement');
const User = require('../models/User');

class DashboardService {
    async getOverviewMetrics(timeRange = '7d') {
        try {
            const endDate = new Date();
            const startDate = new Date();
            
            switch(timeRange) {
                case '1d':
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case '7d':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '30d':
                    startDate.setDate(startDate.getDate() - 30);
                    break;
                case '90d':
                    startDate.setDate(startDate.getDate() - 90);
                    break;
                default:
                    startDate.setDate(startDate.getDate() - 7);
            }

            const [totalUsers, activeUsers, totalContent, totalSessions] = await Promise.all([
                User.countDocuments({ isActive: true }),
                Analytics.distinct('userId', { 
                    timestamp: { $gte: startDate, $lte: endDate },
                    eventType: 'login'
                }).then(users => users.length),
                ContentEngagement.countDocuments(),
                Analytics.countDocuments({ 
                    timestamp: { $gte: startDate, $lte: endDate }
                })
            ]);

            const avgEngagement = await ContentEngagement.aggregate([
                { $group: { _id: null, avgScore: { $avg: '$engagementScore' } } }
            ]);

            return {
                totalUsers,
                activeUsers,
                totalContent,
                totalSessions,
                averageEngagement: avgEngagement[0]?.avgScore || 0,
                timeRange
            };
        } catch (error) {
            throw new Error(`Failed to fetch overview metrics: ${error.message}`);
        }
    }

    async getUserEngagementMetrics(timeRange = '7d') {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

            const dailyActivity = await Analytics.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate },
                        eventType: { $in: ['login', 'page_view', 'content_access'] }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                            eventType: "$eventType"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.date",
                        events: {
                            $push: {
                                type: "$_id.eventType",
                                count: "$count"
                            }
                        },
                        total: { $sum: "$count" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const topUsers = await Analytics.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        totalEvents: { $sum: 1 },
                        uniquePages: { $addToSet: "$metadata.page" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'userInfo'
                    }
                },
                {
                    $project: {
                        userId: "$_id",
                        totalEvents: 1,
                        pageViews: { $size: "$uniquePages" },
                        firstName: { $arrayElemAt: ["$userInfo.firstName", 0] },
                        lastName: { $arrayElemAt: ["$userInfo.lastName", 0] },
                        email: { $arrayElemAt: ["$userInfo.email", 0] }
                    }
                },
                { $sort: { totalEvents: -1 } },
                { $limit: 10 }
            ]);

            return {
                dailyActivity,
                topUsers,
                timeRange
            };
        } catch (error) {
            throw new Error(`Failed to fetch user engagement metrics: ${error.message}`);
        }
    }

    async getContentPerformanceMetrics(timeRange = '7d') {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

            const topContent = await ContentEngagement.find()
                .sort({ engagementScore: -1 })
                .limit(10)
                .lean();

            const contentByCategory = await ContentEngagement.aggregate([
                {
                    $group: {
                        _id: "$category",
                        totalViews: { $sum: "$totalViews" },
                        avgEngagement: { $avg: "$engagementScore" },
                        completionRate: { $avg: "$completionRate" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { totalViews: -1 } }
            ]);

            const contentByGrade = await ContentEngagement.aggregate([
                {
                    $group: {
                        _id: "$grade",
                        totalViews: { $sum: "$totalViews" },
                        avgEngagement: { $avg: "$engagementScore" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { totalViews: -1 } }
            ]);

            return {
                topContent,
                contentByCategory,
                contentByGrade,
                timeRange
            };
        } catch (error) {
            throw new Error(`Failed to fetch content performance metrics: ${error.message}`);
        }
    }

    async getSystemUsageMetrics(timeRange = '7d') {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange.replace('d', '')));

            const hourlyUsage = await Analytics.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            hour: { $hour: "$timestamp" },
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                        },
                        events: { $sum: 1 },
                        uniqueUsers: { $addToSet: "$userId" }
                    }
                },
                {
                    $project: {
                        hour: "$_id.hour",
                        date: "$_id.date",
                        events: 1,
                        uniqueUsers: { $size: "$uniqueUsers" }
                    }
                },
                { $sort: { date: 1, hour: 1 } }
            ]);

            const eventTypeBreakdown = await Analytics.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: "$eventType",
                        count: { $sum: 1 },
                        uniqueUsers: { $addToSet: "$userId" }
                    }
                },
                {
                    $project: {
                        eventType: "$_id",
                        count: 1,
                        uniqueUsers: { $size: "$uniqueUsers" }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return {
                hourlyUsage,
                eventTypeBreakdown,
                timeRange
            };
        } catch (error) {
            throw new Error(`Failed to fetch system usage metrics: ${error.message}`);
        }
    }
}

module.exports = new DashboardService();
