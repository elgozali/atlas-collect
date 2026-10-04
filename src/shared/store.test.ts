import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let storage: Map<string, string>;

beforeEach(() => {
  vi.resetModules();
  storage = new Map();
  const mockStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  };
  vi.stubGlobal("localStorage", mockStorage);
  vi.stubGlobal("window", { localStorage: mockStorage });
});

afterEach(() => vi.unstubAllGlobals());

describe("Saved and temporary UI state", () => {
  it("restores saved items without restoring legacy comparison selections", async () => {
    storage.set(
      "atlas-ui-v1",
      JSON.stringify({
        state: { saved: ["rolex"], compare: ["charizard"] },
        version: 0,
      }),
    );
    const { useUI } = await import("./store");
    expect(useUI.getState().saved).toEqual(["rolex"]);
    expect(useUI.getState().compare).toEqual([]);
  });

  it("persists saved items while keeping comparison choices out of storage", async () => {
    const { useUI } = await import("./store");
    useUI.getState().toggleSaved("rolex");
    useUI.getState().toggleCompare("charizard");
    expect(JSON.parse(storage.get("atlas-ui-v1")!).state).toEqual({
      saved: ["rolex"],
    });
    // A fresh module simulates the initial state after a full reload.
    vi.resetModules();
    const reloaded = await import("./store");
    expect(reloaded.useUI.getState().saved).toEqual(["rolex"]);
    expect(reloaded.useUI.getState().compare).toEqual([]);
  });

  it("clears comparison selections without deleting the watchlist", async () => {
    const { useUI } = await import("./store");
    useUI.getState().toggleSaved("rolex");
    useUI.getState().toggleCompare("charizard");
    useUI.getState().clearCompare();
    expect(useUI.getState().compare).toEqual([]);
    expect(useUI.getState().saved).toEqual(["rolex"]);
  });
});
