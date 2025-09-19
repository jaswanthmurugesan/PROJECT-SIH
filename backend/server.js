const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import services
const ScrapingScheduler = require('./services/scrapingScheduler');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for correct IP addresses
app.set('trust proxy', 1);

// Connect to MongoDB with modern Mongoose v6+ configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator';

mongoose.connect(mongoUri, {
  // Connection timeout settings for production reliability
  serverSelectionTimeoutMS: 30000, // 30 seconds to select server
  connectTimeoutMS: 10000,         // 10 seconds to establish connection
  socketTimeoutMS: 45000,          // 45 seconds for socket operations
  bufferMaxEntries: 0,             // Disable mongoose buffering (fixed casing)
  maxPoolSize: 10,                 // Maximum number of connections
  minPoolSize: 2,                  // Minimum number of connections
  maxIdleTimeMS: 30000,           // Close connections after 30 seconds of inactivity
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  console.log(`📈 Ready state: ${mongoose.connection.readyState}`);
  
  // Initialize scraping scheduler after database connection
  global.scrapingScheduler = new ScrapingScheduler();
  global.scrapingScheduler.startScheduledScraping();
  global.scrapingScheduler.startDailyAnalysis();
  console.log('🕐 NCS Scraping Scheduler initialized');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Check if MongoDB is running and URI is correct:', mongoUri);
  process.exit(1);
});

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

// Routes
app.use('/api/learners', require('./routes/learnerRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRecommendations'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const scrapingStatus = global.scrapingScheduler ? global.scrapingScheduler.getStatus() : null;
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      scraping: scrapingStatus ? {
        isRunning: scrapingStatus.isRunning,
        lastRun: scrapingStatus.lastRunTime,
        nextRun: scrapingStatus.nextRunTime,
        totalRuns: scrapingStatus.totalRuns
      } : 'not initialized'
    }
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'AI-Powered Learning Path Generator API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});