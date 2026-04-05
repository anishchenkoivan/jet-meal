import type { LoggerProvider } from "@opentelemetry/sdk-logs";
import type { MeterProvider } from "@opentelemetry/sdk-metrics";

export type BrowserTelemetryHandle = {
  loggerProvider: LoggerProvider;
  meterProvider: MeterProvider;
  shutdown(): Promise<void>;
};
