export interface ReminderPreferences {
  frequency: 'daily' | 'twice-daily' | 'every-6-hours';
  quietHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  priorityFilter: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[];
}

export interface UserNotificationSettings {
  notificationsEnabled: boolean;
  phone?: string;
  language: string;
  reminderPreferences: ReminderPreferences;
}

export interface ReminderHistory {
  _id: string;
  taskTitle: string;
  priority: string;
  sentAt: string;
  channel: string;
  status: string;
  aiReasoning: string;
}

