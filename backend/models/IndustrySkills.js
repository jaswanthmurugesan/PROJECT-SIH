const mongoose = require('mongoose');

// Schema for Industry Skills Mapping
const industrySkillsSchema = new mongoose.Schema({
  industry: {
    type: String,
    required: true,
    unique: true // This already creates an index, so we don't need a separate one
  },
  subSectors: [{
    name: String,
    description: String
  }],
  roles: [{
    title: {
      type: String,
      required: true
    },
    alternativeTitles: [String], // Different names for same role
    description: String,
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    experienceRequired: {
      min: Number,
      max: Number
    },
    requiredSkills: [{
      skillName: {
        type: String,
        required: true
      },
      importance: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Medium'
      },
      proficiencyRequired: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
      },
      category: {
        type: String,
        enum: ['Technical', 'Soft', 'Language', 'Domain'],
        default: 'Technical'
      }
    }],
    preferredSkills: [{
      skillName: String,
      importance: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
      },
      proficiencyRequired: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
      }
    }],
    salaryRange: {
      entry: {
        min: Number,
        max: Number
      },
      mid: {
        min: Number,
        max: Number
      },
      senior: {
        min: Number,
        max: Number
      },
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        default: 'per year'
      }
    },
    marketData: {
      demandTrend: {
        type: String,
        enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
        default: 'Medium'
      },
      growthProjection: String, // e.g., "25% in next 5 years"
      availableJobs: Number, // Current job openings
      competitionLevel: {
        type: String,
        enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'],
        default: 'Medium'
      },
      geographicDemand: [{
        state: String,
        demandLevel: {
          type: String,
          enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low']
        }
      }]
    },
    careerProgression: {
      nextRoles: [String], // Possible career advancement
      timeToAdvancement: String, // e.g., "2-3 years"
      requiredForAdvancement: [String] // Skills needed for next level
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dataSource: {
    type: String,
    default: 'NCS Portal'
  },
  scrapedJobCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
// Note: industry field already has unique index, so no separate index needed
industrySkillsSchema.index({ 'roles.title': 1 });
industrySkillsSchema.index({ 'roles.nsqfLevel': 1 });
industrySkillsSchema.index({ 'roles.requiredSkills.skillName': 1 });
industrySkillsSchema.index({ 'roles.marketData.demandTrend': 1 });

module.exports = mongoose.model('IndustrySkills', industrySkillsSchema);