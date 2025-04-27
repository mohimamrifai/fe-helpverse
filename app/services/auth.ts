import axios from 'axios';

// Definisi tipe untuk user sesuai dengan dokumentasi API
export interface User {
  id: string;
  _id: string;
  username: string;
  email: string;
  password?: string; // Password tidak akan dikembalikan dari API, tapi dibutuhkan untuk registrasi
  fullName: string;
  phone: string;
  organizerName?: string; // Wajib untuk event organizer
  role: 'user' | 'eventOrganizer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Definisi tipe untuk parameter login
interface LoginParams {
  username: string; // Username atau email
  password: string;
  rememberMe: boolean;
}

// Definisi tipe untuk parameter registrasi pengguna biasa
interface RegisterUserParams {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  agreeTerms: boolean;
  role: 'user';
}

// Definisi tipe untuk parameter registrasi event organizer
interface RegisterEventOrganizerParams {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  organizerName: string; // Nama organisasi event organizer
  password: string;
  agreeTerms: boolean;
  role: 'eventOrganizer';
}

// Definisi tipe untuk respons autentikasi
interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
  message?: string;
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

// Fungsi untuk normalisasi data user
const normalizeUser = (userData: any): User => {
  return {
    id: userData.id || userData._id,
    _id: userData._id || userData.id,
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName,
    phone: userData.phone || '',
    organizerName: userData.organizerName || userData.organizationName,
    role: userData.role,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
    updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date()
  };
};

export const authService = {
  // Fungsi untuk login
  async login(params: LoginParams): Promise<User> {
    try {
      const { username, password, rememberMe } = params;
      const response = await api.post<AuthResponse>('/api/auth/login', {
        identifier: username, // Menggunakan format identifier yang bisa berupa email atau username
        password,
        rememberMe
      });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Jika response tidak mengandung data user, ambil data user menggunakan token
        if (!response.data.data) {
          return this.getCurrentUser();
        }
        
        return normalizeUser(response.data.data);
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  },

  // Fungsi untuk registrasi pengguna biasa
  async registerUser(params: RegisterUserParams): Promise<User> {
    try {
      // Pastikan semua field yang diperlukan tersedia
      if (!params.username || !params.fullName || !params.email || !params.phone || !params.password) {
        throw new Error('Semua field harus diisi');
      }
      
      const response = await api.post<AuthResponse>('/api/auth/register', params);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Jika response tidak mengandung data user, ambil data user menggunakan token
        if (!response.data.data) {
          return this.getCurrentUser();
        }
        
        return normalizeUser(response.data.data);
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },

  // Fungsi untuk registrasi event organizer
  async registerEventOrganizer(params: RegisterEventOrganizerParams): Promise<User> {
    try {
      // Pastikan semua field yang diperlukan tersedia
      if (!params.username || !params.fullName || !params.email || !params.phone || !params.organizerName || !params.password) {
        throw new Error('Semua field harus diisi');
      }
      
      // Data sudah dalam format yang diharapkan server
      console.log('Data yang dikirim ke API:', params);
      
      const response = await api.post<AuthResponse>('/api/auth/register/event-organizer', params);
      
      console.log('API response:', response.data);
      
      if (response.data.success) {
        // Tidak menyimpan token baru ke localStorage untuk mencegah admin berubah menjadi event organizer
        // Hanya mengembalikan data user event organizer yang baru dibuat
        if (response.data.data) {
          return normalizeUser(response.data.data);
        } else {
          // Jika server tidak mengembalikan data user, lempar error
          throw new Error('Server tidak mengembalikan data user');
        }
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
      
      const response = await api.get<AuthResponse>('/api/auth/me');
      
      console.log('✅ getCurrentUser: API response success:', response.data.success);
      
      if (response.data.success) {
        const normalizedUser = normalizeUser(response.data.data);
        // Simpan data user di localStorage untuk fallback jika diperlukan
        localStorage.setItem('userData', JSON.stringify(normalizedUser));
        return normalizedUser;
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