import Map "mo:core/Map";
import Types "../types/marketplace";

module {
  public func createListing(
    listings : Map.Map<Nat, Types.Listing>,
    state : { var nextListingId : Nat },
    seller : Principal,
    title : Text,
    description : Text,
    platform : Types.Platform,
    rank : Text,
    prestige : Nat,
    stats : Types.Stats,
    price : Nat,
    images : [Text],
    now : Int,
  ) : Types.Listing {
    let id = state.nextListingId;
    state.nextListingId += 1;
    let listing : Types.Listing = {
      id;
      seller;
      title;
      description;
      platform;
      rank;
      prestige;
      stats;
      price;
      images;
      status = #active;
      createdAt = now;
    };
    listings.add(id, listing);
    listing
  };

  public func updateListing(
    listings : Map.Map<Nat, Types.Listing>,
    caller : Principal,
    listingId : Nat,
    title : Text,
    description : Text,
    platform : Types.Platform,
    rank : Text,
    prestige : Nat,
    stats : Types.Stats,
    price : Nat,
    images : [Text],
  ) : ?Types.Listing {
    switch (listings.get(listingId)) {
      case (?listing) {
        if (listing.seller != caller) {
          null
        } else {
          let updated : Types.Listing = {
            listing with
            title = title;
            description = description;
            platform = platform;
            rank = rank;
            prestige = prestige;
            stats = stats;
            price = price;
            images = images;
          };
          listings.add(listingId, updated);
          ?updated
        };
      };
      case null { null };
    };
  };

  public func removeListing(
    listings : Map.Map<Nat, Types.Listing>,
    caller : Principal,
    listingId : Nat,
  ) : Bool {
    switch (listings.get(listingId)) {
      case (?listing) {
        if (listing.seller != caller) {
          false
        } else {
          listings.remove(listingId);
          true
        };
      };
      case null { false };
    };
  };

  public func listActiveListings(listings : Map.Map<Nat, Types.Listing>) : [Types.Listing] {
    listings.values().filter(func l = l.status == #active).toArray()
  };

  public func getListing(listings : Map.Map<Nat, Types.Listing>, listingId : Nat) : ?Types.Listing {
    listings.get(listingId)
  };

  public func placeOrder(
    orders : Map.Map<Nat, Types.Order>,
    listings : Map.Map<Nat, Types.Listing>,
    state : { var nextOrderId : Nat },
    buyer : Principal,
    listingId : Nat,
    now : Int,
  ) : ?Types.Order {
    switch (listings.get(listingId)) {
      case (?listing) {
        if (listing.status != #active) {
          null
        } else {
          let id = state.nextOrderId;
          state.nextOrderId += 1;
          let order : Types.Order = {
            id;
            listingId;
            buyer;
            seller = listing.seller;
            price = listing.price;
            platform = listing.platform;
            status = #placed;
            createdAt = now;
          };
          orders.add(id, order);
          // The listing is purchased once an order is placed — mark it sold so
          // it leaves active browsing and cannot be ordered again.
          let sold : Types.Listing = { listing with status = #sold };
          listings.add(listingId, sold);
          ?order
        };
      };
      case null { null };
    };
  };

  public func listBuyerOrders(orders : Map.Map<Nat, Types.Order>, buyer : Principal) : [Types.Order] {
    orders.values().filter(func o = o.buyer == buyer).toArray()
  };

  public func listSellerOrders(orders : Map.Map<Nat, Types.Order>, seller : Principal) : [Types.Order] {
    orders.values().filter(func o = o.seller == seller).toArray()
  };

  public func completeOrder(
    orders : Map.Map<Nat, Types.Order>,
    listings : Map.Map<Nat, Types.Listing>,
    caller : Principal,
    orderId : Nat,
  ) : ?Types.Order {
    switch (orders.get(orderId)) {
      case (?order) {
        if (order.seller != caller) {
          null
        } else {
          let completed : Types.Order = { order with status = #completed };
          orders.add(orderId, completed);
          switch (listings.get(order.listingId)) {
            case (?listing) {
              let sold : Types.Listing = { listing with status = #sold };
              listings.add(order.listingId, sold);
            };
            case null {};
          };
          ?completed
        };
      };
      case null { null };
    };
  };

  public func getOrder(orders : Map.Map<Nat, Types.Order>, caller : Principal, orderId : Nat) : ?Types.Order {
    switch (orders.get(orderId)) {
      case (?order) {
        if (order.buyer != caller) {
          null
        } else {
          ?order
        };
      };
      case null { null };
    };
  };
};
