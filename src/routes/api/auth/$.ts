import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/lib/auth/auth";
import { ensureDevelopmentDatabase } from "@/lib/db/ensure-development-database";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        await ensureDevelopmentDatabase();
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        await ensureDevelopmentDatabase();
        return auth.handler(request);
      },
    },
  },
});
