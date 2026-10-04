import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  saved: string[];
  compare: string[];
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  clear: () => void;
};

function readSavedItems(value: unknown): string[] {
  const saved =
    typeof value === "object" && value !== null && "saved" in value
      ? value.saved
      : undefined;
  return Array.isArray(saved)
    ? saved.filter((item): item is string => typeof item === "string")
    : [];
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      saved: [],
      compare: [],
      toggleSaved: (id) =>
        set((s) => ({
          saved: s.saved.includes(id)
            ? s.saved.filter((x) => x !== id)
            : [...s.saved, id],
        })),
      toggleCompare: (id) =>
        set((s) => ({
          compare: s.compare.includes(id)
            ? s.compare.filter((x) => x !== id)
            : s.compare.length < 3
              ? [...s.compare, id]
              : s.compare,
        })),
      clearCompare: () => set({ compare: [] }),
      clear: () => set({ saved: [], compare: [] }),
    }),
    {
      name: "atlas-ui-v1",
      partialize: (state) => ({ saved: state.saved }),
      merge: (persisted, current) => ({
        ...current,
        saved: readSavedItems(persisted),
      }),
    },
  ),
);
