// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { Button } from "@/components/ui/button";

test("Button renders its child element without leaking render props to the DOM", () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {
    // Intentionally suppress console noise in this test.
  });

  render(
    <Button
      render={(props) => (
        <a {...props} href="/docs">
          {props.children}
        </a>
      )}
    >
      Docs
    </Button>,
  );

  const link = screen.getByRole("link", { name: "Docs" });

  expect(link.hasAttribute("render")).toBe(false);
  expect(consoleError).not.toHaveBeenCalled();

  consoleError.mockRestore();
});
