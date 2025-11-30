import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:8000');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Assessment API
export const assessmentAPI = {
  getQuestions: async () => {
    const response = await api.get('/api/assessment/questions');
    return response.data;
  },

  submitAssessment: async (userId, answers, userProfile = null) => {
    const response = await api.post('/api/assessment/submit', {
      user_id: userId,
      answers,
      user_profile: userProfile,
    });
    return response.data;
  },
};

// Career Exploration API
export const careerAPI = {
  exploreCareers: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/api/careers/explore', { params });
    return response.data;
  },
};

// AI Mentor API
export const mentorAPI = {
  sendMessage: async (userId, message, context = null) => {
    const response = await api.post('/api/mentor/chat', {
      user_id: userId,
      message,
      context,
    });
    return response.data;
  },

  getChatHistory: async (userId, limit = 20) => {
    const response = await api.get(`/api/mentor/chat/history/${userId}`, {
      params: { limit },
    });
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (careerId = null, limit = 50) => {
    const params = {};
    if (careerId) params.career_id = careerId;
    params.limit = limit;
    const response = await api.get('/api/jobs', { params });
    return response.data;
  },

  searchIndeed: async (jobTitle, location = 'India', limit = 10) => {
    const response = await api.get('/api/jobs/indeed-search', {
      params: { job_title: jobTitle, location, limit },
    });
    return response.data;
  },

  applyToJob: async (firebaseUid, jobData) => {
    const response = await api.post('/api/jobs/apply', {
      firebase_uid: firebaseUid,
      ...jobData,
    });
    return response.data;
  },

  getMyApplications: async (firebaseUid) => {
    const response = await api.get(`/api/jobs/my-applications/${firebaseUid}`);
    return response.data;
  },
};

export default api;
