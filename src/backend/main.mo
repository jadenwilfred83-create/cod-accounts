import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "types/marketplace";
import MarketplaceMixin "mixins/marketplace-api";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let listings : Map.Map<Nat, Types.Listing>;
  let orders : Map.Map<Nat, Types.Order>;
  let state : { var nextListingId : Nat; var nextOrderId : Nat };

  include MixinAuthorization(accessControlState, null);
  include MarketplaceMixin(accessControlState, listings, orders, state);

  transient let anyP = Principal.fromText("aaaaa-aa");

  func platformText(p : Types.Platform) : Text = switch p {
    case (#playstation) "playstation";
    case (#xbox) "xbox";
    case (#pc) "pc";
  };

  func listingStatusText(s : Types.ListingStatus) : Text = switch s {
    case (#active) "active";
    case (#sold) "sold";
  };

  func orderStatusText(s : Types.OrderStatus) : Text = switch s {
    case (#placed) "placed";
    case (#completed) "completed";
  };

  include Expose({
    entities = [
      listings.toEntityManual("listing", "Listing", "id")
        .sample({
          id = 0;
          seller = anyP;
          title = "";
          description = "";
          platform = #playstation;
          rank = "";
          prestige = 0;
          stats = { level = 0; kdRatio = 0.0; wins = 0 };
          price = 0;
          images = [];
          status = #active;
          createdAt = 0;
        })
        .payload("id", func l = l.id)
        .payload("seller", func l = l.seller)
        .payload("title", func l = l.title)
        .payload("description", func l = l.description)
        .payload("platform", func l = platformText(l.platform))
        .payload("rank", func l = l.rank)
        .payload("prestige", func l = l.prestige)
        .payload("price", func l = l.price)
        .payload("status", func l = listingStatusText(l.status))
        .payload("createdAt", func l = l.createdAt)
        .public_()
        .build(),
      orders.toEntityManual("order", "Order", "id")
        .sample({
          id = 0;
          listingId = 0;
          buyer = anyP;
          seller = anyP;
          price = 0;
          platform = #playstation;
          status = #placed;
          createdAt = 0;
        })
        .payload("id", func o = o.id)
        .payload("listingId", func o = o.listingId)
        .payload("buyer", func o = o.buyer)
        .payload("seller", func o = o.seller)
        .payload("price", func o = o.price)
        .payload("platform", func o = platformText(o.platform))
        .payload("status", func o = orderStatusText(o.status))
        .payload("createdAt", func o = o.createdAt)
        .ownedBy("buyer")
        .controllerOrScoped()
        .build(),
    ];
  });
};
