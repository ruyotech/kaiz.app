# Command Center AI - Smart Input System

> AI-powered command center that transforms user inputs (text, voice, images) into structured life management entities.

## Overview

The Command Center uses **Claude 3.5 Sonnet** to intelligently interpret user inputs and create structured drafts for:
- ✅ **Tasks** - One-time action items
- 🎯 **Epics** - Larger goals with multiple tasks
- 🏆 **Challenges** - Habits to build over time (7-90 days)
- 📅 **Events** - Scheduled appointments and reminders
- 💳 **Bills** - Financial obligations with due dates
- 📝 **Notes** - Quick captures and ideas

All outputs are automatically categorized by:
- **Life Wheel Area** (Health, Career, Finance, Growth, Relationships, Social, Fun, Home)
- **Eisenhower Quadrant** (Urgent/Important matrix)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INPUT                                      │
│  📝 Text  │  🎤 Voice  │  📷 Image  │  📎 File                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMMAND CENTER API                                   │
│  POST /api/v1/command-center/smart-input                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CLAUDE 3.5 SONNET                                     │
│  • Intent Detection        • Entity Extraction                              │
│  • Life Wheel Mapping      • Eisenhower Classification                      │
│  • Image Analysis          • Smart Suggestions                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌─────────────┐   ┌──────────────┐
            │   READY   │   │   NEEDS     │   │  SUGGEST     │
            │           │   │ CLARIFICATION│   │ ALTERNATIVE  │
            └───────────┘   └─────────────┘   └──────────────┘
                    │               │               │
                    ▼               ▼               ▼
            ┌───────────────────────────────────────────────┐
            │              PENDING DRAFT                     │
            │   → User Reviews → Approves/Modifies/Rejects  │
            └───────────────────────────────────────────────┘
                                    │
                                    ▼
            ┌───────────────────────────────────────────────┐
            │              ENTITY CREATED                    │
            │   Task | Epic | Challenge | Event | Bill      │
            └───────────────────────────────────────────────┘
```

---

## Smart Clarification Flow

Instead of long conversations, the AI asks **maximum 3-5 focused questions** to complete a draft:

### Question Types

| Type | Example | UI Component |
|------|---------|--------------|
| `SINGLE_CHOICE` | "Which life area?" | Radio buttons with icons |
| `MULTIPLE_CHOICE` | "Select labels" | Checkboxes |
| `YES_NO` | "Create as challenge?" | Two-button toggle |
| `DATE_PICKER` | "When is this due?" | Native date picker |
| `TIME_PICKER` | "What time?" | Native time picker |
| `TEXT_INPUT` | "What's the title?" | Text field |
| `NUMBER_INPUT` | "Daily target?" | Number stepper |

### Pre-built Question Templates

```java
ClarificationQuestion.lifeWheelArea()        // 8 life areas with icons
ClarificationQuestion.eisenhowerQuadrant()   // 4 quadrants with descriptions
ClarificationQuestion.challengeDuration()    // 7/14/21/30/60/90 days
ClarificationQuestion.challengeMetricType()  // Yes/No, Count, Time, Streak
ClarificationQuestion.eventDate()            // Date picker
ClarificationQuestion.billCategory()         // Subscription, utility, etc.
```

---

## Image Analysis Capabilities

The AI can analyze images and extract structured data:

| Image Type | Detection | Extracted Data |
|------------|-----------|----------------|
| 📅 **Calendar Screenshot** | Outlook, Google Calendar, Teams | Event title, date, time, attendees, location |
| 🧾 **Receipt** | Store receipts, payment confirmations | Vendor, amount, date, items |
| 💳 **Bill/Statement** | Credit card, utilities, invoices | Vendor, amount, due date, account |
| 🎂 **Invitation** | Birthday cards, party invites, wedding | Occasion, person, date, location |
| 📄 **Document** | General text documents | Extracted text content |
| ✍️ **Handwritten Note** | To-do lists, notes | Transcribed text |

### Example Scenarios

**Scenario 1: Calendar Screenshot**
```
User: [uploads Outlook calendar screenshot]
AI Response: {
  status: "READY",
  intentDetected: "EVENT",
  draft: {
    title: "Q1 Planning Meeting",
    startDateTime: "2026-01-28T10:00:00",
    endDateTime: "2026-01-28T11:30:00",
    location: "Conference Room A",
    attendees: ["john@company.com", "sarah@company.com"],
    lifeWheelArea: "lw-2" // Career
  }
}
```

**Scenario 2: Vague Fitness Goal**
```
User: "I want to become fit"
AI Response: {
  status: "SUGGEST_ALTERNATIVE",
  intentDetected: "CHALLENGE",
  reasoning: "This sounds like a habit you want to build...",
  clarificationFlow: {
    title: "Quick Suggestion",
    questions: [{
      question: "Would you like to start a 30-day fitness challenge?",
      type: "YES_NO",
      options: ["Yes, let's do it!", "No, I had something else in mind"]
    }]
  }
}
```

**Scenario 3: Credit Card Bill**
```
User: [uploads credit card statement] "Track this"
AI Response: {
  status: "READY",
  intentDetected: "BILL",
  draft: {
    title: "Chase Sapphire Payment",
    vendor: "Chase Bank",
    amount: 1247.83,
    currency: "USD",
    dueDate: "2026-02-15",
    isRecurring: true,
    recurrenceFrequency: "monthly",
    category: "credit_card",
    reminderDaysBefore: 3
  }
}
```

---

## API Endpoints

### 1. Process Smart Input
```http
POST /api/v1/command-center/smart-input
Content-Type: application/json

