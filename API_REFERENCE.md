# 📚 Sanctum API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000`  
**Auth:** JWT Bearer Token (header: `Authorization: Bearer <token>`)

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Bible Module](#bible-module)
3. [Liturgy Module](#liturgy-module)
4. [Rosary Module](#rosary-module)
5. [Community Module](#community-module)
6. [Reminders Module](#reminders-module)
7. [Content Library](#content-library)
8. [Campaigns Module](#campaigns-module)
9. [Groups Module](#groups-module)
10. [Users Module](#users-module)
11. [Streak Module](#streak-module)
12. [Personalization Module](#personalization-module)
13. [Error Handling](#error-handling)

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "João Silva"
}

Response: 201 Created
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "email": "user@example.com",
  "name": "João Silva",
  "onboardingCompleted": true,
  "createdAt": "2026-04-10T..."
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response: 200 OK
```

### Complete Onboarding
```http
POST /auth/onboarding
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "preferredFormat": "AUDIO",     // AUDIO | TEXT | MIXED
  "sessionLength": "MEDIUM",       // SHORT | MEDIUM | LONG
  "focusArea": "PEACE",            // PEACE | BIBLE | ROSARY | LITURGY | SLEEP | BEGINNER
  "experienceLevel": "BEGINNER",   // BEGINNER | INTERMEDIATE | ADVANCED
  "interests": ["LENT", "NOVENA"],
  "notifyMorning": true,
  "notifyNight": true,
  "timezone": "America/Sao_Paulo"
}

Response: 200 OK
{
  "id": "clv2...",
  "userId": "clv2...",
  "preferredFormat": "AUDIO",
  "sessionLength": "MEDIUM",
  ...
}
```

---

## Bible Module

### Get All Books
```http
GET /bible/books
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "GEN",
    "name": "Genesis",
    "abbreviation": "Gn"
  },
  ...
]
```

### Get Bible Health Status
```http
GET /bible/health
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "ok": true,
  "source": "local-cache",
  "booksCount": 73,
  "cachedChapters": 1189,
  "cacheReady": true,
  "credentialsConfigured": true
}
```

### Get Chapters of Book
```http
GET /bible/books/:bookId/chapters
Authorization: Bearer <accessToken>

Example: GET /bible/books/GEN/chapters

Response: 200 OK
[
  { "number": 1, "versesCount": 31 },
  { "number": 2, "versesCount": 25 },
  ...
]
```

### Get Chapter Content
```http
GET /bible/books/:bookId/chapters/:num
Authorization: Bearer <accessToken>

Example: GET /bible/books/GEN/chapters/1

Response: 200 OK
{
  "bookId": "GEN",
  "chapterNum": 1,
  "verses": [
    {
      "number": 1,
      "text": "In the beginning...",
      "reference": "Genesis 1:1"
    },
    ...
  ]
}
```

### Save Reading Progress
```http
POST /bible/progress
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bookId": "GEN",
  "bookName": "Genesis",
  "chapterNum": 1,
  "contemplated": true,
  "verseStart": 1,
  "verseEnd": 5
}

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "bookId": "GEN",
  "chapterNum": 1,
  "contemplated": true,
  "lastReadAt": "2026-04-10T..."
}
```

### Get Reading Progress
```http
GET /bible/progress
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "books": [
    {
      "bookId": "GEN",
      "bookName": "Genesis",
      "totalChapters": 50,
      "completedChapters": 5,
      "percentage": 10
    },
    ...
  ],
  "totalChapters": 1189,
  "completedChapters": 45,
  "overallPercentage": 3.78
}
```

### Get Book-Level Progress
```http
GET /bible/books/:bookId/progress
Authorization: Bearer <accessToken>

Example: GET /bible/books/GEN/progress

Response: 200 OK
{
  "bookId": "GEN",
  "bookName": "Genesis",
  "totalChapters": 50,
  "completedChapters": 15,
  "completionPercentage": 30,
  "lastReadAt": "2026-04-10T..."
}
```

### Save Passage
```http
POST /bible/saved-passages
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bookId": "GEN",
  "bookName": "Genesis",
  "chapterNum": 1,
  "verseStart": 1,
  "verseEnd": 3,
  "note": "Beautiful creation account"
}

Response: 201 Created
{
  "id": "clv2...",
  "bookId": "GEN",
  "chapterNum": 1,
  "reference": "Genesis 1:1-3",
  "text": "In the beginning...",
  "note": "Beautiful creation account",
  "createdAt": "2026-04-10T..."
}
```

### List Saved Passages
```http
GET /bible/saved-passages
Authorization: Bearer <accessToken>

Query Parameters:
- bookId: string (optional) - Filter by book
- chapterNum: number (optional) - Filter by chapter

Examples:
GET /bible/saved-passages
GET /bible/saved-passages?bookId=GEN
GET /bible/saved-passages?bookId=GEN&chapterNum=1

Response: 200 OK
[
  {
    "id": "clv2...",
    "bookId": "GEN",
    "reference": "Genesis 1:1-3",
    "text": "In the beginning...",
    "note": "Beautiful creation",
    "createdAt": "2026-04-10T..."
  },
  ...
]
```

### Remove Saved Passage
```http
DELETE /bible/saved-passages/:id
Authorization: Bearer <accessToken>

Example: DELETE /bible/saved-passages/clv2xyz

Response: 200 OK
```

---

## Liturgy Module

### Get Daily Liturgy
```http
GET /liturgy/:date
Authorization: Bearer <accessToken>

Example: GET /liturgy/2026-04-10

Response: 200 OK
{
  "date": "2026-04-10",
  "gospel": "John 20:19-31",
  "gospelReference": "John 20:19-31",
  "firstReading": "Acts 4:32-35",
  "secondReading": "1 John 1:1-2:2",
  "psalm": "Psalm 118:2-4...",
  "reflection": "Today's reflection text...",
  "homily": "Optional homily text...",
  "homilyAudioUrl": "https://...",
  "liturgicalSeason": "Easter Season"
}
```

### Mark Liturgy as Completed
```http
POST /liturgy/:date/complete
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "contemplated": true
}

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "date": "2026-04-10",
  "contemplated": true,
  "completedAt": "2026-04-10T..."
}
```

---

## Rosary Module

### Get Rosary Mysteries
```http
GET /rosary/:mystery
Authorization: Bearer <accessToken>

Example: GET /rosary/JOYFUL

Available mysteries: JOYFUL, SORROWFUL, GLORIOUS, LUMINOUS

Response: 200 OK
{
  "type": "JOYFUL",
  "name": "Joyful Mysteries",
  "mysteries": [
    { "number": 1, "name": "The Annunciation", "passage": "Luke 1:26-38" },
    ...
  ]
}
```

### Mark Mystery as Completed
```http
POST /rosary/:mystery/complete
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "mysteryIndex": 0
}

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "mysteryType": "JOYFUL",
  "mysteryIndex": 0,
  "completedAt": "2026-04-10T..."
}
```

---

## Community Module

### Get Prayer Requests
```http
GET /community/requests
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "userId": "clv2...",
    "content": "Please pray for my family's health",
    "isAnonymous": false,
    "prayerCount": 15,
    "reportCount": 0,
    "isHidden": false,
    "createdAt": "2026-04-09T..."
  },
  ...
]
```

### Post Prayer Request
```http
POST /community/requests
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "Please pray for my family's health",
  "isAnonymous": false
}

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "content": "Please pray for my family's health",
  "isAnonymous": false,
  "prayerCount": 0,
  "createdAt": "2026-04-10T..."
}
```

### Pray for Intention
```http
POST /community/requests/:id/pray
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "prayerCount": 16
}
```

---

## Reminders Module

### Create Reminder
```http
POST /reminders
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Morning Prayer",
  "timeOfDay": "07:00",
  "daysOfWeek": ["MON", "WED", "FRI"],
  "timezone": "America/Sao_Paulo"
}

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "title": "Morning Prayer",
  "timeOfDay": "07:00",
  "daysOfWeek": ["MON", "WED", "FRI"],
  "isActive": true,
  "createdAt": "2026-04-10T..."
}
```

### List Reminders
```http
GET /reminders
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "title": "Morning Prayer",
    "timeOfDay": "07:00",
    "daysOfWeek": ["MON", "WED", "FRI"],
    "isActive": true,
    "createdAt": "2026-04-10T..."
  },
  ...
]
```

### Update Reminder
```http
PATCH /reminders/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated Prayer Time"
}

