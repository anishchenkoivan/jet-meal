import { registerNodeSDK } from "@jet-meal/opentelemetry/src/instrumentation/registerNodeSDK";
import { registerNodeTelemetry } from "@jet-meal/opentelemetry/src/serverInstrumentation/registerNodeTelemetry";

const serviceName =
  process.env["OTEL_SERVICE_NAME"] ?? "@jet-meal/restaurant-ssr";
const serviceVersion = process.env["npm_package_version"];

const hasOtlp =
  Boolean(process.env["OTEL_EXPORTER_OTLP_ENDPOINT"]) ||
  Boolean(process.env["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"]);

if (hasOtlp) {
  registerNodeTelemetry({ serviceName, serviceVersion });
} else {
  registerNodeSDK({
    serviceName,
    serviceVersion,
    debug: process.env["NODE_ENV"] === "development",
  });
}
