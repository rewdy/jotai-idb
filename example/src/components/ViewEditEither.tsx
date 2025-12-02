import { useAtom, useAtomValue } from "jotai";
import type React from "react";
import { useState } from "react";
import { type Folder, foldersAtom, type Item, itemsDb } from "../state";
import { ColorSwatch } from "./util/ColorSwatch";

export type ViewEditFolderProps = {
  id: string;
};

/**
 * Single folder view/edit component
 */
const ViewFolder: React.FC<{
  folder: Folder;
  updateFolder: (folder: Folder) => void;
}> = ({ folder, updateFolder }) => {
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState(folder.name);
  const [color, setColor] = useState(folder.color || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateFolder({
      ...folder,
      name: name.trim(),
      color: color.trim() || undefined,
    });
    setEdit(false);
  };

  const editButtonTxt = edit ? "Cancel" : "Edit";

  return (
    <div>
      <article>
        <header>
          <h3>📂 Folder Details</h3>
        </header>
        <p>
          <button type="button" onClick={() => setEdit(!edit)}>
            {editButtonTxt}
          </button>
        </p>
        <hr />
        {edit ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="folder-name">Name:</label>
              <input
                type="text"
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="folder-color">Color:</label>
              <input
                id="folder-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <button type="submit">Save</button>
          </form>
        ) : (
          <>
            <p>
              <strong>ID:</strong> <code>{folder.id}</code> 🔒
            </p>
            <p>
              <strong>Name:</strong> {folder.name}
            </p>
            <p>
              <strong>Color:</strong>{" "}
              {folder.color ? <ColorSwatch color={folder.color} /> : "N/A"}
            </p>
          </>
        )}
      </article>
    </div>
  );
};

/**
 * Single item view/edit component
 */
const ViewItem: React.FC<{ item: Item; updateItem: (item: Item) => void }> = ({
  item,
  updateItem,
}) => {
  const folders = useAtomValue(foldersAtom).filter(
    (f): f is Folder => f.type === "folder",
  );
  const [edit, setEdit] = useState(false);

  const [name, setName] = useState(item.name);
  const [folderId, setFolderId] = useState(item.folderId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateItem({
      ...item,
      name: name.trim(),
      folderId,
    });
    setEdit(false);
  };

  const assignedFolder = folders.find((f) => f.id === item.folderId);
  const editButtonTxt = edit ? "Cancel" : "Edit";
  return (
    <div>
      <article>
        <header>
          <h3>📄 Item Details</h3>
        </header>
        <p>
          <button type="button" onClick={() => setEdit(!edit)}>
            {editButtonTxt}
          </button>
        </p>
        <hr />
        {edit ? (
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="item-name">Name:</label>
              <input
                type="text"
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="item-folder">Folder:</label>
              <select
                id="item-folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              >
                {folders.map((folder) => (
                  <option value={folder.id} key={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Save</button>
          </form>
        ) : (
          <>
            <p>
              <strong>ID:</strong> <code>{item.id}</code> 🔒
            </p>
            <p>
              <strong>Name:</strong> {item.name}
            </p>
            <p>
              <strong>Folder:</strong> {assignedFolder?.name}{" "}
              {assignedFolder?.color && (
                <ColorSwatch color={assignedFolder.color} />
              )}
            </p>
          </>
        )}
      </article>
    </div>
  );
};

export const ViewEditEither: React.FC<ViewEditFolderProps> = ({ id }) => {
  const [data, setData] = useAtom(itemsDb.item(id));

  return data?.type === "folder" ? (
    <ViewFolder folder={data} updateFolder={setData} />
  ) : data?.type === "item" ? (
    <ViewItem item={data} updateItem={setData} />
  ) : null;
};
