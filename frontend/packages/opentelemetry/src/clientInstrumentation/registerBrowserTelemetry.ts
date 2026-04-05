import { metrics } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { joinOtlpUrl } from "../utils/joinOtlpUrl.js";
import type { TelemetryOptions } from "../telemetryOptions.js";
import type { BrowserTelemetryHandle } from "./registerBrowserTelemetry.d";

let registered = false;

/**
 * Registers global OpenTelemetry **logs** and **metrics** in the browser (OTLP/HTTP).
 * Pass a collector URL your app can reach (and that allows CORS from the browser origin).
 */
export function registerBrowserTelemetry(
  options: TelemetryOptions,
): BrowserTelemetryHandle {
  if (registered) {
    throw new Error(
      "@jet-meal/opentelemetry: registerBrowserTelemetry() was already called",
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

  const base = options.otlpBaseUrl ?? "http://localhost:4318";
  const logsUrl = options.logsEndpoint ?? joinOtlpUrl(base, "/v1/logs");
  const metricsUrl =
    options.metricsEndpoint ?? joinOtlpUrl(base, "/v1/metrics");
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
    loggerProvider,
    meterProvider,
    async shutdown(): Promise<void> {
      await Promise.all([loggerProvider.shutdown(), meterProvider.shutdown()]);
      registered = false;
    },
  };
}
