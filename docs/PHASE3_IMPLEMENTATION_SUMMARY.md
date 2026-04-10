# Phase 3: Structured Community — Implementation Summary

**Date:** 2026-04-10  
**Status:** ✅ COMPLETE  

---

## What Was Implemented

### Database (Prisma)

**5 New Models:**

1. **`PrayerCampaign`** — Collective prayer events
   - Fields: slug, title, description, category, hostType, hostId
   - Goal: PARTICIPANTS | PRAYERS | DAYS_COMPLETED
   - Dates: startDate, endDate
   - Status: isPublished flag

2. **`PrayerCampaignParticipant`** — User participation tracking
   - Fields: campaignId, userId, daysCompleted, totalSessions
   - Tracks: days_completed (increments on new day), total_sessions (increments per prayer)

3. **`PrayerCampaignUpdate`** — Campaign timeline/feed
   - Fields: campaignId, authorId, body, createdAt
   - Allows participants to share updates

4. **`CommunityGroup`** — Prayer groups beyond parish scope
   - Fields: name, description, visibility (PUBLIC|PRIVATE|PARISH_ONLY)
   - Relations: parishId (optional), createdById (required)
   - Creator automatically added as LEADER

5. **`CommunityGroupMember`** — Group membership with roles
   - Fields: role (MEMBER|MODERATOR|LEADER), joinedAt
   - Unique constraint: one user per group
   - Leader can change member roles

**Schema Updates:**
- User now has relations: campaignParticipants, campaignUpdates, communityGroups, groupMemberships
- Parish now has relation: groups

---

## Module: `campaigns`

### Service Methods

```typescript
listCampaigns(userId?, published)          // GET /campaigns
getCampaignBySlug(slug, userId)            // GET /campaigns/:slug
joinCampaign(userId, campaignId)           // POST /campaigns/:id/join
leaveCampaign(userId, campaignId)          // POST /campaigns/:id/leave
recordCampaignActivity(userId, campaignId, durationSeconds)  // POST /campaigns/:id/check-in
getCampaignUpdates(campaignId, limit)      // GET /campaigns/:id/updates
postCampaignUpdate(userId, campaignId, dto) // POST /campaigns/:id/updates
getCampaignLeaderboard(campaignId, limit)  // GET /campaigns/:id/leaderboard
```

### Activity Tracking Logic

When `recordCampaignActivity()` is called:
1. Verify user is a participant
2. Check if last activity was on a different day
3. Increment `daysCompleted` if new day
4. Always increment `totalSessions`
5. Update `lastActivityAt` to now

**Used by:** When user completes a liturgy, rosary, or guided session during a campaign.

### Leaderboard

Ordered by:
1. `daysCompleted` DESC (primary)
2. `totalSessions` DESC (tiebreaker)
3. `joinedAt` ASC (earliest first)

---

## Module: `groups`

### Service Methods

```typescript
listGroups(userId?, visibility)            // GET /groups/browse
getUserGroups(userId)                      // GET /groups/my
getGroupById(id, userId)                   // GET /groups/:id
createGroup(userId, dto)                   // POST /groups
updateGroup(userId, groupId, dto)          // PATCH /groups/:id
deleteGroup(userId, groupId)               // DELETE /groups/:id (creator only)
joinGroup(userId, groupId)                 // POST /groups/:id/join
leaveGroup(userId, groupId)                // POST /groups/:id/leave (non-leaders)
getGroupMembers(groupId)                   // GET /groups/:id/members
changeMemberRole(userId, groupId, memberId, newRole) // PATCH /groups/:id/members/:id/role
```

### Role-Based Access

| Action | LEADER | MODERATOR | MEMBER |
|--------|--------|-----------|--------|
| View members | ✅ | ✅ | ✅ |
| Edit group | ✅ | ❌ | ❌ |
| Delete group | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Leave group | ❌ | ✅ | ✅ |
| Post updates | ✅ | ✅ | ✅ |

---

## Endpoints Summary

### Campaigns (7 endpoints)

```bash
GET    /campaigns
GET    /campaigns/:slug
POST   /campaigns/:id/join
POST   /campaigns/:id/leave
POST   /campaigns/:id/check-in        { durationSeconds: 300 }
GET    /campaigns/:id/updates
POST   /campaigns/:id/updates         { body: "..." }
GET    /campaigns/:id/leaderboard
```

### Groups (10 endpoints)

