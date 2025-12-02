import { useSetAtom } from "jotai";
import type React from "react";
import { useState } from "react";
import { type Folder, itemsDb } from "../state";

export const AddFolder: React.FC = () => {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const saveFolder = useSetAtom(itemsDb.set);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    if (name.trim() === "") {
      setError("Folder name is required.");
      return;
    }
    const newFolder: Folder = {
      id,
      folderId: id,
      type: "folder",
      name: name.trim(),
      color: color.trim() || undefined,
    };
    await saveFolder(id, newFolder);

    reset();
  };

  const reset = () => {
    setName("");
    setColor("");
    setError(null);
    setOpen(false);
  };

  console.log("🟦 Render AddFolder");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add Folder
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
            <h2>Add New Folder</h2>
          </header>
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div>
              <label htmlFor="folder-name">Folder Name:</label>
              <input
                id="folder-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="folder-color">Folder Color:</label>
              <input
                id="folder-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div>
              <button type="submit">Add Folder</button>
            </div>
          </form>
        </article>
      </dialog>
    </>
  );
};
