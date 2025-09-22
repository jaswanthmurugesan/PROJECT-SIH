const express = require('express');
const router = express.Router();
const NCSJob = require('../models/NCSJob');
const IndustrySkills = require('../models/IndustrySkills');
const LearnerProfile = require('../models/LearnerProfile');
const NCSWebScraper = require('../services/ncsWebScraper');

// Job recommendation algorithm
class JobRecommendationEngine {
  constructor() {
    this.skillMatchWeight = 0.4;
    this.locationMatchWeight = 0.2;
    this.experienceMatchWeight = 0.2;
    this.educationMatchWeight = 0.1;
    this.salaryMatchWeight = 0.1;
  }

  async generateRecommendations(userId, limit = 10) {
    try {
      // Get user profile
      const userProfile = await LearnerProfile.findOne({ userId }).populate('userId');
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get all active jobs
      const allJobs = await NCSJob.find({ isActive: true });
      
      // Calculate match scores for each job
      const jobScores = allJobs.map(job => ({
        job,
        score: this.calculateMatchScore(userProfile, job),
        reasons: this.getMatchReasons(userProfile, job)
      }));

      // Sort by score and return top matches
      const recommendations = jobScores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.job.toObject(),
          matchScore: Math.round(item.score * 100),
          matchReasons: item.reasons
        }));

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  calculateMatchScore(userProfile, job) {
    let totalScore = 0;

    // Skill matching
    const skillScore = this.calculateSkillMatch(userProfile.skills, job.skills);
    totalScore += skillScore * this.skillMatchWeight;

    // Location matching
    const locationScore = this.calculateLocationMatch(userProfile.socioEconomicContext.location, job.location);
    totalScore += locationScore * this.locationMatchWeight;

    // Experience matching
    const experienceScore = this.calculateExperienceMatch(userProfile, job.experienceRequired);
    totalScore += experienceScore * this.experienceMatchWeight;

    // Education matching
    const educationScore = this.calculateEducationMatch(userProfile.academicBackground, job.education);
    totalScore += educationScore * this.educationMatchWeight;

    // Salary matching (if user has expectations and job has salary info)
    const salaryScore = this.calculateSalaryMatch(userProfile.aspirations.salaryExpectations, job.salary);
    totalScore += salaryScore * this.salaryMatchWeight;

    return Math.min(totalScore, 1); // Cap at 1.0
  }

  calculateSkillMatch(userSkills, jobSkills) {
    if (!jobSkills || !jobSkills.required || jobSkills.required.length === 0) {
      return 0.5; // Neutral score if no job skills specified
    }

    const userSkillNames = [
      ...userSkills.technicalSkills.map(s => s.skillName.toLowerCase()),
      ...userSkills.softSkills.map(s => s.skillName.toLowerCase()),
      ...userSkills.languages.map(s => s.language.toLowerCase())
    ];

    const requiredSkills = jobSkills.required;
    let matchedSkills = 0;
    let totalImportanceWeight = 0;
    let matchedImportanceWeight = 0;

    requiredSkills.forEach(reqSkill => {
      const importance = reqSkill.importance || 'Medium';
      const weight = this.getImportanceWeight(importance);
      totalImportanceWeight += weight;

      const isMatched = userSkillNames.some(userSkill => 
        userSkill.includes(reqSkill.skillName.toLowerCase()) || 
        reqSkill.skillName.toLowerCase().includes(userSkill)
      );

      if (isMatched) {
        matchedSkills++;
        matchedImportanceWeight += weight;
      }
    });

    // Calculate weighted skill match percentage
    const basicMatch = matchedSkills / requiredSkills.length;
    const weightedMatch = matchedImportanceWeight / totalImportanceWeight;
    
    return (basicMatch + weightedMatch) / 2; // Average of both approaches
  }

  calculateLocationMatch(userLocation, jobLocation) {
    if (!jobLocation) return 0.7; // Neutral if no job location specified
    
    if (jobLocation.isRemote) return 1.0; // Perfect match for remote jobs
    
    // State match
    if (userLocation.state && jobLocation.state) {
      if (userLocation.state.toLowerCase() === jobLocation.state.toLowerCase()) {
        // City match within same state
        if (userLocation.city && jobLocation.city && 
            userLocation.city.toLowerCase() === jobLocation.city.toLowerCase()) {
          return 1.0; // Perfect local match
        }
        return 0.8; // Same state, different city
      }
    }
    
    return 0.3; // Different state (assuming user might relocate)
  }

  calculateExperienceMatch(userProfile, jobExperience) {
    if (!jobExperience) return 0.8; // Neutral if no experience specified

    // Calculate user's total experience
    const userExperience = userProfile.socioEconomicContext.workExperience || [];
    const totalUserExperience = userExperience.reduce((total, exp) => {
      if (exp.endDate && exp.startDate) {
        const years = (new Date(exp.endDate) - new Date(exp.startDate)) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      }
      return total;
    }, 0);

    const jobMinExp = jobExperience.min || 0;
    const jobMaxExp = jobExperience.max || 10;

    if (totalUserExperience >= jobMinExp && totalUserExperience <= jobMaxExp) {
      return 1.0; // Perfect experience match
    } else if (totalUserExperience < jobMinExp) {
      // Under-qualified
      const gap = jobMinExp - totalUserExperience;
      return Math.max(0, 1 - (gap / 5)); // Penalty decreases score
    } else {
      // Over-qualified
      const excess = totalUserExperience - jobMaxExp;
      return Math.max(0.7, 1 - (excess / 10)); // Less penalty for being over-qualified
    }
  }

  calculateEducationMatch(userEducation, jobEducation) {
    if (!jobEducation || !jobEducation.minimumQualification) return 0.8;

    const educationLevels = {
      'Below 10th': 1,
      '10th Pass': 2,
      '12th Pass': 3,
      'Diploma': 4,
      'Graduate': 5,
      'Post Graduate': 6,
      'PhD': 7
    };

    const userLevel = educationLevels[userEducation.highestEducation] || 3;
    const jobMinLevel = educationLevels[jobEducation.minimumQualification] || 3;

    if (userLevel >= jobMinLevel) {
      return 1.0; // Meets or exceeds requirements
    } else {
      const gap = jobMinLevel - userLevel;
      return Math.max(0.3, 1 - (gap * 0.2)); // Penalty for education gap
    }
  }

  calculateSalaryMatch(userSalaryExpectations, jobSalary) {
    if (!userSalaryExpectations || !jobSalary) return 0.7; // Neutral if no salary info

    const userExpected = parseInt(userSalaryExpectations.expectedSalary) || 0;
    if (userExpected === 0) return 0.7;

    const jobMin = jobSalary.min || 0;
    const jobMax = jobSalary.max || jobMin;

    if (userExpected >= jobMin && userExpected <= jobMax) {
      return 1.0; // Perfect salary match
    } else if (userExpected < jobMin) {
      // Job pays more than expected (good for user)
      return 0.9;
    } else {
      // Job pays less than expected
      const shortfall = (userExpected - jobMax) / userExpected;
      return Math.max(0.2, 1 - shortfall);
    }
  }

  getImportanceWeight(importance) {
    const weights = {
      'Critical': 4,
      'High': 3,
      'Medium': 2,
      'Low': 1
    };
    return weights[importance] || 2;
  }

  getMatchReasons(userProfile, job) {
    const reasons = [];

    // Skill matches
    const userSkillNames = [
      ...userProfile.skills.technicalSkills.map(s => s.skillName.toLowerCase()),
      ...userProfile.skills.softSkills.map(s => s.skillName.toLowerCase())
    ];

    const matchedSkills = job.skills.required.filter(reqSkill =>
      userSkillNames.some(userSkill => 
        userSkill.includes(reqSkill.skillName.toLowerCase()) || 
        reqSkill.skillName.toLowerCase().includes(userSkill)
      )
    );

    if (matchedSkills.length > 0) {
      reasons.push(`Matches ${matchedSkills.length} required skills: ${matchedSkills.map(s => s.skillName).slice(0, 3).join(', ')}`);
    }

    // Location match
    if (job.location.isRemote) {
      reasons.push('Remote work available');
    } else if (userProfile.socioEconomicContext.location.state === job.location.state) {
      reasons.push('Located in your state');
    }

    // Experience match
    const userExperience = userProfile.socioEconomicContext.workExperience?.length || 0;
    if (job.experienceRequired && userExperience >= job.experienceRequired.min) {
      reasons.push('Experience requirements met');
    }

    // Education match
    if (job.education && userProfile.academicBackground.highestEducation) {
      reasons.push('Education requirements satisfied');
    }

    return reasons;
  }
}

