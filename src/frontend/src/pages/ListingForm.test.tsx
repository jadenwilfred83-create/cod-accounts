import App from "@/App";
import { SELLER_PRINCIPAL, createActorMock, makeListing } from "@/test/helpers";
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

describe("Listing form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticated = false;
    mockIdentity = undefined;
    window.history.replaceState({}, "", "/");
  });

  it("prompts sign-in for unauthenticated users", async () => {
    renderApp();
    window.history.pushState({}, "", "/listings/new");

    expect(
      await screen.findByText("Sign in to create a listing"),
    ).toBeInTheDocument();

    const loginButton = screen.getByRole("button", {
      name: /sign in with internet identity/i,
    });
    await userEvent.click(loginButton);
    expect(mockLogin).toHaveBeenCalled();
  });

  it("creates a listing and navigates to its detail page", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => SELLER_PRINCIPAL }),
    };
    mockActor.createListing.mockResolvedValue(makeListing({ id: 11n }));
    mockActor.getListing.mockResolvedValue(makeListing({ id: 11n }));

    renderApp();
    window.history.pushState({}, "", "/listings/new");

    await userEvent.type(
      await screen.findByLabelText("Title"),
      "Crimson Ranked Account",
    );
    await userEvent.type(
      screen.getByLabelText("Description"),
      "Max prestige account",
    );
    await userEvent.type(screen.getByLabelText("Price (USD)"), "150");

    const submit = screen.getByRole("button", { name: /publish listing/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(mockActor.createListing).toHaveBeenCalled();
    });
    const args = mockActor.createListing.mock.calls[0];
    expect(args[0]).toBe("Crimson Ranked Account");
    expect(args[1]).toBe("Max prestige account");
    expect(args[6]).toBe(150n);

    // Navigates to the new listing's detail page.
    expect(
      await screen.findByRole("heading", {
        name: "Crimson Ranked Warzone Account",
      }),
    ).toBeInTheDocument();
  });

  it("disables submit until required fields are filled", async () => {
    mockAuthenticated = true;
    mockIdentity = {
      getPrincipal: () => ({ toString: () => SELLER_PRINCIPAL }),
    };

    renderApp();
    window.history.pushState({}, "", "/listings/new");

    const submit = await screen.findByRole("button", {
      name: /publish listing/i,
    });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Title"), "A Title");
    await userEvent.type(screen.getByLabelText("Description"), "A description");
    await userEvent.type(screen.getByLabelText("Price (USD)"), "100");

    await waitFor(() => {
      expect(submit).toBeEnabled();
    });
  });
});
