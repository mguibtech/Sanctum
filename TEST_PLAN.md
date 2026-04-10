# 🧪 API Test Plan - Sanctum Backend

**Status:** Ready for Testing  
**Last Updated:** April 10, 2026

---

## 📋 Pre-Test Checklist

- [x] Build compiles successfully
- [x] All 16 modules integrated
- [x] Database migrations properly formatted
- [x] Seed data available
- [ ] Database running (needs setup)
- [ ] API server started
- [ ] Authentication configured

---

## 🔑 Phase 1: Authentication & User Management

### 1.1 Registration
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "João Silva"
}
Expected: 201 Created + tokens
```

### 1.2 Login
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!"
}
Expected: 200 OK + { accessToken, refreshToken }
```

### 1.3 Get Current User
```
GET /auth/me
Header: Authorization: Bearer <accessToken>
Expected: 200 OK + user profile
```

### 1.4 Refresh Token
```
POST /auth/refresh
Body: { "refreshToken": "<token>" }
Expected: 200 OK + new tokens
```

### 1.5 Logout
```
POST /auth/logout
Body: { "refreshToken": "<token>" }
Expected: 200 OK
```

### 1.6 Complete Onboarding
```
POST /auth/onboarding
Body: {
  "focusArea": "PEACE",
  "preferredFormat": "AUDIO",
  "sessionLength": "MEDIUM",
  "interests": ["LENT", "NOVENA"]
}
Expected: 200 OK + preference profile
```

---

## 📖 Phase 2: Bible Module

### 2.1 Get Books
```
GET /bible/books
Expected: 200 OK + [{ id, name, ... }]
```

### 2.2 Get Chapters
```
GET /bible/books/GEN/chapters
Expected: 200 OK + [{ number, versesCount, ... }]
```

### 2.3 Get Chapter Content
```
GET /bible/books/GEN/chapters/1
Expected: 200 OK + { verses: [{ number, text, reference }] }
```

### 2.4 Health Check
```
GET /bible/health
Expected: 200 OK + { ok, source, cachedChapters, ... }
```

### 2.5 Save Progress
```
POST /bible/progress
Body: {
  "bookId": "GEN",
  "bookName": "Genesis",
  "chapterNum": 1,
  "contemplated": true,
  "verseStart": 1,
  "verseEnd": 5
}
Expected: 201 Created + progress record
```

### 2.6 Get Progress
```
GET /bible/progress
Expected: 200 OK + { books: [{ bookId, progress, ... }] }
```

### 2.7 Get Book Progress
```
GET /bible/books/GEN/progress
Expected: 200 OK + { totalChapters, completedChapters, percentage, ... }
```

### 2.8 Save Passage
```
POST /bible/saved-passages
Body: {
  "bookId": "GEN",
  "bookName": "Genesis",
  "chapterNum": 1,
  "verseStart": 1,
  "verseEnd": 3,
  "note": "Beautiful creation account"
}
Expected: 201 Created + { id, reference, text, ... }
```

### 2.9 List Saved Passages
```
GET /bible/saved-passages
GET /bible/saved-passages?bookId=GEN
GET /bible/saved-passages?bookId=GEN&chapterNum=1
Expected: 200 OK + [{ id, reference, text, note, ... }]
```

### 2.10 Remove Passage
```
DELETE /bible/saved-passages/:id
Expected: 200 OK
```

---

## 🙏 Phase 3: Prayer & Liturgy

### 3.1 Get Daily Liturgy
```
GET /liturgy/2026-04-10
Expected: 200 OK + { gospel, gospelReference, firstReading, ... }
```

### 3.2 Mark Liturgy Complete
```
POST /liturgy/2026-04-10/complete
Body: { "contemplated": true }
Expected: 201 Created
```

### 3.3 Get Rosary
```
GET /rosary/JOYFUL
Expected: 200 OK + { mysteries: [{ name, mysteries: [...] }] }
```

### 3.4 Save Rosary Completion
```
POST /rosary/JOYFUL/complete
Body: { "mysteryIndex": 0 }
Expected: 201 Created
```

### 3.5 Get Prayer Requests
```
GET /community/requests
Expected: 200 OK + [{ id, content, prayerCount, ... }]
```

### 3.6 Post Prayer Request
```
POST /community/requests
Body: {
  "content": "Pray for my family's health",
  "isAnonymous": false
}
Expected: 201 Created
```

### 3.7 Pray for Intention
```
POST /community/requests/:id/pray
Expected: 200 OK + { prayerCount: incremented }
```

---

## ⏰ Phase 4: Reminders & Routines

### 4.1 Create Reminder
```
POST /reminders
Body: {
  "title": "Morning Prayer",
  "timeOfDay": "07:00",
  "daysOfWeek": ["MON", "WED", "FRI"]
}
Expected: 201 Created
```

### 4.2 List Reminders
```
GET /reminders
Expected: 200 OK + [{ id, title, timeOfDay, ... }]
```

### 4.3 Update Reminder
```
PATCH /reminders/:id
Body: { "title": "Updated Prayer" }
Expected: 200 OK
```

### 4.4 Toggle Reminder
```
PATCH /reminders/:id/toggle
Expected: 200 OK + { isActive: toggled }
```

### 4.5 Delete Reminder
```
DELETE /reminders/:id
Expected: 200 OK
```

### 4.6 Get Daily Plan
```
GET /users/me/today
Expected: 200 OK + {
  "date": "2026-04-10",
  "reminders": [...],
  "routines": [...],
  "goals": [...],
  "stats": {...}
}
```

---

## 📚 Phase 5: Content & Campaigns

### 5.1 Get Featured Content
```
GET /content/featured
Expected: 200 OK + [{ id, title, description, ... }]
```

