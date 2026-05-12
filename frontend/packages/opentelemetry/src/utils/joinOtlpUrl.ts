export function joinOtlpUrl(
  baseUrl: string,
  signalPath: "/v1/logs" | "/v1/metrics",
): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith(signalPath)) {
    return trimmed;
  }
  return `${trimmed}${signalPath}`;
}
