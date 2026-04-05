import { joinOtlpUrl } from "../../utils/joinOtlpUrl.js";
import type { TelemetryOptions } from "../../telemetryOptions.js";

export function resolveNodeOtlpMetricsUrl(options: TelemetryOptions): string {
  if (options.metricsEndpoint) {
    return options.metricsEndpoint;
  }
  const fromEnv = process.env["OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"];
  if (fromEnv) {
    return fromEnv;
  }
  const base =
    options.otlpBaseUrl ??
    process.env["OTEL_EXPORTER_OTLP_ENDPOINT"] ??
    "http://localhost:4318";
  return joinOtlpUrl(base, "/v1/metrics");
}
