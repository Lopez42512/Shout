//Global variables
var userLocation = [];
var gMap;
//--------


// var googleMapQuery = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA4Xg_9AqzPbXG547Ie66bFn-kqaYduOe0" >

// Just using HTML API for geo location and test it with other APIs
function getGeoLocation() {

    userLocation = [];

    // place inside function then query for it.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {

            //Push Latitude and Longitude
            userLocation.push(position.coords.latitude);
            userLocation.push(position.coords.longitude);

            //display lattitude and longitude in dom
            var pLocation = $("<p>");
            pLocation.text("The Lattitude-array: " + userLocation[0] + " and the longitude-array: " + userLocation[1]);

            //update maps
            googleMapsLoad(userLocation[0], userLocation[1]);

            //update body
            $("body").append(pLocation);
        }); 
    } else {
        console.log("no access to geto")
    }

    // this is the call for YELP QUERY - WORKING
    var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.951061&longitude=-75.165619&radius=8000";

    //testing  to get variables -- Needs WORK!
    // var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=" + userLocation[0] + "&longitude=" + userLocation[1] + "&radius=8000";
    var yelpAPI = "1QpSc4B1zI5GuI56PDAAvAfpfcsLg9LWuHRfVCeG4TIDDxRe3hGT-sxlU5h5DD0AdLgu-HHoa2cM4m1WaAefYoboIPdVHv0mCjivrwQrdU11FCFl2hd8-iaaTKOTXHYx";


    console.log(yelpQuery);
    $.ajax({
        url: yelpQuery,
        headers: {
            'Authorization': "Bearer " + yelpAPI,
        },
        method: "GET"
    }).then((yelpResponse) => {
        console.log(yelpResponse);
    }

    );
}

//google map function of generating user and icon
function googleMapsLoad(userLat, userLng) {

    // initialize maps

    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 20,
        center: {
            lat: userLat,
            lng: userLng
        }
    });

    var allUsers = [

        firstUser = {
            coords: {
                lat: userLat,
                lng: userLng,
                radius: 10
            },
            iconImage: "./assets/images/map-icon.png",
            content: "<h1>Hello Friends!</h1>"
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
            position: user.coords,
            map: map,

        });

        console.log(user.coords);

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

    }
}


$(document).on("click", "#getGeoLocation", getGeoLocation);

//firebase Google Maps API
//https://www.google.com/maps/embed/v1/MODE?key=AIzaSyCHREkl-BVxFLXW5Hp_reWCSnIDK-Oq2Wk&parameters


// Execute functions