import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Learner Profile API
export const learnerAPI = {
  // Get all profiles
  getAllProfiles: () => api.get('/learners'),
  
  // Get profile by ID
  getProfile: (id) => api.get(`/learners/${id}`),
  
  // Create new profile
  createProfile: (profileData) => api.post('/learners', profileData),
  
  // Update profile
  updateProfile: (id, profileData) => api.put(`/learners/${id}`, profileData),
  
  // Delete profile
  deleteProfile: (id) => api.delete(`/learners/${id}`),
  
  // Get profile completeness
  getCompleteness: (id) => api.get(`/learners/${id}/completeness`),
  
  // Search profiles
  searchProfiles: (searchCriteria) => api.post('/learners/search', searchCriteria),
};

export default api;