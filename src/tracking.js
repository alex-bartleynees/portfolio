import { pageViewsCounter } from "../instrumentation.js";
import { totalViewsCounter } from "../instrumentation.js";

export const trackPageView = (pathname) => {
  console.log("track page view", pathname);
  pageViewsCounter.add(1, {
    page: pathname,
  });
  totalViewsCounter.add(1);
};

export default trackPageView;
