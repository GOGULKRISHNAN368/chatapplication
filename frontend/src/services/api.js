import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const userAPI = {
  searchByUniqueId: (uniqueId) => api.get(`/users/search/${uniqueId}`),
  getContacts: () => api.get('/users/contacts'),
  addContact: (uniqueId) => api.post('/users/contacts', { uniqueId })
};

export const messageAPI = {
  getMessages: (userId) => api.get(`/messages/${userId}`),
  getGroupMessages: (groupId) => api.get(`/messages/group/${groupId}`),
  searchMessages: (query) => api.get(`/messages/search/${query}`)
};

export const groupAPI = {
  createGroup: (data) => api.post('/groups', data),
  getGroups: () => api.get('/groups')
};

export default api;