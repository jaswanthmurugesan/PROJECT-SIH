# Modern Web Scraping Best Practices with Puppeteer

## Overview

This document outlines the modern practices implemented in the NCS Web Scraper to ensure reliability, compatibility, and maintainability with current web technologies.

## Key Changes Made

### 1. Deprecated `page.waitForTimeout()` Replacement

**❌ Old (Deprecated):**

```javascript
await this.page.waitForTimeout(3000);
```

**✅ New (Modern):**

```javascript
// Option 1: Wait for specific element (Preferred)
await this.page.waitForSelector("body", { timeout: 5000 });

// Option 2: Manual delay when needed
await new Promise((resolve) => setTimeout(resolve, 3000));
```

**Why this is better:**

- `waitForTimeout()` was removed in Puppeteer v20+
- Waiting for selectors is more reliable than arbitrary delays
- Falls back gracefully if elements don't appear

### 2. Enhanced Browser Configuration

**✅ Modern Configuration:**

```javascript
this.browser = await puppeteer.launch({
  headless: "new", // Use new headless mode
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--disable-features=VizDisplayCompositor", // Additional stability
  ],
});

// Set default timeout for all operations
this.page.setDefaultTimeout(30000);
```

### 3. Robust Error Handling

**✅ Modern Error Handling:**

```javascript
try {
  await this.page.waitForSelector("body", { timeout: 5000 });
  await new Promise((resolve) => setTimeout(resolve, 3000));
} catch (error) {
  console.log("⚠️ Page might be slow to load, continuing with scraping...");
  // Continue execution instead of failing completely
}
```

### 4. Rate Limiting and Politeness

**✅ Modern Rate Limiting:**

```javascript
for (let i = 0; i < jobListings.length; i++) {
  // Process job

  // Add delay between requests to be polite to the server
  if (i < jobListings.length - 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

## MongoDB Connection Best Practices

### Fixed Deprecation Warnings

**❌ Old (Deprecated):**

```javascript
mongoose.connect(uri, {
  useNewUrlParser: true, // Deprecated in Mongoose 6+
  useUnifiedTopology: true, // Deprecated in Mongoose 6+
});
```

**✅ New (Modern):**

```javascript
mongoose.connect(uri); // Clean, modern syntax
```

### Fixed Duplicate Index Warning

**❌ Old (Caused Warning):**

```javascript
// In schema definition
industry: {
  type: String,
  required: true,
  unique: true  // This creates an index
},

// Later in the file
schema.index({ industry: 1 });  // Duplicate index!
```

**✅ New (Clean):**

```javascript
// In schema definition
industry: {
  type: String,
  required: true,
  unique: true  // This already creates an index
},

// Remove duplicate index definition
// schema.index({ industry: 1 });  // Not needed!
```

## Reliability Strategies

### 1. Progressive Enhancement

- Start with basic scraping
- Add complexity gradually
- Always have fallback strategies

### 2. Selector Flexibility

```javascript
// Use multiple selectors for robustness
const titleElement = element.querySelector(
  ["h1, h2, h3, h4, h5, h6", '[class*="title"]', '[class*="heading"]'].join(
    ", "
  )
);
```

### 3. Timeout Management

```javascript
// Set appropriate timeouts for different operations
await page.goto(url, {
  waitUntil: "networkidle2", // Wait for network to be idle
  timeout: 30000, // 30 second timeout
});

await page.waitForSelector("body", {
  timeout: 5000, // Shorter timeout for element waiting
});
```

### 4. Graceful Degradation

```javascript
try {
  // Try primary scraping method
  await primaryScrapingMethod();
} catch (error) {
  console.log("Primary method failed, trying fallback...");
  // Try fallback method
  await fallbackScrapingMethod();
}
```

## Performance Optimizations

### 1. Resource Blocking

```javascript
// Block unnecessary resources to speed up scraping
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (req.resourceType() == "stylesheet" || req.resourceType() == "image") {
    req.abort();
  } else {
    req.continue();
  }
});
```

### 2. Concurrent Processing

```javascript
// Process multiple jobs concurrently (with limits)
const batchSize = 5;
for (let i = 0; i < jobs.length; i += batchSize) {
  const batch = jobs.slice(i, i + batchSize);
  await Promise.all(batch.map((job) => processJob(job)));

  // Delay between batches
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
```

## Error Recovery Strategies

### 1. Retry Logic

```javascript
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 2. Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

## Monitoring and Logging

### 1. Structured Logging

```javascript
const logger = {
  info: (message, data = {}) =>
    console.log("ℹ️", message, JSON.stringify(data)),
  warn: (message, data = {}) =>
    console.log("⚠️", message, JSON.stringify(data)),
  error: (message, error = {}) =>
    console.log("❌", message, error.message || error),
};
```

### 2. Performance Metrics

```javascript
const startTime = Date.now();
// Perform scraping operations
const endTime = Date.now();
const duration = endTime - startTime;

logger.info("Scraping completed", {
  duration: `${duration}ms`,
  jobsFound: jobs.length,
  successRate: `${((successfulJobs / totalJobs) * 100).toFixed(2)}%`,
});
```

## Compatibility Matrix

| Technology | Version | Status             |
| ---------- | ------- | ------------------ |
| Node.js    | 18+     | ✅ Fully Supported |
| Puppeteer  | 20+     | ✅ Fully Supported |
| Mongoose   | 6+      | ✅ Fully Supported |
| MongoDB    | 4.4+    | ✅ Fully Supported |

## Troubleshooting Common Issues

### Issue: Page Not Loading

```javascript
// Solution: Increase timeout and add retries
await page.goto(url, {
  waitUntil: ["networkidle0", "domcontentloaded"],
  timeout: 60000,
});
```

### Issue: Elements Not Found

```javascript
// Solution: Wait for dynamic content
await page.waitForFunction(
  () => document.querySelectorAll(".job-listing").length > 0,
  { timeout: 10000 }
);
```

### Issue: Memory Leaks

```javascript
// Solution: Proper cleanup
try {
  // Scraping operations
} finally {
  if (page) await page.close();
  if (browser) await browser.close();
}
```

## Future Enhancements

1. **Implement Proxy Rotation** for large-scale scraping
2. **Add CAPTCHA Solving** integration
3. **Implement Database Connection Pooling**
4. **Add Real-time Monitoring Dashboard**
5. **Implement Distributed Scraping** across multiple instances

## Conclusion

These modern practices ensure that the NCS Web Scraper is:

- ✅ Compatible with latest versions of all dependencies
- ✅ Resilient to network issues and website changes
- ✅ Performant and resource-efficient
- ✅ Maintainable and extensible
- ✅ Production-ready with proper error handling

The scraper now runs without any deprecation warnings or compatibility issues, providing a solid foundation for reliable job data collection from the NCS portal.
