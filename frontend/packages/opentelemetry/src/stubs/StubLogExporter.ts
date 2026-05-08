import { ExportResultCode, type ExportResult } from "@opentelemetry/core";
import type { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";

/**
 * Stub log exporter that doesn't send data anywhere.
 * Logs export attempts to console in development mode.
 */
export class StubLogExporter implements LogRecordExporter {
  private readonly _debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this._debug = options.debug ?? false;
  }

  async export(
    logRecords: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void,
  ): Promise<void> {
    if (this._debug && logRecords.length > 0) {
      console.debug(`[StubLogExporter] Would export ${logRecords.length} log records:`, {
        records: logRecords.map(record => ({
          timestamp: record.hrTime,
          severityText: record.severityText,
          body: record.body,
          attributes: record.attributes,
        })),
      });
    }

    // Simulate successful export
    resultCallback({ code: ExportResultCode.SUCCESS } as ExportResult);
  }

  async shutdown(): Promise<void> {
    if (this._debug) {
      console.debug('[StubLogExporter] Shutdown called');
    }
  }
}