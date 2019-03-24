//Global variables
var userLocation = [];
var gMap;

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

//firebase database
var firebaseData = firebase.database();
var firebaseUserLocation = firebaseData.ref("firebase location");
//   geofire ref
var geoFireRefPush = firebase.database().ref("/geofire-location").push();
// gefire initilize
var geoFire = new GeoFire(geoFireRefPush);
//--------

// Just using HTML API for geo location and test it with other APIs
function getGeoLocation() {

    userLocation = [];
    var firebaseKey = Object.key;
    // place inside function then query for it.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {

            //Push Latitude and Longitude
            userLocation.push(position.coords.latitude);
            userLocation.push(position.coords.longitude);

            //display lattitude and longitude in dom
            var pLocation = $("<p>");
            pLocation.text("The Lattitude-array: " + userLocation[0] + " and the longitude-array: " + userLocation[1]);


            //Set user's info for fireBasae
            var userInfo = [
                user1 = {
                    name: "Jorge",
                    center: {
                        lat: parseFloat(userLocation[0]),
                        lng: parseFloat(userLocation[1])
                    },
                    radius: 5 //kilometers
                },
                user2 = {
                    name: "user 2",
                    center: {
                        lat: parseFloat(40.065494),
                        lng: parseFloat(-75.091064)
                    },
                    radius: 5 //kilometers
                }
            ]


            //update map with location of user and create an icon and circle.
            googleMapShout(userLocation[0], userLocation[1]);

            //set the user location to firebase
            firebaseUserLocation.set(userInfo);

            //geofire set location
            firebaseUserLocation.once("value").then(setGeoFireUserInfo, errorObject);

            //user who pressed the shout set geoQuery

            var shoutQuery = geoFire.query({
                center: userLocation,
                radius: 5 // kilometers
            });

            // look at other people around
            var peopleAround = {
                name: "user 2",
                center: {
                    lat: parseFloat(40.065494),
                    lng: parseFloat(-75.091064)
                },
                radius: 5 //kilometers
            };

            //check if someone is in your radius
            shoutQuery.on("key_entered", function (key, location, distance) {
                peopleAround = {
                    id: key,
                    distance: distance,
                    location: location
                };
                // addSellerToMap(oneSeller);
                console.log("People Around: " + peopleAround);
            });


            //update body
            $("body").append(pLocation);
        });
    } else {
        console.log("no access to geto");
    }

    // this is the call for YELP QUERY - WORKING
    var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.951061&longitude=-75.165619&radius=8000";

    //testing  to get variables -- Needs WORK!
    // var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=" + userLocation[0] + "&longitude=" + userLocation[1] + "&radius=8000";
    var yelpAPI = "1QpSc4B1zI5GuI56PDAAvAfpfcsLg9LWuHRfVCeG4TIDDxRe3hGT-sxlU5h5DD0AdLgu-HHoa2cM4m1WaAefYoboIPdVHv0mCjivrwQrdU11FCFl2hd8-iaaTKOTXHYx";

    // //-----------YELP CALL
    //     $.ajax({
    //         url: yelpQuery,
    //         headers: {
    //             'Authorization': "Bearer " + yelpAPI,
    //         },
    //         method: "GET"
    //     }).then((yelpResponse) => {
    //             console.log("Yelp response: "+ yelpResponse);
    //         }

    //     );
}



//google map function of generating user and icon
function googleMapShout(userLat, userLng) {

    // initialize maps

    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 11,
        center: {
            lat: userLat,
            lng: userLng
        }
    });


    var allUsers = [

        firstUser = {
            coords: {
                center: {
                    lat: userLat,
                    lng: userLng
                },
                radius: 5 //kilometers
            },
            iconImage: "./assets/images/map-icon.png",
            content: "<h1>Hello Friends!</h1>"
        },

        secondPerson = {
            coords: {
                center: {
                    lat: 40.065445,
                    lng: -75.090635
                }

            }
        }

    ]

    console.log(allUsers);
    //loop through markers
    for (var i = 0; i < allUsers.length; i++) {
        addUserMarker(allUsers[i]);
    }


    //function Marker
    function addUserMarker(user) {
        //Add marker
        var marker = new google.maps.Marker({
            position: user.coords.center,
            map: map
        });

        console.log(user.coords.center);

        //if user has an Icon
        if (user.iconImage) {
            //set Icon image
            marker.setIcon(user.iconImage);
        }

        // if it contains infoWindow text then create one
        if (user.content) {

            //infoWindow is a pop up for the onClick
            var infoWindow = new google.maps.InfoWindow({
                content: user.content
            });

        }

        marker.addListener("click", () => {

            infoWindow.open(map, marker);
        });

        var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: user.coords.center,
            radius: (user.coords.radius) * 1000 //kilometers
        });
        console.log(user.coords.radius);
    }
}

function setGeoFireUserInfo(snapshot) {
    //get snapshot vallue
    var snapshot = snapshot.val();
    // var keys = Object.keys(snapshot);
    //add all users 
    for (var i = 0; i < snapshot.length; i++) {
        var userName = snapshot[i].name;
        var userLocation = [snapshot[i].center.lat, snapshot[i].center.lng];
        var userRadius = snapshot[i].radius;

        geoFire.set(userName, userLocation).then(function () {
            console.log("Current user " + userName + "'s location has been added to GeoFire and your location is " + userLocation);

            // geoFireRefPush.child(userName).onDisconnect().remove();
        });
    }
}

function errorObject(errorObject) {
    console.log("The read failed: " + errorObject.code);
};

// Execute functions
$(document).on("click", "#getGeoLocation", getGeoLocation);