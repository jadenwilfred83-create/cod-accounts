import App from "@/App";
import {
  BUYER_PRINCIPAL,
  SELLER_PRINCIPAL,
  createActorMock,
  makeListing,
  makeOrder,
} from "@/test/helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
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

describe("Listing detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
    mockIdentity = undefined;
    window.history.replaceState({}, "", "/");
  });

  it("shows full listing details", async () => {
    mockActor.getListing.mockResolvedValue(
      makeListing({
        id: 5n,
        title: "Crimson Ranked Account",
        description: "Max prestige with full loadouts.",
        rank: "Crimson",
        prestige: 5n,
        price: 150n,
      }),
    );

    renderApp();
    window.history.pushState({}, "", "/listing/5");

    expect(
      await screen.findByRole("heading", { name: "Crimson Ranked Account" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Max prestige with full loadouts."),
    ).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("Crimson")).toBeInTheDocument();
  });

  it("prompts sign-in when an unauthenticated user tries to order", async () => {
    mockActor.getListing.mockResolvedValue(makeListing({ id: 5n }));

    renderApp();
    window.history.pushState({}, "", "/listing/5");

    const orderButton = await screen.findByRole("button", {
      name: /sign in to purchase/i,
    });
    await userEvent.click(orderButton);
    expect(mockLogin).toHaveBeenCalled();
  });

  it("places an order through the confirmation dialog for an authenticated buyer", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => BUYER_PRINCIPAL }),
    };
    mockActor.getListing.mockResolvedValue(
      makeListing({ id: 5n, price: 150n }),
    );
    mockActor.placeOrder.mockResolvedValue(
      makeOrder({ id: 9n, listingId: 5n }),
    );

    renderApp();
    window.history.pushState({}, "", "/listing/5");

    const orderButton = await screen.findByRole("button", {
      name: /place order/i,
    });
    await userEvent.click(orderButton);

    const dialog = await screen.findByTestId("order.confirm_modal");
    expect(within(dialog).getByText("$150")).toBeInTheDocument();

    const confirm = within(dialog).getByRole("button", {
      name: /confirm order/i,
    });
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(mockActor.placeOrder).toHaveBeenCalledWith(5n);
    });
    expect(
      await screen.findByText("Order placed! Track it in your dashboard."),
    ).toBeInTheDocument();
  });

  it("shows owner controls only to the listing owner", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => SELLER_PRINCIPAL }),
    };
    mockActor.getListing.mockResolvedValue(
      makeListing({ id: 5n, seller: SELLER_PRINCIPAL as never }),
    );

    renderApp();
    window.history.pushState({}, "", "/listing/5");

    await screen.findByRole("heading", {
      name: "Crimson Ranked Warzone Account",
    });
    expect(
      screen.getByRole("link", { name: /edit listing/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^remove$/i }),
    ).toBeInTheDocument();
  });

  it("does not show owner controls to a non-owner", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => BUYER_PRINCIPAL }),
    };
    mockActor.getListing.mockResolvedValue(
      makeListing({ id: 5n, seller: SELLER_PRINCIPAL as never }),
    );

    renderApp();
    window.history.pushState({}, "", "/listing/5");

    await screen.findByRole("heading", {
      name: "Crimson Ranked Warzone Account",
    });
    expect(
      screen.queryByRole("link", { name: /edit listing/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^remove$/i }),
    ).not.toBeInTheDocument();
  });
});
