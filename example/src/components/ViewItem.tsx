import { useAtom } from "jotai";
import type React from "react";
import { withSuspense } from "../helpers/withSuspense";
import { itemsDb } from "../state";
import { InfoBlock } from "./util/InfoBlock";

export type ViewItemProps = {
  itemId: string;
  close: () => void;
};

const ViewItemInner: React.FC<ViewItemProps> = ({ itemId, close }) => {
  const [item, _setItem] = useAtom(itemsDb.item(itemId));

  console.log("🟨 Render ViewItem", itemId, item);
  return (
    <dialog open>
      <article>
        <header>
          <button
            type="button"
            aria-label="Close"
            rel="prev"
            onClick={close}
          ></button>
          <h2>View Item</h2>
        </header>
        <InfoBlock>
          This section uses the <code>JotaiIDB.item</code> atom to show the
          single item.
        </InfoBlock>
        {item ? (
          <div>
            <h2>{item.name}</h2>
            <pre>
              <code>{JSON.stringify(item, null, 2)}</code>
            </pre>
          </div>
        ) : (
          <p>Item not found.</p>
        )}
        <footer>
          <button type="button" onClick={close}>
            Close
          </button>
        </footer>
      </article>
    </dialog>
  );
};

export const ViewItem = withSuspense(ViewItemInner);
