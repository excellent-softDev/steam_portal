const mongoose = require('mongoose');

const contentEngagementSchema = new mongoose.Schema({
    contentId: { type: String, required: true },
    title: { type: String, required: true },
    contentType: { type: String, required: true },
    grade: { type: String },
    category: { type: String },
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    engagementScore: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

contentEngagementSchema.index({ contentId: 1 });
contentEngagementSchema.index({ grade: 1, category: 1 });
contentEngagementSchema.index({ engagementScore: -1 });

module.exports = mongoose.model('ContentEngagement', contentEngagementSchema);
