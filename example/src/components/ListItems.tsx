import { useAtomValue } from "jotai";
import type React from "react";
import { withSuspense } from "../helpers/withSuspense";
import { type Item, itemsAtom } from "../state";
import { InfoBlock } from "./util/InfoBlock";

const ListItemsInner: React.FC = () => {
  const items = useAtomValue(itemsAtom).filter(
    (item): item is Item => item.type === "item",
  );

  return (
    <article>
      <header>Items</header>
      <InfoBlock>
        This section uses the <code>JotaiIDB.range</code> atom to list all
        items. A range query is passed into the atom to get all records returned
        from the query.
      </InfoBlock>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Folder ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.folderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
};

export const ListItems = withSuspense(ListItemsInner);
ListItems.displayName = "ListItems";
