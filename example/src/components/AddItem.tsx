import { useAtomValue, useSetAtom } from "jotai";
import type React from "react";
import { useState } from "react";
import { type Folder, foldersAtom, type Item, itemsDb } from "../state";

export const AddItem: React.FC = () => {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const saveItem = useSetAtom(itemsDb.set);

  const folders = useAtomValue(foldersAtom).filter(
    (item): item is Folder => item.type === "folder",
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    if (name.trim() === "") {
      setError("Item name is required.");
      return;
    }
    if (!folderId) {
      setError("Folder selection is required.");
      return;
    }
    const newItem: Item = {
      id,
      type: "item",
      name: name.trim(),
      folderId,
    };
    await saveItem(id, newItem);

    reset();
  };

  const reset = () => {
    setName("");
    setFolderId(undefined);
    setError(null);
    setOpen(false);
  };

  console.log("🟪 Render AddItem");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add Item
      </button>
      <dialog open={open} onClose={() => setOpen(false)}>
        <article>
          <header>
            <button
              type="button"
              aria-label="Close"
              rel="prev"
              onClick={() => setOpen(false)}
            ></button>
            <h2>Add New Item</h2>
          </header>
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div>
              <label htmlFor="item-name">Item Name:</label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="folder-id">Folder</label>
              <select
                id="folder-id"
                name="folder-id"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
              >
                <option value="">-- Select a folder --</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button type="submit">Add Item</button>
            </div>
          </form>
        </article>
      </dialog>
    </>
  );
};
