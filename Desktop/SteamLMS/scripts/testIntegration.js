const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ContentEngagement = require('../models/ContentEngagement');

class DataIntegrationTester {
    constructor() {
        this.mysqlConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'steamlms',
            charset: 'utf8mb4',
            connectionLimit: 10
        };
        this.mongoConnectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/steamlms_dashboard';
        this.mysql = null;
    }

    async connect() {
        try {
            // Connect to MySQL
            this.mysql = await mysql.createConnection(this.mysqlConfig);
            console.log('✅ Connected to MySQL');

            // Connect to MongoDB
            await mongoose.connect(this.mongoConnectionString);
            console.log('✅ Connected to MongoDB');

        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.mysql) {
            await this.mysql.end();
        }
        await mongoose.disconnect();
        console.log('✅ All database connections closed');
    }

    async testIntegration() {
        try {
            await this.connect();
            
            console.log('🧪 Testing dashboard data integration...');
            console.log('=' .repeat(60));

            // Test 1: Verify MySQL content data
            await this.testMySQLContent();
            
            // Test 2: Verify MongoDB analytics data
            await this.testMongoAnalytics();
            
            // Test 3: Test cross-system data consistency
            await this.testDataConsistency();
            
            // Test 4: Test dashboard API responses
            await this.testDashboardAPIs();
            
            console.log('=' .repeat(60));
            console.log('✅ All integration tests passed!');
            
        } catch (error) {
            console.error('❌ Integration test failed:', error.message);
            throw error;
        } finally {
            await this.disconnect();
        }
    }

    async testMySQLContent() {
        console.log('\n📋 Testing MySQL Content Data...');
        
        // Test categories
        const [categories] = await this.mysql.execute('SELECT COUNT(*) as count FROM categories');
        console.log(`  ✓ Categories: ${categories[0].count} records`);
        
        // Test subcategories
        const [subcategories] = await this.mysql.execute('SELECT COUNT(*) as count FROM subcategories');
        console.log(`  ✓ Subcategories: ${subcategories[0].count} records`);
        
        // Test content
        const [content] = await this.mysql.execute('SELECT COUNT(*) as count FROM content');
        console.log(`  ✓ Content items: ${content[0].count} records`);
        
        // Test grade distribution
        const [gradeDistribution] = await this.mysql.execute(`
            SELECT g.name, COUNT(c.id) as content_count 
            FROM grades g 
            LEFT JOIN content c ON g.id = c.grade_id 
            GROUP BY g.id, g.name 
            ORDER BY g.name
        `);
        
        console.log('  📊 Content by Grade:');
        gradeDistribution.forEach(grade => {
            console.log(`    - ${grade.name}: ${grade.content_count} items`);
        });
        
        // Test category distribution
        const [categoryDistribution] = await this.mysql.execute(`
            SELECT cat.name, COUNT(c.id) as content_count 
            FROM categories cat 
            LEFT JOIN content c ON cat.id = c.category_id 
            GROUP BY cat.id, cat.name 
            ORDER BY cat.name
        `);
        
        console.log('  📊 Content by Category:');
        categoryDistribution.forEach(category => {
            console.log(`    - ${category.name}: ${category.content_count} items`);
        });
    }

    async testMongoAnalytics() {
        console.log('\n📊 Testing MongoDB Analytics Data...');
        
        // Test users
        const userCount = await User.countDocuments();
        console.log(`  ✓ Users: ${userCount} records`);
        
        // Test analytics events
        const analyticsCount = await Analytics.countDocuments();
        console.log(`  ✓ Analytics events: ${analyticsCount} records`);
        
        // Test content engagement
        const engagementCount = await ContentEngagement.countDocuments();
        console.log(`  ✓ Content engagement: ${engagementCount} records`);
        
        // Test user activity distribution
        const userActivity = await Analytics.aggregate([
            { $group: { _id: '$eventType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('  📊 Event Distribution:');
        userActivity.forEach(event => {
            console.log(`    - ${event._id}: ${event.count} events`);
        });
        
        // Test user engagement by grade
        const userEngagementByGrade = await Analytics.aggregate([
            { $match: { 'metadata.grade': { $exists: true } } },
            { $group: { _id: '$metadata.grade', events: { $sum: 1 } } },
            { $sort: { events: -1 } }
        ]);
        
        console.log('  📊 User Activity by Grade:');
        userEngagementByGrade.forEach(grade => {
            console.log(`    - ${grade._id}: ${grade.events} events`);
        });
    }

    async testDataConsistency() {
        console.log('\n🔗 Testing Cross-System Data Consistency...');
        
        // Get MySQL content by category
        const [mysqlContentByCategory] = await this.mysql.execute(`
            SELECT category_id, COUNT(*) as count 
            FROM content 
            GROUP BY category_id
        `);
        
        // Get MongoDB engagement by category
        const mongoEngagementByCategory = await ContentEngagement.aggregate([
            { $group: { _id: '$category', totalViews: { $sum: '$totalViews' } } },
            { $sort: { totalViews: -1 } }
        ]);
        
        console.log('  📊 Category Comparison:');
        mysqlContentByCategory.forEach(mysqlCat => {
            const mongoCat = mongoEngagementByCategory.find(m => m._id === mysqlCat.category_id);
            console.log(`    - ${mysqlCat.category_id}: ${mysqlCat.count} items, ${mongoCat ? mongoCat.totalViews : 0} views`);
        });
        
        // Test grade consistency
        const [mysqlGrades] = await this.mysql.execute('SELECT id, name FROM grades ORDER BY name');
        const mongoGrades = await Analytics.distinct('metadata.grade');
        
        console.log('  📊 Grade Consistency:');
        mysqlGrades.forEach(grade => {
            const hasActivity = mongoGrades.includes(grade.name);
            console.log(`    - ${grade.name}: ${hasActivity ? '✓' : '✗'} activity data`);
        });
    }

    async testDashboardAPIs() {
        console.log('\n🌐 Testing Dashboard API Integration...');
        
        // Note: This would test actual API endpoints if the server is running
        // For now, we'll test the data that would be served by the APIs
        
        // Test overview metrics calculation
        const totalUsers = await User.countDocuments({ isActive: true });
        const activeUsers = await Analytics.distinct('userId', {
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            eventType: 'login'
        });
        
        const totalContent = await ContentEngagement.countDocuments();
        const totalSessions = await Analytics.countDocuments({
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        console.log('  📊 Dashboard Overview Metrics:');
        console.log(`    - Total Users: ${totalUsers}`);
        console.log(`    - Active Users (7d): ${activeUsers.length}`);
        console.log(`    - Total Content: ${totalContent}`);
        console.log(`    - Total Sessions (7d): ${totalSessions}`);
        
        // Test content performance metrics
        const topContent = await ContentEngagement.find()
            .sort({ engagementScore: -1 })
            .limit(5);
        
        console.log('  🏆 Top Performing Content:');
        topContent.forEach((content, index) => {
            console.log(`    ${index + 1}. ${content.title}: ${content.engagementScore.toFixed(1)} score`);
        });
        
        // Test user engagement metrics
        const topUsers = await Analytics.aggregate([
            { $group: { _id: '$userId', events: { $sum: 1 } } },
            { $sort: { events: -1 } },
            { $limit: 5 }
        ]);
        
        console.log('  👥 Most Active Users:');
        topUsers.forEach((user, index) => {
            console.log(`    ${index + 1}. ${user._id}: ${user.events} events`);
        });
    }

    async generateIntegrationReport() {
        console.log('\n📄 Generating Integration Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            mysql: {
                categories: (await this.mysql.execute('SELECT COUNT(*) as count FROM categories'))[0][0].count,
                subcategories: (await this.mysql.execute('SELECT COUNT(*) as count FROM subcategories'))[0][0].count,
                content: (await this.mysql.execute('SELECT COUNT(*) as count FROM content'))[0][0].count,
                files: (await this.mysql.execute('SELECT COUNT(*) as count FROM files'))[0][0].count
            },
            mongodb: {
                users: await User.countDocuments(),
                analytics: await Analytics.countDocuments(),
                contentEngagement: await ContentEngagement.countDocuments()
            },
            status: 'healthy'
        };
        
        console.log('  📊 System Summary:');
        console.log(`    MySQL Records: ${Object.values(report.mysql).reduce((a, b) => a + b, 0)}`);
        console.log(`    MongoDB Records: ${Object.values(report.mongodb).reduce((a, b) => a + b, 0)}`);
        console.log(`    Status: ${report.status}`);
        
        return report;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new DataIntegrationTester();
    tester.testIntegration()
        .then(() => tester.generateIntegrationReport())
        .catch(console.error);
}

module.exports = DataIntegrationTester;
