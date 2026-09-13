import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/Dashboard";
import { HomePage } from "@/pages/Home";
import { ListingDetailPage } from "@/pages/ListingDetail";
import { ListingFormPage } from "@/pages/ListingForm";
import type { HomeSearch, Platform, SortOption } from "@/types";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

function parsePlatform(value: unknown): Platform | "all" | undefined {
  if (
    value === "all" ||
    value === "playstation" ||
    value === "xbox" ||
    value === "pc"
  ) {
    return value as Platform | "all";
  }
  return undefined;
}

function parseSort(value: unknown): SortOption | undefined {
  if (value === "newest" || value === "price-asc" || value === "price-desc") {
    return value;
  }
  return undefined;
}

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    platform: parsePlatform(search.platform),
    rank: typeof search.rank === "string" ? search.rank : undefined,
    minPrice:
      typeof search.minPrice === "number" && search.minPrice >= 0
        ? search.minPrice
        : undefined,
    maxPrice:
      typeof search.maxPrice === "number" && search.maxPrice >= 0
        ? search.maxPrice
        : undefined,
    sort: parseSort(search.sort),
  }),
  component: HomePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listing/$listingId",
  component: ListingDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const newListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/new",
  component: ListingFormPage,
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/listings/$listingId/edit",
  component: ListingFormPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  listingDetailRoute,
  dashboardRoute,
  newListingRoute,
  editListingRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
