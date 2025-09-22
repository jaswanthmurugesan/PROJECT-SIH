const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function testLoginFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator');
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test@example.com';
    const testPassword = 'test123456';

    // Delete existing test user
    await User.deleteOne({ email: testEmail });
    console.log('🗑️ Deleted any existing test user');

    // Create a new test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: testPassword
    });

    await testUser.save();
    console.log('✅ Test user created successfully');

    // Now test login
    const userForLogin = await User.findByEmailWithPassword(testEmail);
    const isPasswordValid = await userForLogin.comparePassword(testPassword);
    
    console.log('🔍 Testing login...');
    console.log('📧 Email:', testEmail);
    console.log('🔐 Password:', testPassword);
    console.log('✅ Login result:', isPasswordValid ? 'SUCCESS' : 'FAILED');

    if (isPasswordValid) {
      console.log('\n🎉 LOGIN FUNCTIONALITY IS WORKING CORRECTLY!');
      console.log('The issue might be with the existing user password.');
      
      // Let's check the existing user's password hash
      const existingUser = await User.findByEmailWithPassword('naveenkananperiyachi.23aid@kongu.edu');
      console.log('\n🔍 Existing user password hash length:', existingUser.password.length);
      console.log('🔍 Test user password hash length:', userForLogin.password.length);
      
      if (existingUser.password.length < 20) {
        console.log('❌ Existing user password seems to NOT be hashed properly!');
        console.log('🔧 This suggests the password was stored without hashing.');
      } else {
        console.log('✅ Existing user password appears to be hashed correctly.');
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

testLoginFlow();