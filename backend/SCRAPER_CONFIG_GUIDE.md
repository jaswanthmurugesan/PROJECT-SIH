# Job Scraper Configuration Guide

## 🎯 Overview

This guide shows how to configure the job scraper for different job sites by adjusting selectors and extraction logic.

## 📋 Quick Start

### 1. Run Demo Mode

```bash
node scrape-demo.js
```

This shows how the scraper works with sample data.

### 2. Run Real Scraper

```bash
node scrape.js
```

This attempts to scrape a real job site (configured for NCS portal).

## 🔧 Configuring for Different Sites

### Common Job Site Patterns

#### 1. LinkedIn Jobs

```javascript
const config = {
  url: "https://www.linkedin.com/jobs/search",
  selectors: {
    jobList: ".job-search-card",
    title: ".base-search-card__title",
    salary: ".job-search-card__salary-info",
    company: ".base-search-card__subtitle",
  },
};
```

#### 2. Indeed

```javascript
const config = {
  url: "https://www.indeed.com/jobs",
  selectors: {
    jobList: ".jobsearch-SerpJobCard",
    title: "[data-jk] h2 a span",
    salary: ".salaryText",
    company: ".company",
  },
};
```

#### 3. Naukri.com

```javascript
const config = {
  url: "https://www.naukri.com/jobs",
  selectors: {
    jobList: ".jobTuple",
    title: ".title",
    salary: ".salary",
    company: ".companyInfo",
  },
};
```

#### 4. Government Job Sites (like NCS)

```javascript
const config = {
  url: "https://www.ncs.gov.in/Pages/Search.aspx",
  selectors: {
    jobList: "table tr, .job-item, .vacancy-item",
    title: "td:first-child, .job-title",
    salary: "td:nth-child(3), .salary-info",
    company: "td:nth-child(2), .company-name",
  },
};
```

## 📝 Customization Steps

### Step 1: Update Target URL

In `scrape.js`, change the constructor:

```javascript
constructor() {
  this.targetUrl = 'YOUR_TARGET_JOB_SITE_URL';
}
```

### Step 2: Update Job Listing Selectors

In the `extractJobData()` method, update the `jobSelectors` array:

```javascript
const jobSelectors = [
  ".your-job-card-class",
  ".your-job-item-class",
  "[data-your-job-attribute]",
];
```

### Step 3: Update Title Extraction

In the page.evaluate function, update title extraction:

```javascript
// For specific title elements
const titleSelectors = [".your-title-class", "h2.job-title", "[data-title]"];

// For table-based layouts
if (element.tagName === "TR") {
  const cells = element.querySelectorAll("td");
  title = cells[0]?.textContent?.trim(); // Adjust cell index
}
```

### Step 4: Update Salary Extraction

Update the salary patterns in `parseSalaryFromText()`:

```javascript
const salaryPatterns = [
  // Add patterns specific to your target site
  /YOUR_CURRENCY[\d,]+(\.?\d+)?/gi,
  /salary:?\s*YOUR_PATTERN/gi,
];
```

## 🛠️ Common Selector Patterns

### By Class Name

```javascript
".job-card"; // Single class
".job-listing-item"; // Kebab case
".jobCard"; // Camel case
```

### By Attribute

```javascript
"[data-job-id]"; // Has attribute
'[data-job-id="123"]'; // Specific value
'[class*="job"]'; // Contains text
```

### By Tag + Class

```javascript
"div.job-item"; // Div with class
"tr.vacancy-row"; // Table row with class
"li.result-item"; // List item with class
```

### By Hierarchy

```javascript
".job-list .job-item"; // Child selector
".job-card > .title"; // Direct child
".job-info h3"; // Descendant
```

## 🎯 Testing Your Configuration

### 1. Use Browser DevTools

1. Open target job site in Chrome
2. Right-click on job listing → Inspect
3. Find the container element for one job
4. Note the class names and structure
5. Test selectors in Console: `document.querySelectorAll('.your-selector')`

### 2. Test Incrementally

1. Start with finding job container elements
2. Test title extraction
3. Test salary extraction
4. Add error handling

### 3. Debug Output

Add logging to see what's being extracted:

```javascript
console.log("Found element:", element);
console.log("Extracted title:", title);
console.log("Extracted salary:", salary);
```

## 🚨 Common Issues & Solutions

### Issue: No Elements Found

**Solution:** Check if the site loads content dynamically

```javascript
// Wait for content to load
await page.waitForSelector(".job-list", { timeout: 10000 });
await page.waitForTimeout(3000); // Additional wait
```

### Issue: Wrong Text Extracted

**Solution:** Be more specific with selectors

```javascript
// Instead of:
".title";

// Use:
".job-card .title";
// or
".job-listing h2.job-title";
```

### Issue: Salary Not Found

**Solution:** Check multiple locations and patterns

```javascript
// Look in multiple elements
const salarySelectors = [
  ".salary",
  ".compensation",
  ".pay-range",
  ".salary-info span",
];

// Check parent elements
const parentText = element.closest(".job-card").textContent;
```

## 📊 Expected Output Format

### JSON Structure

```json
{
  "scrapeDate": "2025-09-19T12:00:00.000Z",
  "totalJobs": 25,
  "sourceUrl": "https://example-job-site.com",
  "jobs": [
    {
      "title": "Software Engineer",
      "salary": "₹6,00,000 - ₹10,00,000 per annum"
    },
    {
      "title": "Data Analyst",
      "salary": "Not specified"
    }
  ]
}
```

### Console Output

```
🤖 JOB SCRAPER - TITLE & SALARY EXTRACTION
============================================================
🔍 Initializing Puppeteer browser...
✅ Browser initialized successfully
🔍 Navigating to job site: https://example.com
✅ Successfully loaded job site
🔍 Extracting job titles and salaries...
ℹ️  Found job elements using selector: .job-card
ℹ️  Found 25 potential job elements
✅ Jobs found: 25
ℹ️  Sample extracted job: {
  "title": "Software Engineer",
  "salary": "₹6,00,000 - ₹10,00,000 per annum"
}
```

## 🔄 Next Steps

1. **Test with demo**: Run `node scrape-demo.js` first
2. **Identify target site**: Choose your job site
3. **Inspect elements**: Use browser DevTools
4. **Update selectors**: Modify the configuration
5. **Test extraction**: Run and debug
6. **Refine patterns**: Improve salary parsing
7. **Handle edge cases**: Add error handling

## 💡 Tips for Success

- **Start simple**: Get basic title extraction working first
- **Test selectors**: Use browser console to verify selectors work
- **Handle variations**: Job sites often have multiple layouts
- **Add delays**: Some sites need time to load content
- **Respect robots.txt**: Check site's scraping policy
- **Use realistic delays**: Don't overload the server
- **Handle failures gracefully**: Always include error handling
