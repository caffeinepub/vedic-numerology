import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Chart = {
    id : Nat;
    name : Text;
    dob : Text;
    basicNumber : Nat;
    destinyNumber : Nat;
    chartNumbers : [Nat];
  };

  type OldActor = {
    charts : Map.Map<Nat, Chart>;
    nextId : Nat;
  };

  type NewActor = {
    users : Map.Map<Text, { username : Text; passwordHash : Text; sectionLevel : Nat }>;
  };

  public func run(_old : OldActor) : NewActor {
    { users = Map.empty<Text, { username : Text; passwordHash : Text; sectionLevel : Nat }>() };
  };
};
