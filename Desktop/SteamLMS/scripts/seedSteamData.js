const mysql = require('mysql2/promise');
require('dotenv').config();

class SteamDataSeeder {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'steamlms',
            charset: 'utf8mb4',
            connectionLimit: 10
        };
        this.db = null;
    }

    async connect() {
        try {
            this.db = await mysql.createConnection(this.dbConfig);
            console.log('✅ Connected to MySQL database');
        } catch (error) {
            console.error('❌ MySQL connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.db) {
            await this.db.end();
            console.log('✅ MySQL connection closed');
        }
    }

    async seedAllData() {
        try {
            await this.connect();
            
            console.log('🌱 Starting STEAM LMS data seeding...');
            
            await this.seedCategories();
            await this.seedSubcategories();
            await this.seedContent();
            await this.seedContentFiles();
            
            console.log('✅ STEAM LMS data seeding completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during data seeding:', error.message);
            throw error;
        } finally {
            await this.disconnect();
        }
    }

    async seedCategories() {
        console.log('📁 Seeding STEAM categories...');
        
        const steamCategories = [
            {
                id: 'science',
                name: 'Science',
                description: 'Scientific inquiry, exploration, and understanding the natural world',
                icon: 'fa-flask',
                color: '#27ae60'
            },
            {
                id: 'technology',
                name: 'Technology',
                description: 'Digital literacy, computational thinking, and technological tools',
                icon: 'fa-laptop',
                color: '#3498db'
            },
            {
                id: 'engineering',
                name: 'Engineering',
                description: 'Design thinking, problem-solving, and creating solutions',
                icon: 'fa-cogs',
                color: '#e67e22'
            },
            {
                id: 'arts',
                name: 'Arts',
                description: 'Creative expression, design, and artistic development',
                icon: 'fa-palette',
                color: '#e74c3c'
            },
            {
                id: 'mathematics',
                name: 'Mathematics',
                description: 'Mathematical concepts, problem-solving, and numerical literacy',
                icon: 'fa-calculator',
                color: '#9b59b6'
            }
        ];

        for (const category of steamCategories) {
            await this.db.execute(
                'INSERT IGNORE INTO categories (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)',
                [category.id, category.name, category.description, category.icon, category.color]
            );
        }

        console.log(`✅ Seeded ${steamCategories.length} STEAM categories`);
    }

    async seedSubcategories() {
        console.log('📂 Seeding STEAM subcategories...');
        
        const subcategories = [
            // Science Subcategories
            { id: 'biology', name: 'Biology', category_id: 'science', description: 'Life sciences and living organisms' },
            { id: 'chemistry', name: 'Chemistry', category_id: 'science', description: 'Matter, atoms, and chemical reactions' },
            { id: 'physics', name: 'Physics', category_id: 'science', description: 'Energy, motion, and physical laws' },
            { id: 'earth_science', name: 'Earth Science', category_id: 'science', description: 'Geology, weather, and environmental science' },
            { id: 'astronomy', name: 'Astronomy', category_id: 'science', description: 'Space, planets, and celestial bodies' },
            
            // Technology Subcategories
            { id: 'coding', name: 'Coding & Programming', category_id: 'technology', description: 'Computer programming and software development' },
            { id: 'digital_literacy', name: 'Digital Literacy', category_id: 'technology', description: 'Basic computer skills and internet safety' },
            { id: 'robotics', name: 'Robotics', category_id: 'technology', description: 'Building and programming robots' },
            { id: 'web_development', name: 'Web Development', category_id: 'technology', description: 'Creating websites and web applications' },
            { id: 'data_science', name: 'Data Science', category_id: 'technology', description: 'Data analysis and visualization' },
            
            // Engineering Subcategories
            { id: 'mechanical', name: 'Mechanical Engineering', category_id: 'engineering', description: 'Machines, mechanics, and physical systems' },
            { id: 'civil', name: 'Civil Engineering', category_id: 'engineering', description: 'Structures, buildings, and infrastructure' },
            { id: 'electrical', name: 'Electrical Engineering', category_id: 'engineering', description: 'Circuits, electronics, and power systems' },
            { id: 'aerospace', name: 'Aerospace Engineering', category_id: 'engineering', description: 'Aircraft, spacecraft, and flight' },
            { id: 'biomedical', name: 'Biomedical Engineering', category_id: 'engineering', description: 'Medical devices and biological systems' },
            
            // Arts Subcategories
            { id: 'visual_arts', name: 'Visual Arts', category_id: 'arts', description: 'Drawing, painting, and visual design' },
            { id: 'music', name: 'Music', category_id: 'arts', description: 'Music theory, composition, and performance' },
            { id: 'drama', name: 'Drama & Theater', category_id: 'arts', description: 'Acting, playwriting, and performance' },
            { id: 'digital_arts', name: 'Digital Arts', category_id: 'arts', description: 'Digital design, animation, and multimedia' },
            { id: 'creative_writing', name: 'Creative Writing', category_id: 'arts', description: 'Storytelling, poetry, and literature' },
            
            // Mathematics Subcategories
            { id: 'arithmetic', name: 'Arithmetic', category_id: 'mathematics', description: 'Basic operations and number theory' },
            { id: 'algebra', name: 'Algebra', category_id: 'mathematics', description: 'Variables, equations, and functions' },
            { id: 'geometry', name: 'Geometry', category_id: 'mathematics', description: 'Shapes, space, and spatial reasoning' },
            { id: 'statistics', name: 'Statistics', category_id: 'mathematics', description: 'Data collection, analysis, and probability' },
            { id: 'calculus', name: 'Calculus', category_id: 'mathematics', description: 'Rates of change and mathematical analysis' }
        ];

        for (const subcategory of subcategories) {
            await this.db.execute(
                'INSERT IGNORE INTO subcategories (id, name, category_id, description) VALUES (?, ?, ?, ?)',
                [subcategory.id, subcategory.name, subcategory.category_id, subcategory.description]
            );
        }

        console.log(`✅ Seeded ${subcategories.length} STEAM subcategories`);
    }

    async seedContent() {
        console.log('📚 Seeding STEAM content...');
        
        const contentItems = [
            // Science Content
            {
                id: 'sci_bio_cells_101',
                title: 'Introduction to Cells',
                description: 'Learn about the basic building blocks of life',
                grade_id: 'grade5',
                category_id: 'science',
                subcategory_id: 'biology',
                content_type: 'lesson',
                content: this.generateLessonContent('cells', 'biology'),
                difficulty: 'beginner'
            },
            {
                id: 'sci_chem_atoms_201',
                title: 'Atoms and Molecules',
                description: 'Understanding the structure of matter',
                grade_id: 'grade7',
                category_id: 'science',
                subcategory_id: 'chemistry',
                content_type: 'lesson',
                content: this.generateLessonContent('atoms', 'chemistry'),
                difficulty: 'intermediate'
            },
            {
                id: 'sci_phys_forces_301',
                title: 'Forces and Motion',
                description: 'Explore the fundamental principles of physics',
                grade_id: 'grade9',
                category_id: 'science',
                subcategory_id: 'physics',
                content_type: 'lesson',
                content: this.generateLessonContent('forces', 'physics'),
                difficulty: 'intermediate'
            },
            
            // Technology Content
            {
                id: 'tech_code_basics_101',
                title: 'Introduction to Coding',
                description: 'Learn the fundamentals of programming',
                grade_id: 'grade6',
                category_id: 'technology',
                subcategory_id: 'coding',
                content_type: 'lesson',
                content: this.generateLessonContent('coding', 'technology'),
                difficulty: 'beginner'
            },
            {
                id: 'tech_web_html_201',
                title: 'HTML and Web Basics',
                description: 'Create your first web page',
                grade_id: 'grade8',
                category_id: 'technology',
                subcategory_id: 'web_development',
                content_type: 'lesson',
                content: this.generateLessonContent('html', 'web_development'),
                difficulty: 'beginner'
            },
            {
                id: 'tech_robot_intro_301',
                title: 'Introduction to Robotics',
                description: 'Build and program simple robots',
                grade_id: 'grade10',
                category_id: 'technology',
                subcategory_id: 'robotics',
                content_type: 'lesson',
                content: this.generateLessonContent('robotics', 'technology'),
                difficulty: 'intermediate'
            },
            
            // Engineering Content
            {
                id: 'eng_simple_machines_101',
                title: 'Simple Machines',
                description: 'Learn about levers, pulleys, and other basic machines',
                grade_id: 'grade4',
                category_id: 'engineering',
                subcategory_id: 'mechanical',
                content_type: 'lesson',
                content: this.generateLessonContent('machines', 'engineering'),
                difficulty: 'beginner'
            },
            {
                id: 'eng_bridge_design_201',
                title: 'Bridge Design Principles',
                description: 'Understanding structural engineering basics',
                grade_id: 'grade7',
                category_id: 'engineering',
                subcategory_id: 'civil',
                content_type: 'lesson',
                content: this.generateLessonContent('bridges', 'engineering'),
                difficulty: 'intermediate'
            },
            {
                id: 'eng_circuits_301',
                title: 'Basic Circuits',
                description: 'Introduction to electrical circuits',
                grade_id: 'grade8',
                category_id: 'engineering',
                subcategory_id: 'electrical',
                content_type: 'lesson',
                content: this.generateLessonContent('circuits', 'engineering'),
                difficulty: 'intermediate'
            },
            
            // Arts Content
            {
                id: 'arts_drawing_basics_101',
                title: 'Drawing Fundamentals',
                description: 'Learn basic drawing techniques',
                grade_id: 'grade3',
                category_id: 'arts',
                subcategory_id: 'visual_arts',
                content_type: 'lesson',
                content: this.generateLessonContent('drawing', 'arts'),
                difficulty: 'beginner'
            },
            {
                id: 'arts_music_theory_201',
                title: 'Music Theory Basics',
                description: 'Understanding musical notation and theory',
                grade_id: 'grade6',
                category_id: 'arts',
                subcategory_id: 'music',
                content_type: 'lesson',
                content: this.generateLessonContent('music', 'arts'),
                difficulty: 'beginner'
            },
            {
                id: 'arts_digital_design_301',
                title: 'Digital Design Principles',
                description: 'Creating digital art and graphics',
                grade_id: 'grade9',
                category_id: 'arts',
                subcategory_id: 'digital_arts',
                content_type: 'lesson',
                content: this.generateLessonContent('digital_design', 'arts'),
                difficulty: 'intermediate'
            },
            
            // Mathematics Content
            {
                id: 'math_fractions_101',
                title: 'Understanding Fractions',
                description: 'Learn to work with fractions and decimals',
                grade_id: 'grade4',
                category_id: 'mathematics',
                subcategory_id: 'arithmetic',
                content_type: 'lesson',
                content: this.generateLessonContent('fractions', 'mathematics'),
                difficulty: 'beginner'
            },
            {
                id: 'math_algebra_basics_201',
                title: 'Introduction to Algebra',
                description: 'Variables and basic equations',
                grade_id: 'grade7',
                category_id: 'mathematics',
                subcategory_id: 'algebra',
                content_type: 'lesson',
                content: this.generateLessonContent('algebra', 'mathematics'),
                difficulty: 'intermediate'
            },
            {
                id: 'math_geometry_shapes_301',
                title: 'Geometry and Shapes',
                description: 'Properties of geometric shapes and figures',
                grade_id: 'grade8',
                category_id: 'mathematics',
                subcategory_id: 'geometry',
                content_type: 'lesson',
                content: this.generateLessonContent('geometry', 'mathematics'),
                difficulty: 'intermediate'
            }
        ];

        for (const content of contentItems) {
            await this.db.execute(
                'INSERT IGNORE INTO content (id, title, description, grade_id, category_id, subcategory_id, content_type, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [content.id, content.title, content.description, content.grade_id, content.category_id, content.subcategory_id, content.content_type, content.content]
            );
        }

        console.log(`✅ Seeded ${contentItems.length} STEAM content items`);
    }

    async seedContentFiles() {
        console.log('📁 Seeding content files...');
        
        const contentFiles = [
            // Science Files
            { id: 'file_cell_diagram', name: 'Cell Diagram.pdf', size: '2.5 MB', type: 'application/pdf', content_id: 'sci_bio_cells_101' },
            { id: 'file_chemistry_lab', name: 'Chemistry Lab Safety.docx', size: '1.2 MB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', content_id: 'sci_chem_atoms_201' },
            
            // Technology Files
            { id: 'file_code_examples', name: 'Code Examples.zip', size: '450 KB', type: 'application/zip', content_id: 'tech_code_basics_101' },
            { id: 'file_html_template', name: 'HTML Template.html', size: '25 KB', type: 'text/html', content_id: 'tech_web_html_201' },
            
            // Engineering Files
            { id: 'file_bridge_blueprint', name: 'Bridge Blueprint.pdf', size: '3.8 MB', type: 'application/pdf', content_id: 'eng_bridge_design_201' },
            { id: 'file_circuit_diagram', name: 'Circuit Diagram.png', size: '850 KB', type: 'image/png', content_id: 'eng_circuits_301' },
            
            // Arts Files
            { id: 'file_drawing_guide', name: 'Drawing Guide.pdf', size: '4.2 MB', type: 'application/pdf', content_id: 'arts_drawing_basics_101' },
            { id: 'file_music_sheets', name: 'Music Sheets.pdf', size: '1.8 MB', type: 'application/pdf', content_id: 'arts_music_theory_201' },
            
            // Mathematics Files
            { id: 'file_math_worksheet', name: 'Fraction Worksheet.pdf', size: '650 KB', type: 'application/pdf', content_id: 'math_fractions_101' },
            { id: 'file_geometry_formulas', name: 'Geometry Formulas.pdf', size: '890 KB', type: 'application/pdf', content_id: 'math_geometry_shapes_301' }
        ];

        for (const file of contentFiles) {
            await this.db.execute(
                'INSERT IGNORE INTO files (id, name, size, type, content_id) VALUES (?, ?, ?, ?, ?)',
                [file.id, file.name, file.size, file.type, file.content_id]
            );
        }

        console.log(`✅ Seeded ${contentFiles.length} content files`);
    }

    generateLessonContent(topic, category) {
        const templates = {
            cells: `
# Introduction to Cells

## What are Cells?
Cells are the basic building blocks of all living things. Every living organism is made up of one or more cells.

## Types of Cells
- **Plant Cells**: Have cell walls and chloroplasts
- **Animal Cells**: Do not have cell walls or chloroplasts
- **Bacterial Cells**: Simple cells without a nucleus

## Cell Parts (Organelles)
- **Nucleus**: The control center of the cell
- **Mitochondria**: Powerhouses of the cell
- **Cell Membrane**: Controls what enters and leaves the cell
- **Cytoplasm**: Jelly-like substance inside the cell

## Activity
Draw and label a plant cell and an animal cell. Compare their similarities and differences.
            `,
            
            coding: `
# Introduction to Coding

## What is Coding?
Coding is how we communicate with computers to tell them what to do.

## Basic Concepts
- **Algorithm**: A set of step-by-step instructions
- **Variable**: A container for storing data
- **Loop**: Repeating a set of instructions
- **Condition**: Making decisions in code

## Your First Program
\`\`\`python
print("Hello, World!")
name = "Your Name"
print("Welcome, " + name)
\`\`\`

## Activity
Write a simple program that asks for your name and prints a personalized greeting.
            `,
            
            machines: `
# Simple Machines

## What are Simple Machines?
Simple machines make work easier by changing the direction or magnitude of a force.

## Six Types of Simple Machines
1. **Lever**: A rigid bar that pivots around a fulcrum
2. **Pulley**: A wheel with a groove for a rope
3. **Inclined Plane**: A sloping surface
4. **Wheel and Axle**: A wheel attached to a rod
5. **Wedge**: Two inclined planes back to back
6. **Screw**: An inclined plane wrapped around a cylinder

## Examples in Daily Life
- **Levers**: Scissors, seesaws
- **Pulleys**: Flag poles, elevators
- **Inclined Planes**: Ramps, slides

## Activity
Find examples of simple machines in your home and school.
            `,
            
            fractions: `
# Understanding Fractions

## What is a Fraction?
A fraction represents a part of a whole. It has two parts:
- **Numerator**: The top number (how many parts we have)
- **Denominator**: The bottom number (total number of parts)

## Types of Fractions
- **Proper Fractions**: Numerator is smaller than denominator (3/4)
- **Improper Fractions**: Numerator is larger than denominator (7/4)
- **Mixed Numbers**: Whole number and fraction (1 3/4)

## Adding Fractions
To add fractions with the same denominator:
1. Add the numerators
2. Keep the denominator the same

Example: 1/4 + 2/4 = 3/4

## Activity
Use visual models to represent different fractions and practice adding them.
            `
        };

        return templates[topic] || `
# ${topic.charAt(0).toUpperCase() + topic.slice(1)} Lesson

## Introduction
This is an introduction to ${topic} in the field of ${category}.

## Learning Objectives
- Understand basic concepts
- Apply knowledge to practical problems
- Explore real-world applications

## Key Concepts
[Detailed content about ${topic}]

## Activities
1. Reading and comprehension
2. Hands-on practice
3. Assessment and reflection

## Summary
Review of key concepts and next steps.
        `;
    }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
    const seeder = new SteamDataSeeder();
    seeder.seedAllData().catch(console.error);
}

module.exports = SteamDataSeeder;
