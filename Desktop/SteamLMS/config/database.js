const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.mongoConnection = null;
        this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/steamlms_dashboard';
    }

    async connect() {
        try {
            console.log('🔄 Connecting to MongoDB...');
            
            this.mongoConnection = await mongoose.connect(this.connectionString);
            
            console.log('✅ Connected to MongoDB successfully');
            console.log(`📊 Database: ${this.mongoConnection.connection.name}`);
            
            return this.mongoConnection;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.mongoConnection) {
                await mongoose.disconnect();
                console.log('✅ MongoDB connection closed');
            }
        } catch (error) {
            console.error('❌ Error closing MongoDB connection:', error.message);
            throw error;
        }
    }

    getConnection() {
        return this.mongoConnection;
    }

    isConnected() {
        return mongoose.connection.readyState === 1;
    }
}

module.exports = new DatabaseConnection();
