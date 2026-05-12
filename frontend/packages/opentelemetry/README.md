# @jet-meal/opentelemetry

OpenTelemetry instrumentation package for Jet Meal services with support for both real OTLP exporters and stub implementations for development.

## Features

- **NodeSDK**: Server-side OpenTelemetry setup with stub exporters
- **Browser Provider**: Client-side OpenTelemetry setup with stub exporters  
- **Logs & Metrics**: Full instrumentation for logging and metrics collection
- **Stub Implementations**: No external dependencies, data stays local
- **Debug Mode**: Optional console logging for development

## Installation

This package is part of the Jet Meal monorepo and uses workspace dependencies.

## Usage

### Node.js / Server-side

```typescript
import { registerNodeSDK, createServiceLogger, createServiceMeter } from '@jet-meal/opentelemetry';

// Register the SDK with stub exporters
const sdk = registerNodeSDK({
  serviceName: 'my-service',
  serviceVersion: '1.0.0',
  debug: true, // Enable debug logging
  metricExportIntervalMillis: 30000,
});

// Get logger and meter
const logger = createServiceLogger('my-service', 'auth');
const meter = createServiceMeter('my-service', 'performance');

// Create metrics
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests',
});

const responseTimeHistogram = meter.createHistogram('http_request_duration', {
  description: 'HTTP request duration in milliseconds',
  unit: 'ms',
});

// Use logger
logger.emit({
  severityText: 'INFO',
  body: 'User authenticated successfully',
  attributes: { userId: '123', method: 'oauth' },
});

// Use metrics
requestCounter.add(1, { method: 'GET', route: '/api/users' });
responseTimeHistogram.record(150, { method: 'GET', route: '/api/users' });

// Shutdown when done
process.on('SIGTERM', async () => {
  await sdk.shutdown();
});
```

### Browser / Client-side

```typescript
import { registerBrowserProvider, createServiceLogger, createServiceMeter } from '@jet-meal/opentelemetry';

// Register browser providers with stub exporters
const provider = registerBrowserProvider({
  serviceName: 'jet-meal-frontend',
  serviceVersion: '1.0.0',
  debug: process.env.NODE_ENV === 'development',
});

// Get logger and meter
const logger = createServiceLogger('frontend', 'user-interactions');
const meter = createServiceMeter('frontend', 'performance');

// Create metrics
const clickCounter = meter.createCounter('ui_clicks_total');
const pageLoadTime = meter.createHistogram('page_load_duration', {
  unit: 'ms',
});

// Log user actions
function handleUserClick(action: string) {
  logger.emit({
    severityText: 'INFO',
    body: 'User interaction',
    attributes: { action, timestamp: Date.now() },
  });
  
  clickCounter.add(1, { action });
}

// Measure page load
window.addEventListener('load', () => {
  const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
  pageLoadTime.record(loadTime);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  provider.shutdown();
});
```

### Direct API Usage

```typescript
import { getLogger, getMeter } from '@jet-meal/opentelemetry';

// After SDK registration, get APIs directly
const logger = getLogger('my-component');
const meter = getMeter('my-component', '1.0.0');

// Create instruments
const errorCounter = meter.createCounter('errors_total');
const activeUsers = meter.createUpDownCounter('active_users');
const cpuUsage = meter.createGauge('cpu_usage_percent');

// Log errors
try {
  // Some operation
} catch (error) {
  logger.emit({
    severityText: 'ERROR',
    body: 'Operation failed',
    attributes: { 
      error: error.message,
      stack: error.stack,
    },
  });
  
  errorCounter.add(1, { operation: 'user_creation' });
}
```

## API Reference

### registerNodeSDK(options)

Registers OpenTelemetry NodeSDK with stub exporters.

**Options:**
- `serviceName` (string): Name of the service
- `serviceVersion` (string, optional): Version of the service  
- `metricExportIntervalMillis` (number, optional): Metrics export interval (default: 60000)
- `debug` (boolean, optional): Enable debug logging (default: false)

**Returns:** `NodeSDKHandle` with `loggerProvider`, `meterProvider`, and `shutdown()` method.

### registerBrowserProvider(options)

Registers OpenTelemetry browser providers with stub exporters.

**Options:** Same as `registerNodeSDK`

**Returns:** `BrowserProviderHandle` with `loggerProvider`, `meterProvider`, and `shutdown()` method.

### Stub Exporters

- **StubLogExporter**: Captures log records without sending them anywhere
- **StubMetricExporter**: Captures metrics without sending them anywhere
- Both support debug mode for console logging

## Backward Compatibility

The package maintains backward compatibility with existing real OTLP exporters:

```typescript
// Still available for production use
import { registerNodeTelemetry, registerBrowserTelemetry } from '@jet-meal/opentelemetry';
```

## Development

- **Debug Mode**: Set `debug: true` to see telemetry data in console
- **No Network**: Stub exporters never make network requests
- **Performance**: Minimal overhead, suitable for development and testing
- **Testing**: Perfect for unit tests and CI environments