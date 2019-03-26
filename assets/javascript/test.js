$(document).ready(function () {

    $(function () {
        $("form").submit(function () { return false; });
    });

    // Initialize some variables
    var userId;
    var profile;
    var name;
    var player1connected = false;
    var player2connected = false;

    var state = {
        player1: {
            id: "",
            name: "",
            choice: "",
            turn: false,
            wins: 0,
            losses: 0
        },
        player2: {
            id: "",
            name: "",
            choice: "",
            turn: false,
            wins: 0,
            losses: 0
        },
        ties: 0,
        playing: false
    }

    // Initialize Firebase
    // Make sure to match the configuration to the script version number in the HTML
    // (Ex. 3.0 != 3.7.0)
    var config = {
        apiKey: "AIzaSyAL0fkySN1QCB_loPseQeA1J0sBEcB3UKs",
        authDomain: "rps-multiplayer-fc719.firebaseapp.com",
        databaseURL: "https://rps-multiplayer-fc719.firebaseio.com",
        projectId: "rps-multiplayer-fc719",
        storageBucket: "",
        messagingSenderId: "1014074924882"
    };

    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    // -----------------------------

    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    // Other directories on firebase are defined here as well
    var connectionsRef = database.ref("/connections");
    var usersRef = database.ref("/users");
    var stateRef = database.ref("/state");
    var chatRef = database.ref("/chat");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    var connectedRef = database.ref(".info/connected");

    // When the client's connection state changes...
    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user profile.
            profile = usersRef.push({
                id: "",
                name: "",
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });

            //Get a unique key for each window that connects
            userId = profile.key;

            // Remove user from the connection list when they disconnect, along with all of their data
            connectionsRef.onDisconnect().remove();
            usersRef.onDisconnect().remove();
            stateRef.onDisconnect().update({
                player1: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                player2: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                ties: 0,
                playing: false
            });
        }
    });

    // When first loaded, create a stateRef in firebase that will update as a second player joins, or if one player logs out of the window!
    database.ref().on("child_changed", function (snap) {
        console.log(snap.numChildren());
        console.log(usersRef.exist());
        // console.log(`Snap.numChildren(): ${snap.numChildren()}`);
        // var nodes = snap.val().users;
        // console.log(`Nodes: ${JSON.stringify(nodes)}`);
        // console.log(`Nodes.users.numChildren(): ${nodes.numChildren()}`);
        if (snap.numChildren() === 2) {
            stateRef.update({
                player1: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                player2: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                ties: 0,
                playing: false
            });

            player2connected = false;

            // Need to update HTML that someone disconnected and all data has been reset. Need to enter name and play again
            $("#result").show().text("Someone got disconnected! You might need to refresh your browser to re-enter your name to play.");
            $("#player-1-name").text('Type name & Click "Join Game"');
            $("#player-2-name").text('Type name & Click "Join Game"');
            $("#player-1-choose-text, #player-2-choose-text").text("Choose one:");
        }

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    // if (snap.numChildren() > 2) {
    //     $("#viewers").text(`There are ${snap.numChildren()} viewers in the audience.`);
    // }

    // When a name is typed and "Join Game" is clicked
    $("#player-join-game").on("click", function (e) {
        e.preventDefault();
        $("#result").text("");
        var name = $("#player-name-input").val().trim();
        console.log(userId);
        // If the game has not started, there is no player 1 and the userId is not the same as player 2
        if (!state.playing && !state.player1.name && userId !== state.player2.id) {
            //Update this in the database as player 1
            usersRef.child(userId).update({
                id: "",
                name: name,
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });
        } else if (!state.playing && !state.player2.name && userId !== state.player1.id) {
            usersRef.child(userId).update({
                id: "",
                name: name,
                choice: "",
                img: "",
                turn: false,
                wins: 0,
                losses: 0,
                ties: 0
            });
        }
        $("#player-name-input").val("");
    });

    // If anything changes in the usersRef in firebase, that needs to be updated in the stateRef, both in firebase and locally
    usersRef.on("child_changed", function (s) {
        if (!state.player1.name && !state.player2.name) {
            var player1 = s.val();
            stateRef.update({
                player1: {
                    id: s.key,
                    name: player1.name,
                    choice: "",
                    img: "",
                    turn: false,
                    wins: player1.wins,
                    losses: player1.losses
                },
                player2: {
                    id: "",
                    name: "",
                    choice: "",
                    img: "",
                    turn: false,
                    wins: 0,
                    losses: 0
                },
                ties: 0,
                playing: false
            });
            state.player1.name = player1.name;
            state.player1.id = s.key;
            state.player1.turn = true;
            state.player1.wins = player1.wins;
            state.player1.losses = player1.losses;

        } else if (state.player1.name && !state.player2.name) {
            var player2 = s.val();
            stateRef.update({
                player1: {
                    id: state.player1.id,
                    name: state.player1.name,
                    choice: "",
                    img: "",
                    turn: true,
                    wins: state.player1.wins,
                    losses: state.player1.losses
                },
                player2: {
                    id: s.key,
                    name: player2.name,
                    choice: "",
                    img: "",
                    turn: false,
                    wins: player2.wins,
                    losses: player2.losses
                },
                ties: 0,
                playing: true
            });
            state.player2.name = player2.name;
            state.player2.id = s.key;
            state.player1.turn = true;
            state.player2.wins = player2.wins;
            state.player2.losses = player2.losses;
        }
    });

    stateRef.on("value", function (snap) {
        stateFb = snap.val();
        console.log(stateFb);
        if (!stateFb.playing) {
            if (!stateFb.player1.name && !stateFb.player2.name) {
                $("#player-1-name").text('Type name & Click "Join Game"');
                $("#player-2-name").text('Type name & Click "Join Game"');
                $("#player-1-choose-text, #player-2-choose-text").text("Choose one:");
                $("#player-1-connection").text("Not connected").css("color", "white");
            } else if (stateFb.player1.name && !stateFb.player2.name) {
                $("#player-1-connection").text("Connected!").css("color", "yellowgreen");
                $("#player-2-connection").text("Waiting for another player...").css("color", "red");
                player1connected = true;
                player2connected = false;
                $("#player-1-name").text(stateFb.player1.name);
                state = stateFb;
                if (userId === stateFb.player1.id) {
                    $("#player-2-choose-text, .player-2-choice").hide();
                }
            } else if (stateFb.player2.name && !stateFb.player1.name) {
                $("#player-1-connection").text("Waiting for another player...").css("color", "red");
                $("#player-2-connection").text("Connected!").css("color", "yellowgreen");
                player1connected = false;
                player2connected = true;
                $("#player-2-name").text(stateFb.player2.name);
                state = stateFb;
                if (userId === stateFb.player2.id) {
                    $("#player-1-choose-text, .player-1-choice").hide();
                }
            }
        } else if (stateFb.playing) {
            if (stateFb.player2.name && stateFb.player1.name) {
                $("#player-1-connection, #player-2-connection").text("Connected!").css("color", "yellowgreen");
                player1connected = true;
                player2connected = true;
                $("#player-1-name").text(stateFb.player1.name);
                $("#player-2-name").text(stateFb.player2.name);
                state = stateFb;
                if (userId === stateFb.player1.id) {
                    $("#player-2-choose-text, .player-2-choice").hide();
                    $("#player-1-choose-text").text("Now it is your turn to choose.");
                } else if (userId === stateFb.player2.id) {
                    if (!stateFb.player1.choice && !stateFb.player2.choice) {
                        $("#player-2-choose-text").text("Please wait until " + stateFb.player1.name + " chooses.");
                        $("#player-1-choose-text, .player-1-choice").hide();
                    }
                    else if (stateFb.player1.choice && !stateFb.player2.choice) {
                        $("#player-2-choose-text").text("Now it is your turn to choose.");
                    }
                }
            } if (stateFb.player1.choice && stateFb.player2.choice) {
                if (stateFb.player1.choice === stateFb.player2.choice) {
                    // Update the local state.tie variable
                    state.ties++;
                    // Update the database with the local variable
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    //Update the HTML
                    $("#result").show().html('<h2>It\'s a tie!</h2>');
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-choose-text, #player-2-choose-text").text("The results are in!");
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);

                } else if (stateFb.player1.choice === "rock" && stateFb.player2.choice === "scissors" ||
                    stateFb.player1.choice === "scissors" && stateFb.player2.choice === "paper" ||
                    stateFb.player1.choice === "paper" && stateFb.player2.choice === "rock") {
                    // Update local variable
                    state.player1.wins++;
                    state.player2.losses++;

                    // Update this in the database
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    // Update HTML
                    $("#result").show().html(`<h2>${state.player1.name} wins!</h2>`);
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-choose-text, #player-2-choose-text").text("The results are in!");
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);

                } else if (stateFb.player1.choice === "rock" && stateFb.player2.choice === "paper" ||
                    stateFb.player1.choice === "scissors" && stateFb.player2.choice === "rock" ||
                    stateFb.player1.choice === "paper" && stateFb.player2.choice === "scissors") {

                    // Update local variable
                    state.player2.wins++;
                    state.player1.losses++;

                    // Update this in the database
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: state.player1.choice,
                            img: state.player1.img,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: state.player2.choice,
                            img: state.player2.img,
                            turn: false,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: false
                    });

                    // Update HTML
                    $("#result").show().html(`<h2>${state.player2.name} wins!</h2>`);
                    $("#player-1-img, #player-2-img").show();
                    $("#player-1-img").attr("src", state.player1.img);
                    $("#player-2-img").attr("src", state.player2.img);
                    $("#player-1-choose-text, #player-2-choose-text").text("The results are in!");
                    $("#player-1-stats").text(`Wins: ${state.player1.wins} | Losses: ${state.player1.losses} | Ties: ${state.ties}`);
                    $("#player-2-stats").text(`Wins: ${state.player2.wins} | Losses: ${state.player2.losses} | Ties: ${state.ties}`);

                    setTimeout(reset, 1000 * 5);
                }
            }
        }
    });

    var messageField;

    chatRef.on("child_added", function (snapshot) {
        var message = snapshot.val();
        $("#chat-window").prepend(`${message.name}: ${message.message}`);
        $("#chat-window").prepend('<br>');
    });

    $("#chat-submit").on("click", function () {
        messageField = $("#chat-message").val().trim();
        if (userId === state.player1.id) {
            chatRef.push().set({
                message: messageField,
                name: state.player1.name

            });
        } else if (userId === state.player2.id) {
            chatRef.push().set({
                message: messageField,
                name: state.player2.name
            });
        } else {
            chatRef.push().set({
                message: messageField,
                name: "Guest"
            });
        }
    });


    //Function to reset 
    function reset() {
        // Update local variable
        state = {
            player1: {
                id: state.player1.id,
                name: state.player1.name,
                choice: "",
                turn: true,
                wins: state.player1.wins,
                losses: state.player1.losses
            },
            player2: {
                id: state.player2.id,
                name: state.player2.name,
                choice: "",
                turn: false,
                wins: state.player2.wins,
                losses: state.player2.losses
            },
            ties: state.ties,
            playing: true
        }

        //Update this in the database 
        stateRef.update({
            player1: {
                id: state.player1.id,
                name: state.player1.name,
                choice: "",
                img: "",
                turn: true,
                wins: state.player1.wins,
                losses: state.player1.losses
            },
            player2: {
                id: state.player2.id,
                name: state.player2.name,
                choice: "",
                img: "",
                turn: false,
                wins: state.player2.wins,
                losses: state.player2.losses
            },
            ties: state.ties,
            playing: false
        });

        if (userId === state.player1.id) {
            $(".player-1-choice").show();
            $("#player-1-choose-text").show().text("Choose one:");
            $(".player-2-choice, #player-2-choose-text").hide();
        } else if (userId === state.player2.id) {
            $("#player-1-choose-text, .player-1-choice").hide();
            $("#player-2-choose-text").text("Please wait for " + state.player1.name + " to choose.");
            $(".player-2-choice").show();
        }
        $("#result").hide();
        $("#player-1-img, #player-2-img").hide();
    }

    //When Player 1 clicks a choice
    $(".player-1-choice").on("click", function () {
        //Nothing can happen if it's not Player 1
        if (userId === state.player1.id) {
            //And it has to be Player 1's turn
            if (state.player1.turn) {
                if (state.player2.name) {
                    //hide the choices
                    $(".player-1-choice").hide();
                    //get the value of that choice & the src of that img
                    player1Choice = $(this).val();
                    player1ChoiceImgSrc = $(this).attr("data-src");

                    // Update the database
                    stateRef.update({
                        player1: {
                            id: state.player1.id,
                            name: state.player1.name,
                            choice: player1Choice,
                            img: player1ChoiceImgSrc,
                            turn: false,
                            wins: state.player1.wins,
                            losses: state.player1.losses
                        },
                        player2: {
                            id: state.player2.id,
                            name: state.player2.name,
                            choice: "",
                            img: "",
                            turn: true,
                            wins: state.player2.wins,
                            losses: state.player2.losses
                        },
                        ties: state.ties,
                        playing: true
                    });

                    //Update the local state with these values
                    state.player1.choice = player1Choice;
                    state.player1.img = player1ChoiceImgSrc;
                    state.player2.turn = true;
                    $("#player-1-choose-text").text("Waiting for " + state.player2.name + " to choose");
                    $("#player-2-choose-text").text("Now it's your turn.");
                } else {
                    $("#player-1-choose-text").text("Waiting for another player to join the game.");
                }
            } else {

                //Show that it is not Player 1's turn yet
                $("#player-1-choose-text").text("It is not your turn yet.");
            }
        } else {
            // User Id of the person clicking doesn't match the id of Player 1
            $("#player-1-choose-text").text("You are not Player 1.");
        }
    });

    $(".player-2-choice").on("click", function () {
        if (userId === state.player2.id) {
            if (state.player2.turn) {
                $(".player-2-choice").hide();
                player2Choice = $(this).val();
                player2ChoiceImgSrc = $(this).attr("data-src");

                // Update the database
                stateRef.update({
                    player1: {
                        id: state.player1.id,
                        name: state.player1.name,
                        choice: state.player1.choice,
                        img: state.player1.img,
                        turn: false,
                        wins: state.player1.wins,
                        losses: state.player1.losses
                    },
                    player2: {
                        id: state.player2.id,
                        name: state.player2.name,
                        choice: player2Choice,
                        img: player2ChoiceImgSrc,
                        turn: false,
                        wins: state.player2.wins,
                        losses: state.player2.losses
                    },
                    ties: state.ties,
                    playing: true
                });

                //Update the local state with these values 
                state.player2.choice = player2Choice;
                state.player2.img = player2ChoiceImgSrc;
                state.player1.turn = false;
                state.player2.turn = false;

            } else {
                $("#player-2-choose-text").text("It is not your turn yet.");
            }
        } else {
            $("#player-2-choose-text").text("You are not player 2!");
        }
    });
});