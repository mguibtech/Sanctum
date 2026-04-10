# Test Plan - Sanctum Mobile Phase 1

## Overview

Test plan for Phase 1 of Sanctum mobile app focusing on:
- Reminders system
- Goals system  
- Activity tracking
- Session logging
- Integration with existing features

## Test Metrics

| Category | Target | Status | Notes |
|----------|--------|--------|-------|
| Unit Tests | 80% | 🟡 Started | 3/10 hooks tested |
| Component Tests | 70% | 🟡 Started | 1/26 components |
| Integration Tests | 60% | 🟡 Started | 1/22 screens |
| **Overall Coverage** | **60%** | 🟡 35% | Growing |

---

## Phase 1 Test Suite

### A. Hooks Testing (10 hooks × 3 test categories = 30 tests)

#### ✅ Complete (13/30 tests)
- [x] `useReminders` - Initialization, CRUD, utilities (6 tests)
- [x] `useGoals` - Initialization, CRUD, utilities (7 tests)

#### 🟡 In Progress (4/30 tests)
- [x] `useAuth` - Login, register, logout, refresh (4 tests)

#### ⏳ Pending (13/30 tests)
- [ ] `useRoutines` - Template creation, items, completion
- [ ] `useUserStats` - Stats fetching, badge checks
- [ ] `useWeeklyChallenges` - Challenge loading, progress
- [ ] `useStreakNotification` - Notification scheduling
- [ ] `useOnboarding` - Completion tracking
- [ ] `useThemeMode` - Theme persistence
- [ ] `useAppAlert` - Alert display
- Plus utility tests for each

### B. Component Testing (26 components × 4 test categories = 104 tests)

#### ✅ Complete (8/104 tests)
- [x] `Button` - Rendering, interactions, states, accessibility (8 tests)

#### 🟡 Critical Components (Next Priority)
- [ ] `TextField` - Input, validation, error states (8 tests)
- [ ] `Box` - Layout, flex, styling (6 tests)
- [ ] `Text` - Variants, colors, sizing (6 tests)
- [ ] `Card` - Variants, elevation, content (6 tests)
- [ ] `Icon` - Rendering, sizes, colors (4 tests)

#### ⏳ Secondary Components
- [ ] `Badge` - Rendering, variants
- [ ] `Checkbox` - State management
- [ ] `Switch` - Toggle behavior
- [ ] `Tag` - Styling variants
- [ ] `ProgressBar` - Progress display
- [ ] `Rating` - Interaction
- [ ] `Divider` - Layout
- [ ] `Screen` - Full screen wrapper
- [ ] `Logo` - Rendering
- [ ] `ConfettiOverlay` - Animation
- [ ] `DailyHistoryCalendar` - Calendar display
- [ ] `WeeklyActivityChart` - Activity display
- [ ] `WeeklyChallengesCard` - Challenge display
- [ ] `XpToast` - Toast notification
- [ ] `SkeletonLoader` - Loading states

### C. Screen Integration Tests (22 screens × 2-3 test categories = 50+ tests)

#### ✅ Complete (1/50 tests)
- [x] `HomeScreen` - Rendering, API integration, interactions (15 tests)

#### 🟡 Critical Screens (Next Priority)
- [ ] `RemindersScreen` - List, create, edit, delete (12 tests)
- [ ] `GoalsScreen` - List, create, edit, delete (12 tests)
- [ ] `RoutinesScreen` - Templates, items, completion (10 tests)

#### ⏳ Secondary Screens
- [ ] `ProfileScreen` - Stats, badges, leaderboard
- [ ] `BibleScreen` - Books, chapters, progress
- [ ] `RosaryScreen` - Guided prayer, completion
- [ ] `CommunityScreen` - Requests, prayers, moderation
- [ ] `LiturgyScreen` - Daily readings
- [ ] `AuthScreens` - Login, register
- [ ] `OnboardingScreen` - Flow completion

### D. API Integration Tests (47 endpoints)

#### ✅ Mocked
- [x] All endpoints stubbed with jest.mock

#### 🟡 Validate Format
- [ ] Test response formats match expected types
- [ ] Test error scenarios (400, 401, 500)
- [ ] Test timeout handling
- [ ] Test token refresh on 401

#### ⏳ Backend Ready
- [ ] Integration tests with real API
- [ ] Performance benchmarks
- [ ] Rate limiting behavior

---

## Test Execution Order

### Week 1: Foundation (30 tests)
```
Day 1: Setup + useAuth tests ✓
Day 2: useReminders tests ✓
Day 3: useGoals tests ✓
Day 4: Button component tests ✓
Day 5: TextField component tests
```

### Week 2: Critical Components (30 tests)
```
Day 1-2: Box, Text, Card components
Day 3-4: RemindersScreen integration tests
Day 5: GoalsScreen integration tests
```

