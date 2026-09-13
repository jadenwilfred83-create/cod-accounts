import { ListingCard } from "@/components/ListingCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCompleteOrder,
  useListActiveListings,
  useListBuyerOrders,
  useListSellerOrders,
  useRemoveListing,
} from "@/hooks/useQueries";
import { PLATFORM_LABELS, formatDate, formatPrice } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export function DashboardPage() {
  const { isAuthenticated, login, identity } = useInternetIdentity();
  const { data: listings, isLoading: listingsLoading } =
    useListActiveListings();
  const { data: buyerOrders, isLoading: buyerLoading } = useListBuyerOrders();
  const { data: sellerOrders, isLoading: sellerLoading } =
    useListSellerOrders();
  const completeOrder = useCompleteOrder();
  const removeListing = useRemoveListing();

  if (!isAuthenticated) {
    return (
      <div
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6"
        data-ocid="dashboard.unauth"
      >
        <ShieldCheck className="size-12 text-primary" />
        <h1 className="font-display text-2xl font-bold">
          Sign in to access your dashboard
        </h1>
        <p className="max-w-md text-muted-foreground">
          Manage your listings, track incoming orders, and review your purchase
          history.
        </p>
        <Button size="lg" onClick={() => login()} data-ocid="dashboard.login">
          Sign In with Internet Identity
        </Button>
      </div>
    );
  }

  const myPrincipal = identity?.getPrincipal().toString();
  const myListings = (listings ?? []).filter(
    (l) => l.seller.toString() === myPrincipal,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Command Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your listings and orders.
          </p>
        </div>
        <Button asChild data-ocid="dashboard.new_listing">
          <Link to="/listings/new">
            <Plus className="size-4" />
            Sell Account
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="listings" data-ocid="dashboard.tabs">
        <TabsList>
          <TabsTrigger value="listings" data-ocid="dashboard.tab.listings">
            <Package className="size-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="incoming" data-ocid="dashboard.tab.incoming">
            <ClipboardList className="size-4" />
            Incoming Orders
          </TabsTrigger>
          <TabsTrigger value="history" data-ocid="dashboard.tab.history">
            <ShoppingBag className="size-4" />
            Order History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {listingsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map(
                (id) => (
                  <div
                    key={id}
                    className="overflow-hidden rounded-lg border bg-card"
                  >
                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : myListings.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center"
              data-ocid="dashboard.listings_empty"
            >
              <Package className="size-10 text-muted-foreground" />
              <div>
                <h3 className="font-display text-lg font-bold">
                  No listings yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  List your first account to start selling.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                data-ocid="dashboard.listings_empty_action"
              >
                <Link to="/listings/new">
                  <Plus className="size-4" />
                  Create Listing
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myListings.map((listing, i) => (
                <div key={listing.id.toString()} className="relative">
                  <ListingCard listing={listing} index={i} />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeListing.mutate(listing.id)}
                    disabled={removeListing.isPending}
                    data-ocid={`dashboard.delete.${i + 1}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="mt-6">
          {sellerLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (sellerOrders ?? []).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center"
              data-ocid="dashboard.incoming_empty"
            >
              <ClipboardList className="size-10 text-muted-foreground" />
              <div>
                <h3 className="font-display text-lg font-bold">
                  No incoming orders
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Orders placed on your listings will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="divide-y">
                {(sellerOrders ?? []).map((order, i) => (
                  <div
                    key={order.id.toString()}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    data-ocid={`dashboard.incoming.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                        <ClipboardList className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Order #{order.id.toString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {PLATFORM_LABELS[order.platform]} ·{" "}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary">
                        {formatPrice(order.price)}
                      </span>
                      <Badge
                        variant={
                          order.status === "completed" ? "secondary" : "default"
                        }
                        className="font-mono uppercase"
                      >
                        {order.status}
                      </Badge>
                      {order.status === "placed" && (
                        <Button
                          size="sm"
                          onClick={() => completeOrder.mutate(order.id)}
                          disabled={completeOrder.isPending}
                          data-ocid={`dashboard.complete.${i + 1}`}
                        >
                          <CheckCircle2 className="size-4" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {buyerLoading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (buyerOrders ?? []).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-20 text-center"
              data-ocid="dashboard.history_empty"
            >
              <ShoppingBag className="size-10 text-muted-foreground" />
              <div>
                <h3 className="font-display text-lg font-bold">
                  No orders yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your purchase history will appear here.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                data-ocid="dashboard.history_browse"
              >
                <Link to="/">Browse Accounts</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="divide-y">
                {(buyerOrders ?? []).map((order, i) => (
                  <div
                    key={order.id.toString()}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    data-ocid={`dashboard.history.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                        <ShoppingBag className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Order #{order.id.toString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {PLATFORM_LABELS[order.platform]} ·{" "}
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary">
                        {formatPrice(order.price)}
                      </span>
                      <Badge
                        variant={
                          order.status === "completed" ? "secondary" : "default"
                        }
                        className="font-mono uppercase"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
