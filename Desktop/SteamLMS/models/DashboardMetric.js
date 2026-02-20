const mongoose = require('mongoose');

const dashboardMetricSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { 
        type: String, 
        enum: ['user_engagement', 'content_performance', 'system_usage', 'learning_progress'],
        required: true 
    },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: { type: String },
    target: { type: mongoose.Schema.Types.Mixed },
    trend: {
        direction: { type: String, enum: ['up', 'down', 'stable'] },
        percentage: { type: Number }
    },
    timeRange: {
        start: { type: Date },
        end: { type: Date }
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

dashboardMetricSchema.index({ category: 1, createdAt: -1 });
dashboardMetricSchema.index({ name: 1, createdAt: -1 });

dashboardMetricSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DashboardMetric', dashboardMetricSchema);
