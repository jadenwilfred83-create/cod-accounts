module {
  public type Platform = { #playstation; #xbox; #pc };

  public type ListingStatus = { #active; #sold };

  public type OrderStatus = { #placed; #completed };

  public type Stats = {
    level : Nat;
    kdRatio : Float;
    wins : Nat;
  };

  public type Listing = {
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

  public type Order = {
    id : Nat;
    listingId : Nat;
    buyer : Principal;
    seller : Principal;
    price : Nat;
    platform : Platform;
    status : OrderStatus;
    createdAt : Int;
  };
};