### Week 3: Full Coverage (20+ tests)
```
Day 1-3: Remaining component tests
Day 4-5: Additional screen tests
```

---

## Test Categories by Priority

### 🔴 HIGH PRIORITY (Must Have)
1. **Authentication Flow**
   - Login/logout
   - Token refresh
   - Error handling

2. **Reminders System**
   - Create, read, update, delete
   - Toggle enable/disable
   - Time validation

3. **Goals System**
   - Create, read, update, delete
   - Type validation
   - Goal suggestions

4. **Home Screen**
   - Data loading
   - Error states
   - Pull-to-refresh

5. **Session Tracking**
   - Session start/complete
   - Activity summary
   - Daily history

### 🟡 MEDIUM PRIORITY (Should Have)
1. **Routines Management**
   - Template creation
   - Item management
   - Completion tracking

2. **Navigation**
   - Route transitions
   - Deeplinks
   - Deeplink handling

3. **Form Validation**
   - Input validation
   - Error messages
   - Submission handling

4. **Theme/Preferences**
   - Theme switching
   - Storage persistence
   - System detection

### 🟢 LOW PRIORITY (Nice to Have)
1. **Animations**
   - Component animations
   - Transition timing
   - Performance

2. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - Touch targets

3. **Performance**
   - Render optimization
   - Bundle size
   - Memory usage

---

## Specific Test Scenarios

### Reminders Tests
```typescript
✓ Create reminder with all fields
✓ Create reminder with minimal fields
✓ Update reminder fields
✓ Delete reminder
✓ Toggle reminder on/off
✓ Validate time format (HH:mm)
✓ Handle timezone selection
✓ Display reminder in home
✓ Navigate to details
✗ Handle API errors gracefully
✗ Validate days of week
```

### Goals Tests
```typescript
✓ Create goal with all types
✓ Display goal on home
✓ Delete goal
✓ Toggle goal active/inactive
✗ Track goal progress
✗ Update goal value
✗ Show goal completion
✗ Archive completed goal
```

### Session Tracking Tests
```typescript
✗ Start session from reminder
✗ Complete session from routine
✗ Abandon session
✗ Update daily summary
✗ Track XP earned
✗ Update streak
✗ Award badges
✗ Handle offline sessions
```

### Activity Calendar Tests
```typescript
✓ Display 7 days of activity
✗ Show correct icons/colors
✗ Display XP earned
✗ Highlight today
✗ Handle empty days
✗ Show activity tooltip
```

---

## Success Criteria

### Code Coverage
- [ ] **Lines:** 60%+ across app
- [ ] **Branches:** 55%+
- [ ] **Functions:** 65%+
- [ ] **Statements:** 60%+

### Test Count
- [ ] **Unit Tests:** 30+ tests
- [ ] **Component Tests:** 30+ tests
- [ ] **Integration Tests:** 20+ tests
- [ ] **Total:** 80+ tests

### Quality Metrics
- [ ] All critical paths tested
- [ ] Error scenarios covered
- [ ] Edge cases tested
- [ ] No flaky tests
- [ ] <5s average test duration

---

## CI/CD Requirements

### Pre-merge Checks
```bash
✓ npm test -- --coverage (must pass)
✓ Coverage thresholds met
✓ No console errors
✓ No warnings
```

### GitHub Actions Setup
```yaml
- Run all tests
- Generate coverage report
- Upload to Codecov
- Comment coverage on PR
- Block merge if coverage drops
```

---

## Known Gaps

1. **No E2E Tests** - Requires Detox/Appium setup
2. **No Visual Tests** - Requires snapshot testing
3. **No Performance Tests** - Requires profiling
4. **No Accessibility Tests** - Requires axe testing
5. **No Real API Tests** - Waiting for backend

---

## Dependencies & Setup

### Install Test Dependencies
```bash
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  jest ts-jest @types/jest
```

### Run Tests
```bash
npm test                    # All tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage
npm test -- --verbose      # Detailed output
```

---

## Review & Feedback

- [ ] Code review on all test PRs
- [ ] Coverage reports checked
- [ ] Test quality assessed
- [ ] Documentation updated
- [ ] Team aligned on approach

---

## Timeline

**Target Completion:** Before backend Phase 1 migration
- **Week 1:** Foundation (auth, reminders, goals)
- **Week 2:** Components & screens
- **Week 3:** Edge cases & coverage gaps
- **Week 4:** Final review & documentation

---

## Notes

- Start with high-priority items first
- Keep test files close to source files
- Use meaningful test descriptions
- Mock external dependencies
- Test behavior, not implementation
- Keep tests DRY with helpers
- Maintain test documentation
