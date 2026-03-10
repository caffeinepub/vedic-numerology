import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  type User = {
    username : Text;
    passwordHash : Text;
    sectionLevel : Nat;
  };

  let users = Map.empty<Text, User>();

  public query ({ caller }) func login(username : Text, password : Text) : async Nat {
    switch (users.get(username)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?user) {
        if (user.passwordHash == password) {
          user.sectionLevel;
        } else {
          Runtime.trap("Incorrect password");
        };
      };
    };
  };

  public shared ({ caller }) func createUser(adminUsername : Text, adminPassword : Text, username : Text, password : Text, sectionLevel : Nat) : async () {
    if (adminUsername != "vikaskharb50@gmail.com" or adminPassword != "vikasadmin123") {
      Runtime.trap("Admin credentials required");
    };
    if (users.containsKey(username)) {
      Runtime.trap("User already exists");
    };
    let newUser : User = {
      username;
      passwordHash = password;
      sectionLevel;
    };
    users.add(username, newUser);
  };

  public query ({ caller }) func listUsers(adminUsername : Text, adminPassword : Text) : async [User] {
    if (adminUsername != "vikaskharb50@gmail.com" or adminPassword != "vikasadmin123") {
      Runtime.trap("Not Authorized");
    };
    users.values().toArray();
  };

  public shared ({ caller }) func deleteUser(adminUsername : Text, adminPassword : Text, username : Text) : async () {
    if (adminUsername != "vikaskharb50@gmail.com" or adminPassword != "vikasadmin123") {
      Runtime.trap("Not Authorized");
    };
    if (users.containsKey(username)) {
      users.remove(username);
    };
  };
};

