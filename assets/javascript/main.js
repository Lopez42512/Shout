///-----------------------
//Global variables
var userLocation = [];
var gMap;
var Radius = 5;
var profile;
var yelpProfile;
var userID;
var searchQuery;
var currentUsers = {
    name: "",
    center: {
        lat: "",
        lng: ""
    },
    radius: Radius,
    messages: []
}


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

//firebase database
var firebaseData = firebase.database();
//firebase userlocation
var firebaseUserLocation = firebaseData.ref("user location");

// users connected
var connectedRef = firebaseData.ref(".info/connected");
//get user list
var userRef = firebaseData.ref("/users");
//user chat
var chatRef = firebaseData.ref("/chat");
//yelp businesses
var yelpRef = firebaseData.ref("/yelp Businesses");

// //current User Ref
// var currentUserRef = userListRef.push();
// //Add ourself to the list when online
// var ourPresenceRef = firebaseData.ref(".info/connected");

//GEOFIRE-------------------------------------------------------
//geofire ref
var geoFireRefPush = firebase.database().ref("/geofire-location").push();
//gefire initilize
var geoFire = new GeoFire(geoFireRefPush);
//--------
// geoquery
var shoutQuery;

//-------------------------------------------------------------------
//TODO: When you land on page ask the  user for the location and store on to the users firebase ID
//TODO: When you press the shout button, get that specific users location and update firebase with that location
//TODO: Use that Shout Location and update the browser to land a marker on the New Location

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

            //have user unique ID be stored and referenced when pressing the button.
            $(this).attr("data-lat", position.coords.latitude.toString());
            $(this).attr("data-lng", position.coords.longitude.toString());

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
                    radius: Radius //kilometers
                }
                // user2 = {
                //     name: "user 2",
                //     center: {
                //         lat: parseFloat(40.065494),
                //         lng: parseFloat(-75.091064)
                //     },
                //     radius: Radius //kilometers
                // }
            ]

            //update map with location of user and create an icon and circle.
            googleMapShout(userLocation[0], userLocation[1]);

            //update map with Yelp Busnisses Locations
            getYelpInfo();

            //geofire set location
            firebaseUserLocation.on("value", setGeoFireUserInfo, errorObject);

            //set the user location to firebase
            firebaseUserLocation.set(userInfo);

            //neha's approuch
            connectedRef.on("value", function (snapshot) {

                //If they're connected..
                if (snapshot.val()) {
                    //add user profile
                    profile = userRef.push({
                        name: "",
                        center: {
                            lat: "",
                            lng: ""
                        },
                        radius: Radius,
                        messages: []
                    });


                    //User's online ID
                    userID = profile.key;
                }

                //When User leaves, remove all info
                userRef.onDisconnect().remove();

                //Update current user's info who pressed the button
                userRef.child(userID).update({
                    name: "",
                    center: {
                        lat: userLocation[0],
                        lng: userLocation[1]
                    },
                    radius: Radius,
                    messages: []
                });
                // --------------------------end of neha's approuch

            }, errorObject);

            //user who pressed the shout set geoQuery
            var shoutQuery = geoFire.query({
                center: userLocation,
                radius: Radius // kilometers
            });

            // look at other people around
            var peopleAround = {
                name: "user 2",
                center: {
                    lat: parseFloat(40.065494),
                    lng: parseFloat(-75.091064)
                },
                radius: Radius //kilometers
            };

            //check if someone is in your radius
            shoutQuery.on("key_entered", function (key, location, distance) {
                peopleAround = {
                    id: key,
                    distance: distance.toFixed(2) + "km",
                    location: location
                };

                //If you're the shouter, don't drop a pin on you
                if (Math.floor(distance) !== 0) {
                    addShouterMarker(userLocation);
                    console.log("People Around: " + JSON.stringify(peopleAround));
                }

                // locationOfShouter(userLocation);

                //show the shouter's location

                // addSellerToMap(oneSeller);
                console.log("From Shout Query - " + key + " is located at [" + location + "] which is within the query (" + distance.toFixed(2) + " km from center)");

            });

            //update body
            $("body").append(pLocation);
        });
    } else {
        console.log("no access to geto");
    }
}


