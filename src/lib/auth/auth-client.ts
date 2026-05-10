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

import {
  ac,
  admin as adminRole,
  superadmin as superAdminRole,
  user as userRole,
} from "./permissions";
import { env } from "../env.client";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
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