Response: 200 OK
```

### Toggle Reminder Status
```http
PATCH /reminders/:id/toggle
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "isActive": false
}
```

### Delete Reminder
```http
DELETE /reminders/:id
Authorization: Bearer <accessToken>

Response: 200 OK
```

---

## Content Library

### Get Featured Content
```http
GET /content/featured
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "slug": "seven-day-lenten-reflection",
    "title": "Reflexão Quaresmal de 7 Dias",
    "description": "...",
    "category": "LENT",
    "level": "BEGINNER",
    "imageUrl": "https://...",
    "priority": 10,
    "isPublished": true
  },
  ...
]
```

### Browse Content Series
```http
GET /content/series
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "slug": "seven-day-lenten-reflection",
    "title": "Reflexão Quaresmal de 7 Dias",
    "category": "LENT",
    "level": "BEGINNER",
    "estimatedDays": 7,
    "isPublished": true
  },
  ...
]
```

### Get Series Details
```http
GET /content/series/:slug
Authorization: Bearer <accessToken>

Example: GET /content/series/seven-day-lenten-reflection

Response: 200 OK
{
  "id": "clv2...",
  "slug": "seven-day-lenten-reflection",
  "title": "Reflexão Quaresmal de 7 Dias",
  "description": "...",
  "sessions": [
    {
      "id": "clv2...",
      "title": "Day 1: Ash Wednesday",
      "dayNumber": 1,
      "durationSeconds": 600
    },
    ...
  ],
  "userProgress": {
    "currentDay": 1,
    "completedSessions": 0,
    "completed": false,
    "startedAt": "2026-04-10T..."
  }
}
```

### Start Series
```http
POST /content/series/:id/start
Authorization: Bearer <accessToken>

