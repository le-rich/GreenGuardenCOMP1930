//Change Title Bar to User Name's Garden
firebase.auth().onAuthStateChanged(function(user){
	//Get User's name and change the title to their garden.
	var ref = firebase.database().ref("users/" + user.uid);
	ref.on("value", function(snap) {
		var stringName = JSON.stringify(snap.val().name);
		stringName = stringName.substring(1, stringName.length -1);
		var userName = document.getElementById("title");
		userName.innerHTML =  stringName+ "'s Garden";
	});

    //Get if the user has already created a garden, if so, load it.
    ref = firebase.database().ref("users/" + user.uid +"/gardenCreated");
    ref.on("value", function(snap){
    	if (snap.val() == true){
    		$("#createGardenButton").css({"visibility": "hidden", "display": "none"});
    		console.log("Fetched from Startup");
    		fetchAndDisplayGrid();
    		
    	}
    });
});

$(document).ready(function(){
	initUserStats();
});

//When the create a garden is clicked, fade out and display a garden creator.
$('#createGardenButton').click(function(){
	$('#createGardenButton').fadeOut("fast",function(){
		$("#contentRow").css({"visibility": "visible", "display": "flex"});
		buildCreateAGarden();
	});
});

//Creates a 5 x 5 Garden Grid
//TODO: Make this accept arbitrary sized array.
function buildCreateAGarden(){
	for (var y = 0; y < 5; y++){
		var newRow = "<div id=" + "row" + (y + 1) + " class=\"btn-group\">";
		$("#btn-container").append(newRow);
		var appendedRow = $("#row" + (y + 1));
		for (var x = 0; x < 5; x++){
			var newButton = "<button class=\"gardenBtn\" data-pos=\"[" + x + "," + y +"]\">1</button>"
			$("#row" + (y + 1)).append(newButton);
		}
	}

	//When a garden Button is clicked, add the class selected to that button.
	$('.gardenBtn').click(function(){
		$(this).toggleClass("selected");
	});
}

function initUserStats(){
	firebase.auth().onAuthStateChanged(function(user) {
		var ref = firebase.database().ref("users/" + user.uid);
		ref.on("value", function(snap) {
			$("#expXPCounter").text(snap.val().exp + "XP");
		});

		//ref = firebase.database().ref("users/" + user.uid + "/level");
		ref.on("value", function(snap) {
			$("#expLevel").text("Level " + snap.val().level);
		});

		//ref = firebase.database().ref("users/" + user.uid + "/name");
		ref.on("value", function(snap) {
			$("#expName").text(snap.val().name);
		});
	});
}

$('#doneBtn').click(function(){
	buildGrid();
});

var existingGrid = $(".gardenPlanter");

//If the user is logged in, get all selected buttons and submit their positions to the db.
function buildGrid(){
	console.log("build");
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			var gardenArr = [];
			$(".selected").each(function(){
				gardenArr.push($(this).data("pos"));
			});
			var created = true;
			firebase.database().ref("users/"+user.uid).update({
				gardenGrid: gardenArr,
				gardenCreated: created
			});
		}
	});

	//Fades out the creator row.
	$("#contentRow").fadeOut("fast");
}

//Fetches gardenGrid from firebase and constructs a bootstrap layout.
function fetchAndDisplayGrid(){
	console.log("Fetch and Display");
	$("#gardenRow").css({"visibility": "visible", "display": "flex"});
	firebase.auth().onAuthStateChanged(function(user) {
		var dbRef = firebase.database().ref("users/" + user.uid + "/gardenGrid");
		dbRef.on(
			"value",
			function(snap){
				snap.forEach(function(snap){
					$(existingGrid[snap.val()[0] +  (5 * snap.val()[1])]).toggleClass("dbPosActive");
				});
				$(".gardenPlanter").each(function(){
					if (!$(this).hasClass("dbPosActive")){
						$(this).css({"visiblity": "hidden", "opacity": "0", "user-select": "none"});
					}
				});
			}, function(error){
				console.log("Error displaying grid: " + error.code);
			});
	});
}

function on() {
	document.getElementById("plantOverlay").style.display = "block";
	document.getElementById("plantOverlay").style.visibility = "visible";
}

function off() {
	document.getElementById("plantOverlay").style.display = "none";
	document.getElementById("plantOverlay").style.visibility = "hidden";
}





$(document).ready(function() {
	ShowList("Plants");
});

function ShowList(category) {
	var dbRef = firebase.database().ref(category);
	var promise = dbRef.once("value", function(snap){
		list=snap.val();
	});
	promise.then(function(){
        DisplayList(list);  //JSON object
    });
}



function DisplayList(list){
	for (x in list) {
		var newRow = $(document.createElement("div")).attr("class", "row");
		var col = $(document.createElement("div")).attr("class", "col-12");
		var para = $(document.createElement("button")).attr({"class":"plant", "onclick":"addPlant()", "type":"button"});
		newRow.append(col);
		col.append(para);
		var overlay = $("#plantOverlay").append(newRow);
		var node = $(document.createTextNode(x));
		para.append(node);
	}
    
!function(d,s,id){
        var js,fjs=d.getElementsByTagName(s)[0];
        if(!d.getElementById(id))
        {
            js=d.createElement(s);
        js.id=id;
        js.src='https://weatherwidget.io/js/widget.min.js';
        fjs.parentNode.insertBefore(js,fjs);}
    }
    (document,'script','weatherwidget-io-js');
}

function addPlant() {
    off();
}

