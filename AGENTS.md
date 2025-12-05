# AGENTS.md

You are an expert in JavaScript, TypeScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Project: jotai-idb

**jotai-idb** is a typed, reactive IndexedDB state manager powered by [Jotai](https://jotai.org). It provides:

- **Fully typed** record access with TypeScript inference
- **Atom-based API** using Jotai's composable state primitives
- **IndexedDB persistence** with configurable object stores and indexes
- **Range queries** for efficient data retrieval using index bounds
- **Reactive atoms** for reading all items, keys, entries, individual records, and range results
- **Write-through atoms** for put and delete operations with automatic cache invalidation
- **Minimal external dependencies** - Only Jotai (which requires React)

### Architecture

The library is structured around:

- **Types** (`/src/types/`) - Core interfaces for config, records, and queries
- **Database layer** (`/src/db/`) - IndexedDB setup, CRUD operations, and query helpers
- **Atoms** (`/src/atoms/`) - Read atoms (items, keys, entries, item, range) and write atom (setter)
- **Core class** (`/src/core/JotaiIDB.ts`) - Main entry point that ties everything together

### Key APIs

- `db.items` - Atom for all records
- `db.keys` - Atom for all primary keys
- `db.entries` - Atom for [id, value] pairs
- `db.item(id)` - Atom for a single record (cached via atomFamily)
- `db.range(query)` - Atom for range queries (cached via atomFamily)
- `db.setter` - Write-through atom for put/delete operations

## Commands

- `bun run build` - Build the library for production
- `bun run dev` - Turn on watch mode, watch for changes and rebuild the library
- `bun run test` - Run tests with Rstest
- `bun run lint` - Lint code with Biome
- `bun run format` - Format code with Biome
- `bun run check` - Check and fix code with Biome

## Docs

- [Jotai](https://jotai.org/docs/) - Primitive and flexible state management for React
- [Rslib](https://rslib.rs/llms.txt) - A Rust library build tool
- [Rsbuild](https://rsbuild.rs/llms.txt) - An extremely fast Rust-based web bundler
- [Rspack](https://rspack.rs/llms.txt) - A fast Rust-based bundler for the web
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Low-level API for client-side storage

## Code updates

Since we use biome for formatting, run `bun format` after a group of changes have been made. This will be faster than manually trying to fix formatting issues and will be more reliable.

## Testing

### Rstest

- Run `bun run test` to run all tests
- Tests are located in `/tests/`

## Code Quality

### Biome

- Run `bun run lint` to check code style and errors
- Run `bun run format` to auto-format code
- Configuration: `biome.json`

### TypeScript

- Strict mode enabled in `tsconfig.json`
- Type safety flows through entire API surface

## Important Concepts

### Jotai Fundamentals

Jotai is a primitive and flexible state management library for React. Key concepts relevant to this project:

- **Atoms** - Minimal unit of state that can be read and written independently
- **useAtomValue** - Hook to read an atom's value (causes Suspense for async atoms)
- **useSetAtom** - Hook to write to an atom
- **useAtom** - Hook to read and write an atom
- **atomFamily** - Creates a family of atoms with the same type but different parameters
- **Async atoms** - Atoms that resolve to a Promise; components reading them automatically suspend

### IndexedDB Patterns

This library leverages IndexedDB's powerful features:

- **Object Stores** - Named collections with a primary key and optional indexes
- **Indexes** - Allow querying by fields other than the primary key
- **Range Queries** - Efficient queries using lower/upper bounds and direction (reverse)
- **Composite Indexes** - Queries on multiple fields using keyPath arrays
- **IDBValidKey** - Valid key types: string, number, Date, ArrayBufferView, or arrays of these

### Write-Through Pattern

The `db.setter` atom implements a write-through pattern:

1. User calls `dispatch({ type: "put", value: record })` or `dispatch({ type: "delete", id })`
2. The operation is executed against IndexedDB
3. Cache invalidation occurs automatically via Jotai's atom dependency graph
4. Related atoms (`items`, `keys`, `entries`, specific `item()`, affected `range()` results) re-evaluate on next read

### Configuration Strategy

When configuring a JotaiIDB instance:

- **dbName** should reflect your application (e.g., "my-app")
- **version** should increment when schema changes; use version upgrades to migrate existing data
- **store.name** is the object store name; typically "main" for single-store apps
- **store.keyPath** should match your record's ID field (usually "id")
- **indexes** enable efficient queries; design based on your query patterns
- Composite indexes (e.g., `["type", "createdAt"]`) enable multi-field range queries

## Development Patterns

### Testing with Rstest

Tests are in `/tests/`. Use standard JavaScript test syntax with Rstest's testing primitives.

### Building

- `bun run dev` starts watch mode for development iteration
- `bun run build` creates production-optimized ESM and CJS outputs in `/dist`
- Outputs include TypeScript declarations (`.d.ts`)

### Type Inference

Leverage TypeScript's type inference:

```typescript
type MyRecord = {
  id: string;
  type: "user" | "admin";
  name: string;
};

const db = await new JotaiIDB<MyRecord>({ /* config */ }).init();

// Types flow through the entire API
const items = useAtomValue(db.items); // T[] 
const item = useAtomValue(db.item("123")); // T | undefined
const dispatch = useSetAtom(db.setter); // (action: SetterAction<T>) => Promise<void>
```

## Performance Considerations

- **Atom Caching** - `db.item(id)` and `db.range(query)` use `atomFamily` to cache atoms; same parameters always return the same instance
- **Selective Subscriptions** - Components only re-render when their specific atoms change, not all database changes
- **Efficient Queries** - Use indexes and range queries to retrieve only necessary data from IndexedDB
- **Lazy Initialization** - Database opens lazily on first `.init()` call; no overhead until needed

## Code Standards

- **TypeScript Strict Mode** - All code must pass `tsconfig.json` strict mode
- **Promise-based Async** - All IndexedDB operations must use Promises; never use callbacks
- **Non-blocking Atoms** - Atoms should never block React rendering (use Suspense for async atoms)
- **Zero External Dependencies** - Library should only depend on Jotai (which requires React)
- **Strong Type Inference** - Leverage TypeScript generics for full type safety through the API
- **Modular Files** - Keep files focused on single concerns
- **Named Exports Only** - No default exports in library code
- **Jotai Idioms** - Follow Jotai's patterns for atom composition and usage

## Implementation Details

### Initialization Pattern

The JotaiIDB class requires explicit initialization:

```typescript
const db = await new JotaiIDB<T>(config).init();
```

This pattern allows configuration validation before database opening, opens IndexedDB lazily (no overhead until needed), returns the same instance with atoms ready for use, and throws if database opening fails.

### Cache Invalidation via Force-Update Atoms

The library uses "force-update atoms" for cache invalidation after write operations:

The mechanism works by:

- **Force-update atoms** are internal atoms that store incrementing numbers
- **Main read atoms** (`items`, `keys`, `entries`) depend on force-update atoms via `get(forceUpdateX)`
- **When setter executes** put/delete, it increments the relevant force-update atoms
- **This causes dependent atoms** to re-read from IndexedDB on next access
- **Parameterized atoms** (`item(id)`, `range(query)`) don't depend on force-update because they read directly from IndexedDB each time, and `atomFamily` caching ensures same params return same atom instance

This approach ensures automatic cache invalidation after writes, no need for manual cache clearing, minimal re-renders (only affected components update), and simple, predictable behavior.

### Testing Strategy

Tests use `fake-indexeddb` to simulate IndexedDB in Node.js without requiring React.

The testing approach:

- Import `fake-indexeddb/auto` to patch global `indexedDB`
- Use `getDefaultStore()` from Jotai to access atoms directly
- Call `await atom.read(store.get)` to read async atom values
- Call `store.set(atom, value)` to set atom values

Benefits include avoiding React dependency in core testing, testing pure atom behavior and database operations, verifying cache invalidation patterns, and running in Node.js test environment.

Test files are organized by concern:

- `setup.ts` - Shared utilities and test database factory
- `initialization.test.ts` - Database setup and error handling
- `read.test.ts` - Reading operations
- `write.test.ts` - Write operations
- `caching.test.ts` - atomFamily caching behavior
- `items.test.ts` - Items, keys, entries atoms
- `range.test.ts` - Range query functionality
- `invalidation.test.ts` - Cache invalidation after writes
- `types.test.ts` - Type safety verification

### Database Structure

The library is organized into focused modules:

- **Core class** (`/src/core/JotaiIDB.ts`) - Manages atoms, configuration, and database lifecycle
- **Type definitions** (`/src/types/index.ts`) - All public interfaces (RecordType, RangeQuery, SetterAction, etc.)
- **Database operations** (`/src/db/`)

  - `openDB.ts` - Opens/creates IndexedDB with version upgrades
  - `queries.ts` - Read operations (getAll, getById, getAllKeys, getAllByRange)
  - `writes.ts` - Write operations (putRecord, deleteRecord)
- **Public exports** (`/src/index.ts`) - Exports JotaiIDB class and all types

Key invariant: Atoms are created inline in JotaiIDB constructor; no factory functions.