{
  "userId": "uuid",
  "text": "Buy groceries tomorrow",
  "voiceTranscription": null,
  "attachments": [],
  "context": {
    "timezone": "America/New_York",
    "locale": "en-US"
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid",
  "status": "READY | NEEDS_CLARIFICATION | SUGGEST_ALTERNATIVE",
  "intentDetected": "TASK | EPIC | CHALLENGE | EVENT | BILL | NOTE",
  "confidenceScore": 0.95,
  "draft": { ... },
  "reasoning": "This is a simple task...",
  "suggestions": ["Add to shopping list epic"],
  "clarificationFlow": null,
  "timestamp": "2026-01-25T10:30:00Z",
  "expiresAt": "2026-01-26T10:30:00Z"
}
```

### 2. Submit Clarification Answers
```http
POST /api/v1/command-center/smart-input/clarify
Content-Type: application/json

{
  "sessionId": "uuid",
  "flowId": "flow-uuid",
  "answers": [
    { "questionId": "life_wheel_area", "value": "lw-1" },
    { "questionId": "challenge_duration", "value": "30" }
  ]
}
```

### 3. Confirm Alternative Suggestion
```http
POST /api/v1/command-center/smart-input/{sessionId}/confirm-alternative?accepted=true
```

### 4. Draft Actions
```http
POST /api/v1/command-center/drafts/{draftId}/action
Content-Type: application/json

{
  "draftId": "uuid",
  "action": "APPROVE | MODIFY | REJECT",
  "modifications": { ... }
}
```

---

## Cost Analysis & Pricing

### Claude 3.5 Sonnet Pricing (Anthropic)

| Metric | Cost |
|--------|------|
| Input tokens | $3.00 / 1M tokens |
| Output tokens | $15.00 / 1M tokens |

### Token Usage Estimates

| Component | Input Tokens | Output Tokens |
|-----------|--------------|---------------|
| System prompt | ~3,500 | - |
| Average user input | ~100-500 | - |
| Average AI response | - | ~300-800 |
| Image description | ~500-1,500 | - |

**Average Request Cost:**
- Simple text: ~4,000 input + 400 output = **$0.018/request**
- With image: ~5,500 input + 600 output = **$0.026/request**
- **Blended average: ~$0.02/request**

### Usage Patterns

| User Type | Requests/Day | Requests/Month | Monthly Cost |
|-----------|--------------|----------------|--------------|
| 🌱 Light | 3 | 90 | $1.80 |
| 📊 Moderate | 8 | 240 | $4.80 |
| 🚀 Heavy | 20 | 600 | $12.00 |
| 💼 Power User | 40 | 1,200 | $24.00 |

---

## Subscription Plan Recommendations

### Individual Plans

| Plan | Monthly | Annual | AI Requests | Features |
|------|---------|--------|-------------|----------|
| **Free** | $0 | $0 | 30/month | Basic task creation, limited AI |
| **Basic** | $4.99 | $49.99/yr | 150/month | Full AI, all entity types |
| **Pro** | $9.99 | $99.99/yr | 500/month | Priority AI, image analysis, voice |
| **Unlimited** | $19.99 | $199.99/yr | Unlimited | All features, API access |

### Family Plans (up to 6 members)

| Plan | Monthly | Annual | AI Requests | Features |
|------|---------|--------|-------------|----------|
| **Family Basic** | $9.99 | $99.99/yr | 500/month shared | Full AI for all members |
| **Family Pro** | $19.99 | $199.99/yr | 2,000/month shared | Priority AI, shared calendars |
| **Family Ultimate** | $29.99 | $299.99/yr | Unlimited | All features, family analytics |

### Cost-Benefit Analysis

```
Monthly Pro Plan Revenue:     $9.99
Average User Cost (moderate): $4.80
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gross Margin per User:        $5.19 (52%)

Annual Pro Plan Revenue:      $99.99 ($8.33/mo effective)
Average User Annual Cost:     $57.60
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gross Margin per User:        $42.39 (42%)
```

### Recommendations

1. **Free tier is essential** for user acquisition (30 requests = ~10 days of light use)
2. **Annual discounts** (17% off) drive commitment and reduce churn
3. **Family plans** offer 50-60% savings vs individual, encouraging household adoption
4. **Overage pricing** at $0.05/request for users who exceed limits
5. **Enterprise tier** for teams with custom limits and priority support

---

## Cost Optimization Strategies

### 1. Tiered Model Selection
```
Simple inputs (< 50 chars)  → Claude 3 Haiku ($0.25/1M input)
Complex inputs              → Claude 3.5 Sonnet
Image analysis             → Claude 3.5 Sonnet (required)
```
**Potential savings: 30-40%**

### 2. Response Caching
- Cache common patterns ("buy groceries" → Task template)
- Cache Life Wheel mappings for keywords
- 24-hour cache with user-specific overrides

**Potential savings: 15-25%**

### 3. Prompt Optimization
- Reduce system prompt tokens through compression
- Use few-shot examples selectively
- Batch similar requests where possible

**Potential savings: 10-15%**

### 4. Rate Limiting
- Implement per-minute caps (10 req/min)
- Daily caps based on plan tier
- Graceful degradation to cached responses

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| AI Provider | Anthropic Claude 3.5 Sonnet |
| Framework | Spring Boot 3.4.1 + Spring AI 1.0.0 |
| Language | Java 21 (sealed interfaces, records, pattern matching) |
| Database | PostgreSQL with JSONB for draft storage |
| Cache | Redis (for sessions and response caching) |
| Mobile | React Native / Expo SDK 54 |

---

## Security Considerations

1. **API Key Protection** - Anthropic key stored in environment variables, never in code
2. **Rate Limiting** - Per-user limits to prevent abuse
3. **Input Validation** - Sanitize all user inputs before AI processing
4. **PII Handling** - Don't store raw AI conversations, only structured outputs
5. **Draft Expiration** - Auto-delete pending drafts after 24 hours

---

## Future Enhancements

- [ ] Voice input via Whisper API
- [ ] OCR preprocessing for better image text extraction
- [ ] Multi-language support
- [ ] Collaborative drafts for family plans
- [ ] AI-powered draft suggestions based on history
- [ ] Integration with external calendars (Google, Outlook)

---

## Related Documentation

- [Developer Guide](DEVELOPER_GUIDE.md)
- [Testing Guide](TESTING_GUIDE.md)
- [API Documentation](apps/backend/README.md)
