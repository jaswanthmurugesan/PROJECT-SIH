const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function checkUserPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator');
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findByEmailWithPassword('naveenkananperiyachi.23aid@kongu.edu');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.firstName, user.lastName);
    console.log('📧 Email:', user.email);
    console.log('🔐 Password hash exists:', !!user.password);
    
    // Test different possible passwords
    const passwordsToTest = ['test123', 'password', '123456', 'admin123', 'naveen123', 'Test123'];
    
    console.log('\n🔍 Testing passwords...');
    for (const pwd of passwordsToTest) {
      const isValid = await user.comparePassword(pwd);
      console.log(`Password "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      if (isValid) {
        console.log(`\n🎉 CORRECT PASSWORD FOUND: "${pwd}"`);
        break;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

checkUserPassword();