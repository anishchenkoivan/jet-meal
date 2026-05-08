import { metrics } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { StubLogExporter } from "../stubs/StubLogExporter";
import { StubMetricExporter } from "../stubs/StubMetricExporter";

export type NodeSDKOptions = {
  serviceName: string;
  serviceVersion?: string;
  metricExportIntervalMillis?: number;
  debug?: boolean;
};

export type NodeSDKHandle = {
  loggerProvider: LoggerProvider;
  meterProvider: MeterProvider;
  shutdown(): Promise<void>;
};

let registered = false;

/**
 * Registers OpenTelemetry NodeSDK with stub exporters for logs and metrics.
 * Does not send data anywhere - only provides instrumentation APIs.
 */
export function registerNodeSDK(options: NodeSDKOptions): NodeSDKHandle {
  if (registered) {
    throw new Error(
      "@jet-meal/opentelemetry: registerNodeSDK() was already called",
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

  const interval = options.metricExportIntervalMillis ?? 60_000;
  const debug = options.debug ?? false;

  // Set up logger provider with stub exporter
  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor(new StubLogExporter({ debug })),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  // Set up meter provider with stub exporter
  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new StubMetricExporter({ debug }),
        exportIntervalMillis: interval,
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  if (debug) {
    console.debug('[NodeSDK] Registered with stub exporters', {
      serviceName: options.serviceName,
      serviceVersion: options.serviceVersion,
      metricInterval: interval,
    });
  }

  return {
    loggerProvider,
    meterProvider,
    async shutdown(): Promise<void> {
      if (debug) {
        console.debug('[NodeSDK] Shutting down');
      }
      await Promise.all([loggerProvider.shutdown(), meterProvider.shutdown()]);
      registered = false;
    },
  };
}