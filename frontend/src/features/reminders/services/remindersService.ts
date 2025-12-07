import axios from 'axios';
import type { UserNotificationSettings, ReminderHistory } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const remindersService = {
  async getPreferences(): Promise<UserNotificationSettings> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/reminders/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updatePreferences(
    settings: Partial<UserNotificationSettings>,
  ): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.patch(`${API_URL}/reminders/preferences`, settings, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async sendTestNotification(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/reminders/test`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  async getHistory(limit = 10): Promise<ReminderHistory[]> {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/reminders/history?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  async triggerManualCheck(): Promise<{
    success: boolean;
    remindersSent: number;
    message: string;
  }> {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/reminders/trigger`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};

