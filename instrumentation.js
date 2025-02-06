const { NodeSDK } = require("@opentelemetry/sdk-node");
const { ConsoleSpanExporter } = require("@opentelemetry/sdk-trace-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} = require("@opentelemetry/sdk-metrics");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-proto");
const {
  OTLPMetricExporter,
} = require("@opentelemetry/exporter-metrics-otlp-proto");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "portfolio-site",
  }),
  traceExporter: new OTLPTraceExporter({
    url: "http://my-collector-collector.monitoring.svc.cluster.local:4318/v1/traces",
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: "http://my-collector-collector.monitoring.svc.cluster.local:4318/v1/metrics",
      headers: {},
      concurrencyLimit: 1,
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
