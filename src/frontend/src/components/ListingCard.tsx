import { Badge } from "@/components/ui/badge";
import { useListingImages } from "@/hooks/useImageUpload";
import { type Listing, PLATFORM_LABELS, formatKd, formatPrice } from "@/types";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Trophy } from "lucide-react";

export function ListingCard({
  listing,
  index,
}: { listing: Listing; index: number }) {
  const [image] = useListingImages(listing.images);
  const src = image ?? "/assets/images/placeholder.svg";

  return (
    <Link
      to="/listing/$listingId"
      params={{ listingId: listing.id.toString() }}
      className="card-accent-line group flex flex-col overflow-hidden rounded-lg border bg-card shadow-subtle transition-all duration-200 hover:border-primary/40 hover:shadow-elevated"
      style={{ animationDelay: `${index * 60}ms` }}
      data-ocid={`listing.card.${index + 1}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={src}
          alt={listing.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant="secondary" className="font-mono uppercase">
            {listing.rank}
          </Badge>
          <Badge className="bg-accent text-accent-foreground font-mono uppercase">
            <Trophy className="size-3" />P{listing.prestige.toString()}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-base font-bold leading-snug tracking-tight line-clamp-1">
          {listing.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="font-mono uppercase text-muted-foreground"
          >
            <Gamepad2 className="size-3" />
            {PLATFORM_LABELS[listing.platform]}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {formatKd(listing.stats.kdRatio)}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              K/D
            </p>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {listing.stats.wins.toLocaleString("en-US")}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Wins
            </p>
          </div>
          <div>
            <p className="font-mono text-sm font-semibold text-foreground">
              {listing.stats.level.toLocaleString("en-US")}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Level
            </p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t pt-3">
          <span className="font-mono text-lg font-bold text-primary">
            {formatPrice(listing.price)}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
            View Dossier →
          </span>
        </div>
      </div>
    </Link>
  );
}
