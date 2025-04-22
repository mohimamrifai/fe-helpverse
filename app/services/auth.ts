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
  username: string;
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  password: string;
  agreeTerms: boolean;
  role: string;
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
      console.log(`🔐 Request to ${config.url}: Adding Authorization header with token`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log(`⚠️ Request to ${config.url}: No token available`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  // Fungsi untuk login
  async login(params: LoginParams): Promise<User> {
    try {
      const { username, password, rememberMe } = params;
      const response = await api.post('/api/auth/login', {
        email: username,
        password,
        rememberMe
      });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Jika response tidak mengandung data user, ambil data user menggunakan token
        if (!response.data.data) {
          return this.getCurrentUser();
        }
        
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
      // Pastikan semua field yang diperlukan tersedia
      if (!params.username || !params.fullName || !params.email || !params.phone || !params.organizationName || !params.password) {
        throw new Error('Semua field harus diisi');
      }
      
      // Data sudah dalam format yang diharapkan server
      console.log('Data yang dikirim ke API:', params);
      
      const response = await api.post('/api/auth/register', params);
      
      console.log('API response:', response.data);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Jika response tidak mengandung data user, ambil data user menggunakan token
        if (!response.data.data) {
          return this.getCurrentUser();
        }
        
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      console.error('API Error full details:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        const errorMessage = error.response.data.message || 'Registration failed';
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  // Fungsi untuk mendapatkan informasi user saat ini
  async getCurrentUser(): Promise<User> {
    try {
      console.log('🔄 getCurrentUser: Fetching current user data...');
      console.log('🔑 getCurrentUser: Token exists:', !!getToken());
      
      const response = await api.get('/api/auth/me');
      
      console.log('✅ getCurrentUser: API response success:', response.data.success);
      
      if (response.data.success) {
        // Simpan data user di localStorage untuk fallback jika diperlukan
        localStorage.setItem('userData', JSON.stringify(response.data.data));
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get user data');
    } catch (error) {
      console.error('❌ getCurrentUser error:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('🔴 getCurrentUser: Response status:', error.response.status);
        console.error('🔴 getCurrentUser: Response data:', error.response.data);
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
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      // Tetap hapus token meskipun API error
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  },

  // Fungsi untuk memeriksa apakah user sedang terautentikasi
  isAuthenticated(): boolean {
    return !!getToken();
  }
}; 