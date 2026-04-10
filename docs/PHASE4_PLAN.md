# Phase 4: Personalization — Implementation Plan

**Status:** 🔵 NOT STARTED  
**Dependency:** Phase 3 ✅ COMPLETE

---

## Overview

**Goal:** Route each user into the most relevant devotional path.

Move from one-size-fits-all recommendations to personalized experiences:
- Onboarding questionnaire captures user preferences
- Preference profiles guide content discovery
- Rule-based recommendations suggest next actions
- Home feed personalized based on history and preferences

**Expected Outcome:**
- Better activation (new users find relevant content faster)
- Lower drop-off after signup
- Higher routine adoption
- Better retention through personalization

---

## Prisma Models

### `UserPreferenceProfile`
User's spiritual preferences and consumption habits.

```prisma
model UserPreferenceProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  preferredFormat   String   @default("MIXED")  // AUDIO | TEXT | MIXED
  sessionLength     String   @default("MEDIUM") // SHORT (5-10m) | MEDIUM (10-20m) | LONG (30m+)
  focusArea         String   @default("PEACE")  // PEACE | BIBLE | ROSARY | LITURGY | SLEEP | BEGINNER
  experienceLevel   String   @default("BEGINNER") // BEGINNER | INTERMEDIATE | ADVANCED

  notifyMorning     Boolean  @default(true) @map("notify_morning")
  notifyNight       Boolean  @default(true) @map("notify_night")
  timezone          String   @default("UTC")

  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("user_preference_profiles")
}
```

### `UserInterest`
Many-to-many interests for recommendation targeting.

```prisma
model UserInterest {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  interestKey   String   @map("interest_key")  // LENT, NOVENA, ROSARY, PEACE, SLEEP, FAMILY, etc.

  @@unique([userId, interestKey])
  @@map("user_interests")
}
```

### `RecommendationQueue`
Generated recommendations for home feed and nudges.

```prisma
model RecommendationQueue {
  id                String   @id @default(cuid())
  userId            String   @map("user_id")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  recommendationType String  @map("recommendation_type")  // SESSION | SERIES | CAMPAIGN | ROUTINE | BIBLE
  targetId          String   @map("target_id") // sessionId, seriesId, campaignId, etc.
  reasonKey         String   @map("reason_key") // WHY_RECOMMENDED (for UI/analytics)
  score             Float    @default(0)

  generatedAt       DateTime @default(now()) @map("generated_at")
  consumedAt        DateTime? @map("consumed_at")

  @@index([userId, consumedAt])
  @@map("recommendation_queues")
}
```

---

## New Module: `personalization`

### Service: `PreferenceService`

Methods:
- `getOrCreateProfile(userId)` — lazy-initialize profile
- `updateProfile(userId, dto)` — update preferences
- `getProfile(userId)` — get preferences
- `setInterests(userId, interests)` — update interests array

### Service: `RecommendationEngineService`

Rule-based recommendation logic.

Methods:
- `generateHomeRecommendations(userId, limit)` — top 5-10 for home feed
- `getNextBestAction(userId)` — single most relevant action
- `refreshQueue(userId)` — regenerate recommendation queue
- `markAsConsumed(recommendationId)` — record user action

**Rules Engine:**

Analyze:
1. **User History**
   - Sessions completed per content type
   - Campaign participation rate
   - Time of day most active

2. **User Preferences**
   - Preferred format (audio/text)
   - Session length
   - Focus area

3. **Current Context**
   - Time of day (morning/night)
   - Active campaigns
   - Liturgical season
   - Streak status

4. **Signal Strength**

   For each recommendation:
   ```
   score = 0
   
   // Match preference (0-30 points)
   if (content.type == user.focusArea) score += 20
   if (content.duration == user.sessionLength) score += 10
   
   // Recent activity (0-20 points)
   if (user.completedSimilar.last7days > 3) score += 20
   
   // Time of day (0-15 points)
   if (content.type == 'SLEEP' && now.hour >= 20) score += 15
   if (content.type == 'MEDITATION' && now.hour < 12) score += 15
   
   // Campaign momentum (0-20 points)
   if (user.inActiveCampaign && content.aligns) score += 20
   
   // Liturgical alignment (0-15 points)
   if (content.season == liturgicalSeason) score += 15
   ```

---

## Implementation Order

### Backend (Week 1)

1. **Prisma Migration**
   - Create models
   - Add User relations

2. **Module: personalization**
   - PreferenceService (CRUD)
   - RecommendationEngineService (rules)

3. **Controller: personalization**
   - Routes for profile CRUD
   - Route for recommendations
   - Route for next-best-action

4. **Integration Points**
   - Onboarding endpoint (receive questionnaire answers)
   - Preference-aware content discovery
   - Hook into home endpoint

5. **Seed Data**
   - Sample preferences
   - Recommendation rules (config)

---

## Endpoints

### Preferences (6 endpoints)

```bash
GET    /personalization/profile              # Get user profile + interests
POST   /personalization/profile              # Create/update profile
PATCH  /personalization/profile              # Update partial

PATCH  /personalization/interests            # Set user interests
GET    /personalization/interests            # Get user interests

GET    /personalization/recommendations     # Get recommendation queue (top 10)
GET    /personalization/next-action         # Single best action right now
```

