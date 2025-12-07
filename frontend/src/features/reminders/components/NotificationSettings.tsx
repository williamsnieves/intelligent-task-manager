import { useState, useEffect } from 'react';
import { Bell, BellOff, Send, Clock, Filter, Sparkles } from 'lucide-react';
import { remindersService } from '../services/remindersService';
import type { UserNotificationSettings } from '../types';

export const NotificationSettings = () => {
  const [settings, setSettings] = useState<UserNotificationSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await remindersService.getPreferences();
      setSettings(data);
    } catch (error) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await remindersService.updatePreferences(settings);
      showMessage('success', 'Settings saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      const result = await remindersService.sendTestNotification();
      showMessage(
        result.success ? 'success' : 'error',
        result.message || 'Test notification sent!',
      );
    } catch (error) {
      showMessage(
        'error',
        'Failed to send test notification. Check your phone number and WhatsApp configuration.',
      );
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerCheck = async () => {
    setTriggering(true);
    try {
      const result = await remindersService.triggerManualCheck();
      showMessage('success', result.message || 'Check completed!');
    } catch (error) {
      showMessage('error', 'Failed to trigger reminder check');
    } finally {
      setTriggering(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8 text-gray-500">
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Notification Settings
        </h2>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Enable/Disable Notifications */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.notificationsEnabled ? (
              <Bell className="w-5 h-5 text-green-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                WhatsApp Reminders
              </h3>
              <p className="text-sm text-gray-500">
                Receive AI-powered task reminders via WhatsApp
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notificationsEnabled: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Phone Number
          </label>
          <input
            type="tel"
            value={settings.phone || ''}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Include country code (e.g., +1 for USA)
          </p>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Language
          </label>
          <select
            value={settings.language}
            onChange={(e) =>
              setSettings({ ...settings, language: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Frequency Settings */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Reminder Frequency</h3>
        </div>

        <div>
          <select
            value={settings.reminderPreferences?.frequency || 'daily'}
            onChange={(e) =>
              setSettings({
                ...settings,
                reminderPreferences: {
                  ...settings.reminderPreferences,
                  frequency: e.target.value as any,
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="daily">Once Daily (9 AM)</option>
            <option value="twice-daily">Twice Daily (9 AM & 6 PM)</option>
            <option value="every-6-hours">Every 6 Hours</option>
          </select>
        </div>

        {/* Quiet Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiet Hours (No Notifications)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start</label>
              <input
                type="time"
                value={settings.reminderPreferences?.quietHours?.start || '22:00'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminderPreferences: {
                      ...settings.reminderPreferences,
                      quietHours: {
                        ...settings.reminderPreferences?.quietHours,
                        start: e.target.value,
                        end:
                          settings.reminderPreferences?.quietHours?.end || '08:00',
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End</label>
              <input
                type="time"
                value={settings.reminderPreferences?.quietHours?.end || '08:00'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    reminderPreferences: {
                      ...settings.reminderPreferences,
                      quietHours: {
                        ...settings.reminderPreferences?.quietHours,
                        start:
                          settings.reminderPreferences?.quietHours?.start ||
                          '22:00',
                        end: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">
            Remind Me Only For
          </h3>
        </div>

        <div className="space-y-2">
          {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
            <label key={priority} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  settings.reminderPreferences?.priorityFilter?.includes(
                    priority,
                  ) || false
                }
                onChange={(e) => {
                  const current =
                    settings.reminderPreferences?.priorityFilter || [];
                  const updated = e.target.checked
                    ? [...current, priority]
                    : current.filter((p) => p !== priority);

                  setSettings({
                    ...settings,
                    reminderPreferences: {
                      ...settings.reminderPreferences,
                      priorityFilter: updated,
                    },
                  });
                }}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{priority} Priority</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>

        <button
          onClick={handleTestNotification}
          disabled={testing || !settings.phone || !settings.notificationsEnabled}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {testing ? 'Sending...' : 'Test'}
        </button>

        <button
          onClick={handleTriggerCheck}
          disabled={triggering || !settings.notificationsEnabled}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {triggering ? 'Checking...' : 'Check Now'}
        </button>
      </div>
    </div>
  );
};

