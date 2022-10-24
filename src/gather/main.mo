import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import Types "types";

actor Gather {
  public type Error = Types.Error;
  public type Rsvp = Types.Rsvp;
  public type RsvpResult = Types.RsvpResult;
  type StableGather = Types.StableGather;
  type GatheringInfo = Types.GatheringInfo;
  type Gathering = Types.Gathering;

  private func asStable() : StableGather = {
    // Map the (Nat, Gathering) pairs from the unstable gatherings HashMap into
    // a stable array of Gatherings (the Gathering type contains the id, so the
    // HashMap can be recreated on postupgrade)
    gatheringEntries = Iter.toArray(
      Iter.map<(Nat, Gathering), Gathering>(
        gatherings.entries(),
        func pair { pair.1 },
      ),
    );
  };

  // This pattern uses `preupgrade` and `postupgrade` to allow `gatherings` to
  // be stable even though HashMap is not. See
  // https://sdk.dfinity.org/docs/language-guide/upgrades.html#_preupgrade_and_postupgrade_system_methods

  // Only used to store data during upgrades
  stable var stableGather : StableGather = {
    gatheringEntries = [];
  };

  var gatherings : HashMap.HashMap<Nat, Gathering> = HashMap.fromIter<Nat, Gathering>(
    Iter.fromArray(
      Array.map<Gathering, (Nat, Gathering)>(
        stableGather.gatheringEntries,
        func gathering { (gathering.id, gathering) },
      ),
    ),
    1,
    Nat.equal,
    Hash.hash,
  );

  system func preupgrade() {
    stableGather := asStable();
  };

  system func postupgrade() {
    stableGather := { gatheringEntries = [] };
  };

  // Public Application Interface

  public func getGathering(id : Nat) : async ?Gathering {
    Debug.print("Getting gathering " # debug_show (id));
    gatherings.get(id);
  };

  public func getAllGatherings() : async [Gathering] {
    return Iter.toArray(gatherings.vals());
  };

  public func addGathering(info : GatheringInfo) : async Gathering {
    var existingGathering : ?Gathering = null;
    loop {
      var id = await randomNumber();
      existingGathering := gatherings.get(id);
      switch (existingGathering) {
        case null {
          // We're free to use the random id we generated.
          let newGathering : Gathering = {
            id = id;
            info = info;
          };
          gatherings.put(id, newGathering);
          return newGathering;
        };
        // Loop again if existingGathering exists
        case (?g) {};
      };
    } while Option.isNull(existingGathering);
    Debug.trap("Failed to generate usable id for new Gathering.");
  };

  var randomState0 : Nat32 = 1;
  var randomState1 : Nat32 = 2;

  // from https://gist.github.com/chchrist/927b0c8ffe36a52b11522f470b81f216
  func xorshift128plus() : Nat {
    var s1 = randomState0;
    var s0 = randomState1;

    randomState0 := s0;

    s1 ^= s1 << 23;
    s1 ^= s1 >> 17;
    s1 ^= s0;
    s1 ^= s0 >> 26;
    randomState1 := s1;

    return Nat32.toNat(randomState0) + Nat32.toNat(randomState1);
  };

  func randomNumber() : async Nat {
    return xorshift128plus();
  };

  // Add an RSVP
  public shared func rsvp(rsvp : Rsvp, gatheringId : Nat) : async RsvpResult {
    switch (await getGathering(gatheringId)) {
      case null {
        return #err(#GatheringNotFound);
      };
      case (?gathering) {
        let newRsvps : [Rsvp] = List.toArray(
          List.append<Rsvp>(
            List.fromArray<Rsvp>(gathering.info.rsvps),
            List.fromArray<Rsvp>([rsvp]),
          ),
        );

        let oldValue : ?Gathering = gatherings.replace(
          gatheringId,
          {
            id = gatheringId;
            info = {
              title = gathering.info.title;
              description = gathering.info.description;
              datetime = gathering.info.datetime;
              location = gathering.info.location;
              items = gathering.info.items;
              rsvps = newRsvps;
            };
          },
        );
        return #ok(());
      };
    };
  };
};
