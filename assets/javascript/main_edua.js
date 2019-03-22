//https://api.yelp.com/v3/businesses/search
// GET https://api.yelp.com/v3/autocomplete?text=del&latitude=37.786882&longitude=-122.399972
//https://cors-anywhere.herokuapp.com/

//Global variables
var userLocation = new Array(0,0);
var gMap;

// var googleMapQuery = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA4Xg_9AqzPbXG547Ie66bFn-kqaYduOe0" >

// Just using HTML API for geo location and test it with other APIs
function getGeoLocation() {
	
	/*var userLocation = {
	lat: 0,
	lng: 0
	}*/
	console.log("navigator.geolocation: " + navigator.geolocation);
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { //This function appears to run asynchronos...see notes
            
            //Push Latitude and Longitude
            //userLocation.push(position.coords.latitude);
            //userLocation.push(position.coords.longitude);
			
			userLocation[0] = position.coords.latitude;
            userLocation[1] = position.coords.longitude;
			
            //display lattitude and longitude in dom
            var pLocation = $("<p>");
			
			//Note 1: This output doesn't show until I accept "Allow Location"
            pLocation.text("The Lattitude-array: " + userLocation[0] + " and the longitude-array: " + userLocation[1]); 

            $("body").append(pLocation);

        } );
    } else {
        console.log("no access to geto")
    }

	//Note 2: This output shows up right after I press the button
	console.log("console lat - " + userLocation[0] + " console long - " + userLocation[1]);

	//Note 3: Conclusion: The function declares the variables ONLY when the "Allow location" is accpected. Otherwise, the variable is undefined
	// You were leaning this way but it's important to know (I believe) that the part where the location data is gathered is asynchronos to the line at 43.
	// Which is to say that you will get the output of the console log before the location value actually set.
    
// this is the call for YELP QUERY
// var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=39.951061&longitude=-75.165619&radius=8046.72";
//testing to see if I can get variables included

	var yelpQuery = "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=" + userLocation[0] + "&longitude=" + userLocation[1] + "&radius=8000";
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