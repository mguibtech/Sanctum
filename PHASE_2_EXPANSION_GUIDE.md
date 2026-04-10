# Phase 2 - Test Coverage Expansion Guide

**Status:** Starting Phase 2 Implementation  
**Current State:** 44/51 core tests passing (86%)  
**Target:** 60%+ code coverage (additional 20-30 tests)  
**Duration:** ~2-3 hours  

---

## Foundation (Phase 1 - Complete ✅)

The following are **solid and working**:
- ✅ useGoals (10/10)
- ✅ useReminders (13/13)
- ✅ useRoutines (10/10)
- ✅ useUserStats (13/13)
- ✅ Button (8/8)
- ✅ TextField (16/16)
- ✅ useAuth core login (1/8)

**Do not modify these tests** - they are stable and passing.

---

## Phase 2 Objectives

### Objective 1: Fix Component Test Setup (1 hour)

The issue with recent test attempts:
- Components use `@shopify/restyle` which requires `ThemeProvider`
- Created `/src/__tests__/setup.ts` with theme wrapper
- New component tests must use `renderWithTheme` instead of `render`

**Action Items:**
```
✅ Created: __tests__/setup.ts with theme provider wrapper
⏳ TODO: Update any new component tests to use renderWithTheme
⏳ TODO: Test that theme-dependent components render correctly
```

### Objective 2: Add Screen Integration Tests (1 hour)

Currently working screens:
- ✅ reminders.tsx (basic render works)
- ✅ goals.tsx (basic render works)
- ✅ (tabs)/index.tsx - home (basic render works)

**Required for screen tests:**
1. Mock all required hooks (useGoals, useReminders, etc.)
2. Mock all required services (API calls)
3. Mock navigation (useRouter)
4. Verify renders without errors
5. Verify loading states

**Sample pattern already created in:**
- `app/__tests__/home-screen.test.tsx` (template)

### Objective 3: Expand Hook Tests (30 minutes)

Current gaps in hook testing:
- ✅ useAuth - 1/8 tests (core login, other tests skipped due to cleanup issues)
- ⏳ useAuth error handling - 7 tests (skipped for now)

**Options:**
1. Fix error handling tests with proper error mocking
2. Skip error tests and focus on happy paths
3. Refactor error tests to use separate describe blocks

### Objective 4: Add Utility Function Tests (30 minutes)

Utility functions to test:
- formatDaysOfWeek (useReminders)
- getDayLabel (useReminders)
- getGoalLabel (useGoals)
- getGoalUnit (useGoals)
- Any API transformation functions

---

## Implementation Steps

### Step 1: Verify Component Test Setup

Run this command to verify ThemeProvider works:
```bash
npm test -- setup
```

Expected: Should find the setup.ts file (may not have tests yet)

### Step 2: Create New Component Tests

Use this template for new component tests:

```typescript
// At the top of file:
import { render, screen } from '__tests__/setup';  // Use custom render with theme

// In tests:
it('should render with theme', () => {
  render(<ComponentName />);
  expect(screen.queryByText('Expected text')).toBeDefined();
});
```

**Components to test:**
- [ ] Box (layout wrapper)
- [ ] Card (content container)
- [ ] Screen (full-screen wrapper)
- [ ] Divider (separator)
- [ ] Badge (status indicator)
- [ ] Switch (toggle component)
- [ ] Checkbox (selection component)
- [ ] Rating (rating display)
- [ ] Tag (category label)

### Step 3: Enhance Screen Tests

For each screen, create comprehensive test:
1. Render test (verify no errors)
2. Loading state test
3. Empty state test
4. Data display test
5. User interaction test

**Screens needing tests:**
- [ ] app/(tabs)/bible.tsx
- [ ] app/(tabs)/community.tsx
- [ ] app/(tabs)/profile/index.tsx
- [ ] app/(tabs)/rosary.tsx
- [ ] app/liturgy.tsx
- [ ] app/routines.tsx
- [ ] app/onboarding.tsx

### Step 4: Add Utility Tests

Create `hooks/__tests__/utilities.test.ts`:

