import { afterEach, describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";
import { useSnackbarStore } from "../shared/snackbar/store";

afterEach(() => {
  queryClient.clear();
  useSnackbarStore.setState({ messages: [] });
});

describe("Action feedback", () => {
  it("shows a success message after a confirmed mutation", async () => {
    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationFn: async () => "reserved",
      meta: { successMessage: "Collectible reserved." },
    });
    await mutation.execute(undefined);
    expect(useSnackbarStore.getState().messages).toMatchObject([
      { message: "Collectible reserved.", severity: "success" },
    ]);
  });

  it("shows server errors through the shared snackbar queue", async () => {
    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationFn: async () => {
        throw new Error("You have been outbid.");
      },
      meta: { successMessage: "Bid accepted." },
    });
    await expect(mutation.execute(undefined)).rejects.toThrow(
      "You have been outbid.",
    );
    expect(useSnackbarStore.getState().messages).toMatchObject([
      { message: "You have been outbid.", severity: "error" },
    ]);
  });

  it("reports query failures without repeating the same queued message", async () => {
    for (const id of ["first", "second"]) {
      await expect(
        queryClient.fetchQuery({
          queryKey: ["unavailable", id],
          queryFn: async () => {
            throw new Error("Connection unavailable.");
          },
          retry: false,
        }),
      ).rejects.toThrow("Connection unavailable.");
    }
    expect(useSnackbarStore.getState().messages).toHaveLength(1);
    expect(useSnackbarStore.getState().messages[0].severity).toBe("error");
  });
});