Response: 201 Created
{
  "id": "clv2...",
  "userId": "clv2...",
  "seriesId": "clv2...",
  "currentDay": 1,
  "startedAt": "2026-04-10T..."
}
```

### Get Session Details
```http
GET /content/sessions/:id
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "seriesId": "clv2...",
  "title": "Day 1: Ash Wednesday",
  "description": "...",
  "sessionType": "MEDITATION",
  "dayNumber": 1,
  "durationSeconds": 600,
  "scriptText": "Full meditation script...",
  "audio": {
    "id": "clv2...",
    "url": "https://...",
    "durationSeconds": 600,
    "voiceName": "Mariana (female)"
  }
}
```

### Complete Session
```http
POST /content/sessions/:id/complete
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "completed": true,
  "xpAwarded": 10,
  "sessionProgress": {
    "seriesId": "clv2...",
    "currentDay": 2,
    "completedSessions": 1
  }
}
```

### Search Content
```http
GET /content/search
Authorization: Bearer <accessToken>

Query Parameters:
- q: string - Search query
- category: string - Filter by category
- level: string - Filter by level

Response: 200 OK
[
  // Matching series and sessions
]
```

---

## Campaigns Module

### List Campaigns
```http
GET /campaigns
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "slug": "lenten-40-days",
    "title": "40 Days of Lent",
    "description": "...",
    "category": "LENT",
    "startDate": "2026-02-26T...",
    "endDate": "2026-04-09T...",
    "goalType": "DAYS_COMPLETED",
    "goalValue": 40,
    "participantCount": 1250,
    "isPublished": true
  },
  ...
]
```

### Get Campaign Details
```http
GET /campaigns/:slug
Authorization: Bearer <accessToken>

Example: GET /campaigns/lenten-40-days

Response: 200 OK
{
  "id": "clv2...",
  "slug": "lenten-40-days",
  "title": "40 Days of Lent",
  "description": "...",
  "goalType": "DAYS_COMPLETED",
  "goalValue": 40,
  "participants": [
    {
      "userId": "clv2...",
      "userName": "João Silva",
      "daysCompleted": 25,
      "totalSessions": 45,
      "joinedAt": "2026-02-26T..."
    },
    ...
  ]
}
```

### Join Campaign
```http
POST /campaigns/:id/join
Authorization: Bearer <accessToken>

Response: 201 Created
{
  "id": "clv2...",
  "campaignId": "clv2...",
  "userId": "clv2...",
  "daysCompleted": 0,
  "joinedAt": "2026-04-10T..."
}
```

### Check-in Campaign
```http
POST /campaigns/:id/check-in
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "campaignId": "clv2...",
  "daysCompleted": 1,
  "totalSessions": 1,
  "lastActivityAt": "2026-04-10T..."
}
```

### Get Campaign Leaderboard
```http
GET /campaigns/:id/leaderboard
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "rank": 1,
    "userId": "clv2...",
    "userName": "João Silva",
    "daysCompleted": 40,
    "totalSessions": 120,
    "lastActivityAt": "2026-04-09T..."
  },
  ...
]
```

---

## Groups Module

### Browse Public Groups
```http
GET /groups/browse
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "name": "Prayer Warriors",
    "description": "...",
    "visibility": "PUBLIC",
    "memberCount": 45,
    "createdBy": "clv2...",
    "createdAt": "2026-04-01T..."
  },
  ...
]
```

### Get My Groups
```http
GET /groups/my
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "name": "Prayer Warriors",
    "description": "...",
    "visibility": "PUBLIC",
    "memberCount": 45,
    "role": "MEMBER"
  },
  ...
]
```

### Create Group
```http
POST /groups
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Prayer Warriors",
  "description": "Community for daily prayer",
  "visibility": "PUBLIC"  // PUBLIC | PRIVATE | PARISH_ONLY
}

Response: 201 Created
{
  "id": "clv2...",
  "name": "Prayer Warriors",
  "description": "...",
  "visibility": "PUBLIC",
  "createdById": "clv2...",
  "createdAt": "2026-04-10T..."
}
```

### Join Group
```http
POST /groups/:id/join
Authorization: Bearer <accessToken>

