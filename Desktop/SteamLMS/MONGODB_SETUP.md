# MongoDB Setup Guide

## Option 1: Install MongoDB locally
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Create data directory: `C:\data\db`
4. Start MongoDB: `mongod --dbpath "C:\data\db" --port 27017`

## Option 2: Use MongoDB Atlas (Cloud)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update .env file: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/steamlms_dashboard`

## Option 3: Use Docker
1. Install Docker Desktop
2. Run: `docker run -d -p 27017:27017 --name mongodb mongo`

## After MongoDB is running:
```bash
npm run seed:mongo    # Seed MongoDB data
npm run dashboard     # Start dashboard server
```

## Current Status:
✅ MySQL database: Ready with STEAM content
❌ MongoDB database: Not connected
📊 Dashboard: Can run but will show empty analytics

## Quick Start (MySQL only):
```bash
npm run dashboard
```
Then visit: http://localhost:3002/admin-dashboard.html
