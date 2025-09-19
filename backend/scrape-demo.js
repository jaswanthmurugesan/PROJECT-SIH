#!/usr/bin/env node

/**
 * Demo Job Scraper - Extract Job Titles and Salaries
 * 
 * This is a simplified demo version that shows the core functionality.
 * You can easily adapt the selectors to work with any job site.
 * 
 * Usage: node scrape-demo.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

class DemoJobScraper {
  async scrapeJobs() {
    console.log('🚀 Demo Job Scraper Starting...\n');
    
    let browser;
    try {
      // Launch browser in headful mode
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--window-size=1200,800']
      });

      const page = await browser.newPage();
      
      console.log('🌐 Opening job site...');
      
      // For demo, let's create a simple job data structure
      // In a real scenario, you would navigate to an actual job site
      await page.goto('data:text/html,<html><body><h1>Demo Job Portal</h1></body></html>');
      
      // Simulate job data extraction
      const demoJobs = [
        { title: "Software Engineer", salary: "₹6,00,000 - ₹10,00,000 per annum" },
        { title: "Data Analyst", salary: "₹4,50,000 per annum" },
        { title: "Product Manager", salary: "₹8,00,000 - ₹12,00,000 per annum" },
        { title: "Frontend Developer", salary: "₹5,00,000 - ₹8,00,000 per annum" },
        { title: "DevOps Engineer", salary: "₹7,00,000 - ₹11,00,000 per annum" },
        { title: "QA Tester", salary: "Not specified" },
        { title: "UI/UX Designer", salary: "₹4,00,000 - ₹7,00,000 per annum" },
        { title: "Backend Developer", salary: "₹6,50,000 - ₹9,50,000 per annum" }
      ];

      console.log(`✅ Jobs found: ${demoJobs.length}`);
      console.log(`📋 Sample extracted job:`, JSON.stringify(demoJobs[0], null, 2));

      // Display all extracted jobs
      console.log('\n📋 All Extracted Jobs:');
      console.log('='.repeat(50));
      
      demoJobs.forEach((job, index) => {
        console.log(`${index + 1}. Title: "${job.title}"`);
        console.log(`   Salary: "${job.salary}"\n`);
      });

      // Save to JSON file
      const output = {
        scrapeDate: new Date().toISOString(),
        totalJobs: demoJobs.length,
        sourceUrl: "Demo Job Portal",
        jobs: demoJobs
      };

      await fs.writeFile('scraped-jobs.json', JSON.stringify(output, null, 2));
      console.log('💾 Results saved to: scraped-jobs.json');

      return demoJobs;

    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    } finally {
      if (browser) {
        console.log('\n🔒 Closing browser...');
        await browser.close();
      }
    }
  }
}

// Real-world job scraper template
class RealJobScraper {
  async scrapeRealSite(url = 'https://example-job-site.com') {
    console.log('🚀 Real Job Scraper Starting...\n');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: false, // Watch the scraping happen
        defaultViewport: null,
        args: ['--window-size=1200,800']
      });

      const page = await browser.newPage();
      
      console.log(`🌐 Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      console.log('🔍 Looking for job listings...');
      
      // Wait for job listings to load - adjust these selectors for your target site
      const jobSelectors = [
        '.job-listing',     // Common class name
        '.job-card',        // Another common pattern
        '.vacancy-item',    // Government sites often use this
        '[data-job-id]',    // Data attribute pattern
        '.result-item'      // Search result pattern
      ];

      let jobElements = [];
      for (const selector of jobSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          jobElements = await page.$$(selector);
          if (jobElements.length > 0) {
            console.log(`✅ Found ${jobElements.length} jobs using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }

      if (jobElements.length === 0) {
        console.log('⚠️  No job elements found with common selectors');
        console.log('💡 You may need to adjust the selectors for your target site');
        return [];
      }

      // Extract job data
      const jobs = await page.evaluate((elements) => {
        const jobData = [];
        
        elements.forEach((element, index) => {
          try {
            // Extract title - adjust these selectors for your site
            let title = '';
            const titleSelectors = [
              '.job-title',
              '.title',
              'h1', 'h2', 'h3',
              '[class*="title"]',
              'a[href*="job"]'
            ];
            
            for (const titleSelector of titleSelectors) {
              const titleEl = element.querySelector(titleSelector);
              if (titleEl) {
                title = titleEl.textContent.trim();
                break;
              }
            }

            // Extract salary - adjust these selectors for your site
            let salary = 'Not specified';
            const salarySelectors = [
              '.salary',
              '.compensation',
              '.pay',
              '[class*="salary"]',
              '[class*="pay"]'
            ];

            for (const salarySelector of salarySelectors) {
              const salaryEl = element.querySelector(salarySelector);
              if (salaryEl) {
                salary = salaryEl.textContent.trim();
                break;
              }
            }

            // If no specific salary element, look for salary patterns in text
            if (salary === 'Not specified') {
              const text = element.textContent;
              const salaryPatterns = [
                /₹[\d,\s]+(\.?\d+)?(\s*-\s*₹?[\d,\s]+(\.?\d+)?)?/g,
                /\$[\d,]+(\.?\d+)?(\s*-\s*\$?[\d,]+(\.?\d+)?)?/g,
                /[\d,]+\s*(lpa|lakhs?)/gi
              ];

              for (const pattern of salaryPatterns) {
                const match = text.match(pattern);
                if (match) {
                  salary = match[0];
                  break;
                }
              }
            }

            if (title && title.length > 3) {
              jobData.push({ title, salary });
            }

          } catch (err) {
            console.log(`Error processing job ${index}:`, err.message);
          }
        });

        return jobData;
      }, jobElements);

      console.log(`✅ Jobs found: ${jobs.length}`);
      
      if (jobs.length > 0) {
        console.log(`📋 Sample extracted job:`, JSON.stringify(jobs[0], null, 2));
        
        // Save results
        const output = {
          scrapeDate: new Date().toISOString(),
          totalJobs: jobs.length,
          sourceUrl: url,
          jobs: jobs
        };

        await fs.writeFile('real-scraped-jobs.json', JSON.stringify(output, null, 2));
        console.log('💾 Results saved to: real-scraped-jobs.json');
      }

      return jobs;

    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    } finally {
      if (browser) {
        console.log('\n🔒 Closing browser...');
        await browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🎯 Job Scraper Demo\n');
  console.log('Choose scraping mode:');
  console.log('1. Demo mode (shows sample data)');
  console.log('2. Real site mode (customize for your target site)');
  
  // For this demo, we'll run the demo mode
  // To use real mode, uncomment the lines below and provide a real URL
  
  console.log('\n🚀 Running Demo Mode...\n');
  const demoScraper = new DemoJobScraper();
  const demoJobs = await demoScraper.scrapeJobs();
  
  console.log(`\n✅ Demo completed! Extracted ${demoJobs.length} jobs.`);
  
  // Uncomment these lines to test with a real job site:
  /*
  console.log('\n🚀 Running Real Site Mode...\n');
  const realScraper = new RealJobScraper();
  const realJobs = await realScraper.scrapeRealSite('https://your-target-job-site.com');
  console.log(`\n✅ Real scraping completed! Extracted ${realJobs.length} jobs.`);
  */
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DemoJobScraper, RealJobScraper };