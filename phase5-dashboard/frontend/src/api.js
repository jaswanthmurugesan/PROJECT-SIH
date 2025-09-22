import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      // Redirect to login if needed
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiEndpoints = {
  // Health check
  health: () => api.get('/health'),
  
  // Learner endpoints
  getLearners: () => api.get('/learners'),
  getLearner: (id) => api.get(`/learners/${id}`),
  
  // Trainer endpoints
  getTrainers: () => api.get('/trainers'),
  getTrainer: (id) => api.get(`/trainers/${id}`),
  
  // Policymaker endpoints
  getPolicymakers: () => api.get('/policymakers'),
  getPolicymaker: (id) => api.get(`/policymakers/${id}`),
}

export default api