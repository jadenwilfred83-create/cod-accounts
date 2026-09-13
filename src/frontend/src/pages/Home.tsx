import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListActiveListings } from "@/hooks/useQueries";
import {
  type HomeSearch,
  PLATFORM_OPTIONS,
  RANK_TIERS,
  SORT_OPTIONS,
} from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";

export function HomePage() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate();
  const { data: listings, isLoading } = useListActiveListings();

  const updateSearch = (patch: Partial<HomeSearch>) => {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const filtered = useMemo(() => {
    if (!listings) return [];
    let result = [...listings];

    if (search.q) {
      const q = search.q.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }

    if (search.platform && search.platform !== "all") {
      result = result.filter((l) => l.platform === search.platform);
    }

    if (search.rank) {
      result = result.filter((l) => l.rank === search.rank);
    }

    if (search.minPrice !== undefined) {
      result = result.filter((l) => Number(l.price) >= search.minPrice!);
    }
    if (search.maxPrice !== undefined) {
      result = result.filter((l) => Number(l.price) <= search.maxPrice!);
    }

    switch (search.sort) {
      case "price-asc":
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      default:
        result.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        break;
    }

    return result;
  }, [listings, search]);

  const hasFilters =
    search.q ||
    (search.platform && search.platform !== "all") ||
    search.rank ||
    search.minPrice !== undefined ||
    search.maxPrice !== undefined;

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-operator.dim_1600x900.jpg"
            alt=""
            className="size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        </div>
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-20 sm:px-6 md:py-28">
          <p className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
            Verified Call of Duty Accounts
          </p>
          <h1 className="max-w-2xl font-display text-5xl font-bold tracking-tight md:text-7xl">
            Your next <span className="text-gradient-primary">LOADOUT</span> is
            one click away
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Browse a tactical dossier of ranked Warzone accounts — prestige,
            stats, and loadouts verified before they hit the grid.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" data-ocid="hero.browse">
              <a href="#browse">Browse Accounts</a>
            </Button>
            <Button asChild variant="outline" size="lg" data-ocid="hero.sell">
              <a href="/listings/new">Sell Your Account</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="border-b bg-card/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Filter Dossier
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search.q ?? ""}
                onChange={(e) =>
                  updateSearch({ q: e.target.value || undefined })
                }
                placeholder="Search by title or description…"
                className="pl-9"
                data-ocid="filter.search_input"
              />
            </div>
            <Select
              value={search.platform ?? "all"}
              onValueChange={(v) =>
                updateSearch({
                  platform: (v as HomeSearch["platform"]) || undefined,
                })
              }
            >
              <SelectTrigger data-ocid="filter.platform">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {PLATFORM_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={search.rank ?? "all"}
              onValueChange={(v) =>
                updateSearch({ rank: v === "all" ? undefined : v })
              }
            >
              <SelectTrigger data-ocid="filter.rank">
                <SelectValue placeholder="Rank Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {RANK_TIERS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={search.sort ?? "newest"}
              onValueChange={(v) =>
                updateSearch({ sort: v as HomeSearch["sort"] })
              }
            >
              <SelectTrigger data-ocid="filter.sort">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <Input
              type="number"
              min={0}
              placeholder="Min price ($)"
              value={search.minPrice ?? ""}
              onChange={(e) =>
                updateSearch({
                  minPrice:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              data-ocid="filter.min_price"
            />
            <Input
              type="number"
              min={0}
              placeholder="Max price ($)"
              value={search.maxPrice ?? ""}
              onChange={(e) =>
                updateSearch({
                  maxPrice:
                    e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
              data-ocid="filter.max_price"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => void navigate({ to: "/", search: {} })}
              data-ocid="filter.clear"
            >
              Clear filters
            </Button>
          )}
        </div>
      </section>

      {/* Browse grid */}
      <section
        id="browse"
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Active Accounts
          </h2>
          <span className="font-mono text-sm text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-lg border bg-card"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center"
            data-ocid="listing.empty_state"
          >
            <Search className="size-10 text-muted-foreground" />
            <div>
              <h3 className="font-display text-lg font-bold">
                No accounts match your filters
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or clearing the filters.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => void navigate({ to: "/", search: {} })}
              data-ocid="listing.empty_action"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing, i) => (
              <ListingCard
                key={listing.id.toString()}
                listing={listing}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
