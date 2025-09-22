const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LearnerProfile = require('./models/LearnerProfile');
const User = require('./models/User');

// Load environment variables
dotenv.config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator');
    console.log('✅ Connected to MongoDB');

    // Check Users collection
    console.log('\n=== USERS COLLECTION ===');
    const users = await User.find({});
    console.log(`Total Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Check LearnerProfiles collection
    console.log('\n=== LEARNER PROFILES COLLECTION ===');
    const profiles = await LearnerProfile.find({});
    console.log(`Total Profiles: ${profiles.length}`);
    
    if (profiles.length === 0) {
      console.log('❌ No learner profiles found in database');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. Profile ID: ${profile._id}`);
        console.log(`   User ID: ${profile.userId}`);
        console.log(`   Name: ${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}`);
        console.log(`   Email: ${profile.personalInfo?.email}`);
        console.log(`   Completeness: ${profile.profileCompleteness}%`);
        console.log(`   Last Updated: ${profile.lastUpdated}`);
        console.log(`   Is Active: ${profile.isActive}`);
        console.log('');
      });
    }

    // Check if there are any profiles for existing users
    console.log('\n=== USER-PROFILE MATCHING ===');
    for (const user of users) {
      const profile = await LearnerProfile.findOne({ userId: user._id.toString() });
      if (profile) {
        console.log(`✅ User ${user.firstName} ${user.lastName} HAS a profile`);
      } else {
        console.log(`❌ User ${user.firstName} ${user.lastName} MISSING profile`);
      }
    }

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

checkDatabase();