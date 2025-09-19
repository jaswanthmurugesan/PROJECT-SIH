#!/usr/bin/env node

/**
 * Test Job Scraper - Local HTML Testing
 * 
 * This script tests the scraper with a local HTML file to verify functionality
 * before testing with real job sites.
 * 
 * Usage: node scrape-test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green + colors.bright, '✅', message);
}

function logError(message) {
  log(colors.red + colors.bright, '❌', message);
}

function logInfo(message) {
  log(colors.blue + colors.bright, 'ℹ️ ', message);
}

function logStep(message) {
  log(colors.cyan + colors.bright, '🔍', message);
}

class TestJobScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.htmlFilePath = path.join(__dirname, 'test-job-site.html');
  }

  async initialize() {
    logStep('Initializing Puppeteer browser...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Run in headful mode so you can watch
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080'
      ],
      defaultViewport: null
    });

    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    logSuccess('Browser initialized successfully');
  }

  async loadTestPage() {
    logStep('Loading local test HTML file...');
    
    try {
      const fileUrl = `file://${this.htmlFilePath}`;
      await this.page.goto(fileUrl, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      logSuccess('Test page loaded successfully');
      
      // Wait for content to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      logError(`Failed to load test page: ${error.message}`);
      return false;
    }
  }

  async extractJobData() {
    logStep('Extracting job titles and salaries from test page...');
    
    try {
      // Wait for job cards to be present
      await this.page.waitForSelector('.job-card', { timeout: 5000 });
      
      const jobElements = await this.page.$$('.job-card');
      logInfo(`Found ${jobElements.length} job cards`);

      if (jobElements.length === 0) {
        logError('No job cards found on the test page');
        return [];
      }

      // Extract job data
      const jobs = await this.page.evaluate(() => {
        const jobCards = document.querySelectorAll('.job-card');
        const extractedJobs = [];

        jobCards.forEach((card, index) => {
          try {
            // Extract title
            const titleElement = card.querySelector('.job-title');
            const title = titleElement ? titleElement.textContent.trim() : 'No title';

            // Extract salary
            const salaryElement = card.querySelector('.salary');
            let salary = salaryElement ? salaryElement.textContent.trim() : 'Not specified';
            
            // Clean up salary text
            if (salary && salary !== 'Not specified') {
              // Already formatted, just use as is
            } else {
              salary = 'Not specified';
            }

            if (title && title !== 'No title') {
              extractedJobs.push({
                title: title,
                salary: salary
              });
            }

          } catch (err) {
            console.log(`Error processing job card ${index}:`, err.message);
          }
        });

        return extractedJobs;
      });

      logSuccess(`Jobs found: ${jobs.length}`);

      // Show sample extracted job if any found
      if (jobs.length > 0) {
        logInfo(`Sample extracted job: ${JSON.stringify(jobs[0], null, 2)}`);
      }

      return jobs;

    } catch (error) {
      logError(`Error extracting job data: ${error.message}`);
      return [];
    }
  }

  async saveToFile(jobs, filename = 'test-scraped-jobs.json') {
    try {
      const outputPath = path.join(process.cwd(), filename);
      
      const output = {
        scrapeDate: new Date().toISOString(),
        totalJobs: jobs.length,
        sourceUrl: `file://${this.htmlFilePath}`,
        testMode: true,
        jobs: jobs
      };

      await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf8');
      logSuccess(`Results saved to: ${outputPath}`);
      
      return outputPath;
    } catch (error) {
      logError(`Error saving to file: ${error.message}`);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      logStep('Closing browser...');
      await this.browser.close();
      logSuccess('Browser closed successfully');
    }
  }

  async testScraper() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST JOB SCRAPER - LOCAL HTML TESTING');
    console.log('='.repeat(60));

    try {
      // Initialize browser
      await this.initialize();

      // Load test page
      const loadSuccess = await this.loadTestPage();
      if (!loadSuccess) {
        throw new Error('Failed to load test page');
      }

      // Extract job data
      const jobs = await this.extractJobData();

      if (jobs.length === 0) {
        logError('No jobs were extracted from the test page');
        return [];
      }

      // Display results
      console.log('\n' + '-'.repeat(60));
      logStep('EXTRACTED JOBS FROM TEST PAGE:');
      console.log('-'.repeat(60));
      
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. Title: "${job.title}"`);
        console.log(`   Salary: "${job.salary}"\n`);
      });

      // Save to file
      console.log('-'.repeat(60));
      await this.saveToFile(jobs);

      console.log('\n' + '='.repeat(60));
      logSuccess(`TEST SCRAPING COMPLETED! Extracted ${jobs.length} jobs.`);
      console.log('='.repeat(60));

      return jobs;

    } catch (error) {
      logError(`Test scraping failed: ${error.message}`);
      return [];
    } finally {
      // Always close browser
      await this.close();
    }
  }
}

// Main execution
async function main() {
  try {
    const scraper = new TestJobScraper();
    const jobs = await scraper.testScraper();
    
    if (jobs.length > 0) {
      logSuccess('Test completed successfully!');
      logInfo('The scraper is working correctly. You can now test with real job sites.');
      process.exit(0);
    } else {
      logError('Test failed - no jobs were extracted');
      process.exit(1);
    }
  } catch (error) {
    logError(`Critical error: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Test interrupted by user');
  process.exit(0);
});

// Run the test scraper if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { TestJobScraper };