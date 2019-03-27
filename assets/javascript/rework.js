$(document).ready(() => {
    //Global variables
    var gMap;
    var Lattitude;
    var Longitude;
    var Radius = 5;
    var profile;
    var yelpProfile;
    var userID;
    var yelpSearch;
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
                    console.log("# of users "+ snapshot.numChildren() );
                    //add unique user profile
                    // profile = usersRef.push({
                    //     name: "",
                    //     center: {
                    //         lat: "",
                    //         lng: ""
                    //     },
                    //     radius: Radius, //kilometers
                    //     message: []
                    // });

                    // //get unique user key
                    // userID = profile.key;

                    // Remove users if they leave
                    connectionsRef.onDisconnect().remove();
                    usersRef.onDisconnect().remove();
                }
            });
            //--end of connectedRef

            //When user is added to firebase call the get location function       
            firebaseData.ref().on("child_added", (snapshot)=>{
                setUserLocation(snapshot);
            },errorData);

            usersRef.on("value", function (snapshot) {
                setGeoFireUserInfo(snapshot)
            }, errorData);
            //ADD user location to geofire
       
            // --end of firebase root change event

            //functions--------------
            function setUserLocation(snapshot) {
                //update firebase User info
                profile = usersRef.push({
                    name: "static",
                    center: {
                        lat: Lattitude,
                        lng: Longitude
                    },
                    radius: Radius, //kilometers
                    message: []
                });

                //get unique user key
                userID = profile.key;
                //set geofireinfo
                // setGeoFireUserInfo(snapshot);
            }
            // geofire location
            function setGeoFireUserInfo(snapshot) {
                snapshot.forEach(function(childSnapShot){
                    
                    var childData = childSnapShot.val();
                    var userName = childData.name;
                    var userLocation = [childData.center.lat,childData.center.lng];
                    console.log(snapshot.val());
                    console.log(childData.length);
                    //geofire controls the reference points for distance
                    geoFire.set(userName, userLocation).then(function () {
                        console.log("Current user " + userName + "'s location has been added to GeoFire and your location is " + userLocation);
    
                        // geoFireRefPush.child(userName).onDisconnect().remove();
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