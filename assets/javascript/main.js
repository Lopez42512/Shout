$(document).ready(() => {
    //Global variables
    var shoutCheck = false;
    var Lattitude;
    var Longitude;
    var Radius = 100;
    var profile;
    var yelpProfile;
    var profileKey;
    var shoutLocation;
    var peopleAround = {};
    var uid;
    var listenLocation = [];
    var allUserMarkers = [];
    var allShoutMarkers = [];
    var allYelpMarkers = [];
    var chatID;
    // geoquery
    var shoutQuery;
    var listenQuery;
    var yelpQuery;
    var yelpSearch;
    var currentLatitude;
    var currentLongitude;
    var user;

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
    var shoutRef = firebaseData.ref("/shout ref");
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

                    connectionsRef.push(true);
                    // Remove users if they leave
                    connectionsRef.onDisconnect().remove();
                    usersRef.child(profileKey).onDisconnect().remove();
                    shoutRef.onDisconnect().remove();
                    yelpRef.onDisconnect().remove();
                }
            });
        }
    });
    //--end of connectedRef

    // --------------------Most firebase Calls

    connectionsRef.on("value", function (snap) {
        console.log("# of online users = " + snap.numChildren());
    });

    //get users location
    setUserLocation();

    //Update GeoFire with the UserRef's new location      
    firebaseData.ref().on("child_changed", (snapshot) => {
        setGeoFireUserInfo(snapshot);
    }, errorData);
    // --end of firebase root change event

    // TODO: GET SHOUT LOC TO BE A PUSH
    //shout updates
   
    //check chat
    // chatRef.on("child_added", function (snapshot) {
    //     if (snapshot.val()) {
    //         var fireBaseMessage = snapshot.val().chatMessage;
    //         var messageUser = snapshot.val().user;
    //         console.log(fireBaseMessage);
    //         console.log(snapshot.child("chatMessage"))
    //         //message key
    //         var chatKey = chatMessage.key;

    //         $(".chat-text ul").prepend(`<li class="message-font">${messageUser}: ${fireBaseMessage}</>`);
    //         chatRef.onDisconnect().remove();
    //     }
    // });

    //---------------------------START functions--------------
    function initiateYelp() {
        //update yelp markers on all users
        yelpRef.on("value", (snapshot) => {
            var dataSnap = snapshot.val();
            //convert lat and lng to strings
            var stringLatF = dataSnap.center.lat.toString();
            var stringLngF = dataSnap.center.lng.toString();

            console.log("geting info");
            getYelpInfo(dataSnap.search, stringLatF, stringLngF);
        }, errorData);
    }

    function startYelpSearch(e) {
        // e.preventDefault();
        //grab value from the search input
        var yelpSearch = $("#yelpSearchInput").val();
        console.log(yelpSearch);
        // TODO:Ask the guys if we want the user's location or the shout loc.
        //set yelp ref

        console.log($("#yelpSearchInput").val());
        console.log(yelpSearch);
        // reference lat and lng from firebase
        usersRef.child(profileKey).once("value").then((snapshot) => {
            var snapData = snapshot.val();
            //Make them strings for the searhc
            var stringLat = snapData.center.lat.toString();
            var stringLng = snapData.center.lng.toString();
            var search = $("#yelpSearchInput").val();

            //update your yelp ref      
            yelpRef.set({
                center: {
                    lat: snapData.center.lat,
                    lng: snapData.center.lng
                },
                search: search,
                shout: true
            });

            //Ajax call for yelp and loading businesses on to the map
            getYelpInfo(yelpSearch, stringLat, stringLng);
        });
    }

    //Ajax call to yelp
    function getYelpInfo(searchQuery, stringLat, stringLng, ) {
        // this is the call for YELP QUERY - WORKING
        var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=" + searchQuery + "&latitude=" + stringLat + "&longitude=" + stringLng + "&radius=5000&limit=5";

        console.log(yelpQuery);

        //testing  to get variables -- Needs WORK!
        // var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude="+ userLat.toString() + "&longitude="+userLng.toString() + "&radius="+Radius+"&limit=5";
        var yelpAPI = "1QpSc4B1zI5GuI56PDAAvAfpfcsLg9LWuHRfVCeG4TIDDxRe3hGT-sxlU5h5DD0AdLgu-HHoa2cM4m1WaAefYoboIPdVHv0mCjivrwQrdU11FCFl2hd8-iaaTKOTXHYx";

        //-----------YELP CALL--------------
        $.ajax({
            url: yelpQuery,
            headers: {
                'Authorization': "Bearer " + yelpAPI,
            },
            method: "GET"
        }).then((yelpResponse) => {
            console.log(yelpResponse);
            for (var i = 0; i < yelpResponse.businesses.length; i++) {
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
            <p class="yelpDesc">Ratings: ${bRatings}</p>
            <p class="yelpDesc"> Address: <a id="yelpLink" href="${bLocationHref}">${bLocation}</a></p>
            <p class="yelpDesc">The store is ${hours} </p>`
        }

        //Create marker
        addYelpMarker(businessMapObject);

    }

    function addYelpMarker(businessM) {

        //create map marker object
        var marker = new google.maps.Marker({
            position: businessM.coords.center,
            map: map,
            animation: google.maps.Animation.DROP,
        });

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
        //check if marker has been clicked
        marker.addListener("click", () => {

            infoWindow.open(map, marker);
        });
    }

    function shoutLogic() {


        var shoutTextVal = $("#shoutText").val().trim();
        // var Radius = $("#shoutRadius").val();
        var shoutText = $("#shoutText");

        if (shoutTextVal === "") {
            // TODO: finish with the else statement, only do this when the person has entered a message
            checkShoutTextVal(shoutText);
        } else {
            //update firebase User info
            usersRef.child(profileKey).update({
                uid: uid,
                name: "static" + uid,
                center: {
                    lat: Lattitude,
                    lng: Longitude
                },
                radius: Radius, //kilometers
                message: [],
                shoutMessage: shoutTextVal,
                shout: true,
                friend: false
            });

            // set your location globaly
            usersRef.child(profileKey).on("value", (childSnapShot) => {
                var snapData = childSnapShot.val();
                var shoutLocation = [snapData.center.lat, snapData.center.lng];
                console.log(shoutLocation);
                //set shout ref
                shoutRef.set({
                    center: {
                        lat: shoutLocation[0],
                        lng: shoutLocation[1]
                    },
                    message: shoutTextVal
                });

                //TODO:Make it a push, so different people can shout
                // shoutRef.set({
                //     center: {
                //         lat: shoutLocation[0],
                //         lng: shoutLocation[1]
                //     },
                //     message: shoutTextVal
                // });

                // TODO:change this into a function so you can check once the user lands on the page and their friend is near
                if (typeof shoutQuery !== "undefined") {
                    //update the query

                    shoutQuery.updateCrieria({
                        center: shoutLocation,
                        radius: Radius // kilometers
                    });

                } else {

                    var shoutQuery = geoFire.query({
                        center: shoutLocation,
                        radius: Radius // kilometers
                    });
                    //check if someone is in your radius and drop a pin to shouter's  location
                    shoutQuery.on("key_entered", function (key, location, distance) {
                        peopleAround = {
                            id: key,
                            distance: distance + "km",
                            location: location
                        };

                        // If you're the shouter, don't drop a pin on you
                        if (Math.floor(distance) !== 0) {
                            // marker.setMap(map);
                            addShouterMarker(shoutLocation,snapData.shoutMessage);
                            console.log("People Around: " + JSON.stringify(peopleAround));
                        }
                        console.log("SHOUT POSITION " + JSON.stringify(peopleAround));
                    });
                }
                //update map and markers
                googleMapShout(shoutLocation);
                setTimeout(displayChat, 500);
                console.log(shoutLocation);
                // addShouterMarker(shoutLocation);
                $("#shoutText").val("");
            }, errorData);
        } //----end check if there's a
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
                    message: [],
                    shoutMessage: "",
                    shout: false,
                    friend: false
                });

            }, errorHandler);
            // setGeoFireUserInfo(snapshot);
        }
    }

    // geofire location
    function setGeoFireUserInfo(snapshot) {
        snapshot.forEach(function (childSnapShot) {
            //take info from the userRef push
            if (childSnapShot.val()) {
                var childData = childSnapShot.val();
                var userName = childData.name;
                var userLocation = [childData.center.lat, childData.center.lng];
                //geofire controls the reference points for distance
                geoFire.set(userName, userLocation).then(function () {

                    geoFireRefPush.child(userName).onDisconnect().remove();
                });
            }

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
            iconImage: "./assets/images/shout-red-marker.png",
            content: "<h1>Hello Friends!</h1>"
        }
        //set map's center to shouter
        map.panTo(shoutObject.center);
        map.setZoom(14);

        // check if shout is true
        if (shoutCheck === false) {
            console.log("FALSE!!!");
            addUserMarker(shoutObject);
            shoutCheck = true;
        } else {
            return;
        }

        //add Shouter's Marker
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
                strokeOpacity: 0.11,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.11,
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

    function addShouterMarker(shoutLocation, message) {
        console.log("add shouter marker!!");
        // update Shouter's info
        // shoutRef.once("value").then((snapshot) => {
       
            // var snapData = snapshot.val();
            //Add marker
 
            var shouter = {
                center: {
                    lat: shoutLocation[0],
                    lng: shoutLocation[1]
                },
                iconImage: "./assets/images/shout-red-marker.png",
                content: `<h1 id="shoutMessage">${message}</h1>`
            }

            var marker = new google.maps.Marker({
                position: shouter.center,
                map: map,
                animation: google.maps.Animation.DROP,
                optimized: false
            });

            // var mapOverlay = new google.maps.OverlayView();
            // mapOverlay.draw = function () {
            //     this.getPanes().markerLayer.id = "pluse"
            // }

            // mapOverlay.setMap(map);
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
                    content: shouter.content,
                    disableAutoPan: true
                });
            }

            // display shout
            shouterInfoWindow.open(map, marker);
            //check if marker has been clicked
            marker.addListener("click", () => {
                displayChat();
            });

            //bounce animation
            setTimeout(() => {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }, 200);
        // });
    }

    // chat functionality
    function chatMessages(event) {
        // event.preventDefault();
        var chatMessage = chatRef.push({
            chatMessage: $("#chatInput").val(),
            // user: user,
        })

        $("#chatInput").val("");
    }

    // Get users name
    // $("#shout").on("click", function (event) {
    //     user = $('#shoutText').val();
    //     usersRef.set(user);
    // })

    // output message from firebase to chatbox
    chatRef.on("child_added", function (snapshot) {
        if (snapshot.val()) {
            var fireBaseMessage = snapshot.val().chatMessage;
            var messageUser = snapshot.val().user;
            console.log(fireBaseMessage);
            console.log(snapshot.child("chatMessage"))
            //message key
            // var chatKey = chatMessage.key;

            $(".chat-text ul").prepend(`<li class="message-font">${""}: ${fireBaseMessage}</>`);
            chatRef.onDisconnect().remove();
        }
    });

    //check if threre is a shout
    function checkShoutTextVal(shoutText) {
        console.log("There is no value!");
        shoutText.attr("placeholder", "What are you trying to do?");
        shoutText.css("box-shadow", "0 0 5px #e92630");
        return;
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



    // clear markers
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

    function displayChat() {
        $(".welcome-wrapper").css("display", "none");
        $(".chat-wrapper").css("display", "block");
    }

    function clearMarkers() {
        setMapOnAll(null);
    }

    //---------------

    function hideChat() {
        $(".chat-wrapper").css("display", "none");
        $(".welcome-wrapper ").css("display", "block");
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
    //on click shout
    $(document).on("click", "#shout", shoutLogic);
    $(document).on("keyup", "#shoutText", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            $("#shout").click();
        }
    })

    //search for Businesses
    $(document).on("click", "#searchFormBtn", startYelpSearch);
    $(document).on("keyup", "#yelpSearchInput", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            $("#searchFormBtn").click();
        }
    })

    // chat function
    $(document).on("click", ".chat-btn", chatMessages);
    $(document).on("keyup", "#chatInput", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            $(".chat-btn").click();
        }
    })
    //when you click the modal button
    $(document).on("click", ".close", hideChat);
    $(document).on("click", "#myModal", outsideModal);
    $(document).on("click", "#test", toggleChat);

    //extra features
    var typed = new Typed(".ideas", {
        strings: ["Pizza", "movies", "Go for a walk"],
        loop: true,
        typeSpeed: 150,
        smartBackspace: true // Default value
    });


    shoutRef.on("value", (snapshot) => {
        var snap = snapshot.val();
        //set global variable TODO:May not need in future
        currentLatitude = snap.center.lat;
        currentLongitude = snap.center.lng;

      
        // TODO:have to put this back inside the distance checker
        //update the query
        var listenLocation = [snap.center.lat, snap.center.lng];
        // var listenerText = snap.message;

        console.log(listenLocation);
        if (typeof listenQuery !== "undefined") {

            listenQuery.updateCriteria({
                center: listenLocation,
                radius: Radius
            });

        } else {
            //create listen query
            listenQuery = geoFire.query({
                center: listenLocation,
                radius: Radius // kilometers
            });

            // TODO:FOR CLASS MAKE SURE THIS IS TAKEN OUT
            var listenAround = {};
            //check if someone is in your radius and drop a pin to shouter's  location
            listenQuery.on("key_entered", function (key, location, distance) {
                console.log("listening");

                listenAround = {
                    id: key,
                    distance: distance + "km",
                    location: location
                };
                //if you're next to the listener, then don't drop the marker
                if (Math.floor(distance) !== 0) {
                    addShouterMarker(listenLocation, snap.message);
                    initiateYelp();

                } //--end if

                // Drop a pin if you find someoneTODO: MAY NEED IT FOR CLASS PRESENTATION
                addShouterMarker(listenLocation, snap.message );
                initiateYelp();
                console.log(listenLocation);
                console.log(JSON.stringify(key) + " have heard your shout!" + "and they are " + distance + " km away");
            });
        }

    }, errorData);


});