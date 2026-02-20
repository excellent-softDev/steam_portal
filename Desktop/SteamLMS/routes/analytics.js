const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

router.post('/track', async (req, res) => {
    try {
        const { userId, eventType, metadata, sessionId, ipAddress, userAgent } = req.body;
        
        if (!userId || !eventType) {
            return res.status(400).json({
                success: false,
                error: 'userId and eventType are required'
            });
        }

        const analytics = new Analytics({
            userId,
            eventType,
            metadata,
            sessionId,
            ipAddress,
            userAgent
        });

        await analytics.save();
        
        res.json({
            success: true,
            message: 'Analytics event tracked successfully',
            data: analytics
        });
    } catch (error) {
        console.error('Error tracking analytics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 100, eventType } = req.query;
        
        let query = { userId };
        if (eventType) {
            query.eventType = eventType;
        }
        
        const events = await Analytics.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean();
        
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('Error fetching user analytics:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/events', async (req, res) => {
    try {
        const { limit = 100, eventType, startDate, endDate } = req.query;
        
        let query = {};
        if (eventType) {
            query.eventType = eventType;
        }
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        const events = await Analytics.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean();
        
        res.json({
            success: true,
            data: events,
            count: events.length
        });
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
