#!/usr/bin/env node

const SteamDataSeeder = require('./seedSteamData');
const MongoDataSeeder = require('./seedMongoData');

class MasterSeeder {
    constructor() {
        this.steamSeeder = new SteamDataSeeder();
        this.mongoSeeder = new MongoDataSeeder();
    }

    async seedAll() {
        console.log('🚀 Starting complete STEAM LMS data seeding...');
        console.log('=' .repeat(60));
        
        try {
            // Step 1: Seed MySQL STEAM content
            console.log('\n📋 Step 1: Seeding MySQL STEAM Content');
            console.log('-'.repeat(40));
            await this.steamSeeder.seedAllData();
            
            // Step 2: Seed MongoDB analytics data
            console.log('\n📊 Step 2: Seeding MongoDB Analytics Data');
            console.log('-'.repeat(40));
            await this.mongoSeeder.seedAllData();
            
            console.log('\n' + '='.repeat(60));
            console.log('🎉 Complete STEAM LMS data seeding finished successfully!');
            console.log('\n📚 What was seeded:');
            console.log('  • 5 STEAM categories (Science, Technology, Engineering, Arts, Mathematics)');
            console.log('  • 25 subcategories across all STEAM fields');
            console.log('  • 15 comprehensive content items with grade-appropriate mapping');
            console.log('  • 10 content files (PDFs, documents, images)');
            console.log('  • 11 users (8 students, 2 teachers, 1 admin)');
            console.log('  • 900+ analytics events over 30 days');
            console.log('  • 5 content engagement records');
            console.log('  • 5 dashboard metrics');
            
            console.log('\n🚀 Next steps:');
            console.log('  1. Start the dashboard server: npm run dashboard');
            console.log('  2. Access admin dashboard: http://localhost:3002/admin-dashboard.html');
            console.log('  3. Access student dashboard: http://localhost:3002/student-dashboard.html');
            console.log('  4. View real-time analytics and updates');
            
        } catch (error) {
            console.error('\n❌ Seeding failed:', error.message);
            console.error('Please check your database connections and try again.');
            process.exit(1);
        }
    }

    async seedMySQLOnly() {
        console.log('📋 Seeding MySQL STEAM Content Only...');
        await this.steamSeeder.seedAllData();
        console.log('✅ MySQL seeding completed!');
    }

    async seedMongoOnly() {
        console.log('📊 Seeding MongoDB Analytics Data Only...');
        await this.mongoSeeder.seedAllData();
        console.log('✅ MongoDB seeding completed!');
    }
}

// Command line interface
const command = process.argv[2];

async function main() {
    const seeder = new MasterSeeder();
    
    switch (command) {
        case 'mysql':
            await seeder.seedMySQLOnly();
            break;
        case 'mongo':
            await seeder.seedMongoOnly();
            break;
        case 'all':
        default:
            await seeder.seedAll();
            break;
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = MasterSeeder;
