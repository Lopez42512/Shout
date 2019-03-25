var config = {
    apiKey: "AIzaSyBgbeWYYyp8oVui9kLHUT6HSDAREQhX9nU",
    authDomain: "shout-e4409.firebaseapp.com",
    databaseURL: "https://shout-e4409.firebaseio.com",
    projectId: "shout-e4409",
    storageBucket: "shout-e4409.appspot.com",
    messagingSenderId: "881880939559"
};
firebase.initializeApp(config);

var database = firebase.database();

// var usersRef = ref.child("users");

//This adds a user to firebase

$("#add-user-btn").on("click", function (event) {
    // event.preventdefault();

    var userName = $("#user-name-input").val().trim();

    alert("Hello " + userName);

    var newUser = {
        name: userName,
    }

    database.ref("/User").push(newUser);
});

//This adds a message to firebase
$("#submit-button").on("click", function (event) {

    var message = $("#user-message-input").val().trim();

    alert(message);

    var userMessage =
        database.ref("user/message").set({
            message: message
        });

    event.preventdefault();
})

// create a div to get the user message
// grab the value of the message and push it to firebase
// grab the value in firebase and output to another div 