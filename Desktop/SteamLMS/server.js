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
    charset: 'utf8mb4'
};

// Initialize database connection
let db;

async function initializeDatabase() {
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL database');
        
        // Create database if not exists
        await db.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        
        // Use the database without USE statement
        const connection = await mysql.createConnection({
            ...dbConfig,
            database: dbConfig.database
        });
        db = connection;
        
        // Create tables
        await createTables();
        
        // Populate with data
        await populateDatabase();
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

async function createTables() {
    console.log('Creating tables...');
    
    // Grades table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS grades (
            id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            age_range VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Categories table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(20) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            icon VARCHAR(50),
            color VARCHAR(7),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Subcategories table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS subcategories (
            id VARCHAR(50) PRIMARY KEY,
            category_id VARCHAR(20) NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Content table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS content (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            grade_id VARCHAR(20) NOT NULL,
            category_id VARCHAR(20) NOT NULL,
            type ENUM('lesson', 'assignment', 'resource', 'video', 'quiz') NOT NULL,
            content_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Files table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS files (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            size BIGINT,
            data LONGTEXT,
            file_path VARCHAR(500),
            mime_type VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Content files junction table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS content_files (
            content_id VARCHAR(50) NOT NULL,
            file_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (content_id, file_id),
            FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Content subcategories junction table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS content_subcategories (
            content_id VARCHAR(50) NOT NULL,
            subcategory_id VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (content_id, subcategory_id),
            FOREIGN KEY (content_id) REFERENCES content(id) ON DELETE CASCADE,
            FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    // Settings table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            description TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('Tables created successfully');
}

async function populateDatabase() {
    console.log('Populating database with data...');
    
    // Clear existing data
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('DELETE FROM content_subcategories');
    await db.execute('DELETE FROM content_files');
    await db.execute('DELETE FROM content');
    await db.execute('DELETE FROM files');
    await db.execute('DELETE FROM subcategories');
    await db.execute('DELETE FROM categories');
    await db.execute('DELETE FROM grades');
    await db.execute('DELETE FROM settings');
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    // Insert grades
    const grades = [
        ['kinder', 'Kindergarten', 'Early childhood education', '4-5 years'],
        ['grade1', 'Grade 1', 'First grade elementary education', '6-7 years'],
        ['grade2', 'Grade 2', 'Second grade elementary education', '7-8 years'],
        ['grade3', 'Grade 3', 'Third grade elementary education', '8-9 years'],
        ['grade4', 'Grade 4', 'Fourth grade elementary education', '9-10 years'],
        ['grade5', 'Grade 5', 'Fifth grade elementary education', '10-11 years'],
        ['grade6', 'Grade 6', 'Sixth grade elementary education', '11-12 years'],
        ['grade7', 'Grade 7', 'Seventh grade middle school', '12-13 years'],
        ['grade8', 'Grade 8', 'Eighth grade middle school', '13-14 years'],
        ['grade9', 'Grade 9', 'Ninth grade high school', '14-15 years'],
        ['grade10', 'Grade 10', 'Tenth grade high school', '15-16 years'],
        ['grade11', 'Grade 11', 'Eleventh grade high school', '16-17 years'],
        ['grade12', 'Grade 12', 'Twelfth grade high school', '17-18 years']
    ];
    
    for (const grade of grades) {
        await db.execute('INSERT INTO grades (id, name, description, age_range) VALUES (?, ?, ?, ?)', grade);
    }
    
    // Insert categories
    const categories = [
        ['math', 'Mathematics', 'Mathematical concepts and problem-solving', 'fa-calculator', '#3498db'],
        ['science', 'Science', 'Scientific inquiry and exploration', 'fa-flask', '#27ae60'],
        ['technology', 'Technology', 'Digital literacy and computational thinking', 'fa-laptop', '#9b59b6'],
        ['engineering', 'Engineering', 'Design thinking and problem-solving', 'fa-cogs', '#e67e22'],
        ['arts', 'Arts', 'Creative expression and design', 'fa-palette', '#e74c3c']
    ];
    
    for (const category of categories) {
        await db.execute('INSERT INTO categories (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)', category);
    }
    
    // Insert subcategories
    const subcategories = [
        // Mathematics subcategories
        ['math-arithmetic', 'math', 'Arithmetic', 'Basic number operations and calculations'],
        ['math-algebra', 'math', 'Algebra', 'Variables, equations, and algebraic thinking'],
        ['math-geometry', 'math', 'Geometry', 'Shapes, space, and spatial reasoning'],
        ['math-statistics', 'math', 'Statistics', 'Data collection, analysis, and probability'],
        
        // Science subcategories
        ['science-biology', 'science', 'Biology', 'Living organisms and life processes'],
        ['science-chemistry', 'science', 'Chemistry', 'Matter, elements, and chemical reactions'],
        ['science-physics', 'science', 'Physics', 'Energy, forces, and physical laws'],
        ['science-earth', 'science', 'Earth Science', 'Geology, weather, and environmental science'],
        
        // Technology subcategories
        ['tech-coding', 'technology', 'Programming', 'Computer programming and software development'],
        ['tech-robotics', 'technology', 'Robotics', 'Robot design, building, and programming'],
        ['tech-web', 'technology', 'Web Development', 'HTML, CSS, and web technologies'],
        ['tech-digital', 'technology', 'Digital Citizenship', 'Online safety and digital responsibility'],
        
        // Engineering subcategories
        ['eng-civil', 'engineering', 'Civil Engineering', 'Structures, buildings, and infrastructure'],
        ['eng-mechanical', 'engineering', 'Mechanical Engineering', 'Machines, tools, and mechanical systems'],
        ['eng-electrical', 'engineering', 'Electrical Engineering', 'Circuits, electronics, and power systems'],
        ['eng-aerospace', 'engineering', 'Aerospace Engineering', 'Aircraft, spacecraft, and flight'],
        
        // Arts subcategories
        ['arts-visual', 'arts', 'Visual Arts', 'Drawing, painting, and visual design'],
        ['arts-music', 'arts', 'Music', 'Musical instruments, theory, and composition'],
        ['arts-drama', 'arts', 'Drama', 'Acting, theater, and performance arts'],
        ['arts-dance', 'arts', 'Dance', 'Movement, choreography, and dance techniques']
    ];
    
    for (const subcategory of subcategories) {
        await db.execute('INSERT INTO subcategories (id, category_id, name, description) VALUES (?, ?, ?, ?)', subcategory);
    }
    
    // Insert sample content
    const content = [
        // Mathematics content
        ['content_1', 'Introduction to Addition', 'Learn basic addition concepts with visual aids and practice problems.', 'grade1', 'math', 'lesson', 'Students will learn to add numbers 1-10 using counting strategies and visual representations.'],
        ['content_2', 'Algebra Basics: Variables', 'Understanding variables and algebraic expressions.', 'grade7', 'math', 'lesson', 'Introduction to algebraic thinking, variables, and simple equations.'],
        ['content_3', 'Geometry: Shapes and Angles', 'Explore different shapes and angle measurements.', 'grade5', 'math', 'lesson', 'Identify, classify, and measure 2D and 3D shapes and angles.'],
        
        // Science content
        ['content_4', 'Plant Life Cycle', 'Learn how plants grow from seeds to mature plants.', 'grade3', 'science', 'lesson', 'Students will observe and understand the complete life cycle of plants.'],
        ['content_5', 'Chemical Reactions Lab', 'Hands-on experiments with safe chemical reactions.', 'grade10', 'science', 'assignment', 'Conduct and document various chemical reactions with proper safety procedures.'],
        ['content_6', 'Physics: Forces and Motion', 'Understanding basic physics concepts of force and motion.', 'grade8', 'science', 'lesson', 'Explore Newton\'s laws of motion and how forces affect objects.'],
        
        // Technology content
        ['content_7', 'Introduction to Coding', 'Learn basic programming concepts using Scratch.', 'grade4', 'technology', 'lesson', 'Introduction to computational thinking and block-based programming.'],
        ['content_8', 'Build a Simple Robot', 'Create a basic robot using common materials.', 'grade9', 'technology', 'assignment', 'Design and build a simple robot that can perform basic tasks.'],
        ['content_9', 'Web Design Basics', 'Create your first webpage using HTML and CSS.', 'grade11', 'technology', 'lesson', 'Learn the fundamentals of web design and create a personal webpage.'],
        
        // Engineering content
        ['content_10', 'Bridge Building Challenge', 'Design and build bridges using different materials.', 'grade6', 'engineering', 'assignment', 'Apply engineering principles to design and test bridge structures.'],
        ['content_11', 'Simple Machines', 'Explore levers, pulleys, and other simple machines.', 'grade5', 'engineering', 'lesson', 'Understand how simple machines make work easier in everyday life.'],
        ['content_12', 'Electrical Circuits', 'Build basic electrical circuits and understand conductivity.', 'grade8', 'engineering', 'lesson', 'Create series and parallel circuits and understand electrical flow.'],
        
        // Arts content
        ['content_13', 'Color Theory and Mixing', 'Learn about primary colors and color mixing.', 'grade2', 'arts', 'lesson', 'Explore color relationships and create art using color mixing techniques.'],
        ['content_14', 'Music Rhythm and Beat', 'Understanding rhythm and creating simple beats.', 'grade3', 'arts', 'lesson', 'Learn to identify and create different rhythmic patterns.'],
        ['content_15', 'Creative Drama Workshop', 'Develop acting skills through improvisation exercises.', 'grade10', 'arts', 'assignment', 'Participate in drama exercises and create short performances.']
    ];
    
    for (const item of content) {
        await db.execute('INSERT INTO content (id, title, description, grade_id, category_id, type, content_text) VALUES (?, ?, ?, ?, ?, ?, ?)', item);
    }
    
    // Insert content-subcategory relationships
    const contentSubcategories = [
        ['content_1', 'math-arithmetic'],
        ['content_2', 'math-algebra'],
        ['content_3', 'math-geometry'],
        ['content_4', 'science-biology'],
        ['content_5', 'science-chemistry'],
        ['content_6', 'science-physics'],
        ['content_7', 'tech-coding'],
        ['content_8', 'tech-robotics'],
        ['content_9', 'tech-web'],
        ['content_10', 'eng-civil'],
        ['content_11', 'eng-mechanical'],
        ['content_12', 'eng-electrical'],
        ['content_13', 'arts-visual'],
        ['content_14', 'arts-music'],
        ['content_15', 'arts-drama']
    ];
    
    for (const [contentId, subcategoryId] of contentSubcategories) {
        await db.execute('INSERT INTO content_subcategories (content_id, subcategory_id) VALUES (?, ?)', [contentId, subcategoryId]);
    }
    
    // Insert sample files
    const files = [
        ['file_1', 'Math Worksheet 1.pdf', 'application/pdf', 1024000, 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9M=', '/uploads/math-worksheet-1.pdf', 'application/pdf'],
        ['file_2', 'Science Experiment Video.mp4', 'video/mp4', 5120000, 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28y', '/uploads/science-experiment.mp4', 'video/mp4'],
        ['file_3', 'Art Project Image.jpg', 'image/jpeg', 2048000, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ', '/uploads/art-project.jpg', 'image/jpeg'],
        ['file_4', 'Robot Design Plans.pdf', 'application/pdf', 1536000, 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9M=', '/uploads/robot-design.pdf', 'application/pdf'],
        ['file_5', 'Music Notes Sheet.pdf', 'application/pdf', 768000, 'data:application/pdf;base64,JVBERi0xLjQKJeLjz9M=', '/uploads/music-notes.pdf', 'application/pdf']
    ];
    
    for (const file of files) {
        await db.execute('INSERT INTO files (id, name, type, size, data, file_path, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)', file);
    }
    
    // Insert content-file relationships
    const contentFiles = [
        ['content_1', 'file_1'],
        ['content_6', 'file_2'],
        ['content_13', 'file_3'],
        ['content_8', 'file_4'],
        ['content_14', 'file_5']
    ];
    
    for (const [contentId, fileId] of contentFiles) {
        await db.execute('INSERT INTO content_files (content_id, file_id) VALUES (?, ?)', [contentId, fileId]);
    }
    
    // Insert settings
    const settings = [
        ['max_file_size', '100', 'Maximum file size in MB'],
        ['allowed_types', 'pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png,mp4,mp3', 'Allowed file types for upload'],
        ['admin_email', 'admin@steamlms.com', 'Administrator email address'],
        ['site_name', 'STEAM LMS', 'Learning Management System name'],
        ['site_description', 'Science, Technology, Engineering, Arts, and Mathematics Learning Platform', 'Site description']
    ];
    
    for (const [key, value, description] of settings) {
        await db.execute('INSERT INTO settings (setting_key, setting_value, description) VALUES (?, ?, ?)', [key, value, description]);
    }
    
    console.log('Database populated successfully');
}

// API Routes
app.get('/api/grades', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM grades ORDER BY age_range');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/subcategories', async (req, res) => {
    try {
        const categoryId = req.query.category_id;
        let query = 'SELECT * FROM subcategories';
        let params = [];
        
        if (categoryId) {
            query += ' WHERE category_id = ?';
            params = [categoryId];
        }
        
        query += ' ORDER BY name';
        
        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/content', async (req, res) => {
    try {
        const gradeId = req.query.grade_id;
        const categoryId = req.query.category_id;
        
        let query = `
            SELECT c.*, g.name as grade_name, cat.name as category_name 
            FROM content c 
            JOIN grades g ON c.grade_id = g.id 
            JOIN categories cat ON c.category_id = cat.id
        `;
        let params = [];
        
        const conditions = [];
        if (gradeId) {
            conditions.push('c.grade_id = ?');
            params.push(gradeId);
        }
        if (categoryId) {
            conditions.push('c.category_id = ?');
            params.push(categoryId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY c.created_at DESC';
        
        const [rows] = await db.execute(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/content', async (req, res) => {
    try {
        const { title, description, grade_id, category_id, type, content_text, subcategories, files } = req.body;
        
        const id = 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        await db.execute(
            'INSERT INTO content (id, title, description, grade_id, category_id, type, content_text) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, description, grade_id, category_id, type, content_text]
        );
        
        // Add subcategory relationships
        if (subcategories && subcategories.length > 0) {
            for (const subcategoryId of subcategories) {
                await db.execute('INSERT INTO content_subcategories (content_id, subcategory_id) VALUES (?, ?)', [id, subcategoryId]);
            }
        }
        
        // Add file relationships
        if (files && files.length > 0) {
            for (const fileId of files) {
                await db.execute('INSERT INTO content_files (content_id, file_id) VALUES (?, ?)', [id, fileId]);
            }
        }
        
        res.json({ success: true, data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM files ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/files', async (req, res) => {
    try {
        const { name, type, size, data, mime_type } = req.body;
        
        const id = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        await db.execute(
            'INSERT INTO files (id, name, type, size, data, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, type, size, data, mime_type]
        );
        
        res.json({ success: true, data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'MySQL API is running' });
});

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`STEAM LMS MySQL API server running on port ${PORT}`);
        console.log(`Database: ${dbConfig.database}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
