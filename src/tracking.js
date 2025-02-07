import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("page-views");

const pageViewsCounter = meter.createCounter("page_views_total", {
  description: "Number of views per page",
});

const totalViewsCounter = meter.createCounter("total_views", {
  description: "Total number of views across all pages",
});

export const trackPageView = (pathname) => {
  pageViewsCounter.add(1, {
    page: pathname,
  });
  totalViewsCounter.add(1);
};

export default trackPageView;
