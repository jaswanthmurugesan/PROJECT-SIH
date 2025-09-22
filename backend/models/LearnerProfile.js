const mongoose = require('mongoose');

// Academic Background Schema
const academicBackgroundSchema = new mongoose.Schema({
  highestEducation: {
    type: String,
    enum: ['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate', 'PhD', 'Other'],
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true
  },
  instituteName: String,
  graduationYear: Number,
  marks: {
    type: Number,
    min: 0,
    max: 100
  },
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expirationDate: Date
  }]
});

// Skills Schema
const skillsSchema = new mongoose.Schema({
  technicalSkills: [{
    skillName: String,
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    yearsOfExperience: Number
  }],
  softSkills: [{
    skillName: String,
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    }
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['Basic', 'Conversational', 'Fluent', 'Native']
    }
  }]
});

// Socio-Economic Context Schema
const socioEconomicSchema = new mongoose.Schema({
  location: {
    state: String,
    district: String,
    city: String,
    pincode: String,
    isUrban: Boolean
  },
  familyIncome: {
    type: String,
    enum: ['Below 1 Lakh', '1-3 Lakhs', '3-5 Lakhs', '5-10 Lakhs', '10-20 Lakhs', 'Above 20 Lakhs']
  },
  employmentStatus: {
    type: String,
    enum: ['Student', 'Unemployed', 'Employed', 'Self-Employed', 'Retired']
  },
  workExperience: [{
    jobTitle: String,
    company: String,
    duration: String,
    responsibilities: [String]
  }],
  financialConstraints: {
    canAffordPaidCourses: Boolean,
    preferredBudget: Number,
    needsFinancialAssistance: Boolean
  },
  accessToTechnology: {
    hasSmartphone: Boolean,
    hasComputer: Boolean,
    hasReliableInternet: Boolean,
    preferredDeviceForLearning: {
      type: String,
      enum: ['Smartphone', 'Computer', 'Tablet', 'Any', ''],
      default: ''
    }
  }
});

// Learning Pace Schema
const learningPaceSchema = new mongoose.Schema({
  availableHoursPerWeek: {
    type: Number,
    min: 1,
    max: 168
  },
  preferredLearningTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Flexible']
  },
  learningStyle: {
    type: String,
    enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed']
  },
  pacePreference: {
    type: String,
    enum: ['Self-Paced', 'Structured', 'Intensive', 'Part-Time']
  },
  attentionSpan: {
    type: String,
    enum: ['Short (15-30 min)', 'Medium (30-60 min)', 'Long (1-2 hours)', 'Extended (2+ hours)']
  },
  previousLearningExperience: {
    hasOnlineLearningExperience: Boolean,
    completedCourses: Number,
    dropoutRate: Number,
    preferredContentFormat: {
      type: String,
      enum: ['Video', 'Text', 'Interactive', 'Hands-on', 'Mixed', ''],
      default: ''
    }
  }
});

// Aspirations Schema
const aspirationsSchema = new mongoose.Schema({
  careerGoals: {
    shortTerm: [String], // Goals for next 1-2 years
    longTerm: [String],  // Goals for next 5-10 years
    dreamJob: String
  },
  industries: [{
    name: String,
    interestLevel: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  rolePreferences: [{
    roleType: String,
    interestLevel: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  salaryExpectations: {
    currentSalary: Number,
    expectedSalary: Number,
    timeframeToAchieve: String
  },
  workEnvironmentPreferences: {
    preferredWorkMode: {
      type: String,
      enum: ['Remote', 'On-site', 'Hybrid', 'Flexible', ''],
      default: ''
    },
    companySize: {
      type: String,
      enum: ['Startup', 'Small', 'Medium', 'Large', 'Any', ''],
      default: ''
    },
    willingToRelocate: Boolean
  },
  entrepreneurialInterest: {
    interestedInStartup: Boolean,
    businessIdeas: [String],
    riskTolerance: {
      type: String,
      enum: ['Low', 'Medium', 'High', ''],
      default: ''
    }
  }
});

// Main Learner Profile Schema
const learnerProfileSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    }
  },
  
  // Profile Components
  academicBackground: academicBackgroundSchema,
  skills: skillsSchema,
  socioEconomicContext: socioEconomicSchema,
  learningPace: learningPaceSchema,
  aspirations: aspirationsSchema,
  
  // Profile Metadata
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate profile completeness
learnerProfileSchema.methods.calculateCompleteness = function() {
  let totalFields = 0;
  let completedFields = 0;
  
  // Define required fields and their weights
  const requiredSections = [
    'personalInfo',
    'academicBackground',
    'skills',
    'socioEconomicContext',
    'learningPace',
    'aspirations'
  ];
  
  requiredSections.forEach(section => {
    if (this[section]) {
      const sectionData = this[section];
      const sectionKeys = Object.keys(sectionData.toObject ? sectionData.toObject() : sectionData);
      totalFields += sectionKeys.length;
      completedFields += sectionKeys.filter(key => {
        const value = sectionData[key];
        return value !== null && value !== undefined && value !== '';
      }).length;
    }
  });
  
  this.profileCompleteness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  return this.profileCompleteness;
};

// Update lastUpdated timestamp before saving
learnerProfileSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  this.calculateCompleteness();
  next();
});

module.exports = mongoose.model('LearnerProfile', learnerProfileSchema);