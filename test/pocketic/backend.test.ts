import { PocketIc, createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

// @dfinity/principal is not installed in this environment, so principals are
// derived from identities created by @dfinity/pic (which is installed and
// resolvable from this lane) rather than imported from @dfinity/principal.
const SELLER = createIdentity("seller").getPrincipal();
const BUYER = createIdentity("buyer").getPrincipal();
const THIRD_PARTY = createIdentity("third-party").getPrincipal();

const STATS = { wins: 42n, level: 250n, kdRatio: 1.75 };

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({ idlFactory, wasm: BACKEND_WASM }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listActiveListings()).resolves.toEqual([]);
});

it("auto-registers a fresh user on their first authenticated action", async () => {
  // A brand-new principal (never manually registered) can immediately create a
  // listing, and is registered (not a guest) afterwards. The first caller to
  // auto-register becomes admin; later callers become users.
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Auto Registered",
    "First authenticated action registers the caller",
    { playstation: null },
    "Gold",
    2n,
    STATS,
    100n,
    [],
  );
  expect(listing.id).toBeGreaterThanOrEqual(0n);
  await expect(actor.getCallerUserRole()).resolves.not.toEqual({ guest: null });
});

it("round-trips a listing through create and read", async () => {
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Crimson Ranked Account",
    "Max prestige Warzone account",
    { playstation: null },
    "Crimson",
    5n,
    STATS,
    150n,
    ["!caf!abc"],
  );
  expect(listing.id).toBeGreaterThanOrEqual(0n);
  expect(listing.status).toEqual({ active: null });
  expect(listing.seller.toString()).toBe(SELLER.toString());

  const active = await actor.listActiveListings();
  expect(active).toContainEqual(expect.objectContaining({ id: listing.id, title: "Crimson Ranked Account" }));
});

it("places an order, marks the listing sold, and records buyer/seller views", async () => {
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Order Me",
    "Account to be purchased",
    { xbox: null },
    "Gold",
    2n,
    STATS,
    200n,
    [],
  );

  actor.setPrincipal(BUYER);
  const order = await actor.placeOrder(listing.id);
  expect(order).not.toBeNull();
  expect(order![0].status).toEqual({ placed: null });
  expect(order![0].buyer.toString()).toBe(BUYER.toString());
  expect(order![0].seller.toString()).toBe(SELLER.toString());
  expect(order![0].price).toBe(200n);

  // The listing leaves active browsing once purchased.
  const active = await actor.listActiveListings();
  expect(active.some((l) => l.id === listing.id)).toBe(false);

  // Buyer sees the order in their history.
  const buyerOrders = await actor.listBuyerOrders();
  expect(buyerOrders).toContainEqual(expect.objectContaining({ id: order![0].id }));

  // Seller sees the incoming order.
  actor.setPrincipal(SELLER);
  const sellerOrders = await actor.listSellerOrders();
  expect(sellerOrders).toContainEqual(expect.objectContaining({ id: order![0].id }));
});

it("lets the seller complete an order", async () => {
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Complete Me",
    "Account to complete",
    { pc: null },
    "Platinum",
    3n,
    STATS,
    300n,
    [],
  );

  actor.setPrincipal(BUYER);
  const order = await actor.placeOrder(listing.id);
  expect(order).not.toBeNull();

  actor.setPrincipal(SELLER);
  const completed = await actor.completeOrder(order![0].id);
  expect(completed).not.toBeNull();
  expect(completed![0].status).toEqual({ completed: null });
});

it("does not show one caller's order to another", async () => {
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Private Order",
    "Only the buyer may view",
    { playstation: null },
    "Diamond",
    4n,
    STATS,
    400n,
    [],
  );

  actor.setPrincipal(BUYER);
  const order = await actor.placeOrder(listing.id);
  expect(order).not.toBeNull();

  // A third party cannot read the order.
  actor.setPrincipal(THIRD_PARTY);
  await expect(actor.getOrder(order![0].id)).resolves.toEqual([]);

  // The buyer can.
  actor.setPrincipal(BUYER);
  await expect(actor.getOrder(order![0].id)).resolves.toEqual(
    expect.objectContaining([expect.objectContaining({ id: order![0].id })]),
  );
});

it("only the owner can update or remove a listing", async () => {
  actor.setPrincipal(SELLER);
  const listing = await actor.createListing(
    "Owner Only",
    "Only the seller may edit",
    { xbox: null },
    "Silver",
    1n,
    STATS,
    50n,
    [],
  );

  // A non-owner cannot update.
  actor.setPrincipal(BUYER);
  const updated = await actor.updateListing(
    listing.id,
    "Hijacked",
    "should not apply",
    { xbox: null },
    "Silver",
    1n,
    STATS,
    50n,
    [],
  );
  expect(updated).toEqual([]);

  // A non-owner cannot remove.
  await expect(actor.removeListing(listing.id)).resolves.toBe(false);

  // The owner can.
  actor.setPrincipal(SELLER);
  const ownerUpdated = await actor.updateListing(
    listing.id,
    "Owner Updated",
    "applied",
    { xbox: null },
    "Silver",
    1n,
    STATS,
    60n,
    [],
  );
  expect(ownerUpdated).not.toBeNull();
  expect(ownerUpdated![0].title).toBe("Owner Updated");

  await expect(actor.removeListing(listing.id)).resolves.toBe(true);
  await expect(actor.getListing(listing.id)).resolves.toEqual([]);
});
