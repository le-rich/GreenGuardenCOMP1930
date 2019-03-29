var globalUser;

//Change Title Bar to User Name's Garden
firebase.auth().onAuthStateChanged(function(user){
	globalUser = user;
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
	var user = globalUser;
	var ref = firebase.database().ref("users/" + user.uid);
	ref.on("value", function(snap) {
		$("#expXPCounter").text(snap.val().xpStats.exp + "XP");
	});

		//ref = firebase.database().ref("users/" + user.uid + "/level");
		ref.on("value", function(snap) {
			$("#expLevel").text("Level " + snap.val().xpStats.level);
		});

		//ref = firebase.database().ref("users/" + user.uid + "/name");
		ref.on("value", function(snap) {
			$("#expName").text(snap.val().name);
		});
		UpdateXPBar();
	}

	$('#doneBtn').click(function(){
		buildGrid();
	});

<<<<<<< HEAD

$('#moreButton').click(function(){
    $('#gardenRow').css({"visibility": "hidden", "display": "none"}).fadeOut("fast",function(){
        $("#contentRow").fadeIn("fast").css({"visibility": "visible", "display": "block"});
    });
});


var existingGrid = $(".gardenPlanter");
=======
	var existingGrid = $(".gardenPlanter");
>>>>>>> af3984404996b89ea46719941231ac566c22d2e7

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

function on(box) {
	document.getElementById("plantOverlay").style.display = "block";
	document.getElementById("plantOverlay").style.visibility = "visible";

    $("#plantOverlay").attr("data-box",box);
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


function UpdateXPBar(){
	var xpActual = $("#xpActual");
	var user = globalUser;
	var ref = firebase.database().ref("users/" + user.uid + "/xpStats");
	ref.on("value", function(snap) {
		var currentXp = snap.val().exp;
		if (currentXp >=  snap.val().expForLevel){
			var remainingExp = snap.val().exp - snap.val().expForLevel;
			console.log("Remaining EXP:"  + remainingExp);
			currentXp = 0;
			handleLevelUp(remainingExp, snap.val().expForLevel, snap.val().level);
		}

		var widthVal = (snap.val().exp / snap.val().expForLevel) * 100;
		xpActual.css("width", widthVal + "%");
	});
}

function addPlant() {
    off();
    var overlay = document.getElementById("plantOverlay");
    var box = overlay.dataset.box;
    var boxDiv = document.getElementsByClassName("gardenPlanter");
    boxDiv[box-1].style.backgroundColor = "green";
    var selectedBox = boxDiv[box-1];
    while (selectedBox.firstChild) {
    selectedBox.removeChild(selectedBox.firstChild);
      

    firebase.database().ref("users/"+globalUser.uid +"/gardenGrid/" + (box-1)).update({
            plant: "lettuce"
    });
      
	}
    
}

// function addExp(xpToAdd){
// 	var user = globalUser;
// 		var ref = firebase.database().ref("users/" + user.uid + "/xpStats");
// 		ref.on("value", function(snap) {
// 			snap.val().exp += xpToAdd;
// 			if (snap.val().exp >=  snap.val().expForLevel){
// 				var remainingExp = snap.val().exp - snap.val().expForLevel;
// 				handleLevelUp(remainingExp);
// 			}
// 		});
// }

function handleLevelUp(remainingExp, expForLevel, currLevel){
	var user = globalUser;
	var ref = firebase.database().ref("users/" + user.uid + "/xpStats");
	var factor = remainingExp / expForLevel;
	if (factor > 1){
		var resultLevel = (currLevel + Math.floor(factor));
		ref.update({
			level: resultLevel,
			exp: remainingExp
		}).then(function(){
			UpdateXPBar();
		});
		var remainder = remainingExp - (factor * expForLevel);

		handleLevelUp(remainder);
	}else{
		var nextLevel = currLevel + 1;
		firebase.database().ref("users/"+user.uid +"/xpStats").update({
			level: nextLevel,
			exp: remainingExp
		}).then(function(){
			UpdateXPBar();
		});
	}
}