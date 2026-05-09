const DEVELOPMENT_BETTER_AUTH_SECRET = "development-better-auth-secret";

export function resolveBetterAuthSecret(
  rawSecret: string | undefined,
  nodeEnv?: "production" | "development",
): string {
  if (rawSecret) {
    return rawSecret;
  }

  if (nodeEnv === "production") {
    throw new Error("BETTER_AUTH_SECRET must be set in production");
  }

  return DEVELOPMENT_BETTER_AUTH_SECRET;
}
