var saveUser;

$(".joinBtn").on("click", function (event) {
    saveUser = $('#inputName').val();

    console.log(saveUser);
    console.log("i'm here");
    saveUser = $('#inputName').val();
    // usersRef.set(user);
})