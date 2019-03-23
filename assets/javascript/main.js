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

            $("body").append(pLocation);
        });
    } else {
        console.log("no access to geto")
    }

    console.log("console lat - " + userLocation[0] + " console long - " + userLocation[1]);


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
        var result = $("<p>");
        for (var i = 0; i < 5; i++) {
            var name = yelpResponse.businesses[i].name;
            var ratings = yelpResponse.businesses[i].rating;
            var is_closed = yelpResponse.businesses[i].is_closed;
            var location = yelpResponse.businesses[i].location.address1;
            var yelpLat = yelpResponse.businesses[i].coordinates.latitude;
            var yelpLong = yelpResponse.businesses[i].coordinates.longitude;
            $("#name").append($("<p>").text(name));
            $("#ratings").append($("<p>").text(ratings));
            $("#is_closed").append($("<p>").text(is_closed));
            $("#location").append($("<p>").text(location));
        
            
        }


    }

    );
}

$(document).on("click", "#getGeoLocation", getGeoLocation);

//firebase Google Maps API
//https://www.google.com/maps/embed/v1/MODE?key=AIzaSyCHREkl-BVxFLXW5Hp_reWCSnIDK-Oq2Wk&parameters


// Execute functions