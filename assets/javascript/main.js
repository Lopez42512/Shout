//AJAX Call for YELP API
// GET https://api.yelp.com/v3/autocomplete?text=del&latitude=37.786882&longitude=-122.399972
//https://cors-anywhere.herokuapp.com/
var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972&radius=8046.72";
var yelpAPI = "1QpSc4B1zI5GuI56PDAAvAfpfcsLg9LWuHRfVCeG4TIDDxRe3hGT-sxlU5h5DD0AdLgu-HHoa2cM4m1WaAefYoboIPdVHv0mCjivrwQrdU11FCFl2hd8-iaaTKOTXHYx";

var lat;
var long;
var gMap;
// JAVASCRIPT MAP API AND QUERY 

// var googleMapQuery = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA4Xg_9AqzPbXG547Ie66bFn-kqaYduOe0" >

    // Just using HTML API for geo location and test it with other APIs
    function getGeoLocation() {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(position);
                lat = position.coords.latitude;
                long = position.coords.longitude;

                var pLocation = $("<p>");
                pLocation.text("The Lattitude: " + lat + " and the longitude: " + long);

                $("body").append(pLocation);
            });
        } else {
            console.log("no access to geto")
        }
    }

$(document).on("click", "#getGeoLocation", getGeoLocation);

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

// function initMap() {

//     // the location of the person
//     var userLocation = {
//         lar: lat,
//         lng: long
//     };
//     //The map, Centered to the person
//     gMap = new google.maps.Map(document.getElementById("map"), {
//         center: userLocation,
//         zoom: 20
//     });
//     // position the marker on the location of the person
//     var marker = new google.maps.Marker({
//         position: userLocation,
//         map: gMap
//     });

// }

// // Javascript map API
// $.ajax({
//     url: googleMapQuery,
//     method: "GET"
// }, then((googleResponse) => {

//     initMap();
//     console.log(googleResponse);
// }));

//firebase Google Maps API
//https://www.google.com/maps/embed/v1/MODE?key=AIzaSyCHREkl-BVxFLXW5Hp_reWCSnIDK-Oq2Wk&parameters



// Execute functions