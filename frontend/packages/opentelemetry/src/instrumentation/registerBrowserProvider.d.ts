import type { LoggerProvider } from "@opentelemetry/sdk-logs";
import type { MeterProvider } from "@opentelemetry/sdk-metrics";

export type BrowserProviderOptions = {
  serviceName: string;
  serviceVersion?: string;
  metricExportIntervalMillis?: number;
  debug?: boolean;
};

export type BrowserProviderHandle = {
  loggerProvider: LoggerProvider;
  meterProvider: MeterProvider;
  shutdown(): Promise<void>;
};

export declare function registerBrowserProvider(options: BrowserProviderOptions): BrowserProviderHandle;