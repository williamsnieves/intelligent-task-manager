export interface NotificationMessage {
  recipient: string; // Phone number for WhatsApp
  taskTitle: string;
  priority: string;
  dueDate?: string;
  daysPending: number;
  reasoning: string;
  language: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt: Date;
}

export interface INotificationChannel {
  /**
   * Sends a reminder notification through the channel
   * @param message - Notification message details
   * @returns Result of the notification attempt
   */
  send(message: NotificationMessage): Promise<NotificationResult>;

  /**
   * Sends multiple reminders in batch
   * @param messages - Array of notification messages
   * @returns Array of results
   */
  sendBatch(messages: NotificationMessage[]): Promise<NotificationResult[]>;

  /**
   * Checks if the notification channel is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Sends a test message to verify configuration
   * @param recipient - Test recipient
   */
  sendTest(recipient: string): Promise<NotificationResult>;
}
