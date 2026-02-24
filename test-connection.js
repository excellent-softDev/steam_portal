const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing MySQL connection...');
    
    const config = {
        host: 'localhost',
        user: 'root',
        password: '',
        charset: 'utf8mb4'
    };
    
    try {
        // First connect without database
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        await connection.execute('CREATE DATABASE IF NOT EXISTS steamlms');
        console.log('✅ Database "steamlms" ready');
        
        await connection.end();
        
        // Now connect with database
        const dbConfig = {
            ...config,
            database: 'steamlms'
        };
        
        const db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to steamlms database');
        
        await db.end();
        console.log('✅ Connection test successful!');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.log('\nPossible solutions:');
        console.log('1. Make sure XAMPP MySQL is running');
        console.log('2. Check if MySQL is on port 3306');
        console.log('3. Verify user "root" has no password');
        console.log('4. Try restarting XAMPP MySQL service');
    }
}

testConnection();
