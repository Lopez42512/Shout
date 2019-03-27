$(document).ready(() => {
    //Global variables
    var Lattitude;
    var Longitude;
    var Radius = 5;
    var profile;
    var yelpProfile;
    var userID;
    var shoutLocation;
    var peopleAround = {};
    // geoquery
    var shoutQuery;
    var yelpQuery;
    var yelpSearch;

    // Initialize Firebase ----------------------------------------
    var config = {
        apiKey: "AIzaSyBWlRO86vNl6sL5psQX5f7H9Lw_wsULP9g",
        authDomain: "geofiretest-9d07e.firebaseapp.com",
        databaseURL: "https://geofiretest-9d07e.firebaseio.com",
        projectId: "geofiretest-9d07e",
        storageBucket: "geofiretest-9d07e.appspot.com",
        messagingSenderId: "680094207901"
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

    // check if someone is on the page
    connectedRef.on("value", (snapshot) => {
        //if there is a value
        if (snapshot.val()) {

            profile = usersRef.push({
                name: "",
                center: {
                    lat: "",
                    lng: ""
                },
                radius: Radius, //kilometers
                message: []

            });

            //Get a unique key for each window that connects
            userID = profile.key;

            // Remove users if they leave
            connectionsRef.onDisconnect().remove();
            usersRef.onDisconnect().remove();
            console.log("# of users " + snapshot.numChildren());
        }
    });
    //--end of connectedRef

    connectionsRef.on("value", function (snap) {
        console.log("# of online users = " + snap.numChildren());
    });

    //When user is added to firebase call the get location function       
    firebaseData.ref().on("child_changed", (snapshot) => {
        console.log(snapshot);
        setGeoFireUserInfo(snapshot);
    }, errorData);
    // --end of firebase root change event

    //on click shout
    $(document).on("click", "#shout", shoutLogic);

    //search for Businesses
    $(document).on("click", "#searchFormBtn", startYelpSearch);

    //functions--------------
    function startYelpSearch(e) {
        e.preventDefault();
        //grab value from the search input
        var yelpSearch = $("#yelpSearchInput").val();

        // reference lat and lng from firebase
        // yelpRef.set({
        //     yelpSearch,
        //     lat: Lattitude,
        //     lng: Longitude
        // });
        var stringLat = Lattitude.toString();
        var stringLng = Longitude.toString();

        // console.log(stringLng.split());
        //Ajax call for yelp and loading businesses on to the map
        getYelpInfo(yelpSearch);
    }
    //Ajax call to yelp
    function getYelpInfo(searchQuery, stringLat, stringLng, ) {

        console.log(Lattitude);
        // this is the call for YELP QUERY - WORKING
        var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + searchQuery + "&latitude=39.951061&longitude=-75.165619&radius=5000&limit=5";

        console.log(yelpQuery);

        //testing  to get variables -- Needs WORK!
        // var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude="+ userLat.toString() + "&longitude="+userLng.toString() + "&radius="+Radius+"&limit=5";
        var yelpAPI = "1QpSc4B1zI5GuI56PDAAvAfpfcsLg9LWuHRfVCeG4TIDDxRe3hGT-sxlU5h5DD0AdLgu-HHoa2cM4m1WaAefYoboIPdVHv0mCjivrwQrdU11FCFl2hd8-iaaTKOTXHYx";

        //-----------YELP CALL
        $.ajax({
            url: yelpQuery,
            headers: {
                'Authorization': "Bearer " + yelpAPI,
            },
            method: "GET"
        }).then((yelpResponse) => {
            console.log(yelpResponse);
            for (var i = 0; i < 5; i++) {
                // Add yelp businesses
                addYelpBusinesses(yelpResponse.businesses[i]);
            }

        });
    }

    function addYelpBusinesses(yelpBusiness) {
        var bName = yelpBusiness.name;
        var bRatings = yelpBusiness.rating;
        var bIs_closed = yelpBusiness.is_closed;
        var bLocation = yelpBusiness.location.display_address.join("<br>");
        var bLocationHref = " http://maps.google.com/?q=" + yelpBusiness.location.display_address.join("");
        var bLat = parseFloat(yelpBusiness.coordinates.latitude);
        var bLong = parseFloat(yelpBusiness.coordinates.longitude);
        var hours;

        if (bIs_closed) {
            hours = "closed";
        } else {
            hours = "open";
        }
        //create a business map object so we can have a cleaner look
        var businessMapObject = {
            coords: {
                center: {
                    lat: bLat,
                    lng: bLong
                }
            },
            // iconImage: "./assets/images/map-icon.png",
            content: `<h2 class="yelpTitle">${bName}</h2>
            <p class="yelpDesc"> Address: <a id="yelpLink" href="${bLocationHref}">${bLocation}</a></p>
            <p class="yelpDesc">The store is ${hours} </p>`
        }

        //Create marker
        addYelpMarker(businessMapObject);

        //creating the marker
        function addYelpMarker(businessM) {

            //create map marker object
            var marker = new google.maps.Marker({
                position: businessM.coords.center,
                map: map,
                animation: google.maps.Animation.DROP,
            });
            // console.log(user.coords.center);

            //if user has an Icon
            if (businessM.iconImage) {
                //set Icon image
                marker.setIcon(businessM.iconImage);
            }

            // if it contains infoWindow text then create one
            if (businessM.content) {
                //infoWindow is a pop up for the onClick
                var infoWindow = new google.maps.InfoWindow({
                    content: businessM.content
                });
            }

            // create circle    
            // var cityCircle = new google.maps.Circle({
            //     strokeColor: '#FF0000',
            //     strokeOpacity: 0.15,
            //     strokeWeight: 2,
            //     fillColor: '#FF0000',
            //     fillOpacity: 0.15,
            //     map: map,
            //     center: user.coords.center,
            //     radius: (user.coords.radius) * 1000 //kilometers
            // });

            //check if marker has been clicked
            marker.addListener("click", () => {

                infoWindow.open(map, marker);
            });
        }
    }

    function shoutLogic() {
        // set your location globaly
        usersRef.child(userID).on("value", (childSnapShot) => {
            var snap = childSnapShot.val();
            var shoutLocation = [snap.center.lat, snap.center.lng];

            console.log(snap);

            //update the query
            var shoutQuery = geoFire.query({
                center: shoutLocation,
                radius: Radius // kilometers
            });
            console.log(shoutQuery);

            //update map and markers
            googleMapShout(shoutLocation);

            //check if someone is in your radius and drop a pin to shouter's  location
            shoutQuery.on("key_entered", function (key, location, distance) {
                peopleAround = {
                    id: key,
                    distance: distance.toFixed(2) + "km",
                    location: location
                };

                // If you're the shouter, don't drop a pin on you
                if (Math.floor(distance) !== 0) {
                    addShouterMarker(shoutLocation);
                    console.log("People Around: " + JSON.stringify(peopleAround));
                }

                console.log("People Around: " + JSON.stringify(peopleAround));
                console.log("From Shout Query - " + key + " is located at [" + location + "] which is within the query (" + distance.toFixed(2) + " km from center)");

            });
        }, errorData)
    }

    function setUserLocation(snapshot) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                //set lng and lat
                Lattitude = position.coords.latitude;
                Longitude = position.coords.latitude;

                console.log(Lattitude, Longitude);
                console.log(position.coords.accuracy);
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

            }, errorHandler);
            // setGeoFireUserInfo(snapshot);
        }
    }

    // geofire location
    function setGeoFireUserInfo(snapshot) {
        snapshot.forEach(function (childSnapShot) {
            var childData = childSnapShot.val();
            console.log(childData);
            var userName = childData.name;
            var userLocation = [childData.center.lat, childData.center.lng];
            console.log(childData.center.lat);
            console.log(childData.length);

            //geofire controls the reference points for distance
            geoFire.set(userName, userLocation).then(function () {
                console.log("Current user " + userName + "'s location has been added to GeoFire and your location is " + userLocation);

                geoFireRefPush.child(userName).onDisconnect().remove();
            });
        });
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

    function addShouterMarker(shoutLocation) {
        //Add marker
        var shouter = {
            center: {
                lat: shoutLocation[0],
                lng: shoutLocation[1]
            },
            // iconImage: "./assets/images/map-icon.png",
            content: "<h1>Shout! shout! Let it all out!</h1>"
        }

        var marker = new google.maps.Marker({
            position: shouter.center,
            map: map,
            animation: google.maps.Animation.DROP
        });

        // console.log(shouter.coords.center);

        //if user has an Icon
        if (shouter.iconImage) {
            //set Icon image
            marker.setIcon(shouter.iconImage);
        }

        // if it contains infoWindow text then create one
        if (shouter.content) {
            //infoWindow is a pop up for the onClick
            var shouterInfoWindow = new google.maps.InfoWindow({
                content: shouter.content
            });

        }
        //on click, create a chat screen
        marker.addListener("click", () => {
            shouterInfoWindow.open(map, marker);
        });
    }

    //------function executions----------
    //get users location
    setUserLocation();

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
});