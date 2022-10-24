import Nat "mo:base/Nat";
import Result "mo:base/Result";

module {
  // Used to store the contents of the Gather canister in stable types
  // between upgrades
  public type StableGather = {
    gatheringEntries : [Gathering];
  };

  public type GatheringInfo = {
    title : Text;
    description : Text;
    datetime : Text;
    location : Text;
    items : [(Item, Nat)]; // (Item, Number of item originally needed)
    rsvps : [Rsvp];
  };

  public type Gathering = {
    id : Nat;
    info : GatheringInfo;
  };

  public type Item = {
    name : Text;
    description : Text;
  };

  public type Rsvp = {
    name : Text;
    attending : Bool;
    items : [(Item, Nat)]; // (Item, number bringing)
    comment : ?Text;
  };

  public type RsvpResult = Result.Result<(), Error>;

  public type Error = {
    #GatheringNotFound;
  };
};
