// context/AssetContext.jsx
// Shared state so submitted records appear in View All lists
import { createContext, useContext, useState } from "react";

const AssetContext = createContext(null);

export function AssetProvider({ children }) {
  const [assets,       setAssets]       = useState([]);
  const [inspections,  setInspections]  = useState([]);
  const [maintenance,  setMaintenance]  = useState([]);

  const addAsset      = (a) => setAssets((p)      => [{ ...a, id: Date.now() }, ...p]);
  const addInspection = (i) => setInspections((p) => [{ ...i, id: Date.now() }, ...p]);
  const addMaintenance= (m) => setMaintenance((p)  => [{ ...m, id: Date.now() }, ...p]);

  return (
    <AssetContext.Provider value={{
      assets, inspections, maintenance,
      addAsset, addInspection, addMaintenance,
    }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used inside AssetProvider");
  return ctx;
}


// check working