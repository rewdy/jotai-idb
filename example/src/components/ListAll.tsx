/** biome-ignore-all lint/a11y/useValidAnchor: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
import { useAtomValue } from "jotai";
import type React from "react";
import { withSuspense } from "../helpers/withSuspense";
import { itemsDb } from "../state";
import { InfoBlock } from "./util/InfoBlock";

type ListAllProps = {
  onClick?: (id: string) => void;
};

const ListAllInner: React.FC<ListAllProps> = ({ onClick }) => {
  const items = useAtomValue(itemsDb.keys);

  console.log("🟩 Render ListAll");

  return (
    <article>
      <header>All keys</header>
      <InfoBlock>
        This section uses the <code>JotaiIDB.keys</code> atom to list all keys
        in the configured idb store.
      </InfoBlock>
      {items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <ul>
          {items.map((id) => (
            <li key={id}>
              {onClick ? (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    onClick(id);
                  }}
                  href="#"
                >
                  {id}
                </a>
              ) : (
                id
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};

export const ListAll = withSuspense(ListAllInner);
ListAll.displayName = "ListAll";
