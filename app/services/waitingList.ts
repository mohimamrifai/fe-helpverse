import axios from 'axios';

// Interface for waiting list data
export interface WaitingList {
  _id: string;
  name: string;
  email: string;
  phone: string;
  event: string; // Event ID
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for waiting list response data
export interface WaitingListResponse {
  success: boolean;
  count: number;
  data: WaitingList[];
  message?: string;
}

// Interface for waiting list input data
export interface WaitingListInput {
  name: string;
  email: string;
  phone?: string;
  event: string; // Event ID
}

// API Base URL
const API_URL = 'http://localhost:5000';

// Function to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Waiting list service
export const waitingListService = {
  /**
   * Register to waiting list
   * @param waitingListData Waiting list data
   * @returns Response from API
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
        throw new Error(errorData.error || 'Failed to register to waiting list');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error registering to waiting list:', error);
      throw error;
    }
  },

  /**
   * Get waiting list based on email
   * @param email User's email
   * @returns Response from API
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
   * Get all waiting list data (Admin)
   * @param filters Filters for waiting list
   * @returns Response from API
   */
  async getWaitingList(filters = {}): Promise<WaitingListResponse> {
    try {
      const queryParams = new URLSearchParams(filters as Record<string, string>);
      const token = getToken();
      
      if (!token) {
        throw new Error('You must be logged in first');
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
   * Update waiting list status (Admin)
   * @param waitingListId Waiting list ID
   * @param updateData Data to update
   * @returns Response from API
   */
  async updateWaitingListStatus(
    waitingListId: string, 
    updateData: { status: 'pending' | 'approved' | 'rejected', notes?: string }
  ): Promise<any> {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('You must be logged in first');
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
        throw new Error(errorData.error || 'Failed to update waiting list status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating waiting list status:', error);
      throw error;
    }
  }
}; 