const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const mongoose = require('mongoose');
const NCSJob = require('../models/NCSJob');
const IndustrySkills = require('../models/IndustrySkills');

class NCSWebScraper {
  constructor() {
    this.baseUrl = 'https://www.ncs.gov.in';
    this.browser = null;
    this.page = null;
    
    // Skill extraction patterns
    this.skillPatterns = [
      // Technical skills
      /\b(JavaScript|Java|Python|React|Node\.js|Angular|Vue\.js|HTML|CSS|SQL|MongoDB|MySQL|PostgreSQL|AWS|Azure|Docker|Kubernetes|Git|Jenkins|Linux|Windows|MacOS)\b/gi,
      // Soft skills
      /\b(Communication|Leadership|Team\s*work|Problem\s*solving|Time\s*management|Critical\s*thinking|Creativity|Adaptability|Collaboration|Presentation)\b/gi,
      // Language skills
      /\b(English|Hindi|Tamil|Telugu|Bengali|Marathi|Gujarati|Kannada|Malayalam|Punjabi|Urdu|Oriya)\b/gi,
      // Domain skills
      /\b(Marketing|Sales|Finance|Accounting|HR|Operations|Project\s*management|Digital\s*marketing|SEO|Content\s*writing|Graphic\s*design)\b/gi
    ];
    
    // Location patterns for Indian states and cities
    this.locationPatterns = [
      /\b(Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Thane|Bhopal|Visakhapatnam|Pimpri|Patna|Vadodara|Ghaziabad|Ludhiana|Coimbatore|Agra|Madurai|Nashik)\b/gi,
      /\b(Maharashtra|Karnataka|Tamil\s*Nadu|Andhra\s*Pradesh|Telangana|Gujarat|Rajasthan|West\s*Bengal|Uttar\s*Pradesh|Madhya\s*Pradesh|Bihar|Odisha|Kerala|Punjab|Haryana|Jharkhand|Assam|Chhattisgarh|Uttarakhand|Himachal\s*Pradesh|Tripura|Meghalaya|Manipur|Nagaland|Goa|Arunachal\s*Pradesh|Mizoram|Sikkim)\b/gi
    ];
  }

