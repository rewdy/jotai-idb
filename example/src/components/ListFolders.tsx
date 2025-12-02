import { useAtomValue } from "jotai";
import type React from "react";
import { withSuspense } from "../helpers/withSuspense";
import { type Folder, foldersAtom } from "../state";
import { ColorSwatch } from "./util/ColorSwatch";
import { InfoBlock } from "./util/InfoBlock";

const ListFoldersInner: React.FC = () => {
  const items = useAtomValue(foldersAtom);

  const folders = items.filter(
    (item): item is Folder => item.type === "folder",
  );

  return (
    <article>
      <header>Folders</header>
      <InfoBlock>
        This section uses the <code>JotaiIDB.range</code> atom to list all
        folders. A range query is passed into the atom to get all records
        returned from the query.
      </InfoBlock>
      {folders.length === 0 ? (
        <p>No folders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Folder Name</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <tr key={folder.id}>
                <td>{folder.name}</td>
                <td>
                  {folder.color ? <ColorSwatch color={folder.color} /> : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
};

export const ListFolders = withSuspense(ListFoldersInner);
ListFolders.displayName = "ListFolders";
