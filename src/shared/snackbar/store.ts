import { create } from "zustand";
import type { SnackbarMessage, SnackbarSeverity } from "./types";

type SnackbarState = {
  messages: SnackbarMessage[];
  enqueue: (message: string, severity: SnackbarSeverity) => void;
  dismiss: (id: number) => void;
};

let nextId = 0;

export const useSnackbarStore = create<SnackbarState>((set) => ({
  messages: [],
  enqueue: (message, severity) =>
    set((state) => {
      if (
        state.messages.some(
          (item) => item.message === message && item.severity === severity,
        )
      ) {
        return state;
      }
      return {
        messages: [...state.messages, { id: ++nextId, message, severity }],
      };
    }),
  dismiss: (id) =>
    set((state) => ({
      messages: state.messages.filter((item) => item.id !== id),
    })),
}));
