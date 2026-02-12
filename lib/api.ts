import axios from 'axios';

// In Next.js, API routes are relative to the same domain
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        response: {
          status: 0,
          data: { message: 'Network error. Please check your connection.' }
        }
      });
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/users/register', userData),
  login: (credentials: any) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: any) => api.put('/users/profile', userData),
  updateCharacter: (characterData: any) => api.put('/users/profile', characterData),
};

// Story Game API
export const storyGameAPI = {
  getProgress: () => api.get('/story-game/progress'),
  executeCode: (code: string) => api.post('/story-game/execute', { code }),
  purchaseHint: (hintLevel: number) => api.post('/story-game/hint', { hintLevel }),
  resetProgress: () => api.post('/story-game/reset'),
  setFlag: (flag: string) => api.post('/story-game/set-flag', { flag }),
  confirmCollect: (item: string) => api.post('/story-game/confirm-collect', { item }),
};

// Block Builder API
export const blockBuilderAPI = {
  saveBuild: (blocks: any[], currentChallenge: number) => 
    api.post('/block-builder/save', { blocks, currentChallenge }),
  loadBuild: () => api.get('/block-builder/load'),
};

export default api;
