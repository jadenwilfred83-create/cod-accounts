import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Listing {
    id: bigint;
    status: ListingStatus;
    title: string;
    createdAt: bigint;
    rank: string;
    description: string;
    platform: Platform;
    seller: Principal;
    prestige: bigint;
    stats: Stats;
    price: bigint;
    images: Array<string>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface Stats {
    wins: bigint;
    level: bigint;
    kdRatio: number;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface Order {
    id: bigint;
    status: OrderStatus;
    listingId: bigint;
    createdAt: bigint;
    platform: Platform;
    seller: Principal;
    buyer: Principal;
    price: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export enum ListingStatus {
    active = "active",
    sold = "sold"
}
export enum OrderStatus {
    placed = "placed",
    completed = "completed"
}
export enum Platform {
    pc = "pc",
    xbox = "xbox",
    playstation = "playstation"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOrder(orderId: bigint): Promise<Order | null>;
    createListing(title: string, description: string, platform: Platform, rank: string, prestige: bigint, stats: Stats, price: bigint, images: Array<string>): Promise<Listing>;
    execute(qJson: string): Promise<Result>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(listingId: bigint): Promise<Listing | null>;
    getOrder(orderId: bigint): Promise<Order | null>;
    isCallerAdmin(): Promise<boolean>;
    listActiveListings(): Promise<Array<Listing>>;
    listBuyerOrders(): Promise<Array<Order>>;
    listSellerOrders(): Promise<Array<Order>>;
    placeOrder(listingId: bigint): Promise<Order | null>;
    removeListing(listingId: bigint): Promise<boolean>;
    schema(): Promise<string>;
    updateListing(listingId: bigint, title: string, description: string, platform: Platform, rank: string, prestige: bigint, stats: Stats, price: bigint, images: Array<string>): Promise<Listing | null>;
}
