import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/marketplace";
import MarketplaceLib "../lib/marketplace";

mixin (
  accessControlState : AccessControl.AccessControlState,
  listings : Map.Map<Nat, Types.Listing>,
  orders : Map.Map<Nat, Types.Order>,
  state : { var nextListingId : Nat; var nextOrderId : Nat },
) {
  // Auto-register a signed-in caller on their first authenticated action so a
  // freshly signed-in Internet Identity user can immediately create listings
  // and place orders without a separate registration step. AccessControl.initialize
  // is idempotent: the first caller becomes admin, subsequent callers become users.
  func ensureRegistered(caller : Principal) {
    AccessControl.initialize(accessControlState, caller);
  };

  public shared ({ caller }) func createListing(
    title : Text,
    description : Text,
    platform : Types.Platform,
    rank : Text,
    prestige : Nat,
    stats : Types.Stats,
    price : Nat,
    images : [Text],
  ) : async Types.Listing {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };
    MarketplaceLib.createListing(
      listings,
      state,
      caller,
      title,
      description,
      platform,
      rank,
      prestige,
      stats,
      price,
      images,
      Time.now(),
    )
  };

  public shared ({ caller }) func updateListing(
    listingId : Nat,
    title : Text,
    description : Text,
    platform : Types.Platform,
    rank : Text,
    prestige : Nat,
    stats : Types.Stats,
    price : Nat,
    images : [Text],
  ) : async ?Types.Listing {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };
    MarketplaceLib.updateListing(
      listings,
      caller,
      listingId,
      title,
      description,
      platform,
      rank,
      prestige,
      stats,
      price,
      images,
    )
  };

  public shared ({ caller }) func removeListing(listingId : Nat) : async Bool {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can remove listings");
    };
    MarketplaceLib.removeListing(listings, caller, listingId)
  };

  public query func listActiveListings() : async [Types.Listing] {
    MarketplaceLib.listActiveListings(listings)
  };

  public query func getListing(listingId : Nat) : async ?Types.Listing {
    MarketplaceLib.getListing(listings, listingId)
  };

  public shared ({ caller }) func placeOrder(listingId : Nat) : async ?Types.Order {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    MarketplaceLib.placeOrder(orders, listings, state, caller, listingId, Time.now())
  };

  public query ({ caller }) func listBuyerOrders() : async [Types.Order] {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    MarketplaceLib.listBuyerOrders(orders, caller)
  };

  public query ({ caller }) func listSellerOrders() : async [Types.Order] {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    MarketplaceLib.listSellerOrders(orders, caller)
  };

  public shared ({ caller }) func completeOrder(orderId : Nat) : async ?Types.Order {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can complete orders");
    };
    MarketplaceLib.completeOrder(orders, listings, caller, orderId)
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async ?Types.Order {
    ensureRegistered(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    MarketplaceLib.getOrder(orders, caller, orderId)
  };
};
