#!/usr/bin/env node

/**
 * Multi-Site Job Scraper - Production Ready
 * 
 * This script can scrape multiple job sites with configurable selectors.
 * It includes fallback strategies and detailed debugging.
 * 
 * Usage: node scrape-production.js [site]
 * Examples:
 *   node scrape-production.js local     # Test with local HTML
 *   node scrape-production.js naukri    # Scrape Naukri.com
 *   node scrape-production.js indeed    # Scrape Indeed (may have bot protection)
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Site configurations
const SITE_CONFIGS = {
  local: {
    name: 'Local Test Site',
    url: 'file://' + path.join(__dirname, 'test-job-site.html'),
    selectors: {
      jobList: '.job-card',
      title: '.job-title',
      salary: '.salary',
      waitFor: '.job-card'
    }
  },
  naukri: {
    name: 'Naukri.com',
    url: 'https://www.naukri.com/jobs-in-india',
    selectors: {
      jobList: '.jobTuple, .srp-jobtuple-wrapper',
      title: '.jobTupleHeader .title, .job-title',
      salary: '.salary, .sal, .jobTupleCompanySalary',
      waitFor: '.jobTuple, .srp-jobtuple-wrapper'
    }
  },
  indeed: {
    name: 'Indeed India',
    url: 'https://in.indeed.com/jobs?q=software+engineer',
    selectors: {
      jobList: '.jobsearch-SerpJobCard, .job_seen_beacon',
      title: 'h2.jobTitle a span[title], .jobTitle a span',
      salary: '.salaryText, .salary-snippet',
      waitFor: '.jobsearch-SerpJobCard, .job_seen_beacon'
    }
  },
  timesjobs: {
    name: 'TimesJobs',
    url: 'https://www.timesjobs.com/candidate/job-search.html',
    selectors: {
      jobList: '.job-bx',
      title: '.joblist-comp-name, .job-title',
      salary: '.salary, .job-salary',
      waitFor: '.job-bx'
    }
  }
};

class ProductionJobScraper {
  constructor(siteName = 'local') {
    this.browser = null;
    this.page = null;
    this.config = SITE_CONFIGS[siteName] || SITE_CONFIGS.local;
    this.siteName = siteName;
  }

  log(type, message) {
    const colors = {
      success: '\x1b[32m✅',
      error: '\x1b[31m❌',
      info: '\x1b[34mℹ️ ',
      step: '\x1b[36m🔍',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]} ${message}${colors.reset}`);
  }

  async initialize() {
    this.log('step', 'Initializing Puppeteer browser...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ],
      defaultViewport: null
    });

    this.page = await this.browser.newPage();
    
    // Set realistic headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    this.log('success', 'Browser initialized successfully');
  }

  async navigateToSite() {
    this.log('step', `Navigating to ${this.config.name}: ${this.config.url}`);
    
    try {
      await this.page.goto(this.config.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      this.log('success', `Successfully loaded ${this.config.name}`);
      
      // Wait for job listings
      try {
        this.log('step', 'Waiting for job listings to load...');
        await this.page.waitForSelector(this.config.selectors.waitFor, { timeout: 10000 });
        this.log('success', 'Job listings detected');
      } catch (waitError) {
        this.log('info', 'Primary selector not found, continuing with extraction...');
      }
      
      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true;
    } catch (error) {
      this.log('error', `Failed to navigate to site: ${error.message}`);
      return false;
    }
  }

  async extractJobs() {
    this.log('step', 'Extracting job data...');
    
    try {
      // Get page content for debugging
      const pageTitle = await this.page.title();
      this.log('info', `Page title: ${pageTitle}`);

      // Try multiple selector strategies
      const selectorStrategies = [
        this.config.selectors.jobList,
        '.job, .job-item, .job-card, .job-listing',
        '[class*="job"], [id*="job"]',
        'div[data-jk], div[data-job]', // Indeed specific
        'table tr', // Government sites
        'li, div' // Fallback to generic elements
      ];

      let jobElements = [];
      let usedSelector = '';

      for (const selector of selectorStrategies) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            jobElements = elements;
            usedSelector = selector;
            this.log('success', `Found ${elements.length} elements using: ${selector}`);
            break;
          }
        } catch (err) {
          // Continue with next selector
        }
      }

      if (jobElements.length === 0) {
        this.log('error', 'No job elements found with any selector strategy');
        return [];
      }

      // Extract job data with multiple extraction strategies
      const jobs = await this.page.evaluate((elements, config, usedSelector) => {
        const extractedJobs = [];

        // Helper function to extract text from element using multiple selectors
        function extractText(element, selectors) {
          if (typeof selectors === 'string') selectors = [selectors];
          
          for (const selector of selectors) {
            try {
              const el = element.querySelector(selector);
              if (el && el.textContent?.trim()) {
                return el.textContent.trim();
              }
            } catch (e) {
              // Continue with next selector
            }
          }
          return '';
        }

        // Helper function to extract salary patterns
        function extractSalary(text) {
          if (!text) return 'Not specified';
          
          const salaryPatterns = [
            /₹[\d,\s]+(\.?\d+)?(\s*-\s*₹?[\d,\s]+(\.?\d+)?)?\s*(per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
            /\$[\d,]+(\.?\d+)?(\s*-\s*\$?[\d,]+(\.?\d+)?)?\s*(per\s+year|per\s+month|\/year|\/month)?/gi,
            /[\d,]+(?:\.\d+)?\s*(?:-|to)\s*[\d,]+(?:\.\d+)?\s*lpa/gi,
            /[\d,]+(?:\.\d+)?\s*lpa/gi,
            /[\d,]+(?:\.\d+)?\s*lakhs?/gi,
            /rs\.?\s*[\d,]+(\.?\d+)?/gi
          ];

          for (const pattern of salaryPatterns) {
            const match = text.match(pattern);
            if (match && match[0]) {
              return match[0].trim();
            }
          }

          return 'Not specified';
        }

        elements.forEach((element, index) => {
          try {
            let title = '';
            let salary = 'Not specified';

            // Strategy 1: Use configured selectors
            if (config.selectors.title) {
              title = extractText(element, [
                config.selectors.title,
                'h1, h2, h3, h4, h5, h6',
                '.title, .job-title, .jobTitle',
                'a[href*="job"]'
              ]);
            }

            if (config.selectors.salary) {
              const salaryText = extractText(element, [
                config.selectors.salary,
                '.salary, .sal, .pay',
                '[class*="salary"], [class*="pay"]'
              ]);
              salary = extractSalary(salaryText);
            }

            // Strategy 2: If no title found, try element's own text
            if (!title || title.length < 3) {
              title = element.textContent?.trim() || '';
              
              // Clean up title - take first meaningful line
              if (title) {
                const lines = title.split('\n').map(l => l.trim()).filter(l => l.length > 3);
                if (lines.length > 0) {
                  title = lines[0];
                }
              }
            }

            // Strategy 3: If no salary found, search in full element text
            if (salary === 'Not specified') {
              salary = extractSalary(element.textContent || '');
            }

            // Debug logging
            console.log(`Processing element ${index}: title="${title}", salary="${salary}"`);

            // Only add if we have a meaningful title
            if (title && title.length > 3 && title.length < 300) {
              // Remove common noise words
              title = title.replace(/^(job|position|vacancy|opening):/i, '').trim();
              
              extractedJobs.push({
                title: title.substring(0, 200),
                salary: salary
              });
              
              console.log(`Added job: ${title}`);
            } else {
              console.log(`Skipped element ${index}: title too short or empty`);
            }

          } catch (err) {
            console.log(`Error processing element ${index}:`, err.message);
          }
        });

        return extractedJobs;
      }, jobElements, this.config, usedSelector);

      // Remove duplicates
      const uniqueJobs = this.removeDuplicates(jobs);
      
      this.log('success', `Jobs found: ${uniqueJobs.length}`);
      
      if (uniqueJobs.length > 0) {
        this.log('info', `Sample job: ${JSON.stringify(uniqueJobs[0], null, 2)}`);
      }

      return uniqueJobs;

    } catch (error) {
      this.log('error', `Error extracting jobs: ${error.message}`);
      return [];
    }
  }

  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = job.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async saveResults(jobs) {
    const filename = `scraped-jobs-${this.siteName}-${Date.now()}.json`;
    const output = {
      scrapeDate: new Date().toISOString(),
      site: this.config.name,
      sourceUrl: this.config.url,
      totalJobs: jobs.length,
      jobs: jobs
    };

    try {
      await fs.writeFile(filename, JSON.stringify(output, null, 2));
      this.log('success', `Results saved to: ${filename}`);
      return filename;
    } catch (error) {
      this.log('error', `Failed to save results: ${error.message}`);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      this.log('step', 'Closing browser...');
      await this.browser.close();
      this.log('success', 'Browser closed');
    }
  }

  async scrape() {
    console.log('\n' + '='.repeat(70));
    console.log(`🤖 PRODUCTION JOB SCRAPER - ${this.config.name.toUpperCase()}`);
    console.log('='.repeat(70));

    try {
      await this.initialize();
      
      const navSuccess = await this.navigateToSite();
      if (!navSuccess) {
        throw new Error('Failed to navigate to site');
      }

      const jobs = await this.extractJobs();
      
      if (jobs.length === 0) {
        this.log('error', 'No jobs extracted');
        return [];
      }

      // Display results
      console.log('\n' + '-'.repeat(50));
      this.log('step', 'EXTRACTED JOBS:');
      console.log('-'.repeat(50));
      
      jobs.slice(0, 5).forEach((job, index) => {
        console.log(`${index + 1}. "${job.title}"`);
        console.log(`   Salary: ${job.salary}\n`);
      });

      if (jobs.length > 5) {
        console.log(`... and ${jobs.length - 5} more jobs\n`);
      }

      await this.saveResults(jobs);

      console.log('='.repeat(70));
      this.log('success', `SCRAPING COMPLETED! Extracted ${jobs.length} jobs from ${this.config.name}`);
      console.log('='.repeat(70));

      return jobs;

    } catch (error) {
      this.log('error', `Scraping failed: ${error.message}`);
      return [];
    } finally {
      await this.close();
    }
  }
}

// Main execution
async function main() {
  const siteName = process.argv[2] || 'local';
  
  console.log('🎯 Available sites:');
  Object.keys(SITE_CONFIGS).forEach(key => {
    const indicator = key === siteName ? '👉' : '  ';
    console.log(`${indicator} ${key} - ${SITE_CONFIGS[key].name}`);
  });

  if (!SITE_CONFIGS[siteName]) {
    console.log(`\n❌ Unknown site: ${siteName}`);
    console.log('Use: node scrape-production.js [local|naukri|indeed|timesjobs]');
    process.exit(1);
  }

  const scraper = new ProductionJobScraper(siteName);
  const jobs = await scraper.scrape();
  
  process.exit(jobs.length > 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProductionJobScraper, SITE_CONFIGS };