import type { LoggerProvider } from "@opentelemetry/sdk-logs";
import type { MeterProvider } from "@opentelemetry/sdk-metrics";

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

export declare function registerNodeSDK(options: NodeSDKOptions): NodeSDKHandle;