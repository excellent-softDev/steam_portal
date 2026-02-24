const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve main admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Serve simple login page
app.get('/simple-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple-login.html'));
});

// Serve test page
app.get('/admin-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-test.html'));
});

// Serve all other pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 API server: http://localhost:3001`);
});
