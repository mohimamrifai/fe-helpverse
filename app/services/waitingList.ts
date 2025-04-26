import axios from 'axios';

// Interface untuk data waiting list
export interface WaitingList {
  _id: string;
  name: string;
  email: string;
  phone: string;
  event: string; // ID event
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk data respons waiting list
export interface WaitingListResponse {
  success: boolean;
  count: number;
  data: WaitingList[];
  message?: string;
}

// Interface untuk data input waiting list
export interface WaitingListInput {
  name: string;
  email: string;
  phone?: string;
  event: string; // ID event
}

// Base URL dari API
const API_URL = 'http://localhost:5000';

// Fungsi untuk mengambil token dari localStorage
const getToken = () => localStorage.getItem('token');

// Service untuk waiting list
export const waitingListService = {
  /**
   * Mendaftar ke waiting list
   * @param waitingListData Data waiting list
   * @returns Respons dari API
   */
  async registerToWaitingList(waitingListData: WaitingListInput): Promise<WaitingListResponse> {
    try {
      const response = await fetch(`${API_URL}/api/waiting-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(waitingListData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mendaftar waiting list');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering to waiting list:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan daftar waiting list berdasarkan email
   * @param email Email pengguna
   * @returns Respons dari API
   */
  async getUserWaitingList(email: string): Promise<WaitingListResponse> {
    try {
      const response = await fetch(`${API_URL}/api/waiting-list?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user waiting list data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user waiting list data:', error);
      throw error;
    }
  },

  /**
   * Mendapatkan semua data waiting list (Admin)
   * @param filters Filter untuk waiting list
   * @returns Respons dari API
   */
  async getWaitingList(filters = {}): Promise<WaitingListResponse> {
    try {
      const queryParams = new URLSearchParams(filters as Record<string, string>);
      const token = getToken();
      
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }
      
      const response = await fetch(`${API_URL}/api/waiting-list/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch waiting list data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching waiting list data:', error);
      throw error;
    }
  },

  /**
   * Memperbarui status waiting list (Admin)
   * @param waitingListId ID waiting list
   * @param updateData Data yang akan diperbarui
   * @returns Respons dari API
   */
  async updateWaitingListStatus(
    waitingListId: string, 
    updateData: { status: 'pending' | 'approved' | 'rejected', notes?: string }
  ): Promise<any> {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('Anda harus login terlebih dahulu');
      }
      
      const response = await fetch(`${API_URL}/api/waiting-list/admin/${waitingListId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memperbarui status waiting list');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating waiting list status:', error);
      throw error;
    }
  }
}; 