# STEAM Portal - Educational Learning Management System

A comprehensive STEAM (Science, Technology, Engineering, Arts, Mathematics) educational platform built with Node.js, Express, and MySQL. Features a modern admin panel for content management, user administration, and analytics.

## 🚀 Features

### Core Functionality
- **Database-Driven**: MySQL backend with robust data management
- **Admin Panel**: Complete administrative interface
- **Content Management**: Create, edit, and organize educational content
- **File Management**: Upload and manage educational resources
- **User Authentication**: Secure admin login system
- **Responsive Design**: Works on all devices

### Admin Features
- **Dashboard**: Overview with statistics and analytics
- **Content Management**: Create and manage educational content
- **Categories Management**: Organize content by subject areas
- **File Upload**: Bulk file upload with metadata management
- **Grade Levels**: Content organization by educational levels
- **Analytics**: Track content usage and engagement

### Technical Features
- **RESTful API**: Clean API endpoints for all operations
- **Database Integration**: Full MySQL integration with migrations
- **File Storage**: Secure file upload and management
- **Environment Configuration**: Flexible deployment setup
- **Security**: Content Security Policy and secure authentication

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database management
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icon library
- **Chart.js** - Data visualization
- **Custom CSS** - Modern styling

### Development Tools
- **NPM** - Package management
- **Git** - Version control

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB (XAMPP, WAMP, or standalone)
- Git (for cloning)

## 🚀 Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/excellent-softDev/steam_portal.git
cd steam_portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
npm run setup-db
```

### 4. Start the Application
```bash
npm start
```

### 5. Access the Application
- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/auth-login

**Default Admin Credentials:**
- Email: admin@steamlms.com
- Password: admin123

## 📁 Project Structure

```
steam_portal/
├── server.js                 # Main application server
├── setup-database.js         # Database initialization
├── setup-database.sql        # SQL schema
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── README-SETUP.md           # Detailed setup guide
├── public/                   # Frontend files
│   ├── admin-dashboard.html
│   ├── admin-content-management.html
│   ├── admin-categories-management.html
│   ├── auth-login.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   └── vendors/
└── uploads/                  # File upload directory
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=steam_db

# Server Configuration
PORT=3000
```

### Database Setup
The application automatically creates the database and tables on first run. Manual setup:

```bash
# Create database manually
mysql -u root -p
CREATE DATABASE steam_db;

# Run setup script
npm run setup-db
```

## 📚 API Endpoints

### Content Management
- `GET /api/content` - Get all content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Categories & Grades
- `GET /api/categories` - Get all categories
- `GET /api/grades` - Get all grade levels

### File Management
- `GET /api/files` - Get all files
- `POST /api/upload/enhanced` - Upload files
- `GET /uploads/:filename` - Download files

### System
- `GET /api/health` - Health check

## 🎯 Database Schema

### Tables
- **grades** - Educational grade levels
- **categories** - Subject categories (Math, Science, etc.)
- **content** - Educational content and lessons
- **files** - Uploaded file metadata
- **file_categories** - File organization categories

## 🔐 Security

- **Authentication**: Secure admin login system
- **File Upload**: Sanitized file handling
- **Database**: Parameterized queries
- **CORS**: Configured cross-origin policies
- **Environment**: Secure configuration management

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Set production environment
NODE_ENV=production

# Start server
npm start
```

### One-Command Setup
```bash
npm run init-project
```

## 📊 Features in Detail

### Admin Dashboard
- Real-time statistics
- Content overview
- Recent activity tracking
- Interactive charts
- Quick action buttons

### Content Management
- Rich content editor
- Category assignment
- Grade level targeting
- File attachments
- Draft/published states

### File Management
- Bulk upload support
- File metadata management
- Category organization
- Public/private access control
- Download tracking

### Categories Management
- Dynamic category creation
- Color coding
- Icon assignment
- Content organization
- Analytics integration

## 🔄 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run setup-db` - Initialize database
- `npm run init-project` - Complete project setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the [Setup Guide](README-SETUP.md)
2. Review the database configuration
3. Verify environment variables
4. Check server logs for errors

## 🌟 Acknowledgments

- Built with modern web technologies
- Inspired by educational platforms
- Designed for STEAM education
- Optimized for ease of use

---

**STEAM Portal** - Empowering education through technology 🚀
