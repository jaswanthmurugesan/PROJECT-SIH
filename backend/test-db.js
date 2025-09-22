#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * 
 * This script tests your MongoDB connection independently of your main application.
 * Run this to verify your database connection is working before running the main app.
 * 
 * Usage: node test-db.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green + colors.bright, '✅', message);
}

function logError(message) {
  log(colors.red + colors.bright, '❌', message);
}

function logWarning(message) {
  log(colors.yellow + colors.bright, '⚠️ ', message);
}

function logInfo(message) {
  log(colors.blue + colors.bright, 'ℹ️ ', message);
}

function logStep(message) {
  log(colors.cyan + colors.bright, '🔍', message);
}

async function testDatabaseConnection() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 MONGODB CONNECTION TEST');
  console.log('='.repeat(60));

  // Get MongoDB URI
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator';
  
  logInfo(`Testing connection to: ${mongoUri}`);
  logInfo(`Node.js version: ${process.version}`);
  logInfo(`Mongoose version: ${mongoose.version}`);

  console.log('\n' + '-'.repeat(60));
  logStep('STEP 1: Testing MongoDB Connection');
  console.log('-'.repeat(60));

  try {
    // Configure connection with same settings as main app
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    };

    logStep('Attempting to connect to MongoDB...');
    
    // Start connection timer
    const startTime = Date.now();
    
    await mongoose.connect(mongoUri, connectionOptions);
    
    const connectionTime = Date.now() - startTime;
    logSuccess(`Connected to MongoDB in ${connectionTime}ms`);
    
    // Get connection details
    const db = mongoose.connection.db;
    const admin = db.admin();
    
    console.log('\n' + '-'.repeat(60));
    logStep('STEP 2: Gathering Database Information');
    console.log('-'.repeat(60));
    
    logSuccess(`Database name: ${mongoose.connection.name}`);
    logSuccess(`Host: ${mongoose.connection.host}`);
    logSuccess(`Port: ${mongoose.connection.port}`);
    logSuccess(`Ready state: ${mongoose.connection.readyState} (1 = connected)`);
    
    // Test database operations
    console.log('\n' + '-'.repeat(60));
    logStep('STEP 3: Testing Database Operations');
    console.log('-'.repeat(60));
    
    // Get server status
    try {
      const serverStatus = await admin.serverStatus();
      logSuccess(`MongoDB version: ${serverStatus.version}`);
      logSuccess(`Uptime: ${Math.floor(serverStatus.uptime / 60)} minutes`);
    } catch (err) {
      logWarning(`Could not get server status: ${err.message}`);
    }
    
    // List collections
    try {
      const collections = await db.listCollections().toArray();
      logSuccess(`Found ${collections.length} collections in database`);
      
      if (collections.length > 0) {
        console.log('   📋 Collections:');
        collections.forEach(collection => {
          console.log(`     - ${collection.name}`);
        });
      }
    } catch (err) {
      logWarning(`Could not list collections: ${err.message}`);
    }
    
    // Test write operation
    console.log('\n' + '-'.repeat(60));
    logStep('STEP 4: Testing Write Operations');
    console.log('-'.repeat(60));
    
    const testCollection = db.collection('connection_test');
    
    try {
      const testDoc = {
        testId: 'test_' + Date.now(),
        message: 'Connection test successful',
        timestamp: new Date(),
        nodeVersion: process.version,
        mongooseVersion: mongoose.version
      };
      
      const insertResult = await testCollection.insertOne(testDoc);
      logSuccess(`Test document inserted with ID: ${insertResult.insertedId}`);
      
      // Read the document back
      const foundDoc = await testCollection.findOne({ testId: testDoc.testId });
      if (foundDoc) {
        logSuccess('Test document read successfully');
      }
      
      // Clean up test document
      await testCollection.deleteOne({ testId: testDoc.testId });
      logSuccess('Test document cleaned up');
      
    } catch (err) {
      logError(`Write operation failed: ${err.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
    logSuccess('DATABASE CONNECTION TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    logInfo('Your MongoDB connection is working correctly.');
    logInfo('You can now run your main application with confidence.');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    logError('DATABASE CONNECTION TEST FAILED!');
    console.log('='.repeat(60));
    
    logError(`Connection failed: ${error.message}`);
    
    console.log('\n' + '-'.repeat(60));
    logError('TROUBLESHOOTING GUIDE');
    console.log('-'.repeat(60));
    
    if (error.message.includes('ECONNREFUSED')) {
      logError('Connection refused - MongoDB is not running or not accessible');
      console.log('   🔧 LOCAL MONGODB:');
      console.log('      - Check if MongoDB service is running');
      console.log('      - Windows: Check Services app for "MongoDB" service');
      console.log('      - macOS: Run "brew services start mongodb-community"');
      console.log('      - Linux: Run "sudo systemctl start mongod"');
      
    } else if (error.message.includes('authentication failed')) {
      logError('Authentication failed - Check username/password');
      console.log('   🔧 SOLUTIONS:');
      console.log('      - Verify username and password in connection string');
      console.log('      - Check if user has proper permissions');
      
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      logError('Server selection timeout - MongoDB not reachable');
      console.log('   🔧 MONGODB ATLAS:');
      console.log('      - Check if your IP is whitelisted in Network Access');
      console.log('      - Verify connection string is correct');
      console.log('      - Check if cluster is running (not paused)');
      console.log('   🔧 LOCAL MONGODB:');
      console.log('      - Check if MongoDB is running on correct port');
      console.log('      - Check firewall settings');
      
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      logError('DNS resolution failed - Check connection string');
      console.log('   🔧 SOLUTIONS:');
      console.log('      - Verify hostname in connection string');
      console.log('      - Check internet connection');
      console.log('      - For Atlas: verify cluster hostname');
    }
    
    console.log('\n   📝 GENERAL STEPS:');
    console.log('      1. Check your .env file has correct MONGODB_URI');
    console.log('      2. For local: Ensure MongoDB is installed and running');
    console.log('      3. For Atlas: Check cluster status and IP whitelist');
    console.log('      4. Test connection string in MongoDB Compass');
    console.log('      5. Check for typos in username/password');
    
  } finally {
    try {
      await mongoose.connection.close();
      logInfo('Database connection closed');
    } catch (err) {
      logWarning(`Error closing connection: ${err.message}`);
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logError(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logError(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logError(`Critical error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };