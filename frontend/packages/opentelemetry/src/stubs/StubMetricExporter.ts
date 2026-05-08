import { ExportResultCode, type ExportResult } from "@opentelemetry/core";
import {
  AggregationTemporality,
  type InstrumentType,
  type PushMetricExporter,
  type ResourceMetrics,
} from "@opentelemetry/sdk-metrics";

/**
 * Stub metric exporter that doesn't send data anywhere.
 * Logs export attempts to console in development mode.
 */
export class StubMetricExporter implements PushMetricExporter {
  private readonly _debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this._debug = options.debug ?? false;
  }

  async export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void,
  ): Promise<void> {
    if (this._debug && metrics.scopeMetrics.length > 0) {
      console.debug('[StubMetricExporter] Would export metrics:', {
        resource: metrics.resource,
        scopeMetrics: metrics.scopeMetrics.map(scope => ({
          scope: scope.scope,
          metricsCount: scope.metrics.length,
          metrics: scope.metrics.map(metric => ({
            descriptor: metric.descriptor,
            dataPointType: metric.dataPointType,
            dataPoints: metric.dataPoints.length,
          })),
        })),
      });
    }

    // Simulate successful export
    resultCallback({ code: ExportResultCode.SUCCESS } as ExportResult);
  }

  async forceFlush(): Promise<void> {
    if (this._debug) {
      console.debug('[StubMetricExporter] Force flush called');
    }
  }

  async shutdown(): Promise<void> {
    if (this._debug) {
      console.debug('[StubMetricExporter] Shutdown called');
    }
  }

  selectAggregationTemporality(_instrumentType: InstrumentType): AggregationTemporality {
    // Return cumulative for all instruments (similar to OTLP)
    return AggregationTemporality.CUMULATIVE;
  }
}