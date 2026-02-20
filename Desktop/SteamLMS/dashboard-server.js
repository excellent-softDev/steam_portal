const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const databaseConnection = require('./config/database');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const { setSocketIO, broadcastDashboardUpdate } = require('./utils/broadcast');
const realTimeService = require('./services/realTimeService')(broadcastDashboardUpdate);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.DASHBOARD_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Dashboard server is running',
        database: 'MongoDB',
        timestamp: new Date().toISOString()
    });
});

io.on('connection', (socket) => {
    console.log('🔌 Client connected to dashboard WebSocket');
    
    socket.on('subscribe-dashboard', (data) => {
        socket.join(data.dashboardType || 'default');
        console.log(`📊 Client subscribed to ${data.dashboardType || 'default'} dashboard`);
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected from dashboard WebSocket');
    });
});

// Set socketIO instance for broadcast utility
setSocketIO(io);

async function startServer() {
    try {
        // Try to connect to MongoDB, but don't fail if it's not available
        try {
            await databaseConnection.connect();
            console.log('✅ Connected to MongoDB');
        } catch (mongoError) {
            console.warn('⚠️ MongoDB not available, continuing without analytics:', mongoError.message);
        }
        
        // Start real-time updates only if MongoDB is connected
        try {
            realTimeService.startRealTimeUpdates();
        } catch (realTimeError) {
            console.warn('⚠️ Real-time updates not available:', realTimeError.message);
        }
        
        server.listen(PORT, () => {
            console.log(`🚀 Dashboard server running on http://localhost:${PORT}`);
            console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard`);
            console.log(`📈 Analytics API available at http://localhost:${PORT}/api/analytics`);
            console.log(`🔌 WebSocket server ready for real-time updates`);
            console.log(`� Frontend served at http://localhost:${PORT}`);
            
            // Show MongoDB status
            if (databaseConnection.isConnected()) {
                console.log(`�🎲 Sample data generation enabled`);
            } else {
                console.log(`⚠️ MongoDB not connected - analytics features disabled`);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start dashboard server:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down dashboard server gracefully...');
    realTimeService.stopRealTimeUpdates();
    await databaseConnection.disconnect();
    server.close(() => {
        console.log('✅ Dashboard server closed');
        process.exit(0);
    });
});

startServer();

module.exports = { app, broadcastDashboardUpdate };
