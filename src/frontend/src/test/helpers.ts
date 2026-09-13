import { ListingStatus, OrderStatus, Platform } from "@/types";
import type { Listing, Order, Stats } from "@/types";
import { vi } from "vitest";

export const SELLER_PRINCIPAL = "seller-principal-0000";
export const BUYER_PRINCIPAL = "buyer-principal-0000";

export function makeStats(overrides: Partial<Stats> = {}): Stats {
  return { wins: 42n, level: 250n, kdRatio: 1.75, ...overrides };
}

export function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: 1n,
    status: ListingStatus.active,
    title: "Crimson Ranked Warzone Account",
    createdAt: 1_700_000_000_000_000_000n,
    rank: "Crimson",
    description: "Max prestige account with full loadouts.",
    platform: Platform.playstation,
    seller: SELLER_PRINCIPAL as unknown as Listing["seller"],
    prestige: 5n,
    stats: makeStats(),
    price: 150n,
    images: ["/assets/images/placeholder.svg"],
    ...overrides,
  };
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1n,
    status: OrderStatus.placed,
    listingId: 1n,
    createdAt: 1_700_000_000_000_000_000n,
    platform: Platform.playstation,
    seller: SELLER_PRINCIPAL as unknown as Order["seller"],
    buyer: BUYER_PRINCIPAL as unknown as Order["buyer"],
    price: 150n,
    ...overrides,
  };
}

export interface ActorMock {
  listActiveListings: ReturnType<typeof vi.fn>;
  getListing: ReturnType<typeof vi.fn>;
  createListing: ReturnType<typeof vi.fn>;
  updateListing: ReturnType<typeof vi.fn>;
  removeListing: ReturnType<typeof vi.fn>;
  placeOrder: ReturnType<typeof vi.fn>;
  listBuyerOrders: ReturnType<typeof vi.fn>;
  listSellerOrders: ReturnType<typeof vi.fn>;
  completeOrder: ReturnType<typeof vi.fn>;
  getOrder: ReturnType<typeof vi.fn>;
  getCallerUserRole: ReturnType<typeof vi.fn>;
}

export function createActorMock(): ActorMock {
  return {
    listActiveListings: vi.fn(),
    getListing: vi.fn(),
    createListing: vi.fn(),
    updateListing: vi.fn(),
    removeListing: vi.fn(),
    placeOrder: vi.fn(),
    listBuyerOrders: vi.fn(),
    listSellerOrders: vi.fn(),
    completeOrder: vi.fn(),
    getOrder: vi.fn(),
    getCallerUserRole: vi.fn(),
  };
}
