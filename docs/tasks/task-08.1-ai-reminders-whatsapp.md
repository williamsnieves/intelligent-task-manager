# Task 8.1: AI Task Reminders & WhatsApp Notifications

## Goal
Implement an intelligent reminder system that analyzes pending tasks and sends proactive WhatsApp notifications when tasks are overdue or need attention.

## Context
- **AI Analysis**: Use Ollama to evaluate pending tasks (priority, days pending, urgency)
- **WhatsApp Integration**: Use MCP (Model Context Protocol) to connect with WhatsApp API
- **Scheduler**: Run periodic checks (e.g., daily at 9 AM, or every 6 hours)
- **Smart Notifications**: Only notify for tasks that truly need attention

## Use Case Example
> **Scenario**: You created a HIGH priority task 2 days ago and forgot about it.
> 
> **AI Analysis**: "This task has been pending for 2 days, it's HIGH priority, and the due date is tomorrow. User needs a reminder."
> 
> **WhatsApp Message**: 
> ```
> 🔔 Task Reminder
> 
> You have a HIGH priority task pending:
> "Complete project proposal"
> 
> ⏰ Due: Tomorrow (Dec 8)
> 📅 Pending for: 2 days
> 
> Don't forget to complete it! 💪
> ```

## Architecture

### Backend Components

```
src/modules/reminders/
├── domain/
│   ├── reminder-strategy.interface.ts    # IAnalysisStrategy
│   └── notification-channel.interface.ts # INotificationChannel
├── infrastructure/
│   ├── ollama-analyzer.ts               # AI task analysis
│   ├── whatsapp-mcp.provider.ts         # MCP WhatsApp integration
│   └── scheduler.service.ts             # Cron jobs
├── application/
│   └── reminders.service.ts             # Business logic
└── interface/
    └── reminders.controller.ts          # Manual trigger endpoint
```

## Steps

### 1. AI Task Analysis Logic
- [ ] Create `OllamaAnalyzer` to evaluate pending tasks:
  - Input: List of pending tasks with metadata (created date, due date, priority, last update)
  - Output: Array of tasks that need reminders with reasoning
  - Criteria:
    - HIGH/URGENT tasks pending > 1 day
    - MEDIUM tasks pending > 3 days
    - Tasks with due date in next 24 hours
    - Tasks overdue

- [ ] Implement smart prompt:
```typescript
Analyze these pending tasks and determine which ones need a reminder:

Tasks:
1. Title: "Complete proposal"
   Priority: HIGH
   Created: 2 days ago
   Due: Tomorrow
   Last update: 2 days ago

2. Title: "Buy groceries"
   Priority: LOW
   Created: 1 day ago
   Due: Next week
   Last update: 1 day ago

Return ONLY tasks that need reminders with reasoning in JSON format.
```

