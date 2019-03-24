  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBWlRO86vNl6sL5psQX5f7H9Lw_wsULP9g",
    authDomain: "geofiretest-9d07e.firebaseapp.com",
    databaseURL: "https://geofiretest-9d07e.firebaseio.com",
    projectId: "geofiretest-9d07e",
    storageBucket: "geofiretest-9d07e.appspot.com",
    messagingSenderId: "680094207901"
};
firebase.initializeApp(config);

//variables for firebase database
var firebaseData = firebase.database();
//   geofire ref
var firebaseRefPush = firebase.database().ref().push();

var geoFire = new GeoFire(firebaseRefPush);
console.log("firebase "+ geoFire);

//setting initial location
geoFire.set("user_key", [37.785326, -122.405696]).then(function (){
    console.log("provided key has been added to Geofire");
}, function (error){
  console.log("error: " + error);
});


//getting initial location
geoFire.get("user_key").then(function(location) {
  if (location === null) {
    console.log("Provided key is not in GeoFire");
  }
  else {
    console.log("Provided key has a location of " + location);
  }
}, function(error) {
  console.log("Error: " + error);
});

//setup  a query that looks at the user's location.
var geoQuery = geoFire.query({
    center: [37.4, -122.6],
    radius: 1.609 //kilometers
});

//check to see if anything has entered this location
geoQuery.on("key_entered", function(key, location, distance) {
  console.log("Bicycle shop " + key + " found at " + location + " (" + distance + " km away)");
});

