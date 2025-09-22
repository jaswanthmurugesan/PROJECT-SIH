const cron = require('node-cron');
const NCSWebScraper = require('./ncsWebScraper');

class ScrapingScheduler {
  constructor() {
    this.isRunning = false;
    this.lastRunTime = null;
    this.nextRunTime = null;
    this.scrapeHistory = [];
  }

  // Schedule automatic scraping every 6 hours
  startScheduledScraping() {
    console.log('⏰ Starting scheduled NCS scraping...');
    
    // Run every 6 hours: 0 */6 * * *
    this.scheduledTask = cron.schedule('0 */6 * * *', async () => {
      await this.runScheduledScrape();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    // Also run immediately on startup
    setTimeout(() => {
      this.runScheduledScrape();
    }, 5000); // Wait 5 seconds after server start

    console.log('✅ Scheduled scraping initialized - runs every 6 hours');
  }

  // Schedule daily industry analysis update
  startDailyAnalysis() {
    console.log('📊 Starting daily industry analysis...');
    
    // Run every day at 2 AM: 0 2 * * *
    this.analysisTask = cron.schedule('0 2 * * *', async () => {
      await this.runIndustryAnalysis();
    }, {
      scheduled: true,
      timezone: "Asia/Kolkata"
    });

    console.log('✅ Daily analysis scheduled for 2:00 AM IST');
  }

  async runScheduledScrape() {
    if (this.isRunning) {
      console.log('⚠️ Scraping already in progress, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      this.lastRunTime = new Date();
      
      console.log(`🕐 Starting scheduled scrape at ${this.lastRunTime.toISOString()}`);
      
      const scraper = new NCSWebScraper();
      const result = await scraper.performFullScrape();
      
      // Record scrape history
      this.scrapeHistory.push({
        timestamp: this.lastRunTime,
        result,
        duration: Date.now() - this.lastRunTime.getTime()
      });

      // Keep only last 50 scrape records
      if (this.scrapeHistory.length > 50) {
        this.scrapeHistory = this.scrapeHistory.slice(-50);
      }

      // Calculate next run time
      this.nextRunTime = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours from now

      console.log(`✅ Scheduled scrape completed. Next run: ${this.nextRunTime.toISOString()}`);
      console.log(`📊 Results: ${JSON.stringify(result, null, 2)}`);

    } catch (error) {
      console.error('❌ Scheduled scrape failed:', error);
      this.scrapeHistory.push({
        timestamp: this.lastRunTime,
        result: { success: false, error: error.message },
        duration: Date.now() - this.lastRunTime.getTime()
      });
    } finally {
      this.isRunning = false;
    }
  }

  async runIndustryAnalysis() {
    try {
      console.log('📈 Running daily industry analysis...');
      
      const IndustrySkills = require('../models/IndustrySkills');
      const NCSJob = require('../models/NCSJob');
      
      // Get job statistics from last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentJobs = await NCSJob.find({
        scrapedAt: { $gte: last24Hours },
        isActive: true
      });

      // Analyze trends
      const industryTrends = await this.analyzeIndustryTrends(recentJobs);
      const skillTrends = await this.analyzeSkillTrends(recentJobs);
      
      console.log('📊 Industry Trends:', industryTrends);
      console.log('🔧 Skill Trends:', skillTrends);
      
      // Update market data in industry skills
      await this.updateMarketTrends(industryTrends, skillTrends);
      
      console.log('✅ Daily industry analysis completed');
    } catch (error) {
      console.error('❌ Industry analysis failed:', error);
    }
  }

  async analyzeIndustryTrends(jobs) {
    const industryStats = {};
    
    jobs.forEach(job => {
      if (!industryStats[job.industry]) {
        industryStats[job.industry] = {
          count: 0,
          totalSalaryMin: 0,
          totalSalaryMax: 0,
          salaryCount: 0,
          avgNSQFLevel: 0,
          nsqfCount: 0
        };
      }
      
      const stats = industryStats[job.industry];
      stats.count++;
      
      if (job.salary) {
        stats.totalSalaryMin += job.salary.min || 0;
        stats.totalSalaryMax += job.salary.max || 0;
        stats.salaryCount++;
      }
      
      if (job.nsqfLevel) {
        stats.avgNSQFLevel += job.nsqfLevel;
        stats.nsqfCount++;
      }
    });

    // Calculate averages and trends
    Object.keys(industryStats).forEach(industry => {
      const stats = industryStats[industry];
      stats.avgSalaryMin = stats.salaryCount > 0 ? stats.totalSalaryMin / stats.salaryCount : 0;
      stats.avgSalaryMax = stats.salaryCount > 0 ? stats.totalSalaryMax / stats.salaryCount : 0;
      stats.avgNSQFLevel = stats.nsqfCount > 0 ? stats.avgNSQFLevel / stats.nsqfCount : 0;
      
      // Determine demand trend based on job count
      if (stats.count >= 50) {
        stats.demandTrend = 'Very High';
      } else if (stats.count >= 20) {
        stats.demandTrend = 'High';
      } else if (stats.count >= 10) {
        stats.demandTrend = 'Medium';
      } else if (stats.count >= 5) {
        stats.demandTrend = 'Low';
      } else {
        stats.demandTrend = 'Very Low';
      }
    });

    return industryStats;
  }

  async analyzeSkillTrends(jobs) {
    const skillStats = {};
    
    jobs.forEach(job => {
      job.skills.required.forEach(skill => {
        if (!skillStats[skill.skillName]) {
          skillStats[skill.skillName] = {
            count: 0,
            industries: new Set(),
            importanceScore: 0,
            roles: new Set()
          };
        }
        
        const stats = skillStats[skill.skillName];
        stats.count++;
        stats.industries.add(job.industry);
        stats.roles.add(job.title);
        
        // Calculate importance score
        const importanceWeight = {
          'Critical': 4,
          'High': 3,
          'Medium': 2,
          'Low': 1
        };
        stats.importanceScore += importanceWeight[skill.importance] || 2;
      });
    });

    // Convert Set to Array and calculate final scores
    Object.keys(skillStats).forEach(skill => {
      const stats = skillStats[skill];
      stats.industries = Array.from(stats.industries);
      stats.roles = Array.from(stats.roles);
      stats.avgImportance = stats.importanceScore / stats.count;
      stats.versatility = stats.industries.length; // How many industries use this skill
    });

    return skillStats;
  }

  async updateMarketTrends(industryTrends, skillTrends) {
    try {
      const IndustrySkills = require('../models/IndustrySkills');
      
      // Update each industry with latest trends
      for (const [industryName, trends] of Object.entries(industryTrends)) {
        await IndustrySkills.findOneAndUpdate(
          { industry: industryName },
          {
            $set: {
              'roles.$[].marketData.demandTrend': trends.demandTrend,
              'roles.$[].marketData.availableJobs': trends.count,
              lastUpdated: new Date()
            }
          }
        );
      }
      
      console.log('✅ Market trends updated in database');
    } catch (error) {
      console.error('❌ Error updating market trends:', error);
    }
  }

  // Manual trigger for immediate scraping
  async triggerManualScrape() {
    if (this.isRunning) {
      return { success: false, message: 'Scraping already in progress' };
    }

    try {
      console.log('🔄 Manual scrape triggered...');
      await this.runScheduledScrape();
      return { success: true, message: 'Manual scrape completed' };
    } catch (error) {
      console.error('❌ Manual scrape failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get scraping status and history
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      scrapeHistory: this.scrapeHistory.slice(-10), // Last 10 runs
      totalRuns: this.scrapeHistory.length
    };
  }

  // Stop all scheduled tasks
  stopScheduling() {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      console.log('🛑 Scheduled scraping stopped');
    }
    
    if (this.analysisTask) {
      this.analysisTask.stop();
      console.log('🛑 Daily analysis stopped');
    }
  }

  // Restart scheduling
  restartScheduling() {
    this.stopScheduling();
    this.startScheduledScraping();
    this.startDailyAnalysis();
    console.log('🔄 Scheduling restarted');
  }
}

module.exports = ScrapingScheduler;