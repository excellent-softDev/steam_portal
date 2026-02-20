const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'steamlms',
    charset: 'utf8mb4',
    connectionLimit: 10
};

// Initialize database connection
let db;

async function initializeDatabase() {
    try {
        console.log('Connecting to MySQL with config:', {
            host: dbConfig.host,
            user: dbConfig.user,
            database: dbConfig.database
        });
        
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database: steamlms');
        
        // Test the connection
        await db.query('SELECT 1');
        console.log('✅ Database connection test successful');
        
        // Create tables if they don't exist
        await createTables();
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('❌ Full error:', error);
        
        // Try with alternative configuration for XAMPP
        try {
            const xamppConfig = {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'steamlms',
                charset: 'utf8mb4',
                connectionLimit: 10
            };
            
            console.log('🔄 Trying XAMPP configuration...');
            db = await mysql.createConnection(xamppConfig);
            console.log('✅ Connected to MySQL via XAMPP');
            
            await createTables();
        } catch (xamppError) {
            console.error('❌ XAMPP connection also failed:', xamppError.message);
            process.exit(1);
        }
    }
}

// Create database tables
async function createTables() {
    try {
        console.log('🔨 Creating database tables...');
        
        // Create grades table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS grades (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                age_range VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Create categories table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                color VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Create subcategories table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS subcategories (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category_id VARCHAR(50),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Create content table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS content (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                grade_id VARCHAR(50),
                category_id VARCHAR(50),
                subcategory_id VARCHAR(50),
                content_type VARCHAR(50),
                content LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Create files table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS files (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                size VARCHAR(50),
                type VARCHAR(100),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content_id VARCHAR(50)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Create settings table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        console.log('✅ Database tables created successfully');
        
        // Insert default data if tables are empty
        await insertDefaultData();
        
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    }
}

// Insert default data
async function insertDefaultData() {
    try {
        console.log('📝 Inserting default data...');
        
        // Check if grades table is empty
        const [gradesResult] = await db.execute('SELECT COUNT(*) as count FROM grades');
        if (gradesResult[0].count === 0) {
            const defaultGrades = [
                ['kinder', 'Kindergarten', 'Early childhood education', '4-5 years'],
                ['grade1', 'Grade 1', 'First grade', '6-7 years'],
                ['grade2', 'Grade 2', 'Second grade', '7-8 years'],
                ['grade3', 'Grade 3', 'Third grade', '8-9 years'],
                ['grade4', 'Grade 4', 'Fourth grade', '9-10 years'],
                ['grade5', 'Grade 5', 'Fifth grade', '10-11 years'],
                ['grade6', 'Grade 6', 'Sixth grade', '11-12 years'],
                ['grade7', 'Grade 7', 'Seventh grade', '12-13 years'],
                ['grade8', 'Grade 8', 'Eighth grade', '13-14 years'],
                ['grade9', 'Grade 9', 'Ninth grade', '14-15 years'],
                ['grade10', 'Grade 10', 'Tenth grade', '15-16 years'],
                ['grade11', 'Grade 11', 'Eleventh grade', '16-17 years'],
                ['grade12', 'Grade 12', 'Twelfth grade', '17-18 years']
            ];
            
            for (const grade of defaultGrades) {
                await db.execute(
                    'INSERT INTO grades (id, name, description, age_range) VALUES (?, ?, ?, ?)',
                    grade
                );
            }
            console.log('✅ Default grades inserted');
        }
        
        // Check if categories table is empty
        const [categoriesResult] = await db.execute('SELECT COUNT(*) as count FROM categories');
        if (categoriesResult[0].count === 0) {
            const defaultCategories = [
                ['math', 'Mathematics', 'Mathematical concepts and problem-solving', 'fa-calculator', '#3498db'],
                ['science', 'Science', 'Scientific inquiry and exploration', 'fa-flask', '#27ae60'],
                ['technology', 'Technology', 'Digital literacy and computational thinking', 'fa-laptop', '#9b59b6'],
                ['engineering', 'Engineering', 'Design thinking and problem-solving', 'fa-cogs', '#e67e22'],
                ['arts', 'Arts', 'Creative expression and design', 'fa-palette', '#e74c3c']
            ];
            
            for (const category of defaultCategories) {
                await db.execute(
                    'INSERT INTO categories (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)',
                    category
                );
            }
            console.log('✅ Default categories inserted');
        }
        
        console.log('✅ Default data insertion complete');
        
    } catch (error) {
        console.error('❌ Error inserting default data:', error.message);
    }
}

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', database: 'MySQL' });
});

// Get all content
app.get('/api/content', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.*, g.name as grade_name, cat.name as category_name 
            FROM content c 
            LEFT JOIN grades g ON c.grade_id = g.id 
            LEFT JOIN categories cat ON c.category_id = cat.id 
            ORDER BY c.created_at DESC
        `);
        
        const [grades] = await db.execute('SELECT * FROM grades ORDER BY name');
        const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');
        
        res.json({ 
            success: true, 
            data: rows,
            grades: grades,
            categories: categories
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create content
app.post('/api/content', async (req, res) => {
    try {
        const { title, description, gradeId, categoryId, subcategoryId, contentType, content, files } = req.body;
        
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        await db.execute(
            'INSERT INTO content (id, title, description, grade_id, category_id, subcategory_id, content_type, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, description, gradeId, categoryId, subcategoryId, contentType, content]
        );
        
        // Insert associated files if any
        if (files && files.length > 0) {
            for (const file of files) {
                await db.execute(
                    'INSERT INTO files (id, name, size, type, content_id) VALUES (?, ?, ?, ?, ?)',
                    [file.id, file.name, file.size, file.type, id]
                );
            }
        }
        
        res.json({ success: true, data: { id, title, description, gradeId, categoryId, subcategoryId, contentType, content } });
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all grades
app.get('/api/grades', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM grades ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching grades:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all files
app.get('/api/files', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM files ORDER BY upload_date DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend served at http://localhost:${PORT}`);
    });
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    if (db) {
        await db.end();
        console.log('✅ Database connection closed');
    }
    process.exit(0);
});

// Start the server
startServer().catch(console.error);
