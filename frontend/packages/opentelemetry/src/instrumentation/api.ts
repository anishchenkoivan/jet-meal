import { metrics } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";

/**
 * Convenience functions to get OpenTelemetry APIs after registration.
 * These work regardless of whether real or stub providers are used.
 */

/**
 * Get a logger instance.
 * Call this after registerNodeSDK() or registerBrowserProvider().
 */
export function getLogger(name: string, version?: string) {
  return logs.getLogger(name, version);
}

/**
 * Get a meter instance for creating metrics.
 * Call this after registerNodeSDK() or registerBrowserProvider().
 */
export function getMeter(name: string, version?: string) {
  return metrics.getMeter(name, version);
}

/**
 * Create a logger with service context.
 * Convenience wrapper that includes service name in logger name.
 */
export function createServiceLogger(serviceName: string, loggerName?: string) {
  const name = loggerName ? `${serviceName}.${loggerName}` : serviceName;
  return getLogger(name);
}

/**
 * Create a meter with service context.
 * Convenience wrapper that includes service name in meter name.
 */
export function createServiceMeter(serviceName: string, meterName?: string, version?: string) {
  const name = meterName ? `${serviceName}.${meterName}` : serviceName;
  return getMeter(name, version);
}