import { createFileRoute } from "@tanstack/react-router";

import { ProtectExamples } from "@/components/protect-examples";

export const Route = createFileRoute("/dashboard/protect-examples")({
  component: ProtectExamplesPage,
});

function ProtectExamplesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Protect Component Examples</h2>
        <div className="text-sm text-muted-foreground">
          Demonstrating authorization patterns with Better Auth
        </div>
      </div>
      <ProtectExamples />
    </div>
  );
}