### 5.2 Browse Series
```
GET /content/series
Expected: 200 OK + [{ id, slug, title, category, ... }]
```

### 5.3 Get Series Details
```
GET /content/series/seven-day-lenten-reflection
Expected: 200 OK + { sessions: [...], userProgress: {...} }
```

### 5.4 Start Series
```
POST /content/series/:id/start
Expected: 200 OK + { userProgress created }
```

### 5.5 Get Session
```
GET /content/sessions/:id
Expected: 200 OK + { title, description, audio, script, ... }
```

### 5.6 Complete Session
```
POST /content/sessions/:id/complete
Expected: 200 OK + XP awarded
```

### 5.7 List Campaigns
```
GET /campaigns
Expected: 200 OK + [{ id, slug, title, goal, participants, ... }]
```

### 5.8 Get Campaign Details
```
GET /campaigns/:slug
Expected: 200 OK + { title, participants, leaderboard, ... }
```

### 5.9 Join Campaign
```
POST /campaigns/:id/join
Expected: 200 OK + participant record
```

### 5.10 Check-in Campaign
```
POST /campaigns/:id/check-in
Expected: 200 OK + { days_completed incremented }
```

### 5.11 Get Campaign Leaderboard
```
GET /campaigns/:id/leaderboard
Expected: 200 OK + [{ rank, user, score, ... }]
```

---

## 👥 Phase 6: Community Groups

### 6.1 Browse Groups
```
GET /groups/browse
Expected: 200 OK + [{ id, name, visibility, members, ... }]
```

### 6.2 Get My Groups
```
GET /groups/my
Expected: 200 OK + [groups joined by user]
```

### 6.3 Create Group
```
POST /groups
Body: {
  "name": "Prayer Warriors",
  "description": "Community for prayer",
  "visibility": "PUBLIC"
}
Expected: 201 Created
```

### 6.4 Join Group
```
POST /groups/:id/join
Expected: 200 OK
```

### 6.5 Get Group Members
```
GET /groups/:id/members
Expected: 200 OK + [{ user, role, joinedAt, ... }]
```

### 6.6 Change Member Role
```
PATCH /groups/:id/members/:memberId/role
Body: { "role": "MODERATOR" }
Expected: 200 OK
```

---

## 🎮 Phase 7: Gamification

### 7.1 Get User Stats
```
GET /users/stats
Expected: 200 OK + { xp, level, badges, streaks, ... }
```

### 7.2 Get Streak Status
```
GET /streak
Expected: 200 OK + { currentStreak, longestStreak, shields, ... }
```

### 7.3 Claim Streak Shield
```
POST /streak/shield
Expected: 200 OK
```

### 7.4 Get Ranking
```
GET /streak/ranking
GET /streak/ranking?metric=xp&period=week
Expected: 200 OK + [{ rank, user, score, ... }]
```

---

## 🎯 Phase 8: Personalization

### 8.1 Get Profile
```
GET /personalization/profile
Expected: 200 OK + {
  "preferredFormat": "AUDIO",
  "sessionLength": "MEDIUM",
  "focusArea": "PEACE"
}
```

### 8.2 Update Profile
```
PATCH /personalization/profile
Body: { "focusArea": "BIBLE" }
Expected: 200 OK
```

### 8.3 Get Interests
```
GET /personalization/interests
Expected: 200 OK + ["LENT", "NOVENA", ...]
```

### 8.4 Set Interests
```
PATCH /personalization/interests
Body: { "interests": ["LENT", "FAMILY", "SLEEP"] }
Expected: 200 OK
```

### 8.5 Get Recommendations
```
GET /personalization/recommendations
Expected: 200 OK + [{
  "type": "SESSION|SERIES|CAMPAIGN",
  "id": "...",
  "score": 45,
  "reason": "..."
}]
```

### 8.6 Get Next Action
```
GET /personalization/recommendations/next-action
Expected: 200 OK + top recommendation or null
```

### 8.7 Refresh Recommendations
```
POST /personalization/recommendations/refresh
Expected: 200 OK + [regenerated recommendations]
```

### 8.8 Mark Recommendation Consumed
```
POST /personalization/recommendations/:id/consume
Expected: 200 OK
```

---

## ❌ Error Scenarios

### Auth Errors
```
POST /auth/login
Body: { "email": "wrong@example.com", "password": "wrong" }
Expected: 401 Unauthorized
```

### Not Found
```
GET /bible/books/INVALID/chapters
Expected: 404 Not Found
```

### Missing Auth
```
GET /bible/progress
(no Authorization header)
Expected: 401 Unauthorized
```

### Validation Error
```
POST /reminders
Body: { "timeOfDay": "invalid" }
Expected: 400 Bad Request
```

---

## 🧮 Performance Tests

- [ ] Get /bible/progress with 1000+ verses
- [ ] List /campaigns with 10000+ participants
- [ ] Get /stride/ranking with 5000+ users
- [ ] Search /content/search with complex filters
- [ ] Bulk recommendation generation

---

## ✅ Acceptance Criteria

- [ ] All endpoints return correct status codes
- [ ] Response schemas match documentation
- [ ] Auth guard blocks unauthenticated requests
- [ ] Validation catches invalid inputs
- [ ] Database queries complete within <500ms
- [ ] No N+1 query problems
- [ ] Proper error messages provided
- [ ] Rate limiting functional

---

## 🚀 Test Execution Order

1. **Start API** → `npm run start:dev`
2. **Register User** → Get tokens
3. **Run Phase Tests** → Sequential phase testing
4. **Run Error Scenarios** → Verify error handling
5. **Performance Tests** → Load testing (if database available)

---

**Note:** Actual test execution requires a running PostgreSQL database with migrations applied.

