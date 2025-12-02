import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { JotaiIDB, UNICODE_MAX } from "jotai-idb";

/**
 * A thing that holds other things
 */
export type Folder = {
  type: "folder";
  // Id and folder will be the same value, but this makes our index work nicely
  id: string;
  folderId: string;
  name: string;
  color?: string;
};

/**
 * A thing that is held 🥰
 */
export type Item = {
  type: "item";
  id: string;
  folderId: string;
  name: string;
  content?: string;
};

/**
 * Main example implementation of JotaiIDB. For the example, we want to store two
 * different types of records in the same object store. You wouldn't necessarily
 * always do this, but it shows how you CAN then pairing this setup with range
 * queries to get the data you care about.
 */
export const itemsDb = new JotaiIDB<Folder | Item>({
  dbName: "example-db",
  version: 1,
  store: {
    name: "all-data",
    keyPath: "id",
    indexes: [
      {
        name: "listing-index",
        keyPath: ["type", "folderId", "itemId"],
        unique: true,
      },
    ],
  },
  initialData: {
    "9f5896c9-84dd-4933-a9b8-a202ffdd0afa": {
      type: "folder",
      id: "9f5896c9-84dd-4933-a9b8-a202ffdd0afa",
      folderId: "9f5896c9-84dd-4933-a9b8-a202ffdd0afa",
      name: "Personal",
      color: "blue",
    },
  },
});

/**
 * Example atom using the listing-index and returning all items with a
 * keyPath starting with `folder`. Note the usage of UNICODE_MAX to get
 * all items in that range.
 */
export const foldersAtom = itemsDb.range({
  index: "listing-index",
  lower: ["folder"],
  upper: [`folder${UNICODE_MAX}`],
});
foldersAtom.debugLabel = "foldersAtom";

/**
 * Example atom using the listing-index and returning all items with a
 * keyPath starting with `item`. Note the usage of UNICODE_MAX to get
 * all items in that range.
 */
export const itemsAtom = itemsDb.range({
  index: "listing-index",
  lower: ["item"],
  upper: [`item${UNICODE_MAX}`],
});
itemsAtom.debugLabel = "itemsAtom";

/**
 * Example atomFamily using the listing-index to get all items within a specific folder.
 * Note the range key starts with item, then the folderId, and uses UNICODE_MAX to
 * capture all items within that folder.
 */
export const folderItemsAtom = atomFamily((folderId: string) =>
  atom(
    itemsDb.range({
      index: "listing-index",
      lower: ["item", folderId],
      upper: ["item", folderId, UNICODE_MAX],
    }),
  ),
);

/**
 * Just for the example app only: keeps track of the currently viewed item id
 */
export const viewItemAtom = atomWithStorage<string | undefined>(
  "example-view-item",
  undefined,
);
viewItemAtom.debugLabel = "viewItemAtom";
