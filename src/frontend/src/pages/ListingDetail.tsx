import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useListingImages } from "@/hooks/useImageUpload";
import {
  useGetListing,
  usePlaceOrder,
  useRemoveListing,
} from "@/hooks/useQueries";
import { PLATFORM_LABELS, formatDate, formatKd, formatPrice } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Gamepad2,
  ShieldCheck,
  ShoppingCart,
  Trophy,
} from "lucide-react";
import { useState } from "react";

export function ListingDetailPage() {
  const { listingId } = useParams({ from: "/listing/$listingId" });
  const navigate = useNavigate();
  const { isAuthenticated, login, identity } = useInternetIdentity();
  const id = BigInt(listingId);
  const { data: listing, isLoading } = useGetListing(id);
  const placeOrder = usePlaceOrder();
  const removeListing = useRemoveListing();
  const resolvedImages = useListingImages(listing?.images ?? []);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[16/10] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Account not found</h1>
        <p className="text-muted-foreground">
          This listing may have been removed or sold.
        </p>
        <Button asChild variant="outline" data-ocid="detail.back">
          <Link to="/">Back to browse</Link>
        </Button>
      </div>
    );
  }

  const images =
    resolvedImages.length > 0
      ? resolvedImages
      : ["/assets/images/placeholder.svg"];
  const isOwner =
    isAuthenticated &&
    identity !== undefined &&
    listing.seller.toString() === identity.getPrincipal().toString();

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setConfirmOpen(true);
  };

  const confirmOrder = () => {
    placeOrder.mutate(listing.id, {
      onSuccess: () => {
        setConfirmOpen(false);
      },
    });
  };

  const handleRemove = () => {
    removeListing.mutate(listing.id, {
      onSuccess: () => {
        void navigate({ to: "/" });
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 w-fit"
        data-ocid="detail.back"
      >
        <Link to="/">
          <ArrowLeft className="size-4" />
          Back to browse
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="card-accent-line overflow-hidden rounded-lg border bg-card shadow-subtle">
            <img
              src={images[activeImage]}
              alt={listing.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img || `thumb-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`size-20 shrink-0 overflow-hidden rounded-md border transition-colors ${
                    i === activeImage
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                  aria-label={`View screenshot ${i + 1}`}
                  data-ocid={`detail.thumbnail.${i + 1}`}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-mono uppercase">
                {listing.rank}
              </Badge>
              <Badge className="bg-accent text-accent-foreground font-mono uppercase">
                <Trophy className="size-3" />
                Prestige {listing.prestige.toString()}
              </Badge>
              <Badge
                variant="outline"
                className="font-mono uppercase text-muted-foreground"
              >
                <Gamepad2 className="size-3" />
                {PLATFORM_LABELS[listing.platform]}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Listed {formatDate(listing.createdAt)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border bg-card p-4">
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-primary">
                {formatKd(listing.stats.kdRatio)}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                K/D Ratio
              </p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-primary">
                {listing.stats.wins.toLocaleString("en-US")}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Wins
              </p>
            </div>
            <div className="text-center">
              <p className="font-mono text-2xl font-bold text-primary">
                {listing.stats.level.toLocaleString("en-US")}
              </p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Level
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Dossier Notes
            </h2>
            <p className="mt-2 text-base leading-relaxed text-foreground/90">
              {listing.description}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-4 rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-mono text-3xl font-bold text-primary">
                {formatPrice(listing.price)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Verified seller · Secure transfer
            </div>
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending}
              data-ocid="detail.place_order"
            >
              <ShoppingCart className="size-4" />
              {isAuthenticated ? "Place Order" : "Sign In to Purchase"}
            </Button>
            {placeOrder.isError && (
              <p
                className="text-sm text-destructive"
                data-ocid="detail.order_error"
              >
                Unable to place order. Please try again.
              </p>
            )}
            {placeOrder.isSuccess && (
              <p
                className="text-sm text-success"
                data-ocid="detail.order_success"
              >
                Order placed! Track it in your dashboard.
              </p>
            )}
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1"
                  data-ocid="detail.edit"
                >
                  <Link to="/listings/$listingId/edit" params={{ listingId }}>
                    Edit Listing
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRemove}
                  disabled={removeListing.isPending}
                  data-ocid="detail.delete"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent data-ocid="order.confirm_modal">
          <DialogHeader>
            <DialogTitle>Confirm your order</DialogTitle>
            <DialogDescription>
              Review the account details before placing your order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-lg border bg-card p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">{listing.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">
                {PLATFORM_LABELS[listing.platform]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-mono font-bold text-primary">
                {formatPrice(listing.price)}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              data-ocid="order.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmOrder}
              disabled={placeOrder.isPending}
              data-ocid="order.confirm_button"
            >
              {placeOrder.isPending ? "Placing…" : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
