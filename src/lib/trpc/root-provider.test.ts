// @vitest-environment jsdom
import { beforeEach, expect, test, vi } from "vitest";

const { toastError, toastSuccess } = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastError,
    success: toastSuccess,
  },
}));

import { createQueryClient } from "@/lib/trpc/root-provider";

beforeEach(() => {
  vi.clearAllMocks();
});

test("createQueryClient shows the configured success toast and invalidates matching queries", async () => {
  const queryClient = createQueryClient();
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

  const mutation = queryClient.getMutationCache().build(queryClient, {
    meta: {
      invalidatesQuery: [["users"]],
      successMessage: "Saved successfully",
    },
    mutationFn: async () => ({ message: "ignored" }),
  });

  await mutation.execute(undefined);

  expect(toastSuccess).toHaveBeenCalledWith("Saved successfully");
  expect(invalidateQueries).toHaveBeenCalledWith({
    exact: false,
    queryKey: ["users"],
  });
});

test("createQueryClient shows the configured error toast when a mutation fails", async () => {
  const queryClient = createQueryClient();

  const mutation = queryClient.getMutationCache().build(queryClient, {
    meta: {
      errorMessage: "Save failed",
    },
    mutationFn: () => Promise.reject(new Error("original error")),
  });

  await expect(mutation.execute(undefined)).rejects.toThrow("original error");

  expect(toastError).toHaveBeenCalledWith("Save failed");
});