```bash
GET    /groups/browse?visibility=PUBLIC
GET    /groups/my
POST   /groups                         { name, description, visibility, parishId }
GET    /groups/:id
PATCH  /groups/:id                     { name, description, visibility }
DELETE /groups/:id
POST   /groups/:id/join
POST   /groups/:id/leave
GET    /groups/:id/members
PATCH  /groups/:id/members/:id/role   { role: "MODERATOR" }
```

---

## Sample Response Objects

### Campaign with User Status

```json
{
  "id": "campaign-1",
  "slug": "lenten-40-days",
  "title": "Quaresma: 40 Dias de Oração",
  "description": "Uma jornada de 40 dias...",
  "category": "LENT",
  "hostType": "GLOBAL",
  "startDate": "2026-03-05",
  "endDate": "2026-04-19",
  "goalType": "DAYS_COMPLETED",
  "goalValue": 40,
  "isPublished": true,
  "userIsParticipant": true,
  "userParticipation": {
    "id": "part-1",
    "daysCompleted": 15,
    "totalSessions": 25,
    "lastActivityAt": "2026-04-09T18:30:00Z"
  }
}
```

### Group with Membership

```json
{
  "id": "group-1",
  "name": "Grupo de Oração - Paróquia N. Sra",
  "description": "Comunidade de oração semanal",
  "visibility": "PARISH_ONLY",
  "parishId": "parish-1",
  "createdById": "user-1",
  "createdBy": {
    "id": "user-1",
    "name": "Maria",
    "avatar": "..."
  },
  "_count": { "members": 23 },
  "userIsMember": true,
  "userMembership": {
    "id": "mem-1",
    "role": "MEMBER",
    "joinedAt": "2026-04-05T10:00:00Z"
  }
}
```

### Leaderboard

```json
[
  {
    "id": "part-1",
    "user": { "id": "u1", "name": "João", "avatar": "..." },
    "daysCompleted": 40,
    "totalSessions": 120
  },
  {
    "id": "part-2",
    "user": { "id": "u2", "name": "Maria", "avatar": "..." },
    "daysCompleted": 38,
    "totalSessions": 95
  }
]
```

---

## Integration Points

### With Session Logging

When user completes a liturgy/rosary/guided-session during a campaign:

```typescript
// In liturgy.service or similar:
await sessionsService.logCompletedSession(userId, 'LITURGY', ...);

// Also record in campaign:
if (userIsInActiveCampaign) {
  await campaignsService.recordCampaignActivity(userId, campaignId, durationSeconds);
}
```

### With XP System

Campaign participation does NOT directly award XP (XP comes from the underlying activity: liturgy, rosary, etc.). However, completing campaign goals could unlock badges in future.

---

## Testing Checklist

Before shipping Phase 3:

- [ ] `POST /campaigns/:id/join` creates participant with daysCompleted=0
- [ ] `POST /campaigns/:id/check-in` increments totalSessions (every call)
- [ ] `POST /campaigns/:id/check-in` increments daysCompleted (only on new day)
- [ ] `GET /campaigns/:id/leaderboard` ordered correctly (days desc, sessions desc)
- [ ] `POST /groups` creates group and adds creator as LEADER
- [ ] `POST /groups/:id/join` adds user as MEMBER
- [ ] `DELETE /groups/:id` only works if user is creator
- [ ] `POST /groups/:id/leave` prevents LEADER from leaving
- [ ] `PATCH /groups/:id/members/:id/role` only works for LEADER
- [ ] Campaign visibility filters work (PUBLIC, PRIVATE, PARISH_ONLY)
- [ ] Campaign date ranges are respected for participation logic

---

## Known Limitations

1. **Campaign Creation** — Currently no admin endpoint; campaigns must be created via Prisma seeding or admin panel (Phase 5)

2. **Participant Filtering** — Campaign creator is not automatically added as participant; manual join required

3. **Campaign Messaging** — Updates are open to all participants; no moderation or deletion per update

4. **Group Campaigns** — Groups can't (yet) host campaigns; campaigns are global/parish-hosted only

5. **Notifications** — Campaign updates don't trigger notifications (Phase 4)

---

## Phase 3 Complete

**Modules:** campaigns, groups  
**Endpoints:** 17 REST  
**Database models:** 5 new  
**Status:** Ready for mobile UI + admin panel  

**Next:** Phase 4 — Personalization (onboarding, preference profiles, recommendations)