// Routes

// Get job recommendations for a user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, industry, location } = req.query;

    const engine = new JobRecommendationEngine();
    let recommendations = await engine.generateRecommendations(userId, parseInt(limit));

    // Apply filters if provided
    if (industry) {
      recommendations = recommendations.filter(job => 
        job.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }

    if (location) {
      recommendations = recommendations.filter(job => 
        job.location.state?.toLowerCase().includes(location.toLowerCase()) ||
        job.location.city?.toLowerCase().includes(location.toLowerCase()) ||
        job.location.isRemote
      );
    }

    res.json({
      success: true,
      recommendations,
      totalFound: recommendations.length
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job recommendations',
      error: error.message
    });
  }
});

// Get skill gap analysis for a user against a specific job
router.get('/skill-gap/:userId/:jobId', async (req, res) => {
  try {
    const { userId, jobId } = req.params;

    const userProfile = await LearnerProfile.findOne({ userId });
    const job = await NCSJob.findById(jobId);

    if (!userProfile || !job) {
      return res.status(404).json({
        success: false,
        message: 'User profile or job not found'
      });
    }

    const engine = new JobRecommendationEngine();
    const skillScore = engine.calculateSkillMatch(userProfile.skills, job.skills);

    // Detailed skill gap analysis
    const userSkillNames = [
      ...userProfile.skills.technicalSkills.map(s => s.skillName.toLowerCase()),
      ...userProfile.skills.softSkills.map(s => s.skillName.toLowerCase()),
      ...userProfile.skills.languages.map(s => s.language.toLowerCase())
    ];

    const requiredSkills = job.skills.required || [];
    const missingSkills = requiredSkills.filter(reqSkill =>
      !userSkillNames.some(userSkill => 
        userSkill.includes(reqSkill.skillName.toLowerCase()) || 
        reqSkill.skillName.toLowerCase().includes(userSkill)
      )
    );

    const matchingSkills = requiredSkills.filter(reqSkill =>
      userSkillNames.some(userSkill => 
        userSkill.includes(reqSkill.skillName.toLowerCase()) || 
        reqSkill.skillName.toLowerCase().includes(userSkill)
      )
    );

    res.json({
      success: true,
      analysis: {
        jobTitle: job.title,
        company: job.company,
        overallSkillMatch: Math.round(skillScore * 100),
        totalRequiredSkills: requiredSkills.length,
        matchingSkills: matchingSkills.map(s => s.skillName),
        missingSkills: missingSkills.map(s => ({
          skillName: s.skillName,
          importance: s.importance
        })),
        recommendations: missingSkills.length > 0 ? 
          `Focus on learning: ${missingSkills.slice(0, 3).map(s => s.skillName).join(', ')}` :
          'You have all the required skills for this position!'
      }
    });
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze skill gap',
      error: error.message
    });
  }
});

