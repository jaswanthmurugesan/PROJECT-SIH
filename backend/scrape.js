#!/usr/bin/env node

/**
 * Simple Job Scraper - Extract Job Titles and Salaries
 * 
 * This script uses Puppeteer to scrape job listings and extract only:
 * - Job Title
 * - Salary (with fallback to "Not specified")
 * 
 * Compatible with Puppeteer v20+ and runs in headful mode for visibility.
 * 
 * Usage: node scrape.js
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

class JobScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    // Updated to use Indeed for better results - you can change this
    this.targetUrl = 'https://www.indeed.com/jobs?q=software+engineer&l=India';
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
      defaultViewport: null // Use full window size
    });

    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    logSuccess('Browser initialized successfully');
  }

  async navigateToJobSite() {
    logStep(`Navigating to job site: ${this.targetUrl}`);
    
    try {
      await this.page.goto(this.targetUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      logSuccess('Successfully loaded job site');
      
      // Wait for Indeed's job listings to load
      try {
        logStep('Waiting for job listings to load...');
        await this.page.waitForSelector('.jobsearch-SerpJobCard, .job_seen_beacon', { timeout: 10000 });
        logSuccess('Job listings detected');
      } catch (waitError) {
        logStep('Primary selectors not found, trying alternative approach...');
        // Wait for any content to load
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true;
    } catch (error) {
      logError(`Failed to navigate to job site: ${error.message}`);
      return false;
    }
  }

  async extractJobData() {
    logStep('Extracting job titles and salaries...');
    
    try {
      // Wait for job listings to be present - Updated for Indeed
      const jobSelectors = [
        '.jobsearch-SerpJobCard',     // Indeed job cards
        '.job_seen_beacon',           // Indeed alternative
        '.slider_container .slider_item', // Indeed carousel
        '.job-tile',                  // Generic fallback
        '.job-card',                  // Generic fallback
        '.job-listing',               // Generic fallback
        '.vacancy-item',              // Government sites
        '.job-item',                  // Generic fallback
        '[class*="job"]',             // Any element with "job" in class
        '[class*="vacancy"]'          // Any element with "vacancy" in class
      ];

      let jobElements = [];
      
      // Try different selectors to find job listings
      for (const selector of jobSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          jobElements = await this.page.$$(selector);
          if (jobElements.length > 0) {
            logInfo(`Found job elements using selector: ${selector}`);
            break;
          }
        } catch (err) {
          // Continue trying other selectors
        }
      }

      // If no specific job elements found, try extracting from common patterns
      if (jobElements.length === 0) {
        logStep('No specific job elements found, trying generic extraction...');
        
        // Look for table rows (common in government job sites)
        const tableRows = await this.page.$$('table tr');
        if (tableRows.length > 1) {
          jobElements = tableRows.slice(1); // Skip header row
          logInfo(`Found ${jobElements.length} table rows to process`);
        } else {
          // Look for any elements with text that might be job titles
          jobElements = await this.page.$$('h1, h2, h3, h4, h5, h6, .title, .heading, strong, b');
        }
      }

      logInfo(`Found ${jobElements.length} potential job elements`);

      if (jobElements.length === 0) {
        logError('No job elements found on the page');
        return [];
      }

      // Extract job data from elements
      const jobs = await this.page.evaluate((elements) => {
        const extractedJobs = [];

        // Helper function to parse salary from text (inline version)
        function parseSalaryFromText(text) {
          if (!text || typeof text !== 'string') {
            return 'Not specified';
          }

          const salaryText = text.toLowerCase();
          
          // Check for common "not specified" indicators
          const noSalaryIndicators = [
            'not specified', 'not mentioned', 'competitive', 'negotiable', 
            'as per norms', 'as per rules', 'govt scales', 'government scale'
          ];

          for (const indicator of noSalaryIndicators) {
            if (salaryText.includes(indicator)) {
              return 'Not specified';
            }
          }

          // Common salary patterns to look for - Updated with more formats
          const salaryPatterns = [
            // Indian Rupee patterns
            /₹[\d,\s]+(\.?\d+)?(\s*-\s*₹?[\d,\s]+(\.?\d+)?)?\s*(per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
            /rs\.?\s*[\d,]+(\.?\d+)?(\s*-\s*rs\.?\s*[\d,]+(\.?\d+)?)?\s*(per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
            
            // US Dollar patterns
            /\$[\d,]+(\.?\d+)?(\s*-\s*\$?[\d,]+(\.?\d+)?)?\s*(per\s+year|per\s+month|\/year|\/month|annually|monthly)?/gi,
            /USD\s*[\d,]+(\.?\d+)?(\s*-\s*USD\s*[\d,]+(\.?\d+)?)?/gi,
            
            // LPA and Lakhs patterns
            /[\d,]+(?:\.\d+)?\s*(?:-|to)\s*[\d,]+(?:\.\d+)?\s*lpa/gi,
            /[\d,]+(?:\.\d+)?\s*lpa/gi,
            /[\d,]+(?:\.\d+)?\s*(?:-|to)\s*[\d,]+(?:\.\d+)?\s*lakhs?/gi,
            /[\d,]+(?:\.\d+)?\s*lakhs?/gi,
            
            // General salary keywords
            /salary:?\s*[$₹]?[\d,\s]+(\.?\d+)?(\s*-\s*[$₹]?[\d,\s]+(\.?\d+)?)?\s*(per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
            
            // Hourly rates
            /\$[\d,]+(\.?\d+)?\s*\/?\s*(hr|hour|hourly)/gi,
            /₹[\d,]+(\.?\d+)?\s*\/?\s*(hr|hour|hourly)/gi,
            
            // Range patterns without currency symbols
            /\b[\d,]+\s*-\s*[\d,]+\s*(thousands?|k|K)\b/gi
          ];
          
          for (const pattern of salaryPatterns) {
            const match = text.match(pattern);
            if (match && match[0]) {
              return match[0].trim();
            }
          }

          return 'Not specified';
        }

        // Convert NodeList to Array if needed
        const elementsArray = Array.from(elements);

        elementsArray.forEach((element, index) => {
          try {
            let title = '';
            let salary = 'Not specified';

            // Strategy 1: Handle Indeed job cards specifically
            if (element.classList.contains('jobsearch-SerpJobCard') || element.classList.contains('job_seen_beacon')) {
              // Indeed specific selectors
              const titleEl = element.querySelector('h2.jobTitle a span, .jobTitle a span, h2 a span[title]');
              if (titleEl) {
                title = titleEl.getAttribute('title') || titleEl.textContent?.trim() || '';
              }
              
              // Indeed salary selectors
              const salaryEl = element.querySelector('.salaryText, .salary-snippet, .estimated-salary');
              if (salaryEl) {
                salary = parseSalaryFromText(salaryEl.textContent?.trim() || '');
              }
            }
            // Strategy 2: Handle table rows (for government sites)
            else if (element.tagName === 'TR') {
              const cells = element.querySelectorAll('td');
              if (cells.length >= 1) {
                title = cells[0]?.textContent?.trim() || '';
                // Look for salary in any cell
                for (let i = 1; i < cells.length; i++) {
                  const cellText = cells[i]?.textContent?.trim() || '';
                  const extractedSalary = parseSalaryFromText(cellText);
                  if (extractedSalary !== 'Not specified') {
                    salary = extractedSalary;
                    break;
                  }
                }
              }
            }
            // Strategy 3: Generic extraction for other sites
            else {
              // Try common title selectors
              const titleSelectors = [
                'h2 a', 'h3 a', '.title', '.job-title', '.jobTitle',
                'h2', 'h3', 'h4', '.heading', '[class*="title"]'
              ];
              
              for (const titleSelector of titleSelectors) {
                const titleEl = element.querySelector(titleSelector);
                if (titleEl && titleEl.textContent?.trim()) {
                  title = titleEl.textContent.trim();
                  break;
                }
              }
              
              // If still no title, use element text
              if (!title) {
                title = element.textContent?.trim() || '';
              }
            }

            // Strategy 4: Look for salary in the same element or nearby if not found
            if (salary === 'Not specified') {
              const parentElement = element.closest('div, tr, li') || element;
              const textContent = (element.textContent + ' ' + parentElement.textContent);
              salary = parseSalaryFromText(textContent);
            }

            // Clean up title - remove extra whitespace and limit length
            title = title.replace(/\s+/g, ' ').trim();
            
            // Only include if we have a meaningful title
            if (title && title.length > 3 && title.length < 200) {
              extractedJobs.push({
                title: title,
                salary: salary
              });
            }

          } catch (err) {
            console.log(`Error processing element ${index}:`, err.message);
          }
        });

        return extractedJobs;
      }, jobElements);

      // Remove duplicates based on title
      const uniqueJobs = [];
      const seenTitles = new Set();

      jobs.forEach(job => {
        const normalizedTitle = job.title.toLowerCase().trim();
        if (!seenTitles.has(normalizedTitle)) {
          seenTitles.add(normalizedTitle);
          uniqueJobs.push(job);
        }
      });

      logSuccess(`Jobs found: ${uniqueJobs.length}`);

      // Show sample extracted job if any found
      if (uniqueJobs.length > 0) {
        logInfo(`Sample extracted job: ${JSON.stringify(uniqueJobs[0], null, 2)}`);
      }

      return uniqueJobs;

    } catch (error) {
      logError(`Error extracting job data: ${error.message}`);
      return [];
    }
  }

  async saveToFile(jobs, filename = 'scraped-jobs.json') {
    try {
      const outputPath = path.join(process.cwd(), filename);
      
      const output = {
        scrapeDate: new Date().toISOString(),
        totalJobs: jobs.length,
        sourceUrl: this.targetUrl,
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

  async scrapeJobs() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 JOB SCRAPER - TITLE & SALARY EXTRACTION');
    console.log('='.repeat(60));

    try {
      // Initialize browser
      await this.initialize();

      // Navigate to job site
      const navigationSuccess = await this.navigateToJobSite();
      if (!navigationSuccess) {
        throw new Error('Failed to navigate to job site');
      }

      // Extract job data
      const jobs = await this.extractJobData();

      if (jobs.length === 0) {
        logError('No jobs were extracted from the page');
        return [];
      }

      // Display results
      console.log('\n' + '-'.repeat(60));
      logStep('EXTRACTED JOBS:');
      console.log('-'.repeat(60));
      
      jobs.forEach((job, index) => {
        console.log(`${index + 1}. Title: "${job.title}"`);
        console.log(`   Salary: "${job.salary}"\n`);
      });

      // Save to file
      console.log('-'.repeat(60));
      await this.saveToFile(jobs);

      console.log('\n' + '='.repeat(60));
      logSuccess(`SCRAPING COMPLETED! Extracted ${jobs.length} jobs.`);
      console.log('='.repeat(60));

      return jobs;

    } catch (error) {
      logError(`Scraping failed: ${error.message}`);
      return [];
    } finally {
      // Always close browser
      await this.close();
    }
  }
}

// Advanced salary parser for better extraction
function parseSalary(text) {
  if (!text || typeof text !== 'string') {
    return 'Not specified';
  }

  const salaryText = text.toLowerCase();
  
  // Check for common "not specified" indicators
  const noSalaryIndicators = [
    'not specified', 'not mentioned', 'competitive', 'negotiable', 
    'as per norms', 'as per rules', 'govt scales', 'government scale'
  ];

  for (const indicator of noSalaryIndicators) {
    if (salaryText.includes(indicator)) {
      return 'Not specified';
    }
  }

  // Enhanced salary patterns
  const patterns = [
    // INR with symbols
    /₹\s*[\d,]+(\.?\d+)?\s*(?:-|to)\s*₹?\s*[\d,]+(\.?\d+)?\s*(?:per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
    /₹\s*[\d,]+(\.?\d+)?\s*(?:per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
    
    // RS format
    /rs\.?\s*[\d,]+(\.?\d+)?\s*(?:-|to)\s*rs\.?\s*[\d,]+(\.?\d+)?\s*(?:per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
    /rs\.?\s*[\d,]+(\.?\d+)?\s*(?:per\s+annum|per\s+month|\/year|\/month|p\.a\.|p\.m\.)?/gi,
    
    // LPA format
    /[\d,]+(?:\.\d+)?\s*(?:-|to)\s*[\d,]+(?:\.\d+)?\s*lpa/gi,
    /[\d,]+(?:\.\d+)?\s*lpa/gi,
    
    // Lakhs format
    /[\d,]+(?:\.\d+)?\s*(?:-|to)\s*[\d,]+(?:\.\d+)?\s*lakhs?/gi,
    /[\d,]+(?:\.\d+)?\s*lakhs?/gi
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }

  return 'Not specified';
}

// Main execution
async function main() {
  try {
    const scraper = new JobScraper();
    const jobs = await scraper.scrapeJobs();
    
    if (jobs.length > 0) {
      process.exit(0);
    } else {
      logError('No jobs were extracted');
      process.exit(1);
    }
  } catch (error) {
    logError(`Critical error: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Scraping interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logError(`Unhandled Promise Rejection: ${err.message}`);
  process.exit(1);
});

// Run the scraper if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { JobScraper, parseSalary };