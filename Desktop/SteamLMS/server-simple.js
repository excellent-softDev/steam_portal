const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Simple API routes (mock data)
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Simple server running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple Server running on http://localhost:${PORT}`);
    console.log(`🌐 Dashboard available at http://localhost:${PORT}/admin.html`);
});
