import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  emailOTPClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { resolveAuthBaseUrl } from "@/lib/auth/auth-base-url";

import {
  ac,
  admin as adminRole,
  superadmin as superAdminRole,
  user as userRole,
} from "./permissions";

export const authClient = createAuthClient({
  baseURL: resolveAuthBaseUrl(import.meta.env.VITE_SERVER_URL, globalThis.location?.origin),
  plugins: [
    twoFactorClient(),
    passkeyClient(),
    adminClient({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        superadmin: superAdminRole,
      },
    }),
    organizationClient(),
    emailOTPClient(),
    magicLinkClient(),
    multiSessionClient(),
  ],
});

export type AuthClient = ReturnType<typeof createAuthClient>;
