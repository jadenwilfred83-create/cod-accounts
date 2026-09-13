import {
  type Listing,
  type Order,
  type Platform,
  type Stats,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useListActiveListings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listings", "active"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(listingId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["listing", listingId],
    queryFn: async () => {
      if (!actor || listingId === undefined) return null;
      return actor.getListing(listingId);
    },
    enabled: !!actor && !isFetching && listingId !== undefined,
  });
}

export interface ListingInput {
  title: string;
  description: string;
  platform: Platform;
  rank: string;
  prestige: bigint;
  stats: Stats;
  price: bigint;
  images: Array<string>;
}

export function useCreateListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ListingInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createListing(
        input.title,
        input.description,
        input.platform,
        input.rank,
        input.prestige,
        input.stats,
        input.price,
        input.images,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ListingInput & { id: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateListing(
        input.id,
        input.title,
        input.description,
        input.platform,
        input.rank,
        input.prestige,
        input.stats,
        input.price,
        input.images,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useRemoveListing() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeListing(listingId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.placeOrder(listingId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useListBuyerOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["orders", "buyer"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBuyerOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListSellerOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["orders", "seller"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSellerOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCompleteOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.completeOrder(orderId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useGetOrder(orderId: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor || orderId === undefined) return null;
      return actor.getOrder(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== undefined,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export type { Listing, Order };