  async initialize() {
    try {
      console.log('🚀 Initializing NCS Web Scraper...');
      this.browser = await puppeteer.launch({
        headless: false, // Set to false for debugging to see browser actions
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1366, height: 768 });
      
      // Set longer timeout for slow networks
      this.page.setDefaultTimeout(30000);
      
      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async scrapeJobListings(searchParams = {}) {
    try {
      console.log('🔍 Starting job listings scrape...');
      
      if (!this.page) {
        await this.initialize();
      }

      let allJobs = [];
      let currentPage = 1;
      const maxPages = 5; // Limit to 5 pages for demo

      // Navigate to NCS job search page
      console.log('🌐 Navigating to NCS job search page...');
      await this.page.goto(`${this.baseUrl}/Pages/Search.aspx`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the search form to load
      try {
        console.log('⏳ Waiting for search form to load...');
        await this.page.waitForSelector('#ctl00_SPWebPartManager1_g_0e3d64c4_58de_4b80_8c69_b62f4c8fcb1a_ctl00_txtKeyword', { 
          timeout: 10000 
        });
        console.log('✅ Search form loaded successfully');
      } catch (error) {
        console.log('⚠️ Search form not found, trying alternative approach...');
        
        // Try looking for any job listing containers
        try {
          await this.page.waitForSelector('.job-tile, .job-card, .vacancy-item, .listing-item', { 
            timeout: 5000 
          });
          console.log('✅ Found job listing elements');
        } catch (altError) {
          console.log('⚠️ No job listing elements found, proceeding with page analysis...');
        }
      }

      // Perform a general search to get all available jobs
      console.log('🔍 Performing job search...');
      try {
        // Try to click search button or perform search
        const searchButton = await this.page.$('#ctl00_SPWebPartManager1_g_0e3d64c4_58de_4b80_8c69_b62f4c8fcb1a_ctl00_btnSearch');
        if (searchButton) {
          console.log('🔘 Clicking search button...');
          await searchButton.click();
          
          // Wait for results to load
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (searchError) {
        console.log('⚠️ Search button not found, proceeding with current page content...');
      }

      // Pagination loop
      while (currentPage <= maxPages) {
        console.log(`📄 Scraping page ${currentPage}...`);
        
        const pageJobs = await this.extractJobsFromCurrentPage();
        console.log(`✅ Jobs found on page ${currentPage}: ${pageJobs.length}`);
        
        allJobs = allJobs.concat(pageJobs);

        // Try to navigate to next page
        const hasNextPage = await this.navigateToNextPage();
        if (!hasNextPage) {
          console.log('📄 No more pages available');
          break;
        }
        
        currentPage++;
        console.log('🔄 Navigating to next page...');
        
        // Wait between page requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log(`🎯 Scraping completed: Total jobs = ${allJobs.length}`);
      return allJobs;

    } catch (error) {
      console.error('❌ Error scraping job listings:', error);
      return [];
    }
  }

  async extractJobsFromCurrentPage() {
    try {
      // Wait for potential job listings to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      const jobs = await this.page.evaluate(() => {
        const jobElements = [];
        
        // Helper function to extract industry from text (inline version)
        function extractIndustryFromText(text) {
          try {
            const textLower = text.toLowerCase();
            
            // Industry keyword mapping
            const industryKeywords = {
              'Information Technology': ['software', 'developer', 'programmer', 'it', 'tech', 'computer', 'coding', 'web', 'app', 'system', 'data'],
              'Healthcare': ['medical', 'hospital', 'nurse', 'doctor', 'health', 'clinical', 'patient', 'pharmacy', 'medicine'],
              'Education': ['teacher', 'professor', 'education', 'school', 'university', 'college', 'academic', 'instructor', 'training'],
              'Finance': ['bank', 'finance', 'accounting', 'financial', 'investment', 'insurance', 'audit', 'credit', 'loan'],
              'Manufacturing': ['production', 'manufacturing', 'factory', 'industrial', 'assembly', 'quality', 'engineer', 'mechanical'],
              'Construction': ['construction', 'building', 'civil', 'architect', 'contractor', 'infrastructure', 'project'],
              'Retail': ['sales', 'retail', 'customer', 'store', 'marketing', 'business', 'commerce', 'merchant'],
              'Transportation': ['driver', 'transport', 'logistics', 'delivery', 'shipping', 'supply', 'warehouse'],
              'Agriculture': ['agriculture', 'farming', 'rural', 'crop', 'livestock', 'agricultural', 'farm'],
              'Tourism': ['hotel', 'tourism', 'travel', 'hospitality', 'restaurant', 'food', 'service'],
              'Public Administration': ['government', 'administration', 'public', 'civil', 'municipal', 'state', 'central'],
              'Security': ['security', 'police', 'guard', 'safety', 'protection', 'enforcement', 'surveillance']
            };
            
            // Find matching industry
            for (const [industry, keywords] of Object.entries(industryKeywords)) {
              for (const keyword of keywords) {
                if (textLower.includes(keyword)) {
                  return industry;
                }
              }
            }
            
            return 'General'; // Default fallback
          } catch (error) {
            console.log('Error extracting industry:', error);
            return 'General';
          }
        }
        
        // Helper function to extract skills from text (inline version)
        function extractSkillsFromText(text) {
          try {
            const skillPatterns = {
              required: [
                /\b(?:graduate|degree|diploma|certification)\b/gi,
                /\b(?:experience|years|background)\b/gi,
                /\b(?:knowledge|skills|proficiency)\b/gi
              ],
              preferred: [
                /\b(?:preferred|desirable|advantageous|plus)\b/gi,
                /\b(?:additional|extra|bonus)\b/gi
              ]
            };
            
            const required = [];
            const preferred = [];
            
            // Extract basic requirements
            if (text.toLowerCase().includes('graduate')) required.push('Graduate degree');
            if (text.toLowerCase().includes('computer')) required.push('Computer literacy');
            if (text.toLowerCase().includes('communication')) required.push('Communication skills');
            if (text.toLowerCase().includes('english')) required.push('English proficiency');
            
            // Add default skills if none found
            if (required.length === 0) {
              required.push('Basic education', 'Communication skills');
            }
            
            return { required, preferred };
          } catch (error) {
            console.log('Error extracting skills:', error);
            return { required: ['Basic education'], preferred: [] };
          }
        }
        
        // Multiple selector strategies for different NCS page layouts
        const selectors = [
          // Common job listing patterns
          '.job-tile',
          '.job-card', 
          '.vacancy-item',
          '.listing-item',
          '.search-result-item',
          '[class*="job"]',
          '[class*="vacancy"]',
          '[class*="listing"]',
          // Table row patterns
          'tr[class*="row"]',
          'tr[class*="item"]',
          // Div patterns
          'div[class*="result"]',
          'div[class*="item"]',
          // List patterns
          'li[class*="job"]',
          'li[class*="vacancy"]'
        ];

        let foundElements = [];
        
        // Try each selector pattern
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`Found ${elements.length} elements with selector: ${selector}`);
            foundElements = Array.from(elements);
            break; // Use the first successful selector
          }
        }

        // If no specific job elements found, try to find any structured content
        if (foundElements.length === 0) {
          // Look for table rows that might contain job data
          const tableRows = document.querySelectorAll('table tr');
          if (tableRows.length > 1) { // Skip header row
            foundElements = Array.from(tableRows).slice(1); // Skip first row (likely header)
          }
        }

        // If still no elements, try divs with text content
        if (foundElements.length === 0) {
          const contentDivs = document.querySelectorAll('div');
          foundElements = Array.from(contentDivs).filter(div => {
            const text = div.textContent.trim();
            return text.length > 50 && text.length < 500; // Reasonable job description length
          });
        }

        console.log(`Processing ${foundElements.length} potential job elements`);

        foundElements.forEach((element, index) => {
          try {
            // Multiple strategies to extract job information
            let title = '';
            let company = '';
            let location = '';
            let link = '';
            let description = '';

            // Strategy 1: Look for specific title patterns
            const titleSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[class*="title"]', '[class*="heading"]', '[class*="name"]', 'strong', 'b'];
            for (const sel of titleSelectors) {
              const titleEl = element.querySelector(sel);
              if (titleEl && titleEl.textContent.trim()) {
                title = titleEl.textContent.trim();
                break;
              }
            }

            // Strategy 2: Look for company information
            const companySelectors = ['[class*="company"]', '[class*="organization"]', '[class*="employer"]', '[class*="firm"]'];
            for (const sel of companySelectors) {
              const companyEl = element.querySelector(sel);
              if (companyEl && companyEl.textContent.trim()) {
                company = companyEl.textContent.trim();
                break;
              }
            }

            // Strategy 3: Look for location information
            const locationSelectors = ['[class*="location"]', '[class*="place"]', '[class*="city"]', '[class*="address"]'];
            for (const sel of locationSelectors) {
              const locationEl = element.querySelector(sel);
              if (locationEl && locationEl.textContent.trim()) {
                location = locationEl.textContent.trim();
                break;
              }
            }

            // Strategy 4: Look for links
            const linkEl = element.querySelector('a[href]');
            if (linkEl) {
              link = linkEl.href;
            }

            // Strategy 5: Extract description from element text
            description = element.textContent.trim();

            // Alternative extraction from table cells if this is a table row
            if (element.tagName === 'TR') {
              const cells = element.querySelectorAll('td');
              if (cells.length >= 2) {
                title = cells[0]?.textContent.trim() || '';
                company = cells[1]?.textContent.trim() || 'Government/Public Sector';
                location = cells[2]?.textContent.trim() || '';
                description = cells[3]?.textContent.trim() || '';
              }
            }

            // Fallback: Extract from text content patterns
            if (!title && description) {
              const lines = description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
              if (lines.length > 0) {
                title = lines[0];
                if (lines.length > 1) company = lines[1];
                if (lines.length > 2) location = lines[2];
              }
            }

            // Only add if we have meaningful data
            if (title && title.length > 3) {
              // Extract industry and skills using inline helper functions
              const extractedIndustry = extractIndustryFromText(title + ' ' + description);
              const extractedSkills = extractSkillsFromText(title + ' ' + description);
              
              jobElements.push({
                jobId: `ncs_${Date.now()}_${index}`,
                title: title.substring(0, 200), // Limit title length
                company: company || 'Government/Public Sector',
                location: location || '',
                description: description.substring(0, 1000), // Limit description length
                industry: extractedIndustry, // Required field
                skills: extractedSkills, // Required field
                sourceUrl: link || window.location.href,
                scrapedAt: new Date().toISOString()
              });
            }
          } catch (err) {
            console.log('Error processing job element:', err);
          }
        });

        return jobElements;
      });

      return jobs;
    } catch (error) {
      console.error('❌ Error extracting jobs from page:', error);
      return [];
    }
  }

  async navigateToNextPage() {
    try {
      console.log('🔍 Looking for Next button...');
      
      // Use XPath to find Next button with text content
      const nextButtonXPaths = [
        "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
        "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
        "//input[@value and contains(translate(@value, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'next')]",
        "//a[contains(@title, 'Next') or contains(@title, 'next')]",
        "//a[contains(@class, 'next') or contains(@class, 'Next')]"
      ];

      for (const xpath of nextButtonXPaths) {
        try {
          console.log(`🔍 Trying XPath: ${xpath}`);
          const nextButtons = await this.page.$x(xpath);
          
          if (nextButtons.length > 0) {
            console.log(`✅ Found ${nextButtons.length} potential Next button(s)`);
            
            // Check each button to find an enabled one
            for (let i = 0; i < nextButtons.length; i++) {
              const button = nextButtons[i];
              
              // Check if button is enabled
              const isDisabled = await this.page.evaluate((el) => {
                return el.disabled || 
                       el.classList.contains('disabled') || 
                       el.getAttribute('aria-disabled') === 'true' ||
                       el.style.display === 'none' ||
                       el.style.visibility === 'hidden' ||
                       getComputedStyle(el).display === 'none';
              }, button);

              if (!isDisabled) {
                console.log(`🔘 Found enabled Next button, clicking...`);
                
                // Scroll button into view
                await this.page.evaluate((el) => {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, button);
                
                // Wait a moment for scroll
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Click the button
                await button.click();
                
                console.log('✅ Next button clicked, waiting for page to load...');
                
                // Wait for page to load with multiple strategies
                try {
                  // Wait for network idle
                  await this.page.waitForLoadState?.('networkidle', { timeout: 10000 });
                } catch (loadError) {
                  // Fallback: wait for a reasonable time
                  await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
                console.log('📄 Successfully moved to next page');
                return true;
              } else {
                console.log(`⚠️ Next button ${i + 1} is disabled - might be last page`);
              }
            }
          }
        } catch (xpathError) {
          console.log(`⚠️ XPath ${xpath} failed:`, xpathError.message);
        }
      }

      // Additional fallback: try CSS selectors for common pagination patterns
      const fallbackSelectors = [
        '.pagination .next:not(.disabled)',
        '.paging .next:not(.disabled)',
        'a[rel="next"]',
        '.page-next',
        '.nextpage'
      ];

      for (const selector of fallbackSelectors) {
        try {
          const nextButton = await this.page.$(selector);
          if (nextButton) {
            console.log(`🔘 Found Next button with CSS selector: ${selector}`);
            await nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('📄 Successfully moved to next page (CSS fallback)');
            return true;
          }
        } catch (selectorError) {
          console.log(`⚠️ CSS selector ${selector} failed:`, selectorError.message);
        }
      }

      console.log('📄 No more pages available - pagination complete');
      return false;
    } catch (error) {
      console.error('❌ Error navigating to next page:', error);
      return false;
    }
  }

  async extractJobDetails(job) {
    try {
      // Enhanced job detail extraction
      const enhancedJob = {
        ...job,
        industry: this.extractIndustry(job.title, job.description),
        skills: this.extractSkills(job.description + ' ' + job.title),
        location: this.parseLocation(job.location),
        experienceRequired: this.extractExperience(job.description),
        education: this.extractEducation(job.description),
        salary: this.extractSalary(job.description),
        nsqfLevel: this.estimateNSQFLevel(job.title, job.description),
        isActive: true,
        lastUpdated: new Date()
      };

      return enhancedJob;
    } catch (error) {
      console.error('Error extracting job details:', error);
      return job;
    }
  }

  extractSkills(text) {
    try {
      console.log('🔧 Extracting skills from job text...');
      
      const skills = {
        required: [],
        preferred: []
      };

      // Return empty skills object if no text provided
      if (!text || typeof text !== 'string') {
        console.log('⚠️ No text provided for skill extraction, returning empty skills');
        return skills;
      }

      const cleanText = text.toLowerCase();
      let skillsFound = 0;

      this.skillPatterns.forEach((pattern, patternIndex) => {
        try {
          const matches = text.match(pattern);
          if (matches && matches.length > 0) {
            console.log(`✅ Found ${matches.length} skills with pattern ${patternIndex + 1}`);
            
            matches.forEach(skill => {
              const cleanSkill = skill.trim();
              if (cleanSkill && cleanSkill.length > 1) {
                // Check if skill already exists to avoid duplicates
                const existingSkill = skills.required.find(s => 
                  s.skillName && s.skillName.toLowerCase() === cleanSkill.toLowerCase()
                );
                
                if (!existingSkill) {
                  skills.required.push({
                    skillName: cleanSkill,
                    importance: this.determineSkillImportance(cleanSkill, cleanText)
                  });
                  skillsFound++;
                }
              }
            });
          }
        } catch (patternError) {
          console.log(`⚠️ Error with skill pattern ${patternIndex + 1}:`, patternError.message);
        }
      });

      // If no skills found, add some default based on job text
      if (skillsFound === 0) {
        console.log('⚠️ No skills found with patterns, adding default skills...');
        
        // Add basic skills based on common job requirements
        const defaultSkills = [];
        
        if (cleanText.includes('computer') || cleanText.includes('office')) {
          defaultSkills.push({ skillName: 'Computer Skills', importance: 'Medium' });
        }
        if (cleanText.includes('communication') || cleanText.includes('interact')) {
          defaultSkills.push({ skillName: 'Communication', importance: 'High' });
        }
        if (cleanText.includes('team') || cleanText.includes('group')) {
          defaultSkills.push({ skillName: 'Teamwork', importance: 'Medium' });
        }
        if (cleanText.includes('english') || cleanText.includes('language')) {
          defaultSkills.push({ skillName: 'English', importance: 'Medium' });
        }
        
        skills.required = defaultSkills;
        console.log(`✅ Added ${defaultSkills.length} default skills`);
      } else {
        console.log(`✅ Successfully extracted ${skillsFound} skills`);
      }

      return skills;
    } catch (error) {
      console.error('❌ Error extracting skills:', error);
      console.log('⚠️ Returning empty skills object due to error');
      return {
        required: [],
        preferred: []
      };
    }
  }

  extractIndustry(title, description) {
    try {
      const text = (title + ' ' + description).toLowerCase();
      console.log('🏭 Extracting industry from job text...');
      
      const industryKeywords = {
        'Information Technology': ['software', 'developer', 'programmer', 'it', 'technology', 'coding', 'web', 'app', 'digital', 'computer', 'tech', 'data', 'system', 'network'],
        'Healthcare': ['doctor', 'nurse', 'medical', 'hospital', 'healthcare', 'clinical', 'health', 'medicine', 'patient', 'treatment'],
        'Education': ['teacher', 'professor', 'education', 'training', 'academic', 'school', 'college', 'university', 'tutor', 'instructor'],
        'Manufacturing': ['production', 'manufacturing', 'factory', 'assembly', 'quality', 'industrial', 'plant', 'operations', 'process', 'machinery'],
        'Banking & Finance': ['bank', 'finance', 'accounting', 'financial', 'investment', 'loan', 'credit', 'insurance', 'audit', 'treasury'],
        'Government': ['government', 'public', 'administrative', 'civil', 'municipal', 'ministry', 'department', 'bureau', 'authority', 'commission'],
        'Sales & Marketing': ['sales', 'marketing', 'business', 'customer', 'client', 'retail', 'commerce', 'trade', 'promotion', 'advertising'],
        'Engineering': ['engineer', 'technical', 'mechanical', 'electrical', 'civil', 'structural', 'design', 'construction', 'maintenance', 'repair'],
        'Transportation': ['driver', 'transport', 'logistics', 'delivery', 'shipping', 'cargo', 'fleet', 'vehicle', 'travel', 'courier'],
        'Agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'rural', 'agricultural', 'farm', 'soil', 'harvest', 'irrigation'],
        'Hospitality': ['hotel', 'restaurant', 'hospitality', 'tourism', 'food', 'service', 'chef', 'catering', 'housekeeping', 'reception'],
        'Construction': ['construction', 'building', 'contractor', 'mason', 'carpenter', 'plumber', 'electrician', 'worker', 'labor', 'site']
      };

      for (const [industry, keywords] of Object.entries(industryKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
          console.log(`✅ Industry identified: ${industry}`);
          return industry;
        }
      }

      // If no industry matched, default to General
      console.log('⚠️ No industry keywords matched, defaulting to General');
      return 'General';
    } catch (error) {
      console.error('❌ Error extracting industry:', error);
      console.log('⚠️ Defaulting industry to General due to error');
      return 'General';
    }
  }

  parseLocation(locationText) {
    const location = {
      state: '',
      city: '',
      district: '',
      isRemote: false
    };

    if (!locationText) return location;

    const text = locationText.toLowerCase();
    
    if (text.includes('remote') || text.includes('work from home')) {
      location.isRemote = true;
    }

    // Extract state and city using patterns
    this.locationPatterns.forEach(pattern => {
      const matches = locationText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanLocation = match.trim();
          if (!location.city && this.isCityName(cleanLocation)) {
            location.city = cleanLocation;
          } else if (!location.state && this.isStateName(cleanLocation)) {
            location.state = cleanLocation;
          }
        });
      }
    });

    return location;
  }

