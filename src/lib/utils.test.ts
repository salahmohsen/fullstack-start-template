// @vitest-environment jsdom
import { expect, test } from "vitest";

import { convertImageToBase64 } from "@/lib/utils";

test("convertImageToBase64 returns a data URL for an image file", async () => {
  const file = new File(["hello"], "avatar.txt", { type: "text/plain" });

  const result = await convertImageToBase64(file);

  expect(result).toBe("data:text/plain;base64,aGVsbG8=");
});
