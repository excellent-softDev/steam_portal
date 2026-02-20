const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');

router.get('/overview', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const metrics = await dashboardService.getOverviewMetrics(timeRange);
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching overview metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/user-engagement', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const metrics = await dashboardService.getUserEngagementMetrics(timeRange);
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching user engagement metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/content-performance', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const metrics = await dashboardService.getContentPerformanceMetrics(timeRange);
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching content performance metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/system-usage', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        const metrics = await dashboardService.getSystemUsageMetrics(timeRange);
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching system usage metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