### 2. WhatsApp MCP Integration
- [ ] Research WhatsApp MCP providers:
  - Option 1: [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
  - Option 2: [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
  - Option 3: [Green API](https://green-api.com/) (easier for personal use)
  - Option 4: [Evolution API](https://evolution-api.com/) (open source, self-hosted)

- [ ] Implement `WhatsAppMcpProvider`:
  - Connect via MCP protocol
  - Send formatted messages
  - Handle errors (user not registered, API down)
  - Rate limiting (max 1 reminder per task per day)

- [ ] Message template with multilingual support:
```typescript
interface ReminderMessage {
  emoji: string;
  title: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  daysPending: number;
  reasoning: string;
  callToAction: string;
}
```

### 3. Scheduler Service
- [ ] Install `@nestjs/schedule` package
- [ ] Create cron jobs:
  - Daily at 9 AM: Check all users' pending tasks
  - Every 6 hours: Check HIGH/URGENT tasks
  - 1 hour before due date: Send urgent reminder

- [ ] Implement `SchedulerService`:
```typescript
@Cron('0 9 * * *') // Daily at 9 AM
async checkDailyReminders() {
  const users = await this.usersService.findAllWithPendingTasks();
  
  for (const user of users) {
    const tasks = await this.tasksService.findPending(user._id);
    const analysis = await this.ollamaAnalyzer.analyze(tasks);
    
    if (analysis.needsReminder.length > 0) {
      await this.whatsappProvider.sendReminder(user.phone, analysis);
    }
  }
}
```

### 4. User Configuration
- [ ] Add to User schema:
```typescript
{
  phone: string;              // WhatsApp number
  notificationsEnabled: boolean;
  reminderPreferences: {
    frequency: 'daily' | 'twice-daily' | 'hourly';
    quietHours: { start: '22:00', end: '08:00' };
    priorityFilter: ['HIGH', 'URGENT']; // Only notify for these
  }
}
```

- [ ] Create settings page in frontend:
  - Enable/disable reminders
  - Set WhatsApp number
  - Configure frequency
  - Set quiet hours

### 5. Manual Trigger Endpoint
- [ ] `POST /reminders/check` - Manually trigger reminder check
- [ ] `POST /reminders/test` - Send test WhatsApp message
- [ ] `GET /reminders/history` - View sent reminders history

### 6. Reminder History & Analytics
- [ ] Create `Reminder` schema:
```typescript
{
  userId: ObjectId;
  taskId: ObjectId;
  sentAt: Date;
  channel: 'whatsapp' | 'email' | 'push';
  status: 'sent' | 'failed' | 'delivered' | 'read';
  aiReasoning: string;
}
```

- [ ] Track metrics:
  - Reminders sent per day
  - Tasks completed after reminder
  - User engagement rate

## Configuration

**Backend** (`backend/.env`):
```env
# AI Reminders
REMINDERS_ENABLED=true
REMINDER_CRON_SCHEDULE=0 9 * * *

# WhatsApp MCP
WHATSAPP_PROVIDER=evolution-api  # or twilio, green-api
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=your_api_key_here
WHATSAPP_INSTANCE_ID=your_instance_id

# Ollama (reuse existing)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral
```

## Frontend Integration

### Settings Page (`src/features/settings/`)
- [ ] Create `NotificationSettings.tsx`:
  - Toggle reminders on/off
  - Input WhatsApp number with validation
  - Select reminder frequency
  - Set quiet hours
  - Test notification button

### Dashboard Widget
- [ ] Show "Next Reminder Check" countdown
- [ ] Display reminder history (last 5)
- [ ] Quick toggle for reminders

## Testing

### Unit Tests
- [ ] `OllamaAnalyzer.analyze()` - Test task evaluation logic
- [ ] `WhatsAppMcpProvider.sendMessage()` - Mock MCP calls
- [ ] `SchedulerService.checkReminders()` - Test cron logic

### Integration Tests
- [ ] End-to-end: Create task → Wait 2 days (simulate) → Verify reminder sent
- [ ] Test quiet hours (no reminders during sleep)
- [ ] Test rate limiting (max 1 per task per day)

### Manual Testing
1. Create a HIGH priority task
2. Set due date to tomorrow
3. Trigger manual check: `POST /reminders/check`
4. Verify WhatsApp message received
5. Verify reminder saved in history

## Security & Privacy

- [ ] **Opt-in Only**: Users must explicitly enable reminders
- [ ] **Phone Validation**: Verify WhatsApp number before sending
- [ ] **Rate Limiting**: Prevent spam (max 10 reminders/day per user)
- [ ] **Data Privacy**: Don't send full task details, just summary
- [ ] **Encryption**: Store phone numbers encrypted
- [ ] **Unsubscribe**: Easy way to disable reminders

## Recommended MCP Provider

For MVP, recommend **Evolution API** (open source):
- ✅ Self-hosted (privacy)
- ✅ Free (no API costs)
- ✅ Easy setup with Docker
- ✅ Full WhatsApp Business API features
- ✅ MCP compatible

**Setup**:
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your_secret_key \
  atendai/evolution-api:latest
```

## Alternative: Start Simple (Email/Push)

If WhatsApp integration is complex, start with:
- **Phase 1**: Email notifications (easier, use Nodemailer)
- **Phase 2**: Browser push notifications (Web Push API)
- **Phase 3**: WhatsApp via MCP (when ready)

## Success Criteria

- [ ] AI correctly identifies tasks needing reminders
- [ ] WhatsApp messages are delivered successfully
- [ ] Users can configure reminder preferences
- [ ] Scheduler runs reliably without missing checks
- [ ] Reminders improve task completion rate (track metrics)
- [ ] No spam (users don't disable due to too many notifications)

## Future Enhancements

- [ ] Smart scheduling (learn user's active hours)
- [ ] Telegram/Slack integration
- [ ] Voice reminders (Twilio)
- [ ] AI suggests best time to send reminder
- [ ] Snooze functionality ("Remind me in 2 hours")
- [ ] Task completion confirmation via WhatsApp

## Dependencies

**Backend**:
- `@nestjs/schedule` - Cron jobs
- `node-cron` - Alternative scheduler
- Evolution API or Twilio SDK for WhatsApp

**Frontend**:
- `react-phone-number-input` - Phone number input with validation
- `libphonenumber-js` - Phone number validation

## Estimated Effort

- **Backend AI Analysis**: 4-6 hours
- **WhatsApp MCP Integration**: 6-8 hours (depends on provider)
- **Scheduler Setup**: 2-3 hours
- **Frontend Settings**: 3-4 hours
- **Testing & Refinement**: 4-5 hours

**Total**: ~20-26 hours (2-3 days)

## Notes

- Start with Evolution API for easiest setup
- Test thoroughly with quiet hours to avoid annoying users
- Consider timezone handling for international users
- AI should be conservative (better to under-notify than spam)

