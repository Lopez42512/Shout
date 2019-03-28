$(document).ready(() => {
    //Global variables
    var shoutCheck;
    var Lattitude;
    var Longitude;
    var Radius = 5;
    var profile;
    var yelpProfile;
    var profileKey;
    var shoutLocation;
    var peopleAround = {};
    var uid;
    // geoquery
    var shoutQuery;
    var yelpQuery;
    var yelpSearch;
    var user;

    // Initialize Firebase
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

    //Get user ID
    firebase.auth().signInAnonymously().catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

    // check if someone is on the page
    connectedRef.on("value", (snapshot) => {
        //if there is a value
        if (snapshot.val()) {

            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    var isAnonymous = user.isAnonymous;
                    uid = user.uid;

                    profile = usersRef.push({
                        uid: uid,
                        name: "",
                        center: {
                            lat: "",
                            lng: ""
                        },
                        radius: Radius, //kilometers
                        message: []

                    });
                    //get userRef Push key
                    profileKey = profile.key;
                    // Remove users if they leave
                    connectionsRef.onDisconnect().remove();
                    usersRef.child(profileKey).onDisconnect().remove();
                    console.log("# of users " + snapshot.numChildren())
                }
            });
        }
    });
    //--end of connectedRef

    // ------Most firebaseData Calls

    connectionsRef.on("value", function (snap) {
        console.log("# of online users = " + snap.numChildren());
    });

    //Update GeoFire with the UserRef's new location
    firebaseData.ref().on("child_changed", (snapshot) => {
        setGeoFireUserInfo(snapshot);
    }, errorData);

    // --end of firebase root change event

    shoutRef.on("value", (snapshot) => {

        var snap = snapshot.val();
        console.log(snap);
        addShouterMarker(snap.center.lat, snap.center.lng);
    }, errorData);


    //---------------------------START functions--------------
    function startYelpSearch(e) {
        e.preventDefault();
        //grab value from the search input
        var yelpSearch = $("#yelpSearchInput").val();
        // TODO:Get Yelp to accept user Lattitude and Longitude
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
        console.log(yelpAPI)
        //-----------YELP CALL--------------
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
        usersRef.child(profileKey).on("value", (childSnapShot) => {
            var snap = childSnapShot.val();
            var shoutLocation = [snap.center.lat, snap.center.lng];

            console.log(snap);

            shoutRef.set({
                lat: $("#shout").attr("data-lat"),
                lng: $("#shout").attr("data-lng")
            });
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
                    distance: distance + "km",
                    location: location
                };

                // If you're the shouter, don't drop a pin on you
                if (Math.floor(distance) !== 0) {
                    addShouterMarker(shoutLocation);
                    console.log("People Around: " + JSON.stringify(peopleAround));
                }
                addShouterMarker(shoutLocation);
                console.log("People Around: " + JSON.stringify(peopleAround));
            });
        }, errorData)
    }

    function setUserLocation(snapshot) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                //set lng and lat
                Lattitude = position.coords.latitude;
                Longitude = position.coords.longitude;
                //have user unique ID be stored and referenced when pressing the button.
                $("#shout").attr("data-lat", Lattitude.toString());
                $("#shout").attr("data-lng", Longitude.toString());

                //update firebase User info
                usersRef.child(profileKey).update({
                    uid: uid,
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
            //take info from the userRef push
            var childData = childSnapShot.val();
            console.log(childData);
            console.log(childData.center.lat);
            var userName = childData.name;
            var userLocation = [childData.center.lat, childData.center.lng];

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
                toggleChat()
                // infoWindow.open(map, marker);
            });
        }

    }

    function addShouterMarker(shoutLocation) {
        //Add marker
        console.log(shoutLocation + "is in add shouterMArker");
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
        // display shout
        shouterInfoWindow.open(map, marker);
    }

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

    function chatMessages(event) {
        event.preventDefault();
        var chatMessage = chatRef.set({
            chatMessage: $("#messageBoxInput").val(),
            user: user
        });

        // clear text
        $("#messageBoxInput").val("");
    }

    $("#fakeButton").on("click", function (event) {
        user = $("#fakeChatInput").val();
        alert(user);
        usersRef.set(user);
        // clear text
        // $("#messageBoxInput").val("");
    });

    chatRef.on("value", function (snapshot) {
        if (snapshot.val()) {
            var fireBaseMessage = snapshot.val().chatMessage;
            var messageUser = snapshot.val().user;
            console.log(fireBaseMessage);
            //message key
            // var chatKey = chatMessage.key;

            $("#messageBoxDisplay").append(`<li class="message-font">${messageUser}: ${fireBaseMessage}</>`);
            chatRef.child().onDisconnect().remove();
        }
    });
    //---------------

    function displayModal() {
        $("#myModal").css("display", "block");
    }

    function hideModal() {
        $(this).css("display", "none");
    }

    function outsideModal(event) {
        var target = $(event.target);
        if (target.is("#myModal")) {
            $(this).css("display", "none");
        }
    }

    function toggleChat() {
        $(".message-box").toggleClass("active");
    }

    //------function executions----------
    //get users location
    setUserLocation();

    //on click shout
    $(document).on("click", "#shout", shoutLogic);

    //search for Businesses
    $(document).on("click", "#searchFormBtn", startYelpSearch);

    // chat function
    $(document).on("click", "#chatBtn", chatMessages);
    //when you click the modal button
    $(document).on("click", "#modalBtn", displayModal);
    $(document).on("click", "#close", hideModal);
    $(document).on("click", "#myModal", outsideModal);
    $(document).on("click", "#test", toggleChat);

});

