# Testing Guide - Sanctum Mobile App

## Overview

This guide covers the testing infrastructure for the Sanctum mobile app. Tests are organized into three categories:

1. **Unit Tests** - Testing individual hooks and utilities
2. **Component Tests** - Testing UI components in isolation
3. **Integration Tests** - Testing screens and feature flows

## Setup

### Dependencies

Tests require the following packages (add to package.json):

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^13.0.0",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.8",
    "@react-native-async-storage/async-storage": "^1.23.1"
  }
}
```

### Configuration Files

- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup and mocks

## Running Tests

### All Tests
```bash
npm test
# or
yarn test
```

### Watch Mode
```bash
npm test -- --watch
# or
yarn test --watch
```

### Specific Test File
```bash
npm test -- useReminders.test.ts
# or
yarn test useReminders.test.ts
```

### Coverage Report
```bash
npm test -- --coverage
# or
yarn test --coverage
```

### Update Snapshots
```bash
npm test -- -u
# or
yarn test -u
```

## Test Structure

### Unit Tests - Hooks (`hooks/__tests__/`)

**Current Coverage:**
- ✅ `useReminders.test.ts` - CRUD operations, formatting utilities
- ✅ `useGoals.test.ts` - Goal management, type validation
- ✅ `useAuth.test.ts` - Login, register, logout, token refresh

**What Each Tests:**
- Initialization and loading states
- CRUD operations (Create, Read, Update, Delete)
- Error handling
- Utility functions
- State management

**Example:**
```typescript
describe('useReminders Hook', () => {
  it('should create a reminder successfully', async () => {
    const { result } = renderHook(() => useReminders());
    await act(async () => {
      await result.current.create(reminderData);
    });
    expect(api.post).toHaveBeenCalled();
  });
});
```

### Component Tests (`components/ui/__tests__/`)

**Current Coverage:**
- ✅ `Button.test.tsx` - Rendering, interactions, states, accessibility

**Test Categories:**
- Rendering with different props
- User interactions (press, disabled)
- Visual states (loading, disabled)
- Accessibility features
- Edge cases

**Example:**
```typescript
describe('Button Component', () => {
  it('should call onPress when button is pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Press me</Button>);
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Tests (`app/__tests__/`)

**Current Coverage:**
- ✅ `home.test.tsx` - Full screen rendering, API integration, user flows

**Test Categories:**
- Screen rendering
- API integration and mocking
- User interactions
- Data display
- Error handling
- Performance

**Example:**
```typescript
describe('HomeScreen Integration Tests', () => {
  it('should fetch and display liturgy', async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.queryByText('John 3:16')).toBeDefined();
    });
  });
});
```

## Mocking Strategy

### API Mocking
```typescript
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
```

### Hook Mocking
```typescript
jest.mock('../../hooks/useReminders', () => ({
  useReminders: jest.fn(() => ({
    reminders: [],
    create: jest.fn(),
  })),
}));
```

### Navigation Mocking
```typescript
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));
```

## Best Practices

### 1. Test Naming
```typescript
// Good
it('should load reminders on component mount')

// Bad
it('test loading')
```

### 2. Use describe() for Organization
```typescript
describe('useReminders Hook', () => {
  describe('Initialization', () => {
    it('should load reminders on mount')
  })
  
  describe('Create Reminder', () => {
    it('should create a reminder successfully')
  })
})
```

### 3. Clean Up After Tests
```typescript
beforeEach(() => {
  jest.clearAllMocks()
  // Reset state
})
```

### 4. Use waitFor for Async Operations
```typescript
await waitFor(() => {
  expect(screen.queryByText('Text')).toBeDefined()
})
```

### 5. Test User Behavior, Not Implementation
```typescript
// Good - tests user action
fireEvent.press(screen.getByText('Submit'))

// Bad - tests internal state
expect(component.state.isLoading).toBe(false)
```

## Coverage Goals

Current threshold: 50% (by lines, branches, functions, statements)

Target for Phase 1:
- **Hooks:** 80%+ coverage
- **Components:** 70%+ coverage
- **Screens:** 60%+ coverage
- **Overall:** 60%+ coverage

## Common Issues & Solutions

### Issue: Mock not working
**Solution:** Ensure mocks are defined BEFORE imports
```typescript
jest.mock('module') // BEFORE
import { something } from 'module' // AFTER
```

### Issue: Async tests timing out
**Solution:** Use proper async/await with waitFor
```typescript
await waitFor(() => {
  expect(something).toBe(true)
}, { timeout: 5000 })
```

### Issue: Navigation mock errors
**Solution:** Mock in jest.setup.js, not in individual tests

## Future Test Coverage

### To Add:
- [ ] More component tests (TextField, Card, Dialog, etc)
- [ ] More screen tests (Reminders, Goals, Routines)
- [ ] API service tests
- [ ] Utility function tests
- [ ] Navigation flow tests
- [ ] Error boundary tests
- [ ] Snapshot tests for complex components

### Test Scenarios to Cover:
- [ ] Offline behavior
- [ ] Token refresh on 401
- [ ] Theme switching
- [ ] Onboarding flow
- [ ] Form validation
- [ ] Error recovery
- [ ] Permission handling

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --coverage
```

## Debugging Tests

### Enable Console Logs
```bash
npm test -- --verbose
```

### Debug Single Test
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Check Mock Calls
```typescript
console.log(mockFn.mock.calls)
console.log(mockFn.mock.results)
```

## Resources

- [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about)

## Questions?

Refer to the test files in `hooks/__tests__/`, `components/ui/__tests__/`, and `app/__tests__/` for examples.
