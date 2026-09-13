import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, Outlet } from "@tanstack/react-router";
import { Crosshair, LayoutDashboard, Plus, ShieldCheck } from "lucide-react";

export function Layout() {
  const { isAuthenticated, login, clear } = useInternetIdentity();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-card shadow-subtle">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight"
            data-ocid="nav.home"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Crosshair className="size-5" />
            </span>
            <span>
              WARZONE <span className="text-primary">VAULT</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              data-ocid="nav.dashboard"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              data-ocid="nav.sell"
            >
              <Link to="/listings/new">
                <Plus className="size-4" />
                Sell Account
              </Link>
            </Button>

            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clear()}
                data-ocid="nav.logout"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => login()}
                data-ocid="nav.login"
              >
                <ShieldCheck className="size-4" />
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-display text-sm font-bold">
            <Crosshair className="size-4 text-primary" />
            WARZONE VAULT
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className={cn("text-primary underline-offset-4 hover:underline")}
            >
              caffeine.ai
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
