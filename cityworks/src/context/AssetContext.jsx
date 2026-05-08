// context/AssetContext.jsx
// Data persists across page refreshes using localStorage
import { createContext, useContext, useState } from "react";

// ── Helper: load from localStorage safely ─────────────────
function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Helper: save to localStorage safely ───────────────────
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

// ── Storage keys ──────────────────────────────────────────
const KEYS = {
  assets:      "cw_assets",
  inspections: "cw_inspections",
  maintenance: "cw_maintenance",
};

// ── Context ───────────────────────────────────────────────
const AssetContext = createContext(null);

export function AssetProvider({ children }) {

  // Initialize state from localStorage on first load
  const [assets,      setAssets]      = useState(() => loadFromStorage(KEYS.assets));
  const [inspections, setInspections] = useState(() => loadFromStorage(KEYS.inspections));
  const [maintenance, setMaintenance] = useState(() => loadFromStorage(KEYS.maintenance));

  // ── Add functions — update state AND localStorage ───────
  const addAsset = (a) => {
    const newRecord = { ...a, id: Date.now() };
    setAssets(prev => {
      const updated = [newRecord, ...prev];
      saveToStorage(KEYS.assets, updated);
      return updated;
    });
  };

  const addInspection = (i) => {
    const newRecord = { ...i, id: Date.now() };
    setInspections(prev => {
      const updated = [newRecord, ...prev];
      saveToStorage(KEYS.inspections, updated);
      return updated;
    });
  };

  const addMaintenance = (m) => {
    const newRecord = { ...m, id: Date.now() };
    setMaintenance(prev => {
      const updated = [newRecord, ...prev];
      saveToStorage(KEYS.maintenance, updated);
      return updated;
    });
  };

  // ── Delete functions ────────────────────────────────────
  const deleteAsset = (id) => {
    setAssets(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveToStorage(KEYS.assets, updated);
      return updated;
    });
  };

  const deleteInspection = (id) => {
    setInspections(prev => {
      const updated = prev.filter(i => i.id !== id);
      saveToStorage(KEYS.inspections, updated);
      return updated;
    });
  };

  const deleteMaintenance = (id) => {
    setMaintenance(prev => {
      const updated = prev.filter(m => m.id !== id);
      saveToStorage(KEYS.maintenance, updated);
      return updated;
    });
  };

  // ── Clear all (useful for testing) ─────────────────────
  const clearAll = () => {
    setAssets([]);
    setInspections([]);
    setMaintenance([]);
    localStorage.removeItem(KEYS.assets);
    localStorage.removeItem(KEYS.maintenance);
    localStorage.removeItem(KEYS.inspections);
  };

  return (
    <AssetContext.Provider value={{
      // Data
      assets,
      inspections,
      maintenance,
      // Add
      addAsset,
      addInspection,
      addMaintenance,
      // Delete
      deleteAsset,
      deleteInspection,
      deleteMaintenance,
      // Utilities
      clearAll,
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