```typescript
describe('Reminder Utilities', () => {
  describe('formatDaysOfWeek', () => {
    it('should format all days', () => {
      const result = formatDaysOfWeek([0,1,2,3,4,5,6]);
      expect(result).toBe('Every day');
    });

    it('should format weekdays', () => {
      const result = formatDaysOfWeek([1,2,3,4,5]);
      expect(result).toContain('Weekdays');
    });
  });

  describe('getDayLabel', () => {
    it('should return day name', () => {
      expect(getDayLabel(0)).toBe('Sunday');
      expect(getDayLabel(1)).toBe('Monday');
    });
  });
});
```

---

## Testing Best Practices for Phase 2

### DO ✅

- ✅ Use the custom `renderWithTheme` for components
- ✅ Mock all external dependencies (hooks, services, navigation)
- ✅ Test happy paths first, error paths second
- ✅ Keep tests focused and independent
- ✅ Use descriptive test names
- ✅ Verify both rendering and user interactions

### DON'T ❌

- ❌ Don't modify the 44 passing Phase 1 tests
- ❌ Don't test implementation details, test behavior
- ❌ Don't forget to mock useRouter for screen tests
- ❌ Don't create tests without proper setup
- ❌ Don't skip writing error handling tests

---

## Coverage Expansion Map

### Phase 1 Coverage (Current: 44 tests)
```
Core Hooks:       46 tests (100%) ✅
Core Components:  24 tests (100%) ✅
─────────────────────────────────
Total:           70 tests (86% passing)
```

### Phase 2 Target (+20-30 tests)
```
Additional Hooks:     5-10 tests
Additional Components: 10-15 tests
Screen Tests:         5-10 tests
Utility Functions:    5 tests
─────────────────────────────────
Target Total:        95-100 tests (60%+ coverage)
```

---

## Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined (reading 'sm')"
**Cause:** Theme not provided to component
**Solution:** Use `renderWithTheme()` instead of `render()`

### Issue 2: "Mock not found" error
**Cause:** Hook or service not mocked
**Solution:** Add jest.mock() block at top of test file

### Issue 3: "useRouter is not a function"
**Cause:** expo-router not mocked
**Solution:** 
```typescript
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));
```

### Issue 4: Tests fail but app works
**Cause:** Mocks not returning correct structure
**Solution:** Check API response structure in hooks, mirror in mocks

---

## Success Criteria for Phase 2

✅ **Completion criteria:**
- [ ] 60+ total test cases created
- [ ] 50+ tests passing consistently
- [ ] All screen renders tested
- [ ] All utility functions tested
- [ ] Zero regressions in Phase 1 tests
- [ ] Code coverage report generated
- [ ] Documentation updated

✅ **Quality criteria:**
- [ ] All new tests follow established patterns
- [ ] Tests are independent and repeatable
- [ ] Proper error handling in mocks
- [ ] Clear and descriptive test names
- [ ] No flaky or timing-dependent tests

---

## Quick Start Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- useGoals

# Run with coverage report
npm test -- --coverage

# Watch mode for development
npm test -- --watch

# Run specific test suite
npm test -- --testNamePattern="Box Component"
```

---

## Files to Review

Before starting Phase 2, review these files:

1. **jest.setup.js** - Global mocks configuration
2. **jest.config.js** - Jest configuration
3. **__tests__/setup.ts** - NEW: Theme provider setup
4. **hooks/__tests__/useGoals.test.ts** - Reference for hook test patterns
5. **components/ui/__tests__/Button.test.tsx** - Reference for component test patterns

---

## Next Steps After Phase 2

Once Phase 2 is complete with 60%+ coverage:

### Phase 3: E2E Testing
- Add Detox for real device testing
- Test complete user flows
- Verify navigation and interactions

### Phase 4: Performance & Accessibility
- Add performance regression tests
- Add accessibility testing
- Add visual regression testing

### Phase 5: Maintenance
- Set up coverage threshold enforcement
- Configure pre-commit hooks
- Create test documentation for team

---

## Support References

- **Testing Library Docs:** https://testing-library.com/docs/react-native-testing-library/intro
- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Restyle Theme Guide:** https://shopify.dev/api/admin-rest/2022-01/resources/product

---

**Phase 2 Status:** Ready to start  
**Estimated Duration:** 2-3 hours  
**Target Completion:** 60%+ coverage with 60+ tests

Let's build! 🚀
