const LOCALHOST_ORIGIN = "http://localhost:3000";

export function resolveAuthBaseUrl(rawBaseUrl?: string, fallbackOrigin?: string): string {
  const candidate = rawBaseUrl?.trim();

  if (!candidate) {
    return fallbackOrigin ?? LOCALHOST_ORIGIN;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(candidate)) {
    return new URL(candidate).toString().replace(/\/$/, "");
  }

  return new URL(`http://${candidate}`).toString().replace(/\/$/, "");
}
