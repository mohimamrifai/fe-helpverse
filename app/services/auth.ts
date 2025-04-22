import axios from 'axios';

// Definisi tipe untuk user
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'eventOrganizer' | 'user';
  fullName?: string;
  email?: string;
}

// Definisi tipe untuk parameter login
interface LoginParams {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Definisi tipe untuk parameter registrasi event organizer
interface RegisterEventOrganizerParams {
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  password: string;
  agreeTerms: boolean;
}

// Base URL dari API
const API_URL = 'http://localhost:5000';

// Fungsi untuk mengambil token dari localStorage
const getToken = () => localStorage.getItem('token');

// Axios instance dengan header Authorization
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  // Fungsi untuk login
  async login(params: LoginParams): Promise<User> {
    try {
      const response = await api.post('/api/auth/login', params);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  },

  // Fungsi untuk registrasi event organizer
  async registerEventOrganizer(params: RegisterEventOrganizerParams): Promise<User> {
    try {
      const response = await api.post('/api/auth/register/event-organizer', params);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },

  // Fungsi untuk mendapatkan informasi user saat ini
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/api/auth/me');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get user data');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get user data');
      }
      throw error;
    }
  },

  // Fungsi untuk logout
  async logout(): Promise<void> {
    try {
      await api.get('/api/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap hapus token meskipun API error
      localStorage.removeItem('token');
    }
  },

  // Fungsi untuk memeriksa apakah user sedang terautentikasi
  isAuthenticated(): boolean {
    return !!getToken();
  }
}; 