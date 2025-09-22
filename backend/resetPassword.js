const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function resetUserPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator');
    console.log('✅ Connected to MongoDB');

    const userEmail = 'naveenkananperiyachi.23aid@kongu.edu';
    const newPassword = 'password123';

    // Find the user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.firstName, user.lastName);

    // Update password (this will trigger the pre-save hook to hash it)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log(`🔐 New password: ${newPassword}`);
    
    // Test the new password
    const userForTest = await User.findByEmailWithPassword(userEmail);
    const isPasswordValid = await userForTest.comparePassword(newPassword);
    
    console.log('🧪 Testing new password...');
    console.log('✅ Password test result:', isPasswordValid ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

resetUserPassword();