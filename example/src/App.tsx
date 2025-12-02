import { useAtom } from "jotai";
import { AddFolder } from "./components/AddFolder";
import { ListAll } from "./components/ListAll";
import { ListFolders } from "./components/ListFolders";
import { Wrapper } from "./components/util/Wrapper";
import { ViewItem } from "./components/ViewItem";
import { viewItemAtom } from "./state";

import "jotai-devtools/styles.css";
import { AddItem } from "./components/AddItem";
import { EverythingGrid } from "./components/EverythingGrid";
import { ListItems } from "./components/ListItems";

const App = () => {
  const [viewId, setViewId] = useAtom(viewItemAtom);
  return (
    <>
      <header className="container">
        <hgroup>
          <h1>jotai-idb example app</h1>
          <p>How to use jotai-idb to interact with IndexedDB</p>
        </hgroup>
      </header>
      <main className="container">
        <Wrapper>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <AddFolder />
            <AddItem />
          </div>
          {viewId && (
            <ViewItem itemId={viewId} close={() => setViewId(undefined)} />
          )}
          <ListFolders />
          <ListItems />
          <EverythingGrid />
          <ListAll onClick={(id) => setViewId(id)} />
          {/* <DevTools /> */}
        </Wrapper>
      </main>
    </>
  );
};

export default App;
