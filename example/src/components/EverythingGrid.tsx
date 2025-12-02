import { useAtomValue } from "jotai";
import type React from "react";
import { withSuspense } from "../helpers/withSuspense";
import { itemsDb } from "../state";
import { InfoBlock } from "./util/InfoBlock";
import { ViewEditEither } from "./ViewEditEither";

const EverythingGridInner: React.FC = () => {
  const allKeys = useAtomValue(itemsDb.keys);

  return (
    <div>
      <h2>All items</h2>
      <InfoBlock>
        This section shows a listing of all items. Each component listed below
        receives a <code>id</code> prop. The component that renders each (
        <code>&lt;ViewEditEither /&gt;</code>) uses the{" "}
        <code>JotaiIDB.item</code> atom family, taking the id as a prop. This
        means each component listed should only re-render when it's own data is
        updated.
      </InfoBlock>
      <div className="display-grid">
        {allKeys.map((key) => (
          <ViewEditEither id={key} key={key} />
        ))}
      </div>
    </div>
  );
};

export const EverythingGrid = withSuspense(EverythingGridInner);
