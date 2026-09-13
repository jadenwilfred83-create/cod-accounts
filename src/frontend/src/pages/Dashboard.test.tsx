import App from "@/App";
import {
  BUYER_PRINCIPAL,
  SELLER_PRINCIPAL,
  createActorMock,
  makeListing,
  makeOrder,
} from "@/test/helpers";
import { OrderStatus } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: mockAuthenticated,
    login: mockLogin,
    clear: vi.fn(),
    identity: mockIdentity,
  }),
  InternetIdentityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  loadConfig: vi.fn(),
}));

vi.mock("@caffeineai/object-storage", () => ({
  StorageClient: class {
    putFile = vi.fn();
    getDirectURL = vi.fn();
  },
}));

const mockActor = createActorMock();
const mockLogin = vi.fn();
let mockAuthenticated = false;
let mockIdentity:
  | { getPrincipal: () => { toString: () => string } }
  | undefined;

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
    mockIdentity = undefined;
    window.history.replaceState({}, "", "/");
  });

  it("prompts sign-in for unauthenticated users", async () => {
    renderApp();
    window.history.pushState({}, "", "/dashboard");

    expect(
      await screen.findByText("Sign in to access your dashboard"),
    ).toBeInTheDocument();

    const loginButton = screen.getByRole("button", {
      name: /sign in with internet identity/i,
    });
    await userEvent.click(loginButton);
    expect(mockLogin).toHaveBeenCalled();
  });

  it("shows the seller's own listings in the My Listings tab", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => SELLER_PRINCIPAL }),
    };
    mockActor.listActiveListings.mockResolvedValue([
      makeListing({
        id: 1n,
        title: "My Account",
        seller: SELLER_PRINCIPAL as never,
      }),
      makeListing({
        id: 2n,
        title: "Someone Else's",
        seller: BUYER_PRINCIPAL as never,
      }),
    ]);
    mockActor.listBuyerOrders.mockResolvedValue([]);
    mockActor.listSellerOrders.mockResolvedValue([]);

    renderApp();
    window.history.pushState({}, "", "/dashboard");

    expect(await screen.findByText("My Account")).toBeInTheDocument();
    expect(screen.queryByText("Someone Else's")).not.toBeInTheDocument();
  });

  it("shows incoming orders and lets the seller complete them", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => SELLER_PRINCIPAL }),
    };
    mockActor.listActiveListings.mockResolvedValue([]);
    mockActor.listBuyerOrders.mockResolvedValue([]);
    mockActor.listSellerOrders.mockResolvedValue([
      makeOrder({ id: 3n, status: OrderStatus.placed, price: 150n }),
    ]);
    mockActor.completeOrder.mockResolvedValue(
      makeOrder({ id: 3n, status: OrderStatus.completed, price: 150n }),
    );

    renderApp();
    window.history.pushState({}, "", "/dashboard");

    const incomingTab = await screen.findByRole("tab", {
      name: /incoming orders/i,
    });
    await userEvent.click(incomingTab);

    expect(await screen.findByText("Order #3")).toBeInTheDocument();
    expect(screen.getByText("placed")).toBeInTheDocument();

    const completeButton = screen.getByRole("button", { name: /complete/i });
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(mockActor.completeOrder).toHaveBeenCalledWith(3n);
    });
  });

  it("shows the buyer's order history", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => BUYER_PRINCIPAL }),
    };
    mockActor.listActiveListings.mockResolvedValue([]);
    mockActor.listBuyerOrders.mockResolvedValue([
      makeOrder({ id: 4n, status: OrderStatus.completed, price: 200n }),
    ]);
    mockActor.listSellerOrders.mockResolvedValue([]);

    renderApp();
    window.history.pushState({}, "", "/dashboard");

    const historyTab = await screen.findByRole("tab", {
      name: /order history/i,
    });
    await userEvent.click(historyTab);

    expect(await screen.findByText("Order #4")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });
});
