# SteamLMS Dashboard System

A comprehensive dashboard system for SteamLMS with real-time analytics, built with separation of concerns using MongoDB for data storage.

## Features

### Admin Dashboard
- **Real-time Analytics**: Live user activity, system usage, and content performance metrics
- **User Engagement Tracking**: Monitor user login patterns, page views, and learning progress
- **Content Performance**: Track content engagement, completion rates, and popularity
- **System Usage**: Monitor server load, peak usage times, and event distribution
- **Interactive Charts**: Beautiful, responsive charts using Chart.js
- **Real-time Updates**: WebSocket-powered live data updates

### Student Dashboard
- **Personal Learning Overview**: Track individual progress and achievements
- **Course Progress**: Monitor completion status for enrolled courses
- **Learning Path**: Visual progression through curriculum
- **Achievement System**: Gamification with badges and rewards
- **Activity History**: Detailed log of learning activities
- **Real-time Feedback**: Instant updates on progress and achievements

## Architecture

### Separation of Concerns

```
├── config/
│   └── database.js          # MongoDB connection management
├── models/                  # Data models and schemas
│   ├── User.js
│   ├── Analytics.js
│   ├── DashboardMetric.js
│   └── ContentEngagement.js
├── services/                # Business logic layer
│   ├── dashboardService.js  # Dashboard data aggregation
│   └── realTimeService.js   # Real-time updates and data generation
├── routes/                  # API route handlers
│   ├── dashboard.js         # Dashboard endpoints
│   └── analytics.js         # Analytics tracking endpoints
└── public/                  # Frontend assets
    ├── admin-dashboard.html
    ├── student-dashboard.html
    └── assets/js/
        ├── dashboard.js
        └── student-dashboard.js
```

### Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for WebSocket connections
- **Frontend**: Bootstrap 5, Chart.js, Vanilla JavaScript
- **Analytics**: Custom event tracking system

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SteamLMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/steamlms_dashboard
   
   # Server Configuration
   DASHBOARD_PORT=3002
   FRONTEND_URL=http://localhost:3000
   
   # Optional: If using existing MySQL system
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=steamlms
   ```

4. **Start MongoDB**
   
   If running locally:
   ```bash
   # For MongoDB installed locally
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

5. **Start the Dashboard Server**
   ```bash
   npm run dashboard
   ```

6. **Access the Dashboards**
   
   - Admin Dashboard: http://localhost:3002/admin-dashboard.html
   - Student Dashboard: http://localhost:3002/student-dashboard.html

## API Endpoints

### Dashboard API

#### Overview Metrics
```http
GET /api/dashboard/overview?timeRange=7d
```

#### User Engagement
```http
GET /api/dashboard/user-engagement?timeRange=7d
```

#### Content Performance
```http
GET /api/dashboard/content-performance?timeRange=7d
```

#### System Usage
```http
GET /api/dashboard/system-usage?timeRange=7d
```

### Analytics API

#### Track Event
```http
POST /api/analytics/track
Content-Type: application/json

{
  "userId": "user123",
  "eventType": "page_view",
  "metadata": {
    "page": "/dashboard",
    "duration": 45
  },
  "sessionId": "session_abc123"
}
```

#### Get User Analytics
```http
GET /api/analytics/user/user123?limit=100
```

#### Get All Events
```http
GET /api/analytics/events?eventType=login&startDate=2024-01-01&endDate=2024-01-31
```

## Real-time Features

### WebSocket Events

The dashboard system uses Socket.io for real-time updates:

#### Client-side
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3002');

// Subscribe to dashboard updates
socket.emit('subscribe-dashboard', { dashboardType: 'admin' });

// Listen for updates
socket.on('dashboard-update', (data) => {
    console.log('Received update:', data);
});
```

#### Server-side Events
- `dashboard-update`: Broadcast when metrics are updated
- `user_activity`: Real-time user activity notifications

### Data Generation

The system includes a sample data generator that creates realistic analytics events every 10 seconds for demonstration purposes. This can be disabled in production by modifying the `realTimeService.js`.

## Data Models

### User Schema
```javascript
{
    userId: String,
    email: String,
    firstName: String,
    lastName: String,
    role: ['student', 'teacher', 'admin'],
    grade: String,
    isActive: Boolean,
    lastLogin: Date
}
```

### Analytics Schema
```javascript
{
    userId: String,
    eventType: ['login', 'logout', 'page_view', 'content_access', 'assignment_complete', 'quiz_attempt', 'download'],
    metadata: {
        page: String,
        contentId: String,
        contentType: String,
        duration: Number,
        score: Number
    },
    timestamp: Date,
    sessionId: String
}
```

### DashboardMetric Schema
```javascript
{
    name: String,
    category: ['user_engagement', 'content_performance', 'system_usage', 'learning_progress'],
    value: Mixed,
    unit: String,
    target: Mixed,
    trend: {
        direction: ['up', 'down', 'stable'],
        percentage: Number
    }
}
```

## Development

### Running in Development Mode
```bash
# Start dashboard server with auto-reload
npm run dashboard:dev

# Start only the main LMS server
npm start
```

### Adding New Metrics

1. **Update the Service Layer** (`services/dashboardService.js`)
2. **Add API Endpoint** (`routes/dashboard.js`)
3. **Update Frontend** (`public/assets/js/dashboard.js`)

### Custom Analytics Events

Track custom events by calling the analytics API:
```javascript
await fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        userId: 'user123',
        eventType: 'custom_event',
        metadata: { customData: 'value' }
    })
});
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db/steamlms_dashboard
DASHBOARD_PORT=3002
FRONTEND_URL=https://your-domain.com
```

### Security Considerations
- Enable authentication for dashboard access
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate all input data
- Use environment variables for sensitive configuration

## Monitoring and Maintenance

### Health Check
```http
GET /api/health
```

### Database Monitoring
- Monitor MongoDB connection pool
- Track query performance
- Set up alerts for high error rates

### Performance Optimization
- Use MongoDB indexes for frequently queried fields
- Implement caching for dashboard metrics
- Optimize WebSocket connections

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure MongoDB is accessible from the server

2. **Dashboard Not Loading**
   - Check if dashboard server is running on port 3002
   - Verify CORS settings
   - Check browser console for errors

3. **Real-time Updates Not Working**
   - Ensure WebSocket connection is established
   - Check if client is subscribed to correct dashboard type
   - Verify Socket.io server is running

### Logs
The dashboard server provides detailed logs for:
- Database connections
- API requests
- Real-time updates
- Sample data generation

## Contributing

1. Follow the existing code structure and separation of concerns
2. Add tests for new features
3. Update documentation for API changes
4. Use meaningful commit messages

## License

This project is licensed under the ISC License.
