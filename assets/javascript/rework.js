$(document).ready(() => {
    //Global variables
    var Lattitude;
    var Longitude;
    var Radius = 5;
    var profile;
    var yelpProfile;
    var userID;
    var yelpSearch;
    var shoutLocation;
    // geoquery
    var shoutQuery;
    var yelpQuery;

    // Initialize Firebase ----------------------------------------
    var config = {
        apiKey: "AIzaSyBgbeWYYyp8oVui9kLHUT6HSDAREQhX9nU",
        authDomain: "shout-e4409.firebaseapp.com",
        databaseURL: "https://shout-e4409.firebaseio.com",
        projectId: "shout-e4409",
        storageBucket: "shout-e4409.appspot.com",
        messagingSenderId: "881880939559"
    };
    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var firebaseData = firebase.database();

    //All firebase direcories
    var usersRef = firebaseData.ref("/users");
    var connectionsRef = firebaseData.ref("/connections");
    var chatRef = firebaseData.ref("/chat");
    var shoutRef = firebaseData.ref("/shoutLoc");
    var yelpRef = firebaseData.ref("/yelp Businesses");

    //GEOFIRE-------------------------------------------------------
    //geofire ref
    var geoFireRefPush = firebaseData.ref("/geofire-location").push();
    //geofire initilize
    var geoFire = new GeoFire(geoFireRefPush);

    //live connection ref to the site
    var connectedRef = firebaseData.ref(".info/connected");

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            //set lng and lat
            Lattitude = position.coords.latitude;
            Longitude = position.coords.latitude;

            // check if someone is on the page
            connectedRef.on("value", (snapshot) => {
                //if there is a value
                if (snapshot.val()) {
                    // Remove users if they leave
                    connectionsRef.onDisconnect().remove();
                    usersRef.onDisconnect().remove();
                    console.log("# of users " + snapshot.numChildren());

                    //add unique user profile
                    profile = usersRef.push({
                        name: "static",
                        center: {
                            lat: Lattitude,
                            lng: Longitude
                        },
                        radius: Radius, //kilometers
                        chat: [],
                        shoutMessage: ""
                    });
                    //get unique user key
                    userID = profile.key;
                }
            });
            //--end of connectedRef

            // setUserLocation();
            //When user is added to firebase call the get location function       
            firebaseData.ref().on("child_added", (snapshot) => {
                setGeoFireUserInfo(snapshot);
            }, errorData);
            // --end of firebase root change event

            //on click shout
            $(document).on("click", "#shout", shoutLogic);

            //functions--------------
            function shoutLogic() {
                // set your location globaly
                usersRef.child(userID).on("value",(childSnapShot)=>{
                    var snap= childSnapShot.val();
                    var shoutLocation = [snap.center.lat,snap.center.lng];
                    
                    console.log(snap);
                    
                    //update the query
                    var shoutQuery = geoFire.query({
                        center: shoutLocation,
                        radius: Radius // kilometers
                    });
                    console.log(shoutQuery);
                    //update map and markers
                    googleMapShout(shoutLocation);
                    //googleMapShout();
                } , errorData)
                //set map's center to shouter
         
            }

            function setUserLocation(snapshot) {
                //update firebase User info
                usersRef.child(userID).update({
                    name: "static",
                    center: {
                        lat: Lattitude,
                        lng: Longitude
                    },
                    radius: Radius, //kilometers
                    message: []
                });
                // //get unique user key
                userID = profile.key;
                //set geofireinfo
                // setGeoFireUserInfo(snapshot);
            }

            // geofire location
            function setGeoFireUserInfo(snapshot) {
                snapshot.forEach(function (childSnapShot) {

                    var childData = childSnapShot.val();
                    var userName = childData.name;
                    var userLocation = [childData.center.lat, childData.center.lng];
                    console.log(snapshot.val());
                    console.log(childData.length);
                    //geofire controls the reference points for distance
                    geoFire.set(userName, userLocation).then(function () {
                        console.log("Current user " + userName + "'s location has been added to GeoFire and your location is " + userLocation);

                        geoFireRefPush.child(userName).onDisconnect().remove();
                    });
                });

                //get snapshot value
                // var sv = snapshot.val();
                // var keys = Object.keys(sv);
                // console.log(snapshot.userID);
                // // console.log(snapshot.name);
                //add all users 
                // var userName = sv.name;
                // var userLocation = [sv.center.lat, sv.center.lng];

                // console.log(userName);
                // console.log(userLocation);

                // for (var i = 0; i < sv.length; i++) {


                // }
            }

            //google map function of generating user and icon
            function googleMapShout(shoutLocation) {
                //create object for map
                var shoutObject = {
                    center: {
                        lat: shoutLocation[0],
                        lng: shoutLocation[1]
                    },
                    iconImage: "./assets/images/map-icon.png",
                    content: "<h1>Hello Friends!</h1>"
                }
                //set map's center to shouter
                map.panTo(shoutObject.center);

                //add marker
                addUserMarker(shoutObject);
                //function Marker
                function addUserMarker(so) {

                    var marker = new google.maps.Marker({
                        position: so.center,
                        map: map,
                        animation: google.maps.Animation.DROP,
                    });

                    //if user has an Icon
                    if (so.iconImage) {
                        //set Icon image
                        marker.setIcon(so.iconImage);
                    }

                    // if it contains infoWindow text then create one
                    if (so.content) {
                        //infoWindow is a pop up for the onClick
                        var infoWindow = new google.maps.InfoWindow({
                            content: so.content
                        });
                    }

                    // create circle    
                    var cityCircle = new google.maps.Circle({
                        strokeColor: '#FF0000',
                        strokeOpacity: 0.15,
                        strokeWeight: 2,
                        fillColor: '#FF0000',
                        fillOpacity: 0.15,
                        map: map,
                        center: so.center,
                        radius: Radius * 1000 //kilometers
                    });

                    //check if marker has been clicked
                    marker.addListener("click", () => {
                        infoWindow.open(map, marker);
                    });
                }
            }

            //------function executions----------
            //get users location
            // getUserLocatiion();


        }, errorHandler);

        //error handler for geolocation
        function errorHandler(err) {
            if (err.code == 1) {
                alert("Error: Access is denied!");
            } else if (err.code == 2) {
                alert("Error: Position is unavailable!");
            }
        }

        function errorData(err) {
            console.log("Error");
            console.log(err);
        }
    }

});