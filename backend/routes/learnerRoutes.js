const express = require('express');
const router = express.Router();
const LearnerProfile = require('../models/LearnerProfile');

// @route   GET /api/learners
// @desc    Get all learner profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await LearnerProfile.find({ isActive: true }).select('-__v');
    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/learners/user/:userId
// @desc    Get learner profile by userId
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await LearnerProfile.findOne({ userId: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Learner profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/learners/:id
// @desc    Get single learner profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const profile = await LearnerProfile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Learner profile not found'
      });
    }
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/learners
// @desc    Create new learner profile
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      personalInfo,
      academicBackground,
      skills,
      socioEconomicContext,
      learningPace,
      aspirations
    } = req.body;

    // Check if profile already exists
    let existingProfile = await LearnerProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists for this user'
      });
    }

    // Create new profile
    const newProfile = new LearnerProfile({
      userId,
      personalInfo,
      academicBackground,
      skills,
      socioEconomicContext,
      learningPace,
      aspirations
    });

    const savedProfile = await newProfile.save();
    
    res.status(201).json({
      success: true,
      message: 'Learner profile created successfully',
      data: savedProfile
    });
  } catch (error) {
    console.error(error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/learners/:id
// @desc    Update learner profile
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const profile = await LearnerProfile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Learner profile not found'
      });
    }

    // Update fields
    const updateFields = [
      'personalInfo',
      'academicBackground',
      'skills',
      'socioEconomicContext',
      'learningPace',
      'aspirations'
    ];

    updateFields.forEach(field => {
      if (req.body[field]) {
        profile[field] = { ...profile[field].toObject(), ...req.body[field] };
      }
    });

    const updatedProfile = await profile.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error(error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   DELETE /api/learners/:id
// @desc    Delete learner profile (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const profile = await LearnerProfile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Learner profile not found'
      });
    }

    // Soft delete
    profile.isActive = false;
    await profile.save();
    
    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/learners/:id/completeness
// @desc    Get profile completeness score
// @access  Public
router.get('/:id/completeness', async (req, res) => {
  try {
    const profile = await LearnerProfile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Learner profile not found'
      });
    }

    const completeness = profile.calculateCompleteness();
    
    res.json({
      success: true,
      data: {
        profileId: profile._id,
        completeness: completeness,
        lastUpdated: profile.lastUpdated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/learners/search
// @desc    Search learner profiles based on criteria
// @access  Public
router.post('/search', async (req, res) => {
  try {
    const {
      location,
      skills,
      education,
      experience,
      industryInterest,
      page = 1,
      limit = 10
    } = req.body;

    let query = { isActive: true };

    // Build search query
    if (location) {
      if (location.state) {
        query['socioEconomicContext.location.state'] = new RegExp(location.state, 'i');
      }
      if (location.city) {
        query['socioEconomicContext.location.city'] = new RegExp(location.city, 'i');
      }
    }

    if (education) {
      query['academicBackground.highestEducation'] = education;
    }

    if (skills && skills.length > 0) {
      query['$or'] = [
        { 'skills.technicalSkills.skillName': { $in: skills.map(skill => new RegExp(skill, 'i')) } },
        { 'skills.softSkills.skillName': { $in: skills.map(skill => new RegExp(skill, 'i')) } }
      ];
    }

    if (industryInterest) {
      query['aspirations.industries.name'] = new RegExp(industryInterest, 'i');
    }

    const skip = (page - 1) * limit;
    const profiles = await LearnerProfile.find(query)
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ lastUpdated: -1 });

    const total = await LearnerProfile.countDocuments(query);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;