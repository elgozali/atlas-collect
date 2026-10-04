import { create } from "zustand";
import { persist } from "zustand/middleware";
type UIState = {
  saved: string[];
  compare: string[];
  toggleSaved: (id: string) => void;
  toggleCompare: (id: string) => void;
  clear: () => void;
};
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
      clear: () => set({ saved: [], compare: [] }),
    }),
    { name: "atlas-ui-v1" },
  ),
);
