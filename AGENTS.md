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
- **Zero external dependencies** except Jotai

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

1. User calls `setSetter({ type: "put", value: record })` or `setSetter({ type: "delete", id })`
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
const setSetter = useSetAtom(db.setter); // (action: SetterAction<T>) => Promise<void>
```

## Performance Considerations

- **Atom Caching** - `db.item(id)` and `db.range(query)` use `atomFamily` to cache atoms; same parameters always return the same instance
- **Selective Subscriptions** - Components only re-render when their specific atoms change, not all database changes
- **Efficient Queries** - Use indexes and range queries to retrieve only necessary data from IndexedDB
- **Lazy Initialization** - Database opens lazily on first `.init()` call; no overhead until needed
