# jotai-idb Documentation

A typed, reactive IndexedDB state manager powered by [Jotai](https://jotai.org). Persist and sync your application state with minimal boilerplate, full type safety, and Jotai's atom-based architecture.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Configuration](#configuration)
- [Reading Data](#reading-data)
- [Writing Data](#writing-data)
- [Range Queries](#range-queries)
- [Complete Example](#complete-example)
- [API Reference](#api-reference)
- [Type Reference](#type-reference)

## Installation

```bash
npm install jotai-idb jotai
# or
pnpm add jotai-idb jotai
# or
bun add jotai-idb jotai
```

## Quick Start

```typescript
import { JotaiIDB } from "jotai-idb";

// Define your record type
type Picture = {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Record type discriminator
   */
  type: "picture";
  /**
   * URL to the picture resource
   */
  url: string;
  /**
   * Associated tags
   */
  tags: string[];
};

// Create and initialize the database
const db = await new JotaiIDB<Picture>({
  dbName: "my-app",
  version: 1,
  store: {
    name: "pictures",
    keyPath: "id",
    indexes: [
      { name: "byType", keyPath: "type" }
    ]
  }
}).init();
```

## Core Concepts

### Atoms

jotai-idb exposes your IndexedDB data as **Jotai atoms**. Atoms are the fundamental unit of state in Jotai and can be read and written in React components using hooks like `useAtomValue`, `useSetAtom`, and `useAtom`.

### Initialization

All database operations require initialization via `await new JotaiIDB(config).init()`. This returns the same instance with atoms ready to use.

### Type Safety

All operations are fully typed. Your record type `T` flows through the entire API, ensuring compile-time safety.

## Configuration

### JotaiIDBConfig

```typescript
interface JotaiIDBConfig {
  /**
   * Name of the IndexedDB database
   */
  dbName: string;
  /**
   * Schema version (used for migrations)
   */
  version: number;
  /**
   * Object store definition
   */
  store: StoreDefinition;
}
```

### StoreDefinition

```typescript
interface StoreDefinition {
  /**
   * Name of the object store
   */
  name: string;
  /**
   * Primary key field (must be a string)
   */
  keyPath: string;
  /**
   * Optional indexes for queries
   */
  indexes?: IndexDefinition[];
}
```

### IndexDefinition

```typescript
interface IndexDefinition {
  /**
   * Unique index name
   */
  name: string;
  /**
   * Single field or composite key
   */
  keyPath: string | string[];
  /**
   * Enforce uniqueness (default: false)
   */
  unique?: boolean;
  /**
   * Index array fields (default: false)
   */
  multiEntry?: boolean;
}
```

### Example Configuration

```typescript
const db = await new JotaiIDB({
  dbName: "app-db",
  version: 1,
  store: {
    name: "items",
    keyPath: "id",
    indexes: [
      { name: "byType", keyPath: "type" },
      { name: "byCreatedAt", keyPath: "createdAt" },
      { name: "byTypeAndStatus", keyPath: ["type", "status"] }
    ]
  }
}).init();
```

## Reading Data

### Get All Items

```typescript
import { useAtomValue } from "jotai";

function AllItems() {
  const items = useAtomValue(db.items);
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

**Returns:** `Promise<T[]>` - All records in the store

### Get All Keys

```typescript
function KeyList() {
  const keys = useAtomValue(db.keys);
  
  return <p>Total items: {keys.length}</p>;
}
```

**Returns:** `Promise<IDBValidKey[]>` - All primary keys

### Get All Entries

```typescript
function EntryList() {
  const entries = useAtomValue(db.entries);
  
  return (
    <ul>
      {entries.map(([id, item]) => (
        <li key={id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

**Returns:** `Promise<Array<[id: string, item: T]>>` - All records as [id, value] pairs

### Get Single Item by ID

```typescript
function ItemDetail({ id }: { id: string }) {
  const item = useAtomValue(db.item(id));
  
  if (!item) return <div>Not found</div>;
  
  return <div>{item.name}</div>;
}
```

**Returns:** `Promise<T | undefined>` - Single record or undefined

**Note:** `db.item(id)` uses `atomFamily` for caching—the same ID will return the same cached atom instance.

## Writing Data

### Add or Update Records

```typescript
import { useSetAtom } from "jotai";

function AddItem() {
  const setSetter = useSetAtom(db.setter);
  
  const handleAdd = async () => {
    await setSetter({
      type: "put",
      value: {
        id: "item-123",
        name: "New Item",
        description: "..."
      }
    });
  };
  
  return <button onClick={handleAdd}>Add Item</button>;
}
```

### Delete Records

```typescript
function DeleteItem({ id }: { id: string }) {
  const setSetter = useSetAtom(db.setter);
  
  const handleDelete = async () => {
    await setSetter({
      type: "delete",
      id: id
    });
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

### SetterAction Type

```typescript
type SetterAction<T extends RecordType> =
  | { type: "put"; value: T }
  | { type: "delete"; id: IDBValidKey };
```

**Important:** After a write operation, atoms are automatically re-evaluated on next read. Jotai handles cache invalidation.

## Range Queries

Range queries allow you to fetch records from an index within a specified range.

### Basic Range Query

```typescript
function PicturesByType() {
  const pictures = useAtomValue(
    db.range({
      index: "byType",
      lower: "picture",
      upper: "picture"
    })
  );
  
  return <div>{pictures.length} pictures</div>;
}
```

### Prefix Range (using Unicode boundary)

```typescript
// Get all items starting with "user#"
const users = useAtomValue(
  db.range({
    index: "byPrefix",
    lower: "user#",
    upper: "user#\uffff" // Unicode max character
  })
);
```

### Between Range

```typescript
const recentItems = useAtomValue(
  db.range({
    index: "byCreatedAt",
    lower: 1700000000,
    upper: 1700086400
  })
);
```

### Reverse Order

```typescript
const latestFirst = useAtomValue(
  db.range({
    index: "byCreatedAt",
    lower: 0,
    upper: Date.now(),
    reverse: true
  })
);
```

### Open/Closed Bounds

```typescript
// Exclude lower bound
const items = useAtomValue(
  db.range({
    index: "byTimestamp",
    lower: startTime,
    upper: endTime,
    lowerOpen: true, // Excludes startTime
    upperOpen: false  // Includes endTime
  })
);
```

### RangeQuery Type

```typescript
interface RangeQuery {
  index: string;           // Name of the index to query
  lower?: IDBValidKey;     // Lower bound
  upper?: IDBValidKey;     // Upper bound
  lowerOpen?: boolean;     // Exclude lower bound
  upperOpen?: boolean;     // Exclude upper bound
  reverse?: boolean;       // Reverse order
}
```

**Returns:** `Promise<T[]>` - Records matching the range

## Complete Example

Here's a full example of a notes application:

```typescript
import { JotaiIDB } from "jotai-idb";
import { useAtomValue, useSetAtom } from "jotai";
import { Suspense } from "react";

// Define types
type Note = {
  /**
   * Unique note identifier
   */
  id: string;
  /**
   * Note title
   */
  title: string;
  /**
   * Note content body
   */
  content: string;
  /**
   * Creation timestamp in milliseconds
   */
  createdAt: number;
  /**
   * Associated tags
   */
  tags: string[];
};

// Initialize database
const db = await new JotaiIDB<Note>({
  dbName: "notes-app",
  version: 1,
  store: {
    name: "notes",
    keyPath: "id",
    indexes: [
      { name: "byCreatedAt", keyPath: "createdAt" }
    ]
  }
}).init();

// React component
function NotesApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotesList />
      <NoteForm />
    </Suspense>
  );
}

function NotesList() {
  const notes = useAtomValue(db.items);
  
  // Sort by creation date (descending)
  const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);
  
  return (
    <div>
      <h2>Notes ({sorted.length})</h2>
      <ul>
        {sorted.map(note => (
          <NoteItem key={note.id} note={note} />
        ))}
      </ul>
    </div>
  );
}

function NoteItem({ note }: { note: Note }) {
  const setSetter = useSetAtom(db.setter);
  
  const handleDelete = () => {
    setSetter({ type: "delete", id: note.id });
  };
  
  return (
    <li>
      <h3>{note.title}</h3>
      <p>{note.content}</p>
      <small>{new Date(note.createdAt).toLocaleString()}</small>
      <button onClick={handleDelete}>Delete</button>
    </li>
  );
}

function NoteForm() {
  const setSetter = useSetAtom(db.setter);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await setSetter({
      type: "put",
      value: {
        id: `note-${Date.now()}`,
        title: formData.get("title") as string,
        content: formData.get("content") as string,
        createdAt: Date.now(),
        tags: []
      }
    });
    
    e.currentTarget.reset();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button type="submit">Add Note</button>
    </form>
  );
}
```

## API Reference

### JotaiIDB Class

#### Constructor

```typescript
new JotaiIDB<T extends RecordType>(config: JotaiIDBConfig)
```

Creates a new database instance. Must call `.init()` before using atoms.

#### `init(): Promise<this>`

Initializes the database and prepares atoms for use.

```typescript
const db = await new JotaiIDB(config).init();
```

#### `items: Atom<Promise<T[]>>`

Atom containing all records in the store. Use with `useAtomValue()`.

```typescript
const allRecords = useAtomValue(db.items);
```

#### `keys: Atom<Promise<IDBValidKey[]>>`

Atom containing all primary keys. Use with `useAtomValue()`.

```typescript
const allKeys = useAtomValue(db.keys);
```

#### `entries: Atom<Promise<Array<[id: string, item: T]>>>`

Atom containing all records as [id, value] pairs. Use with `useAtomValue()`.

```typescript
const allEntries = useAtomValue(db.entries);
```

#### `item(id: string): Atom<Promise<T | undefined>>`

Returns an atom for a single record by ID. Cached via `atomFamily`.

```typescript
const record = useAtomValue(db.item("record-123"));
```

#### `range(query: RangeQuery): Atom<Promise<T[]>>`

Returns an atom for a range query on an index. Cached via `atomFamily`.

```typescript
const results = useAtomValue(db.range({
  index: "byType",
  lower: "picture",
  upper: "picture"
}));
```

#### `setter: Atom<null, [SetterAction<T>], Promise<void>>`

Write-through atom for put and delete operations. Use with `useSetAtom()`.

```typescript
const setSetter = useSetAtom(db.setter);

// Put
await setSetter({ type: "put", value: myRecord });

// Delete
await setSetter({ type: "delete", id: "record-123" });
```

## Type Reference

### RecordType

```typescript
interface RecordType {
  /**
   * Unique identifier (required)
   */
  id: string;
  /**
   * Additional properties
   */
  [key: string]: unknown;
}
```

All records must have a string `id` field. Extend this interface for your specific types:

```typescript
type User = RecordType & {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * User's full name
   */
  name: string;
  /**
   * User's email address
   */
  email: string;
};
```

### Config Types

```typescript
interface JotaiIDBConfig {
  /**
   * Name of the IndexedDB database
   */
  dbName: string;
  /**
   * Schema version (used for migrations)
   */
  version: number;
  /**
   * Object store definition
   */
  store: StoreDefinition;
}

interface StoreDefinition {
  /**
   * Name of the object store
   */
  name: string;
  /**
   * Primary key field (must be a string)
   */
  keyPath: string;
  /**
   * Optional indexes for queries
   */
  indexes?: IndexDefinition[];
}

interface IndexDefinition {
  /**
   * Unique index name
   */
  name: string;
  /**
   * Single field or composite key
   */
  keyPath: string | string[];
  /**
   * Enforce uniqueness (default: false)
   */
  unique?: boolean;
  /**
   * Index array fields (default: false)
   */
  multiEntry?: boolean;
}
```

### Query and Action Types

```typescript
interface RangeQuery {
  /**
   * Name of the index to query
   */
  index: string;
  /**
   * Lower bound
   */
  lower?: IDBValidKey;
  /**
   * Upper bound
   */
  upper?: IDBValidKey;
  /**
   * Exclude lower bound
   */
  lowerOpen?: boolean;
  /**
   * Exclude upper bound
   */
  upperOpen?: boolean;
  /**
   * Reverse order
   */
  reverse?: boolean;
}

type SetterAction<T extends RecordType> =
  | { type: "put"; value: T }
  | { type: "delete"; id: IDBValidKey };

type RangeQueryResult<T extends RecordType> = Array<[string, T]>;
```

## Best Practices

### 1. Use Composite Indexes for Multi-Field Queries

```typescript
indexes: [
  { name: "byTypeAndStatus", keyPath: ["type", "status"] }
]

// Query by exact match on both fields
db.range({
  index: "byTypeAndStatus",
  lower: ["picture", "active"],
  upper: ["picture", "active"]
})
```

### 2. Prefix Queries with Unicode Boundary

```typescript
// All items starting with "user#"
db.range({
  index: "byId",
  lower: "user#",
  upper: "user#\uffff"
})
```

### 3. Cache Atoms with atomFamily

Both `db.item(id)` and `db.range(query)` use `atomFamily` internally, so calling them multiple times with the same argument returns the cached atom instance.

### 4. Use Suspense for Async Atoms

Wrap components reading atoms in `<Suspense>`:

```typescript
<Suspense fallback={<div>Loading...</div>}>
  <MyComponent />
</Suspense>
```

### 5. Manual Refetch Pattern

If you need to manually refetch data after external changes:

```typescript
import { useAtom } from "jotai";

function Component() {
  const [data, refresh] = useAtom(db.items);
  
  const handleRefresh = () => {
    // Force re-evaluation by setting to undefined
    refresh(undefined);
  };
}
```

### 6. Batch Operations

For multiple writes, use Promise.all:

```typescript
const setSetter = useSetAtom(db.setter);

await Promise.all([
  setSetter({ type: "put", value: record1 }),
  setSetter({ type: "put", value: record2 }),
  setSetter({ type: "put", value: record3 })
]);
```

## Browser Support

jotai-idb requires:

- IndexedDB support (all modern browsers)
- ES2022 or newer (for async/await, Promise)
- A bundler with ESM support

## License

MIT
