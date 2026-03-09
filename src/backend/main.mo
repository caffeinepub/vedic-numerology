import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  public type Chart = {
    id : Nat;
    name : Text;
    dob : Text;
    basicNumber : Nat;
    destinyNumber : Nat;
    chartNumbers : [Nat];
  };

  let charts = Map.empty<Nat, Chart>();
  var nextId = 0;

  public shared ({ caller }) func createChart(name : Text, dob : Text, basicNumber : Nat, destinyNumber : Nat, chartNumbers : [Nat]) : async Nat {
    let chart : Chart = {
      id = nextId;
      name;
      dob;
      basicNumber;
      destinyNumber;
      chartNumbers;
    };
    charts.add(nextId, chart);
    nextId += 1;
    chart.id;
  };

  public query ({ caller }) func getAllCharts() : async [Chart] {
    charts.values().toArray();
  };

  public shared ({ caller }) func deleteChart(id : Nat) : async () {
    if (charts.get(id) == null) {
      Runtime.trap("Chart not found");
    };
    charts.remove(id);
  };
};
