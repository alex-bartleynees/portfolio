import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { metrics } from "@opentelemetry/api";

const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: "portfolio-site",
    [ATTR_SERVICE_VERSION]: "0.1.0",
  }),
);

const sdk = new NodeSDK({
  resource: resource,
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

const meter = metrics.getMeter("page-views");
export const pageViewsCounter = meter.createCounter("page_views_total", {
  description: "Number of views per page",
});

export const totalViewsCounter = meter.createCounter("total_views", {
  description: "Total number of views across all pages",
});

export const trackPageView = (pathname) => {
  pageViewsCounter.add(1, {
    page: pathname,
  });
  totalViewsCounter.add(1);
};