// Get all available jobs with filters
router.get('/jobs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      industry, 
      location, 
      minSalary, 
      maxSalary, 
      experienceLevel,
      skills,
      sortBy = 'postedDate',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = { isActive: true };

    if (industry) {
      filter.industry = new RegExp(industry, 'i');
    }

    if (location) {
      filter.$or = [
        { 'location.state': new RegExp(location, 'i') },
        { 'location.city': new RegExp(location, 'i') },
        { 'location.isRemote': true }
      ];
    }

    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.min = { $gte: parseInt(minSalary) };
      if (maxSalary) filter.salary.max = { $lte: parseInt(maxSalary) };
    }

    if (experienceLevel) {
      const expLevel = parseInt(experienceLevel);
      filter.experienceRequired = {
        min: { $lte: expLevel },
        max: { $gte: expLevel }
      };
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filter['skills.required.skillName'] = { $in: skillArray.map(s => new RegExp(s, 'i')) };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const jobs = await NCSJob.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await NCSJob.countDocuments(filter);

    res.json({
      success: true,
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalJobs / parseInt(limit)),
        totalJobs,
        hasNext: skip + jobs.length < totalJobs,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get industry insights
router.get('/industries', async (req, res) => {
  try {
    const industries = await IndustrySkills.find({})
      .select('industry roles.title roles.marketData lastUpdated scrapedJobCount')
      .sort({ scrapedJobCount: -1 });

    const insights = industries.map(industry => ({
      name: industry.industry,
      totalRoles: industry.roles?.length || 0,
      availableJobs: industry.scrapedJobCount || 0,
      lastUpdated: industry.lastUpdated,
      topRoles: industry.roles?.slice(0, 5).map(role => ({
        title: role.title,
        demandTrend: role.marketData?.demandTrend || 'Medium',
        availableJobs: role.marketData?.availableJobs || 0
      })) || []
    }));

    res.json({
      success: true,
      industries: insights
    });
  } catch (error) {
    console.error('Error fetching industry insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch industry insights',
      error: error.message
    });
  }
});

// Trigger manual scraping (admin function)
router.post('/scrape/trigger', async (req, res) => {
  try {
    if (!global.scrapingScheduler) {
      return res.status(503).json({
        success: false,
        message: 'Scraping service not initialized'
      });
    }

    const result = await global.scrapingScheduler.triggerManualScrape();

    res.json({
      success: result.success,
      message: result.message || 'Scraping completed',
      result
    });
  } catch (error) {
    console.error('Error triggering scrape:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger scraping',
      error: error.message
    });
  }
});

// Get scraping status
router.get('/scrape/status', (req, res) => {
  try {
    if (!global.scrapingScheduler) {
      return res.status(503).json({
        success: false,
        message: 'Scraping service not initialized'
      });
    }

    const status = global.scrapingScheduler.getStatus();
    
    res.json({
      success: true,
      status: {
        isRunning: status.isRunning,
        lastRunTime: status.lastRunTime,
        nextRunTime: status.nextRunTime,
        totalRuns: status.totalRuns,
        recentRuns: status.scrapeHistory.map(run => ({
          timestamp: run.timestamp,
          duration: run.duration,
          success: run.result.success,
          jobsProcessed: run.result.jobsProcessed || 0,
          error: run.result.error
        }))
      }
    });
  } catch (error) {
    console.error('Error getting scrape status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scraping status',
      error: error.message
    });
  }
});

module.exports = router;