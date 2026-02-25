const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'steam_db'
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Setting up STEAM Portal database...');
    
    // First connect without database name to create it
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);
    
    // Close connection and reconnect to the specific database
    await connection.end();
    
    // Connect to the specific database
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to '${dbConfig.database}' database`);
    
    // Create tables directly with individual statements
    console.log('🔄 Creating tables...');
    
    // Create grades table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age_range VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created grades table');
    
    // Create categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created categories table');
    
    // Create subcategories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id VARCHAR(20) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created subcategories table');
    
    // Create content table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS content (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        grade_id VARCHAR(20),
        category_id VARCHAR(20),
        type VARCHAR(50) DEFAULT 'lesson',
        content_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created content table');
    
    // Create files table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100),
        size INT,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100),
        category_id VARCHAR(20),
        is_public BOOLEAN DEFAULT FALSE,
        download_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created files table');
    
    // Create file_categories table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_categories (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created file_categories table');
    
    // Insert sample data
    console.log('🔄 Inserting sample data...');
    
    // Insert grades
    const grades = [
      ['kindergarten', 'Kindergarten', 'Ages 4-6'],
      ['grade1', 'Grade 1', 'Ages 6-7'],
      ['grade2', 'Grade 2', 'Ages 7-8'],
      ['grade3', 'Grade 3', 'Ages 8-9'],
      ['grade4', 'Grade 4', 'Ages 9-10'],
      ['grade5', 'Grade 5', 'Ages 10-11']
    ];

    for (const [id, name, age] of grades) {
      try {
        await connection.execute('INSERT IGNORE INTO grades (id, name, age_range) VALUES (?, ?, ?)', [id, name, age]);
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log('✅ Inserted grades data');
    
    // Insert categories
    const categories = [
      ['math', 'Mathematics', 'fa-calculator', '#3498db'],
      ['science', 'Science', 'fa-flask', '#27ae60'],
      ['arts', 'Arts', 'fa-palette', '#e74c3c'],
      ['technology', 'Technology', 'fa-laptop', '#9b59b6'],
      ['engineering', 'Engineering', 'fa-cogs', '#95a5a6']
    ];

    for (const [id, name, icon, color] of categories) {
      try {
        await connection.execute('INSERT IGNORE INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)', [id, name, icon, color]);
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log('✅ Inserted categories data');
    
    // Insert sample subcategories
    const subcategories = [
      ['algebra', 'Algebra', 'math'],
      ['geometry', 'Geometry', 'math'],
      ['calculus', 'Calculus', 'math'],
      ['physics', 'Physics', 'science'],
      ['chemistry', 'Chemistry', 'science'],
      ['biology', 'Biology', 'science'],
      ['painting', 'Painting', 'arts'],
      ['music', 'Music', 'arts'],
      ['sculpture', 'Sculpture', 'arts'],
      ['programming', 'Programming', 'technology'],
      ['web-dev', 'Web Development', 'technology'],
      ['robotics', 'Robotics', 'technology'],
      ['mechanical', 'Mechanical Engineering', 'engineering'],
      ['civil', 'Civil Engineering', 'engineering'],
      ['electrical', 'Electrical Engineering', 'engineering']
    ];

    for (const [id, name, categoryId] of subcategories) {
      try {
        await connection.execute('INSERT IGNORE INTO subcategories (id, name, category_id) VALUES (?, ?, ?)', [id, name, categoryId]);
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log('✅ Inserted subcategories data');
    
    // Insert file categories
    const fileCategories = [
      ['video', 'Videos', 'fa-video', '#e74c3c'],
      ['exercise', 'Exercises', 'fa-pencil-alt', '#3498db'],
      ['memo', 'Memos', 'fa-key', '#27ae60'],
      ['document', 'Documents', 'fa-file-pdf', '#9b59b6'],
      ['general', 'General', 'fa-folder', '#95a5a6']
    ];

    for (const [id, name, icon, color] of fileCategories) {
      try {
        await connection.execute('INSERT IGNORE INTO file_categories (id, name, icon, color) VALUES (?, ?, ?, ?)', [id, name, icon, color]);
      } catch (e) {
        // Ignore duplicate errors
      }
    }
    console.log('✅ Inserted file categories data');
    
    console.log('✅ Database setup completed successfully!');
    
    // Verify setup by checking tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Created tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    // Check sample data
    const [gradesCount] = await connection.execute('SELECT COUNT(*) as count FROM grades');
    const [categoriesCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [fileCategoriesCount] = await connection.execute('SELECT COUNT(*) as count FROM file_categories');
    
    console.log(`📊 Sample data inserted:`);
    console.log(`   - Grades: ${gradesCount[0].count} records`);
    console.log(`   - Categories: ${categoriesCount[0].count} records`);
    console.log(`   - File Categories: ${fileCategoriesCount[0].count} records`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
