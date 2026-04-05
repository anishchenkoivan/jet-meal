import { joinOtlpUrl } from "../../utils/joinOtlpUrl.js";
import type { TelemetryOptions } from "../../telemetryOptions.js";

export function resolveNodeOtlpLogsUrl(options: TelemetryOptions): string {
  if (options.logsEndpoint) {
    return options.logsEndpoint;
  }
  const fromEnv = process.env["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"];
  if (fromEnv) {
    return fromEnv;
  }
  const base =
    options.otlpBaseUrl ??
    process.env["OTEL_EXPORTER_OTLP_ENDPOINT"] ??
    "http://localhost:4318";
  return joinOtlpUrl(base, "/v1/logs");
}