  extractExperience(description) {
    const experienceRegex = /(\d+)[\s-]*(?:to|-)[\s]*(\d+)[\s]*years?/gi;
    const minExpRegex = /minimum[\s]*(\d+)[\s]*years?/gi;
    const expRegex = /(\d+)[\s]*years?[\s]*experience/gi;

    let match = experienceRegex.exec(description);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[2]) };
    }

    match = minExpRegex.exec(description);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[1]) + 5 };
    }

    match = expRegex.exec(description);
    if (match) {
      return { min: parseInt(match[1]), max: parseInt(match[1]) + 2 };
    }

    return { min: 0, max: 2 }; // Default for entry level
  }

  extractEducation(description) {
    const educationKeywords = {
      'PhD': ['phd', 'doctorate', 'ph.d'],
      'Post Graduate': ['master', 'mba', 'mca', 'mtech', 'm.tech', 'post graduate'],
      'Graduate': ['bachelor', 'degree', 'graduate', 'btech', 'b.tech', 'be', 'bca', 'bcom', 'ba', 'bsc'],
      'Diploma': ['diploma', 'certificate'],
      '12th Pass': ['12th', 'higher secondary', '+2', 'intermediate'],
      '10th Pass': ['10th', 'secondary', 'matriculation']
    };

    const text = description.toLowerCase();
    
    for (const [level, keywords] of Object.entries(educationKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return {
          minimumQualification: level,
          preferredQualification: level,
          fieldOfStudy: []
        };
      }
    }

    return {
      minimumQualification: '10th Pass',
      preferredQualification: 'Graduate',
      fieldOfStudy: []
    };
  }

  extractSalary(description) {
    const salaryRegex = /(?:rs\.?|inr|₹)[\s]*(\d+(?:,\d+)*(?:\.\d+)?)[\s]*(?:to|-)[\s]*(?:rs\.?|inr|₹)?[\s]*(\d+(?:,\d+)*(?:\.\d+)?)/gi;
    const singleSalaryRegex = /(?:rs\.?|inr|₹)[\s]*(\d+(?:,\d+)*(?:\.\d+)?)/gi;

    let match = salaryRegex.exec(description);
    if (match) {
      return {
        min: parseInt(match[1].replace(/,/g, '')),
        max: parseInt(match[2].replace(/,/g, '')),
        currency: 'INR',
        period: 'per month'
      };
    }

    match = singleSalaryRegex.exec(description);
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ''));
      return {
        min: amount,
        max: amount * 1.2,
        currency: 'INR',
        period: 'per month'
      };
    }

    return null;
  }

  estimateNSQFLevel(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    // NSQF level estimation based on role complexity
    if (text.includes('director') || text.includes('ceo') || text.includes('head')) {
      return 9;
    } else if (text.includes('manager') || text.includes('lead') || text.includes('senior')) {
      return 7;
    } else if (text.includes('developer') || text.includes('engineer') || text.includes('analyst')) {
      return 6;
    } else if (text.includes('assistant') || text.includes('junior') || text.includes('trainee')) {
      return 4;
    } else if (text.includes('operator') || text.includes('technician')) {
      return 3;
    }
    
    return 5; // Default mid-level
  }

  determineSkillImportance(skill, context) {
    const criticalKeywords = ['required', 'must', 'essential', 'mandatory'];
    const highKeywords = ['preferred', 'desired', 'good to have'];
    
    const contextLower = context.toLowerCase();
    const skillLower = skill.toLowerCase();
    
    // Check context around the skill
    const skillIndex = contextLower.indexOf(skillLower);
    const surroundingText = contextLower.substring(Math.max(0, skillIndex - 50), skillIndex + 50);
    
    if (criticalKeywords.some(keyword => surroundingText.includes(keyword))) {
      return 'Critical';
    } else if (highKeywords.some(keyword => surroundingText.includes(keyword))) {
      return 'High';
    }
    
    return 'Medium';
  }

  isCityName(name) {
    const majorCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow'];
    return majorCities.includes(name.toLowerCase());
  }

  isStateName(name) {
    const states = ['maharashtra', 'karnataka', 'tamil nadu', 'andhra pradesh', 'telangana', 'gujarat', 'rajasthan', 'west bengal'];
    return states.includes(name.toLowerCase());
  }

  async saveJobsToDatabase(jobs) {
    try {
      console.log(`💾 Saving ${jobs.length} jobs to database...`);
      
      // Check database connection before proceeding
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ Database not connected, attempting to reconnect...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-path-generator';
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          bufferMaxEntries: 0
        });
        console.log('✅ Database reconnected successfully');
      }
      
      let savedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const [index, jobData] of jobs.entries()) {
        try {
          console.log(`📝 Processing job ${index + 1}/${jobs.length}: "${jobData.title || 'Untitled'}"`);
          
          // Ensure all required fields have safe defaults
          const safeJobData = {
            ...jobData,
            // Ensure required fields are never null/undefined
            title: jobData.title || 'Untitled Position',
            company: jobData.company || 'Government/Public Sector',
            description: jobData.description || 'No description available',
            industry: jobData.industry || 'General',
            skills: jobData.skills || { required: [], preferred: [] },
            location: jobData.location || { state: '', city: '', district: '', isRemote: false },
            experienceRequired: jobData.experienceRequired || { min: 0, max: 2 },
            education: jobData.education || {
              minimumQualification: '10th Pass',
              preferredQualification: 'Graduate',
              fieldOfStudy: []
            },
            nsqfLevel: jobData.nsqfLevel || 5,
            isActive: jobData.isActive !== undefined ? jobData.isActive : true,
            lastUpdated: new Date(),
            scrapedAt: jobData.scrapedAt || new Date().toISOString(),
            sourceUrl: jobData.sourceUrl || 'https://www.ncs.gov.in'
          };

          // Additional safety checks for nested objects
          if (!safeJobData.skills.required) {
            console.log('⚠️ Missing skills.required, adding empty array');
            safeJobData.skills.required = [];
          }
          
          if (!safeJobData.skills.preferred) {
            console.log('⚠️ Missing skills.preferred, adding empty array');
            safeJobData.skills.preferred = [];
          }

          if (typeof safeJobData.location === 'string') {
            console.log('⚠️ Location is string, converting to object');
            safeJobData.location = {
              state: safeJobData.location,
              city: '',
              district: '',
              isRemote: false
            };
          }

          // Validate jobId exists
          if (!safeJobData.jobId) {
            safeJobData.jobId = `ncs_${Date.now()}_${index}`;
            console.log(`⚠️ Missing jobId, generated: ${safeJobData.jobId}`);
          }

          console.log(`✅ Job data validated - Industry: ${safeJobData.industry}, Skills: ${safeJobData.skills.required.length} required`);

          // Use explicit timeout for individual operations
          const operationTimeout = 15000; // 15 seconds per operation
          
          // Check if job already exists with timeout
          const existingJob = await Promise.race([
            NCSJob.findOne({ jobId: safeJobData.jobId }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Find operation timeout')), operationTimeout)
            )
          ]);
          
          if (existingJob) {
            // Update existing job with timeout
            const updatedJob = await Promise.race([
              NCSJob.findOneAndUpdate(
                { jobId: safeJobData.jobId },
                safeJobData,
                { new: true, runValidators: true }
              ),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Update operation timeout')), operationTimeout)
              )
            ]);
            updatedCount++;
            console.log(`🔄 Updated existing job: ${safeJobData.title}`);
          } else {
            // Create new job with timeout
            const job = new NCSJob(safeJobData);
            await Promise.race([
              job.save(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Save operation timeout')), operationTimeout)
              )
            ]);
            savedCount++;
            console.log(`💾 Saved new job: ${safeJobData.title}`);
          }
        } catch (jobError) {
          errorCount++;
          console.error(`❌ Error saving job ${index + 1} "${jobData.title || 'Unknown'}":`, jobError.message);
          
          // Log specific timeout errors
          if (jobError.message.includes('timeout') || jobError.message.includes('buffering timed out')) {
            console.error('🕐 Database operation timed out - check MongoDB connection and performance');
          }
          
          // Log validation errors in detail
          if (jobError.name === 'ValidationError') {
            console.error('📋 Validation errors:');
            Object.keys(jobError.errors).forEach(field => {
              console.error(`  - ${field}: ${jobError.errors[field].message}`);
            });
          }
        }
      }

      const totalProcessed = savedCount + updatedCount + errorCount;
      console.log(`✅ Database operation completed:`);
      console.log(`  📊 Total processed: ${totalProcessed}/${jobs.length}`);
      console.log(`  💾 New jobs saved: ${savedCount}`);
      console.log(`  🔄 Jobs updated: ${updatedCount}`);
      console.log(`  ❌ Errors: ${errorCount}`);

      return { saved: savedCount, updated: updatedCount, errors: errorCount };
    } catch (error) {
      console.error('❌ Critical error in saveJobsToDatabase:', error);
      
      // Check if it's a connection error
      if (error.message.includes('buffering timed out') || error.message.includes('connection')) {
        console.error('🔗 Database connection issue detected:');
        console.error('   - Check if MongoDB is running');
        console.error('   - Verify connection string in .env');
        console.error('   - For Atlas: check IP whitelist and cluster status');
        console.error('   - Run "node test-db.js" to diagnose connection');
      }
      
      return { saved: 0, updated: 0, errors: jobs.length };
    }
  }

  async updateIndustrySkills(jobs) {
    try {
      console.log('🔄 Updating industry skills database...');
      
      const industryData = {};
      
      // Group jobs by industry
      jobs.forEach(job => {
        if (!industryData[job.industry]) {
          industryData[job.industry] = {
            roles: {},
            totalJobs: 0
          };
        }
        
        industryData[job.industry].totalJobs++;
        
        if (!industryData[job.industry].roles[job.title]) {
          industryData[job.industry].roles[job.title] = {
            count: 0,
            skills: new Map(),
            salaries: [],
            nsqfLevels: [],
            experience: []
          };
        }
        
        const roleData = industryData[job.industry].roles[job.title];
        roleData.count++;
        
        // Aggregate skills
        job.skills.required.forEach(skill => {
          const current = roleData.skills.get(skill.skillName) || 0;
          roleData.skills.set(skill.skillName, current + 1);
        });
        
        // Aggregate other data
        if (job.salary) roleData.salaries.push(job.salary);
        if (job.nsqfLevel) roleData.nsqfLevels.push(job.nsqfLevel);
        if (job.experienceRequired) roleData.experience.push(job.experienceRequired);
      });
      
      // Update database
      for (const [industryName, data] of Object.entries(industryData)) {
        await this.updateIndustrySkillsRecord(industryName, data);
      }
      
      console.log('✅ Industry skills database updated');
    } catch (error) {
      console.error('❌ Error updating industry skills:', error);
    }
  }

  async updateIndustrySkillsRecord(industryName, data) {
    try {
      const roles = Object.entries(data.roles).map(([title, roleData]) => {
        // Process skills
        const skillEntries = Array.from(roleData.skills.entries());
        const totalJobsForRole = roleData.count;
        
        const requiredSkills = skillEntries
          .filter(([skill, count]) => count / totalJobsForRole >= 0.3) // Appears in 30%+ of jobs
          .map(([skill, count]) => ({
            skillName: skill,
            importance: count / totalJobsForRole >= 0.7 ? 'Critical' : 
                       count / totalJobsForRole >= 0.5 ? 'High' : 'Medium',
            proficiencyRequired: 'Intermediate',
            category: this.categorizeSkill(skill)
          }));

        // Calculate salary range
        const salaries = roleData.salaries.filter(s => s && s.min && s.max);
        const salaryRange = salaries.length > 0 ? {
          entry: {
            min: Math.min(...salaries.map(s => s.min)),
            max: Math.max(...salaries.map(s => s.max))
          },
          mid: {
            min: Math.min(...salaries.map(s => s.min)) * 1.5,
            max: Math.max(...salaries.map(s => s.max)) * 1.5
          },
          senior: {
            min: Math.min(...salaries.map(s => s.min)) * 2.5,
            max: Math.max(...salaries.map(s => s.max)) * 2.5
          },
          currency: 'INR',
          period: 'per year'
        } : null;

        // Calculate NSQF level
        const nsqfLevel = roleData.nsqfLevels.length > 0 ? 
          Math.round(roleData.nsqfLevels.reduce((a, b) => a + b, 0) / roleData.nsqfLevels.length) : 5;

        return {
          title,
          description: `${title} role in ${industryName}`,
          nsqfLevel,
          requiredSkills,
          preferredSkills: [],
          salaryRange,
          marketData: {
            demandTrend: roleData.count >= 10 ? 'High' : roleData.count >= 5 ? 'Medium' : 'Low',
            availableJobs: roleData.count,
            competitionLevel: 'Medium'
          }
        };
      });

      const industrySkills = await IndustrySkills.findOneAndUpdate(
        { industry: industryName },
        {
          industry: industryName,
          roles,
          lastUpdated: new Date(),
          dataSource: 'NCS Portal',
          scrapedJobCount: data.totalJobs
        },
        { upsert: true, new: true }
      );

      console.log(`📊 Updated ${industryName} with ${roles.length} roles`);
    } catch (error) {
      console.error(`Error updating industry ${industryName}:`, error);
    }
  }

  categorizeSkill(skill) {
    const skillLower = skill.toLowerCase();
    
    const technicalKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker'];
    const softKeywords = ['communication', 'leadership', 'teamwork', 'problem', 'time', 'critical'];
    const languageKeywords = ['english', 'hindi', 'tamil', 'telugu', 'bengali'];
    
    if (technicalKeywords.some(keyword => skillLower.includes(keyword))) {
      return 'Technical';
    } else if (softKeywords.some(keyword => skillLower.includes(keyword))) {
      return 'Soft';
    } else if (languageKeywords.some(keyword => skillLower.includes(keyword))) {
      return 'Language';
    }
    
    return 'Domain';
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }

  async performFullScrape() {
    try {
      console.log('🚀 Starting full NCS scrape...');
      
      const jobs = await this.scrapeJobListings();
      
      if (jobs.length > 0) {
        const saveResult = await this.saveJobsToDatabase(jobs);
        await this.updateIndustrySkills(jobs);
        
        console.log(`✅ Scraping completed: ${saveResult.saved} new jobs, ${saveResult.updated} updated`);
        return { success: true, jobsProcessed: jobs.length, ...saveResult };
      } else {
        console.log('⚠️ No jobs found during scraping');
        return { success: false, message: 'No jobs found' };
      }
    } catch (error) {
      console.error('❌ Full scrape failed:', error);
      return { success: false, error: error.message };
    } finally {
      await this.close();
    }
  }
}

module.exports = NCSWebScraper;