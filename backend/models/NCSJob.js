const mongoose = require('mongoose');

// Schema for NCS job listings
const ncsJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    state: String,
    city: String,
    district: String,
    isRemote: {
      type: Boolean,
      default: false
    }
  },
  industry: {
    type: String,
    required: true
  },
  sector: String,
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  },
  experienceRequired: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 20
    }
  },
  education: {
    minimumQualification: String,
    preferredQualification: String,
    fieldOfStudy: [String]
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    period: {
      type: String,
      enum: ['per hour', 'per day', 'per month', 'per year'],
      default: 'per month'
    }
  },
  skills: {
    required: [{
      skillName: String,
      importance: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Medium'
      }
    }],
    preferred: [{
      skillName: String,
      importance: {
        type: String,
        enum: ['Critical', 'High', 'Medium', 'Low'],
        default: 'Low'
      }
    }]
  },
  nsqfLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  applicationDetails: {
    applyUrl: String,
    applicationDeadline: Date,
    contactInfo: {
      email: String,
      phone: String
    }
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  sourceUrl: String
}, {
  timestamps: true
});

// Indexes for efficient querying
ncsJobSchema.index({ industry: 1, location: 1 });
ncsJobSchema.index({ 'skills.required.skillName': 1 });
ncsJobSchema.index({ nsqfLevel: 1 });
ncsJobSchema.index({ experienceRequired: 1 });
ncsJobSchema.index({ postedDate: -1 });
ncsJobSchema.index({ isActive: 1 });

// Text search index for job descriptions and titles
ncsJobSchema.index({
  title: 'text',
  description: 'text',
  'skills.required.skillName': 'text',
  'skills.preferred.skillName': 'text'
});

module.exports = mongoose.model('NCSJob', ncsJobSchema);