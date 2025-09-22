import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const jobAPI = axios.create({
  baseURL: `${API_BASE_URL}/jobs`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
jobAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const jobRecommendationAPI = {
  // Get personalized job recommendations
  getRecommendations: async (userId, options = {}) => {
    try {
      const { limit = 10, industry, location } = options;
      const params = new URLSearchParams();
      
      if (limit) params.append('limit', limit);
      if (industry) params.append('industry', industry);
      if (location) params.append('location', location);
      
      const response = await jobAPI.get(`/recommendations/${userId}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Get skill gap analysis for a specific job
  getSkillGapAnalysis: async (userId, jobId) => {
    try {
      const response = await jobAPI.get(`/skill-gap/${userId}/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill gap analysis:', error);
      throw error;
    }
  },

  // Get all jobs with filters
  getJobs: async (filters = {}) => {
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
      } = filters;

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (industry) params.append('industry', industry);
      if (location) params.append('location', location);
      if (minSalary) params.append('minSalary', minSalary);
      if (maxSalary) params.append('maxSalary', maxSalary);
      if (experienceLevel) params.append('experienceLevel', experienceLevel);
      if (skills) params.append('skills', skills);

      const response = await jobAPI.get(`/jobs?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Get industry insights
  getIndustryInsights: async () => {
    try {
      const response = await jobAPI.get('/industries');
      return response.data;
    } catch (error) {
      console.error('Error fetching industry insights:', error);
      throw error;
    }
  },

  // Trigger manual scraping (admin function)
  triggerScraping: async () => {
    try {
      const response = await jobAPI.post('/scrape/trigger');
      return response.data;
    } catch (error) {
      console.error('Error triggering scraping:', error);
      throw error;
    }
  },

  // Get scraping status
  getScrapingStatus: async () => {
    try {
      const response = await jobAPI.get('/scrape/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching scraping status:', error);
      throw error;
    }
  }
};

export default jobRecommendationAPI;