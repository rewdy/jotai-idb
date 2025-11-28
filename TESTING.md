# Testing Guide for jotai-idb

## Overview

This project uses **Rstest** for testing with **fake-indexeddb** to simulate IndexedDB in a Node.js environment. Notably, **React is NOT required** for testing the core library functionality—it's only needed as a dev dependency because Jotai's core module depends on it.

## Running Tests

```bash
bun run test
```

## Test Architecture

### Why No React?

The library is designed to be testable without React:

- **Database layer tests** - Pure functions that work with IndexedDB directly
- **Atom tests** - Tested using Jotai's `getDefaultStore()` for direct atom access without React hooks
- **Integration tests** - Full end-to-end testing of the `JotaiIDB` class

React is installed as a dev dependency **only** because Jotai's internal modules import it, even though we don't use React in our tests.

### Key Testing Strategy

1. **fake-indexeddb** - Provides an in-memory IndexedDB implementation for Node.js
2. **getDefaultStore()** - Jotai's testing utility to directly read/write atoms without React
3. **Unique database names** - Each test gets a unique database to avoid state pollution

## Test Coverage

The test suite (`/tests/index.test.ts`) includes 29 tests organized into 8 test suites:

### 1. Database Initialization (3 tests)

- Database initialization succeeds
- Atoms are created after init
- Error handling for uninitialized atoms

### 2. Read Operations (4 tests)

- Empty items, keys, entries initially
- Non-existent items return undefined

### 3. Write Operations (4 tests)

- Put single/multiple records
- Update existing records
- Delete records

### 4. Atom Caching with atomFamily (4 tests)

- Same atom instance returned for same ID
- Different atom instances for different IDs
- Same pattern for range queries

### 5. Item Queries (3 tests)

- Get single item by ID
- Retrieve all keys
- Retrieve all entries as [id, value] pairs

### 6. Range Queries (7 tests)

- Exact index value matching
- Composite index ranges
- Lower/upper bound handling (open/closed)
- Result reversal
- Single-sided bounds (lower-only, upper-only)

### 7. Cache Invalidation (3 tests)

- Items atom updates after put
- Specific item atom updates after put
- Items atom updates after delete

### 8. Type Safety (1 test)

- Records maintain type information through operations

## Implementation Details

### Custom atomFamily

Since Jotai's `atomFamily` from `jotai/utils` requires React, we created a simple, React-free implementation in `/src/utils/atomFamily.ts`:

```typescript
export function createAtomFamily<K, V>(
  atomCreator: (key: K) => V,
): (key: K) => V {
  const cache = new Map<K, V>();

  return (key: K): V => {
    if (!cache.has(key)) {
      cache.set(key, atomCreator(key));
    }
    return cache.get(key) as V;
  };
}
```

This ensures the same atom instance is returned for the same parameters, enabling proper caching and comparison in tests.

### Cache Invalidation Pattern

The `JotaiIDB` class uses force-update atoms to invalidate caches after write operations:

```typescript
// After a put/delete operation
set(this.forceUpdateItems, (v: number) => v + 1);  // Triggers items atom to re-read
set(forceUpdateAtom, (v: number) => v + 1);        // Triggers specific item atom to re-read
```

This ensures that after any write operation, subsequent reads from atoms will fetch fresh data from IndexedDB.

## Testing Without React

### Pattern: Direct Atom Access

```typescript
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

// Read an atom
const value = await store.get(db.items);

// Write to an atom
await store.set(db.setter, { type: 'put', value: record });
```

This pattern works for any Jotai atom without requiring React or hooks.## Dependencies

### Production Dependencies

- `jotai` - Atom-based state management

### Development Dependencies

- `@rstest/core` - Testing framework
- `fake-indexeddb` - In-memory IndexedDB for Node.js
- `react` - Required by Jotai's internals (dev-only)
- `typescript` - Type checking
- `@biomejs/biome` - Linting and formatting

## Best Practices for Adding Tests

1. **Use unique database names** - Prevents cross-test pollution:

```typescript
dbName: `test-db-${Date.now()}-${Math.random()}`
```

1. **Create fresh instances in beforeEach** - Ensures clean state:

```typescript
beforeEach(async () => {
  db = await new JotaiIDB<TestRecord>(config).init();
});
```

1. **Always await async operations** - IndexedDB and atoms are async:

```typescript
const items = await store.get(db.items);
```

1. **Use expect().toHaveLength()** for array assertions when order is variable
1. **Use expect().toEqual()** when testing specific values or ordering

## Running Tests in Watch Mode

```bash
bun run dev  # Builds in watch mode
bun run test # In another terminal
```

## Debugging Tests

Set environment variable for more verbose output:

```bash
DEBUG=rstest bun run test
```
