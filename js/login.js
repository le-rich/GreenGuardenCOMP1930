function loadDone(){
	switchToLogin();
	myVar = setTimeout(showPage, 1500);
}

function showPage(){
	$("#overlayLoad").slideUp("fast");
	$("#allContainer").css({"display": "block", "visibility": "visible"});
}

function switchToLogin(){
	$("#userField").slideUp("fast");
	$("#signupLabel").text("Login to Your Account");
	$("#switchLoginLink").attr("onclick", "switchToSignup()").text("Need an account? Click here to Sign Up.");
	$("#userFieldInput").attr("required", "false");
	$("#doneBtn").attr("value","LOGIN").attr("onclick", "loginFirebaseAccount()");
}

function switchToSignup(){
	$("#userField").slideDown("fast");
	$("#signupLabel").text("Create Your Account");
	$("#switchLoginLink").attr("onclick", "switchToLogin()").text("Already have an account? Click here to login.");
	$("#doneBtn").attr("value","SIGN UP").attr("onclick", "createFirebaseAccount()");
}

var loginProcessing = false;

function createFirebaseAccount(){
	var form = $("#signupForm");
	var username = $("#userFieldInput").val();
	var email = $("#emailFieldInput").val();
	var pass = $("#pwFieldInput").val();
	loginProcessing = true;
	firebase.auth().createUserWithEmailAndPassword(email, pass).then(function(firebaseUser) {
		firebase.auth().onAuthStateChanged(function(user){
        	//Update database with the profile info collected for the user
        	var promise = firebase.database().ref('users/'+user.uid).update( {
        		"name": username,
        		"xpStats" : {"exp": "0", "level": 1, "expForLevel": "3600"},
        		"plants": ""
        	});

        	//When the databate update is done, then go to main.html
        	promise.then(function() {
        		window.location.href="index.html";
        	});
    	});
		return firebaseUser;
	}).catch(function(error) {
		alert(error)
		loginProcessing = false;
	});

	return false;
}

function loginFirebaseAccount(){
	var form = $("#signupForm");
	var email = $("#emailFieldInput").val();
	var pass = $("#pwFieldInput").val();
	loginProcessing = true;
	firebase.auth().signInWithEmailAndPassword(email, pass).then(function(firebaseUser){
		firebase.auth().onAuthStateChanged(function(user){
			window.location.href = "index.html";
		});
	}).catch(function(error) {
		alert(error);
		loginProcessing = false;
	});
};



firebase.auth().onAuthStateChanged(function(user){
	if (!loginProcessing && user != null){
		window.location.href="index.html";
	}
});