# Jotai IndexedDB Library – Detailed Implementation Plan

## 1. Project Goals
Create a **typed, reactive, Jotai-based IndexedDB state manager** with:

- A single database instance configured by the user
- One or more object stores (phase 2)
- Fully typed records
- Configurable indexes
- Read atoms
- Write atoms
- Item-by-ID atoms
- Range query atoms (with begins_with, between, etc.)
- Zero dependencies except Jotai
- Small, modular, idiomatic TypeScript

This should be analogous to jotai-minidb, but:
- Much more powerful  
- Typed  
- Index-aware  
- Range-query capable  
- DynamoDB-pattern friendly  


## 2. Deliverables (High-level)

### Library features
- `JotaiIDB<T>` main class  
- Database initialization  
- Object store & index creation  
- Read-through atoms  
- Write-through atoms  
- Item-by-ID atoms  
- Range query atoms  
- Basic CRUD helpers  

### API design
```ts
const db = new JotaiIDB<DBRecord>({
  dbName: "mydb",
  version: 1,
  store: {
    name: "main",
    keyPath: "id",
    indexes: [
      { name: "byTypeAndId", keyPath: ["type", "id"] },
      { name: "byType", keyPath: "type" }
    ]
  }
});

// Read atoms
db.items
db.keys
db.entries

// Item atom
db.item("picture#123")

// Range atom
db.range({
  index: "byTypeAndId",
  lower: ["picture", ""],
  upper: ["picture", "\uffff"]
});

// Setter atom
db.setter
```


## 3. Project Structure

```
/src
  /types
    index.ts
  /db
    openDB.ts
    queries.ts
    writes.ts
  /atoms
    itemsAtom.ts
    keysAtom.ts
    entriesAtom.ts
    itemAtom.ts
    rangeAtom.ts
    setterAtom.ts
  /core
    JotaiIDB.ts
index.ts
package.json
tsconfig.json
README.md
```


## 4. Detailed Implementation Plan

### Phase 1: Types (`/src/types/index.ts`)

Define:
- `IndexDefinition`
- `StoreDefinition`
- `JotaiIDBConfig<T>`
- `RangeQuery`
- `RecordType`


### Phase 2: IndexedDB Setup (`/src/db/openDB.ts`)
Implement:
- `openDB(config)`
- handle version upgrades
- create store + indexes
- wrap everything in Promises


### Phase 3: CRUD Helpers

#### `/src/db/writes.ts`
- `putRecord(db, storeName, value)`
- `deleteRecord(db, storeName, id)`

#### `/src/db/queries.ts`
- `getAll(db, storeName)`
- `getById(db, storeName, id)`
- `getAllByRange(db, storeName, index, lower, upper)`
- `prefixRange(prefix)` helper


### Phase 4: Atom Implementations

#### `/src/atoms/itemsAtom.ts`
Loads all items from IDB.

#### `/src/atoms/keysAtom.ts`
Maps items → keys.

#### `/src/atoms/entriesAtom.ts`
Maps items → `[id, value]`.

#### `/src/atoms/itemAtom.ts`
Atom family for a single record by ID.

#### `/src/atoms/rangeAtom.ts`
Reads from index using a range.

#### `/src/atoms/setterAtom.ts`
Write-through atom:
1. Writes to IDB  
2. Updates Jotai atoms  


## 5. Core Class – `/src/core/JotaiIDB.ts`

Handles:
- Config & initialization
- dbPromise
- Exposes atoms
- Provides `item()`, `range()`, and `setter`

Example structure:
```ts
export class JotaiIDB<T extends RecordType> {
  private dbPromise: Promise<IDBDatabase>;
  private storeName: string;

  items;
  keys;
  entries;

  constructor(config: JotaiIDBConfig<T>) {
    this.dbPromise = openDB(config);
    this.storeName = config.store.name;

    this.items = createItemsAtom(this);
    this.keys = createKeysAtom(this);
    this.entries = createEntriesAtom(this);
  }

  item(id: string) {
    return createItemAtom(this, id);
  }

  range(query: RangeQuery) {
    return createRangeAtom(this, query);
  }

  setter = createSetterAtom(this);
}
```


## 6. Public Exports – `/src/index.ts`
```ts
export * from "./core/JotaiIDB";
export * from "./types";
```


## 7. Optional Features
Add later:
- deleteAtom  
- clearAtom  
- multi-store support  
- multi-tab sync via BroadcastChannel  
- prefix-based helper atoms  
- optimistic updates  
- migrations  


## 8. README Example

Example usage:
```ts
type Picture = {
  id: `picture#${string}`;
  type: "picture";
  url: string;
};

type Project = {
  id: `project#${string}`;
  type: "project";
  name: string;
};

type Row = Picture | Project;

const db = new JotaiIDB<Row>({
  dbName: "mydb",
  version: 1,
  store: {
    name: "main",
    keyPath: "id",
    indexes: [
      { name: "byTypeAndId", keyPath: ["type", "id"] },
    ]
  }
});

// read everything
const allItemsAtom = db.items;

// read single item
const itemAtom = db.item("picture#123");

// range: all pictures
const picturesAtom = db.range({
  index: "byTypeAndId",
  lower: ["picture", ""],
  upper: ["picture", "\uffff"]
});

// write/update
const setItemAtom = db.setter;
```


## 9. Coding Notes (for LLM implementation)

- TypeScript strict mode  
- All IndexedDB operations must use Promises  
- Atoms should never block React rendering  
- Avoid external deps  
- Strong type inference required  
- Keep files modular  
- No default exports  
- Follow Jotai idioms  

