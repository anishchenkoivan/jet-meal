import { metrics } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import type { TelemetryOptions } from "../telemetryOptions.js";
import { resolveNodeOtlpLogsUrl } from "./utils/resolveNodeOtlpLogsUrl.js";
import { resolveNodeOtlpMetricsUrl } from "./utils/resolveNodeOtlpMetricsUrl.js";
import type { NodeTelemetryHandle } from "./registerNodeTelemetry.d";

let registered = false;

/**
 * Registers global OpenTelemetry **logs** and **metrics** for Node (OTLP/HTTP).
 * Does not configure tracing.
 */
export function registerNodeTelemetry(
  options: TelemetryOptions,
): NodeTelemetryHandle {
  if (registered) {
    throw new Error(
      "@jet-meal/opentelemetry: registerNodeTelemetry() was already called",
    );
  }
  registered = true;

  const attrs: Record<string, string> = {
    [ATTR_SERVICE_NAME]: options.serviceName,
  };
  if (options.serviceVersion) {
    attrs[ATTR_SERVICE_VERSION] = options.serviceVersion;
  }
  const resource = resourceFromAttributes(attrs);

  const logsUrl = resolveNodeOtlpLogsUrl(options);
  const metricsUrl = resolveNodeOtlpMetricsUrl(options);
  const interval = options.metricExportIntervalMillis ?? 60_000;

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor(new OTLPLogExporter({ url: logsUrl })),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ url: metricsUrl }),
        exportIntervalMillis: interval,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  return {
    async shutdown(): Promise<void> {
      await Promise.all([loggerProvider.shutdown(), meterProvider.shutdown()]);
      registered = false;
    },
  };
}