### Onboarding (new)

```bash
POST   /auth/onboarding                      # Submit questionnaire answers
# Payload: {preferredFormat, sessionLength, focusArea, interests}
# Creates UserPreferenceProfile and UserInterest records
```

### Enriched Home Endpoint

```bash
GET    /users/me/today                       # Already exists
# Enhanced with recommended_next_actions: []
```

---

## Sample Data

### Preference Profiles

```typescript
{
  userId: "user-1",
  preferredFormat: "AUDIO",
  sessionLength: "SHORT",
  focusArea: "SLEEP",
  experienceLevel: "BEGINNER",
  timezone: "America/Sao_Paulo",
  notifyMorning: false,
  notifyNight: true
}

{
  userId: "user-2",
  preferredFormat: "MIXED",
  sessionLength: "MEDIUM",
  focusArea: "BIBLE",
  experienceLevel: "INTERMEDIATE",
  timezone: "America/Rio_de_Janeiro",
  notifyMorning: true,
  notifyNight: true
}
```

### Interests

```typescript
["LENT", "ROSARY", "FAMILY", "PEACE"]
["NOVENA", "SCRIPTURE", "BEGINNER"]
["SLEEP", "MUSIC", "CONTEMPLATION"]
```

---

## Onboarding Integration

When a user signs up:

1. **GET /auth/me** after login returns:
   ```json
   {
     "id": "...",
     "name": "...",
     "email": "...",
     "onboardingCompleted": false  // NEW FIELD
   }
   ```

2. **Mobile shows onboarding screen** with:
   - "How do you prefer to pray?" → preferredFormat
   - "How long do you have?" → sessionLength
   - "What resonates with you?" → focusArea + interests (multi-select)
   - "What's your timezone?" → timezone
   - "Notify me at..." → notifyMorning/notifyNight

3. **POST /auth/onboarding**
   ```json
   {
     "preferredFormat": "AUDIO",
     "sessionLength": "SHORT",
     "focusArea": "SLEEP",
     "interests": ["SLEEP", "MUSIC"],
     "timezone": "America/Sao_Paulo",
     "notifyMorning": false,
     "notifyNight": true
   }
   ```

4. **Backend**
   - Creates UserPreferenceProfile
   - Creates UserInterest records
   - Sets User.onboardingCompleted = true
   - Generates initial RecommendationQueue

---

## Recommendation Rules (Code)

```typescript
// Basic example
async generateHomeRecommendations(userId: string, limit = 10) {
  const profile = await this.getProfile(userId);
  const history = await this.getSessionHistory(userId, days: 30);
  const now = new Date();
  
  const candidates = [
    // Guided sessions matching preferences
    ...await this.getMatchingGuidedSessions(profile),
    
    // Active campaigns matching interests
    ...await this.getMatchingCampaigns(profile),
    
    // Series matching focus area
    ...await this.getMatchingSeries(profile),
    
    // Bible reading recommendations
    ...await this.getBibleRecommendations(history),
  ];
  
  // Score each candidate
  const scored = candidates.map(c => ({
    ...c,
    score: this.scoreRecommendation(c, profile, history, now)
  }));
  
  // Sort and return top N
  const recommended = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Queue them for tracking
  await Promise.all(
    recommended.map(r =>
      this.prisma.recommendationQueue.create({
        data: {
          userId,
          recommendationType: r.type,
          targetId: r.id,
          reasonKey: r.reason,
          score: r.score
        }
      })
    )
  );
  
  return recommended;
}
```

---

## Testing Checklist

Before shipping Phase 4:

- [ ] Onboarding creates profile and interests
- [ ] `GET /personalization/profile` returns full profile
- [ ] `PATCH /personalization/profile` updates fields
- [ ] `PATCH /personalization/interests` replaces interests
- [ ] Recommendations generated for audio-preferring user
- [ ] Recommendations generated for night-praying user
- [ ] Next-best-action returns highest-scored item
- [ ] Recommendations match focus area
- [ ] Campaign recommendations appear for interested users
- [ ] Recommendations decay after consumption
- [ ] Timezone preference impacts notification timing

---

## Success Metrics

Once Phase 4 ships, measure:

1. **Activation**
   - % of users completing onboarding
   - Time to first recommendation consumption

2. **Engagement**
   - Sessions per day for recommended content
   - Click-through rate on home recommendations
   - Time spent in guided sessions vs. other activities

3. **Retention**
   - D7 retention (users who see recommendations vs. don't)
   - Routine adoption rate for recommended routines
   - Campaign join rate for recommended campaigns

---

## Known Limitations

1. **No ML** — Rules-based only; no personalization learning from behavior yet

2. **Static Rules** — Recommendation algorithm is hardcoded; no A/B testing framework

3. **No Cold Start** — New users with no profile get generic recommendations

4. **No Seasonal Updates** — Liturgical season not auto-detected; hardcoded or manual

5. **No Collaboration Filtering** — Can't recommend based on "users like you enjoyed..."

These are acceptable for MVP; Phase 5+ can add sophistication.

---

## Next: Phase 5

Once Phase 4 ships and personalization is working:

- Admin panel for content/campaign creation
- Analytics event tracking
- Subscription/payment integration
- Batch notification scheduling
- Advanced recommendation rules (A/B testing)

