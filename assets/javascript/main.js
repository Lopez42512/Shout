//https://api.yelp.com/v3/businesses/search
// GET https://api.yelp.com/v3/autocomplete?text=del&latitude=37.786882&longitude=-122.399972
//https://cors-anywhere.herokuapp.com/

//Global variables
var userLocation = [];
var gMap;

// var googleMapQuery = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA4Xg_9AqzPbXG547Ie66bFn-kqaYduOe0" >

// Just using HTML API for geo location and test it with other APIs
function getGeoLocation() {

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

    
// this is the call for YELP QUERY
// var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.951061&longitude=-75.165619&radius=8046.72";
//testing to see if I can get variables included
var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=" + userLocation[0] + "&longitude=" + userLocation[1] + "&radius=8046.72";
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

$(document).on("click", "#getGeoLocation", getGeoLocation);

// getGeoLocation();



//firebase Google Maps API
//https://www.google.com/maps/embed/v1/MODE?key=AIzaSyCHREkl-BVxFLXW5Hp_reWCSnIDK-Oq2Wk&parameters


// Execute functions