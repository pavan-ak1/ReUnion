import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken, setAuthToken, clearAuth } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    const token = getAuthToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post<{ token: string; user: any }>(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const { token, user } = response.data;
        
        // Update the auth token
        setAuthToken(token);
        
        // Update the Authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth
        clearAuth();
        
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signin')) {
          window.location.href = `/signin?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other error statuses
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response as any;
      
      if (status === 403) {
        // Forbidden - user doesn't have permission
        if (typeof window !== 'undefined') {
          window.location.href = '/unauthorized';
        }
      } else if (status === 404) {
        // Not found
        console.error('Resource not found:', error.config?.url);
      } else if (status >= 500) {
        // Server error
        console.error('Server error:', error.response?.data);
      }
      
      // Return a consistent error format
      return Promise.reject({
        status: error.response.status,
        message: data?.message || 'An error occurred',
        errors: data?.errors,
        data: data,
      });
    } else if (error.request) {
      // Request was made but no response was received
      console.error('No response from server:', error.request);
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
      return Promise.reject({
        status: -1,
        message: error.message || 'Error setting up request',
      });
    }
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with an error status code
    return {
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    // Request was made but no response was received
    return {
      status: 0,
      message: 'No response from server. Please check your connection.',
    };
  } else {
    // Something happened in setting up the request
    return {
      status: -1,
      message: error.message || 'Error setting up request',
    };
  }
};

export default api;
