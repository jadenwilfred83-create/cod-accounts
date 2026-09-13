import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components use data-ocid attributes as their stable test hooks.
configure({ testIdAttribute: "data-ocid" });

// The app's main.tsx patches BigInt so TanStack Query can hash query keys that
// contain bigints (e.g. ["listing", listingId]). Tests render <App /> directly
// without main.tsx, so the same patch must be applied here.
BigInt.prototype.toJSON = function () {
  return this.toString();
};
