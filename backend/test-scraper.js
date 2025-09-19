const NCSWebScraper = require('./services/ncsWebScraper');

async function testScraper() {
  const scraper = new NCSWebScraper();
  
  try {
    console.log('🧪 Starting minimal scraper test...');
    
    // Test just the first page without pagination
    await scraper.initialize();
    
    console.log('🌐 Navigating to NCS portal...');
    await scraper.page.goto('https://www.ncs.gov.in/Pages/default.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('📄 Extracting jobs from current page...');
    const jobs = await scraper.extractJobsFromCurrentPage();
    
    console.log(`✅ Found ${jobs.length} jobs`);
    if (jobs.length > 0) {
      console.log('📋 Sample job:', JSON.stringify(jobs[0], null, 2));
      
      // Test database save with proper fields
      console.log('💾 Testing database save...');
      const saveResult = await scraper.saveJobsToDatabase(jobs);
      console.log('📊 Save result:', saveResult);
    }
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await scraper.close();
  }
}

testScraper().then(() => {
  console.log('🎯 Scraper test finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Critical error:', error);
  process.exit(1);
});