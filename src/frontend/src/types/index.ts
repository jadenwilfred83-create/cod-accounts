import { Platform } from "@/backend";
import type { Listing, Order, Stats } from "@/backend";

export type { Listing, Order, Stats };
export { Platform };
export { ListingStatus, OrderStatus } from "@/backend";

export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.playstation]: "PlayStation",
  [Platform.xbox]: "Xbox",
  [Platform.pc]: "PC",
};

export const PLATFORM_OPTIONS: Array<{ value: Platform; label: string }> = [
  { value: Platform.playstation, label: "PlayStation" },
  { value: Platform.xbox, label: "Xbox" },
  { value: Platform.pc, label: "PC" },
];

export const RANK_TIERS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Crimson",
  "Iridescent",
  "Top 250",
] as const;

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface HomeSearch {
  q?: string;
  platform?: Platform | "all";
  rank?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
}

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function formatPrice(price: bigint): string {
  return `$${price.toLocaleString("en-US")}`;
}

export function formatKd(kdRatio: number): string {
  return kdRatio.toFixed(2);
}

export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
