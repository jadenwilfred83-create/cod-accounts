import App from "@/App";
import { createActorMock, makeListing } from "@/test/helpers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: mockActor, isFetching: false }),
  useInternetIdentity: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    clear: vi.fn(),
    identity: undefined,
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

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/");
  });

  it("renders the browse grid with listing cards", async () => {
    mockActor.listActiveListings.mockResolvedValue([
      makeListing({ id: 1n, title: "Crimson Ranked Account", price: 150n }),
      makeListing({ id: 2n, title: "Diamond Warzone Account", price: 300n }),
    ]);

    renderApp();

    expect(
      await screen.findByRole("heading", { name: "Active Accounts" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Crimson Ranked Account"),
    ).toBeInTheDocument();
    expect(screen.getByText("Diamond Warzone Account")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it("shows an empty state when no listings match", async () => {
    mockActor.listActiveListings.mockResolvedValue([]);

    renderApp();

    expect(
      await screen.findByText("No accounts match your filters"),
    ).toBeInTheDocument();
  });

  it("filters listings by search keyword", async () => {
    mockActor.listActiveListings.mockResolvedValue([
      makeListing({ id: 1n, title: "Crimson Ranked Account" }),
      makeListing({ id: 2n, title: "Diamond Warzone Account" }),
    ]);

    renderApp();
    await screen.findByText("Crimson Ranked Account");

    const searchInput = screen.getByPlaceholderText(
      "Search by title or description…",
    );
    await userEvent.type(searchInput, "diamond");

    await waitFor(() => {
      expect(
        screen.queryByText("Crimson Ranked Account"),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Diamond Warzone Account")).toBeInTheDocument();
  });

  it("sorts listings by price low to high via the URL", async () => {
    mockActor.listActiveListings.mockResolvedValue([
      makeListing({ id: 1n, title: "Expensive Account", price: 300n }),
      makeListing({ id: 2n, title: "Cheap Account", price: 100n }),
    ]);

    window.history.replaceState({}, "", "/?sort=price-asc");
    renderApp();
    await screen.findByText("Expensive Account");

    await waitFor(() => {
      const cards = screen.getAllByRole("link");
      const titles = cards.map((c) => c.textContent ?? "");
      const cheapIndex = titles.findIndex((t) => t.includes("Cheap Account"));
      const expensiveIndex = titles.findIndex((t) =>
        t.includes("Expensive Account"),
      );
      expect(cheapIndex).toBeGreaterThan(-1);
      expect(expensiveIndex).toBeGreaterThan(cheapIndex);
    });
  });

  it("links each listing card to its detail page", async () => {
    mockActor.listActiveListings.mockResolvedValue([
      makeListing({ id: 7n, title: "Detail Bound Account" }),
    ]);

    renderApp();
    const card = await screen.findByText("Detail Bound Account");
    const link = card.closest("a");
    expect(link).toHaveAttribute("href", "/listing/7");
  });
});
