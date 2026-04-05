export type TelemetryOptions = {
  serviceName: string;
  serviceVersion?: string;
  /**
   * OTLP HTTP collector origin, e.g. `http://localhost:4318`.
   * Server: falls back to `OTEL_EXPORTER_OTLP_ENDPOINT`.
   * Browser: defaults to `http://localhost:4318` (ensure CORS on the collector).
   */
  otlpBaseUrl?: string;
  /** Full OTLP HTTP URL for logs (`…/v1/logs`). Overrides `otlpBaseUrl` / env when set. */
  logsEndpoint?: string;
  /** Full OTLP HTTP URL for metrics (`…/v1/metrics`). Overrides `otlpBaseUrl` / env when set. */
  metricsEndpoint?: string;
  metricExportIntervalMillis?: number;
};
