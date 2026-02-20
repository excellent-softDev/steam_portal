const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    eventType: { 
        type: String, 
        enum: ['login', 'logout', 'page_view', 'content_access', 'assignment_complete', 'quiz_attempt', 'download'],
        required: true 
    },
    metadata: {
        page: { type: String },
        contentId: { type: String },
        contentType: { type: String },
        duration: { type: Number },
        score: { type: Number },
        grade: { type: String },
        category: { type: String }
    },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
});

analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