//Ajax call to yelp
function getYelpInfo(searchQuery, userLat, userLng) {

    // this is the call for YELP QUERY - WORKING
    var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.951061&longitude=-75.165619&radius=5000&limit=5";

    //testing  to get variables -- Needs WORK!
    // var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=" + userLocation[0] + "&longitude=" + userLocation[1] + "&radius="+ Radius+"&limit=5";
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

//google map function of generating user and icon
function googleMapShout(userLat, userLng) {

    var allUsers = [

        firstUser = {
            coords: {
                center: {
                    lat: userLat,
                    lng: userLng
                },
                radius: Radius //kilometers
            },
            iconImage: "./assets/images/map-icon.png",
            content: "<h1>Hello Friends!</h1>"
        }
        // ,

        // secondPerson = {
        //     coords: {
        //         center: {
        //             lat: 40.065445,
        //             lng: -75.090635
        //         }

        //     }
        // }

    ]

    //set map's center to shouter
    map.panTo(allUsers[0].coords.center);

    //loop through markers and drop
    for (var i = 0; i < allUsers.length; i++) {
        var userIndex = allUsers[i];
        //    window.setTimeout( function(){
        //     addUserMarker(userIndex)
        //    },200) ;

        addUserMarker(userIndex);
    }

    //function Marker
    function addUserMarker(user) {

        var marker = new google.maps.Marker({
            position: user.coords.center,
            map: map,
            animation: google.maps.Animation.DROP,
        });
        // console.log(user.coords.center);

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

        // create circle    
        var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.15,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.15,
            map: map,
            center: user.coords.center,
            radius: (user.coords.radius) * 1000 //kilometers
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
        coords: {
            center: {
                lat: shoutLocation[0],
                lng: shoutLocation[1]
            },
            radius: Radius //kilometers
        },
        // iconImage: "./assets/images/map-icon.png",
        content: "<h1>This is a SHOUT!</h1>"
    };

    var marker = new google.maps.Marker({
        position: shouter.coords.center,
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

    marker.addListener("click", () => {

        shouterInfoWindow.open(map, marker);
    });

    var cityCircle = new google.maps.Circle({
        strokeColor: '#00bcd4',
        strokeOpacity: 0.3,
        strokeWeight: 2,
        fillColor: '#f33839',
        fillOpacity: 0.35,
        map: map,
        center: shouter.coords.center,
        radius: (shouter.coords.radius) * 1000 //kilometers
    });
}
//------Show Yelp on Map
function addYelpBusinesses(yelpBusiness) {
    var bName = yelpBusiness.name;
    var bRatings = yelpBusiness.rating;
    var bIs_closed = yelpBusiness.is_closed;
    var bLocation = yelpBusiness.location.display_address.join("<br>");
    var bLocationHref = " http://maps.google.com/?q="+ yelpBusiness.location.display_address.join("");
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

    console.log("Business location" + yelpBusiness.length);
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


function setGeoFireUserInfo(snapshot) {
    //get snapshot vallue
    var snapshot = snapshot.val();
    // var keys = Object.keys(snapshot);
    //add all users 
    for (var i = 0; i < snapshot.length; i++) {
        var userName = snapshot[i].name;
        var userLocation = [snapshot[i].center.lat, snapshot[i].center.lng];
        var Radius = snapshot[i].radius;

        geoFire.set(userName, userLocation).then(function () {
            // console.log("Current user " + userName + "'s location has been added to GeoFire and your location is " + userLocation);

            // geoFireRefPush.child(userName).onDisconnect().remove();
        });
    }
}

function errorObject(errorObject) {
    console.log("The read failed: " + errorObject.code);
};

function usersOnline() {
    ourPresenceRef.on("value", function (snapshot) {
        if (snapshot.val()) {
            // remove ourselves when we disconnect
            currentUserRef.onDisconnect().remove();

            currentUserRef.set(true);
        }
    });
}

//     //number of online users is the number of objects in the presence list.
//     userListRef.on("value", function (snapshot) {
//         // remove ourselves when we disconnect
//         currentUserRef.onDisconnect().remove();
//         //user is present
//         currentUserRef.set(true);
//         console.log("# of online users = " + snapshot.numChildren());
//     });

//     //get user location


// }

$("#submit-btn").on("click", function (event) {
    // event.preventdefault();

    var message = {
        chat: $("#messageBox").val()
    }

    //push message
    chatRef.push(message);

    chatRef.on("child_added", function (childSnapshot) {
        var fireBaseMessage = childSnapshot.val().chat;
        $(".message-box").append(`<p class="message-font"> ${fireBaseMessage}</p>`);
    });
});

// Execute Initial functions----------------
// Check who's online
// usersOnline();

//on click shout
$(document).on("click", "#getGeoLocation", getGeoLocation);