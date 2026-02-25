# STEAM Portal - Database Setup & Deployment Guide

## Quick Setup (5 minutes)

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB (XAMPP, WAMP, or standalone)
- Git (optional, for cloning)

### 1. Database Setup
```bash
# Start your MySQL service (XAMPP/WAMP)
# Create database named: steam_db
# Or let the setup script create it automatically
```

### 2. Project Setup
```bash
# Clone or extract the project
cd steam_portal

# Install dependencies
npm install

# Setup database automatically
npm run setup-db

# Start the server
npm start
```

### 3. Access the Application
- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

## Detailed Setup Instructions

### Step 1: Install XAMPP/WAMP (if not installed)
1. Download XAMPP from https://www.apachefriends.org/
2. Install and start Apache & MySQL services
3. Access phpMyAdmin at http://localhost/phpmyadmin

### Step 2: Create Database
**Option A: Automatic (Recommended)**
- The setup script will create the database automatically

**Option B: Manual**
1. Open phpMyAdmin
2. Click "New" in left sidebar
3. Enter database name: `steam_db`
4. Click "Create"

### Step 3: Configure Environment
1. Copy `.env.example` to `.env`
2. Update database credentials if needed:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=steam_db
PORT=3000
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Initialize Database
```bash
npm run setup-db
```
This will:
- Create all required tables
- Insert sample data (grades, categories)
- Set up proper relationships

### Step 6: Start Server
```bash
npm start
```

## Deployment on Another Machine

### Method 1: One-Command Setup
```bash
git clone <repository-url>
cd steam_portal
npm run init-project
```

### Method 2: Step-by-Step
1. **Copy project files** to new machine
2. **Install Node.js** if not present
3. **Install XAMPP/WAMP** and start MySQL
4. **Configure database** in `.env` file
5. **Run setup commands**:
```bash
npm install
npm run setup-db
npm start
```

## Database Configuration Options

### Default XAMPP Settings
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=steam_db
```

### Custom MySQL Settings
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=steam_db
```

### Production Environment
```env
DB_HOST=your_database_host
DB_USER=production_user
DB_PASSWORD=secure_password
DB_NAME=steam_db
NODE_ENV=production
```

## File Structure After Setup
```
steam_portal/
├── server.js              # Main application server
├── setup-database.js      # Database initialization script
├── setup-database.sql     # SQL setup script
├── package.json           # Dependencies and scripts
├── .env                   # Environment configuration
├── .env.example           # Environment template
├── uploads/               # File upload directory (auto-created)
└── public/                # Frontend files
    ├── admin.html         # Admin interface
    ├── index.html         # Main interface
    └── assets/            # CSS, JS, images
```

## Database Tables Created
- `grades` - Educational grade levels
- `categories` - Content categories (Math, Science, etc.)
- `content` - Educational content/lessons
- `files` - Uploaded file metadata
- `file_categories` - File organization categories

## Common Issues & Solutions

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**: Update DB_USER and DB_PASSWORD in `.env` to match your MySQL credentials.

### Issue: "Database doesn't exist"
**Solution**: Run `npm run setup-db` to create and populate the database.

### Issue: "Port 3000 already in use"
**Solution**: Change PORT in `.env` file or stop the conflicting service.

### Issue: "MySQL service not running"
**Solution**: Start MySQL from XAMPP control panel or services.

## API Endpoints
- `GET /api/health` - Server health check
- `GET /api/grades` - Get all grades
- `GET /api/categories` - Get all categories
- `GET /api/content` - Get all content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content
- `GET /api/files` - Get all files
- `POST /api/upload/enhanced` - Upload files

## Support
If you encounter any issues:
1. Check that MySQL is running
2. Verify database credentials in `.env`
3. Ensure all dependencies are installed
4. Run `npm run setup-db` to reinitialize database

## Security Notes for Production
1. Change default database credentials
2. Set strong passwords in environment variables
3. Enable HTTPS in production
4. Regularly backup the database
5. Monitor file upload sizes and types
