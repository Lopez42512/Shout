var saveUser;

$(".joinBtn").on("click", function (event) {
    saveUser = $('#inputName').val().toString();
    sessionStorage.setItem("userName", saveUser);
    // usersRef.set(user);
});