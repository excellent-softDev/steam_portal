const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'steamlms',
        charset: 'utf8mb4',
        connectionLimit: 10
    };

    let db;
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL database');

        // Check if subcategory_id column exists in content table
        const [subcategoryColumn] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${dbConfig.database}' 
            AND TABLE_NAME = 'content' 
            AND COLUMN_NAME = 'subcategory_id'
        `);

        if (subcategoryColumn.length === 0) {
            console.log('🔧 Adding subcategory_id column to content table...');
            
            // Add the missing column
            await db.execute(`
                ALTER TABLE content 
                ADD COLUMN subcategory_id VARCHAR(50) AFTER category_id
            `);
            
            console.log('✅ Added subcategory_id column');
        } else {
            console.log('✅ subcategory_id column already exists');
        }

        // Check if content_type column exists
        const [contentTypeColumn] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${dbConfig.database}' 
            AND TABLE_NAME = 'content' 
            AND COLUMN_NAME = 'content_type'
        `);

        if (contentTypeColumn.length === 0) {
            console.log('🔧 Adding content_type column to content table...');
            
            await db.execute(`
                ALTER TABLE content 
                ADD COLUMN content_type VARCHAR(50) AFTER subcategory_id
            `);
            
            console.log('✅ Added content_type column');
        } else {
            console.log('✅ content_type column already exists');
        }

        // Check if content column exists
        const [contentColumn] = await db.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${dbConfig.database}' 
            AND TABLE_NAME = 'content' 
            AND COLUMN_NAME = 'content'
        `);

        if (contentColumn.length === 0) {
            console.log('🔧 Adding content column to content table...');
            
            await db.execute(`
                ALTER TABLE content 
                ADD COLUMN content LONGTEXT AFTER content_type
            `);
            
            console.log('✅ Added content column');
        } else {
            console.log('✅ content column already exists');
        }

        // Check if foreign key constraints exist
        const [constraints] = await db.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = '${dbConfig.database}' 
            AND TABLE_NAME = 'content' 
            AND CONSTRAINT_NAME != 'PRIMARY'
        `);

        if (constraints.length === 0) {
            console.log('🔧 Adding foreign key constraints...');
            
            // Add foreign key constraints
            await db.execute(`
                ALTER TABLE content 
                ADD CONSTRAINT fk_content_grade 
                FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL
            `);
            
            await db.execute(`
                ALTER TABLE content 
                ADD CONSTRAINT fk_content_category 
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            `);
            
            await db.execute(`
                ALTER TABLE content 
                ADD CONSTRAINT fk_content_subcategory 
                FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
            `);
            
            console.log('✅ Added foreign key constraints');
        } else {
            console.log('✅ Foreign key constraints already exist');
        }

        // Check if files table exists and has content_id column
        const [filesTable] = await db.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = '${dbConfig.database}' 
            AND TABLE_NAME = 'files'
        `);

        if (filesTable.length > 0) {
            const [contentIdColumn] = await db.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '${dbConfig.database}' 
                AND TABLE_NAME = 'files' 
                AND COLUMN_NAME = 'content_id'
            `);

            if (contentIdColumn.length === 0) {
                console.log('🔧 Adding content_id column to files table...');
                
                await db.execute(`
                    ALTER TABLE files 
                        ADD COLUMN content_id VARCHAR(50) AFTER type
                `);
                
                console.log('✅ Added content_id column to files table');
            } else {
                console.log('✅ content_id column already exists in files table');
            }
        } else {
            console.log('📁 Files table does not exist yet');
        }

        console.log('🎉 Database schema updated successfully!');

    } catch (error) {
        console.error('❌ Error fixing database:', error.message);
        throw error;
    } finally {
        if (db) {
            await db.end();
            console.log('✅ Database connection closed');
        }
    }
}

if (require.main === module) {
    fixDatabase().catch(console.error);
}

module.exports = fixDatabase;
