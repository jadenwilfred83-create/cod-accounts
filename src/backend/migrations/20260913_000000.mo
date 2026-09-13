import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  type Platform = { #playstation; #xbox; #pc };

  type ListingStatus = { #active; #sold };

  type OrderStatus = { #placed; #completed };

  type Stats = {
    level : Nat;
    kdRatio : Float;
    wins : Nat;
  };

  type Listing = {
    id : Nat;
    seller : Principal;
    title : Text;
    description : Text;
    platform : Platform;
    rank : Text;
    prestige : Nat;
    stats : Stats;
    price : Nat;
    images : [Text];
    status : ListingStatus;
    createdAt : Int;
  };

  type Order = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    price : Nat;
    platform : Platform;
    status : OrderStatus;
    createdAt : Int;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    listings : Map.Map<Nat, Listing>;
    orders : Map.Map<Nat, Order>;
    state : { var nextListingId : Nat; var nextOrderId : Nat };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      listings = Map.empty();
      orders = Map.empty();
      state = { var nextListingId = 0; var nextOrderId = 0 };
    };
  };
};