Response: 201 Created
{
  "groupId": "clv2...",
  "userId": "clv2...",
  "role": "MEMBER",
  "joinedAt": "2026-04-10T..."
}
```

### Get Group Members
```http
GET /groups/:id/members
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "userId": "clv2...",
    "userName": "João Silva",
    "role": "LEADER",
    "joinedAt": "2026-04-01T..."
  },
  ...
]
```

---

## Users Module

### Get Daily Plan
```http
GET /users/me/today
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "date": "2026-04-10",
  "reminders": [
    {
      "id": "clv2...",
      "title": "Morning Prayer",
      "timeOfDay": "07:00",
      "isActive": true
    },
    ...
  ],
  "routines": [
    {
      "id": "clv2...",
      "name": "Morning Routine",
      "estimatedMinutes": 30,
      "items": [...]
    },
    ...
  ],
  "goals": [
    {
      "id": "clv2...",
      "title": "Read Bible Chapter",
      "targetDays": 7,
      "completedDays": 3
    },
    ...
  ],
  "gamification": {
    "currentXp": 450,
    "level": 3,
    "levelName": "Discípulo",
    "xpToNextLevel": 550,
    "currentStreak": 15,
    "badges": 5
  }
}
```

### Get User Stats
```http
GET /users/stats
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "userId": "clv2...",
  "xp": 450,
  "level": 3,
  "totalLiturgyRead": 45,
  "totalBibleChapters": 15,
  "totalContemplated": 20,
  "badges": 5,
  "achievements": [
    {
      "id": "clv2...",
      "name": "Bible Beginner",
      "description": "Read 10 chapters"
    },
    ...
  ]
}
```

---

## Streak Module

### Get Streak Status
```http
GET /streak
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "userId": "clv2...",
  "currentStreak": 15,
  "longestStreak": 45,
  "shields": 1,
  "lastActivityAt": "2026-04-10T..."
}
```

### Get Leaderboard
```http
GET /streak/ranking
Authorization: Bearer <accessToken>

Query Parameters:
- metric: string - streak | xp | bible | contemplation (default: streak)
- period: string - week | month | allTime (default: allTime)

Examples:
GET /streak/ranking
GET /streak/ranking?metric=xp&period=week
GET /streak/ranking?metric=bible&period=month

Response: 200 OK
[
  {
    "rank": 1,
    "userId": "clv2...",
    "userName": "Maria Santos",
    "score": 450,    // varies by metric
    "metric": "streak"
  },
  ...
]
```

---

## Personalization Module

### Get Preference Profile
```http
GET /personalization/profile
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "userId": "clv2...",
  "preferredFormat": "AUDIO",
  "sessionLength": "MEDIUM",
  "focusArea": "PEACE",
  "experienceLevel": "BEGINNER",
  "notifyMorning": true,
  "notifyNight": true,
  "timezone": "America/Sao_Paulo",
  "createdAt": "2026-04-10T..."
}
```

### Update Preference Profile
```http
PATCH /personalization/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "focusArea": "BIBLE",
  "notifyMorning": false
}

Response: 200 OK
```

### Get Interests
```http
GET /personalization/interests
Authorization: Bearer <accessToken>

Response: 200 OK
[
  "LENT",
  "NOVENA",
  "ROSARY"
]
```

### Set Interests
```http
PATCH /personalization/interests
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "interests": ["LENT", "FAMILY", "SLEEP"]
}

Response: 200 OK
```

### Get Recommendations
```http
GET /personalization/recommendations
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "clv2...",
    "userId": "clv2...",
    "recommendationType": "SESSION",
    "targetId": "clv2...",
    "reasonKey": "GUIDED_SESSION_MATCH",
    "score": 45,
    "generatedAt": "2026-04-10T...",
    "consumedAt": null
  },
  ...
]
```

### Get Next Best Action
```http
GET /personalization/recommendations/next-action
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "recommendationType": "SESSION",
  "targetId": "clv2...",
  "score": 45,
  "reason": "GUIDED_SESSION_MATCH"
}
```

### Refresh Recommendations
```http
POST /personalization/recommendations/refresh
Authorization: Bearer <accessToken>

Response: 200 OK
[
  // Newly generated recommendations
]
```

### Mark Recommendation Consumed
```http
POST /personalization/recommendations/:id/consume
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "clv2...",
  "consumedAt": "2026-04-10T..."
}
```

---

## Error Handling

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid input or validation failure |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User lacks required permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists or state conflict |
| 429 | Too Many Requests | Rate limit exceeded (100 req/60s) |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Bible API or external service unavailable |

### Example Error Response
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "wrong"
}

Response: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per 60 seconds** per IP address.

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1713000600
```

When limit exceeded:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

---

## Pagination

Currently, list endpoints return all results. Pagination will be added in future versions.

---

**Last Updated:** April 10, 2026  
**Status:** Production Ready

