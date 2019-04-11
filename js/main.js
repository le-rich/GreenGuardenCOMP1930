var globalUser;

function loadDone(){
	myVar = setTimeout(showPage, 1000);
}

function showPage(){
	$("#overlayLoad").slideUp("fast");
	$("#allContainer").css({"display": "block", "visibility": "visible"});
}

//Change Title Bar to User Name's Garden
firebase.auth().onAuthStateChanged(function(user){
	globalUser = user;
	//Get User's name and change the title to their garden.
	var ref = firebase.database().ref("users/" + user.uid);
	ref.on("value", function(snap) {
		var stringName = JSON.stringify(snap.val().name);
		stringName = stringName.substring(1, stringName.length -1);
		var userName = document.getElementById("title");
		$("#title").text(stringName + "'s Garden");
	});

    //Get if the user has already created a garden, if so, load it.
    ref = firebase.database().ref("users/" + user.uid +"/gardenCreated");
    ref.once("value", function(snap){
    	if (snap.val() == true){
    		fetchAndDisplayGrid();
    		fetchAndDisplayGrid();
    	} else {
        noGarden();
      }

        initUserStats();
    });
});



$("#signOut").click(function(){
	firebase.auth().signOut().then(function() {
  		// Sign-out successful.
  		window.location.href="login.html";
	}).catch(function(error) {
  		// An error happened.
	});
});


//When the create a garden is clicked, fade out and display a garden creator.
$('#createGardenButton').click(function(){
	$('body').css("background-image", "url('cssimg/gridme.png') !important");
	$('#createGardenButton').fadeOut("fast",function(){
		$("#contentRow").css({"visibility": "visible", "display": "flex"});
	});
    $("#noGarden").css({"visibility": "hidden", "display": "none"});
    //buildCreateAGarden();
});

function fetchDisplayInspectorInfo(index, name){
	var pickDateRef = firebase.database().ref("users/" + globalUser.uid + "/plants/" + index);
	pickDateRef.once("value", function(snap){
		$("#inspectPickDate").text(snap.val().dateToPick);
		$("#inspectWaterDate").text(snap.val().dateToWater);
	});
	$("#inspectTitle").text(name);
	$("#inspectPlantOverlay").attr("data-index", index);
}

$("#pickBtn").click(function(){
	var user = globalUser;
	hideInspectOverlay();
	var index = $("#inspectPlantOverlay").attr("data-index");
	var planters = $(".gardenPlanter");
	$(planters[index]).css({"background-image": "none"}).removeClass("hasPlant");
	$(planters[index]).children(".addPlant").css({"display": "block", "visibility":"visible"});
	var plantRef = firebase.database().ref("Plants/" + $(planters[index]).attr("data-plant"));
	addExp(1200);
	var ref = firebase.database().ref("users/" + user.uid +"/plants/" + index);
	ref.remove();
	$(planters[index]).removeAttr("data-plant").removeAttr("data-ind");
});

$("#waterBtn").click(function(){
	addExp(50);
});



//Creates a 5 x 5 Garden Grid
function buildCreateAGarden(){
	//Create Each Button
	for (var y = 0; y < 5; y++){
		var newRow = "<div id=" + "row" + (y + 1) + " class=\"btn-group\">";
		$("#btn-container").append(newRow);
		var appendedRow = $("#row" + (y + 1));
		for (var x = 0; x < 5; x++){
			var newButton = "<button" + " id=\"" + x + y + "\"" + "class=\"gardenBtn\" data-pos=\"[" + x + "," + y +"]\"></button>"
			$("#row" + (y + 1)).append(newButton);
		}
	}

	//If a planter exists in that location already from db, load it.
	firebase.auth().onAuthStateChanged(function(user) {
		var plantRef = firebase.database().ref("users/" + user.uid + "/gardenGrid");
		plantRef.on("value", function(snap){
			for (var pos in snap.val()){
				var key = "" + snap.val()[pos][0] + snap.val()[pos][1];
				$("#" + key).addClass("selected");
			}
		});
	});

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
	fetchAndDisplayGrid();
	fetchAndDisplayGrid();
	$('body').css({"background-image": "none", "background" : "linear-gradient(307deg, #A7DDA7, #a0d969)", "color": "white"});
	$("#moreButton").fadeIn("fast");
	$("#contentRow").fadeOut();
	$("#expContainer").css({"visibility": "visible", "display": "block"});
});


//If the user wants to add more garden grid
$('#moreButton').click(function(){
		$('body').css({"background-image": "url('css/img/gridme.png')", "color": "black"});
    $('#gardenRow').css({"visibility": "hidden", "display": "none"}).fadeOut("fast",function(){
        $("#contentRow").fadeIn("fast").css({"visibility": "visible", "display": "flex"});
    });
    $(this).fadeOut("fast");
});

var existingGrid = $(".gardenPlanter");

//If the user is logged in, get all selected buttons and submit their positions to the db.
function buildGrid(){
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
}

//Fetches gardenGrid from firebase and constructs a bootstrap layout.
function fetchAndDisplayGrid(){
	firebase.auth().onAuthStateChanged(function(user) {
		var dbRef = firebase.database().ref("users/" + user.uid + "/gardenGrid");
		var plantRef = firebase.database().ref("users/" + user.uid + "/plants");

		$(".dbPosActive").each(function(){
			$(this).removeClass("dbPosActive");
		});

		$(".inspecting").each(function(){
			$(this).removeClass("inspecting");
		});

		dbRef.once("value",function(snap){
				snap.forEach(function(snap){
					$(existingGrid[snap.val()[0] +  (5 * snap.val()[1])]).toggleClass("dbPosActive");
				});

				$(".gardenPlanter").each(function(){
					if (!$(this).hasClass("dbPosActive")){
						$(this).css({"visiblity": "hidden", "opacity": "0", "user-select": "none"});
						$(this).children(".addPlant").css({"display": "none", "visiblity": "hidden"});
						$(this).children(".addPlant").attr("disabled", "disabled");
					
					}else{
						$(this).css({"visiblity": "visible", "opacity": "1", "user-select": "auto"});
						if ($(this).hasClass("hasPlant")){
							$(this).children(".addPlant").attr("disabled", "disabled");
							$(this).children(".addPlant").css({"display": "none", "visiblity": "hidden"});
						}else{
							$(this).children(".addPlant").removeAttr("disabled");
							$(this).children(".addPlant").css({"display": "block", "visiblity": "visible"});
						}
					}
				});
			}, function(error){
				console.log("Error displaying grid: " + error.code);
			});
			var index = 0;
			plantRef.on("value", function(snap){
			snap.forEach(function(snap){
				$(existingGrid[snap.val()["gridIndex"]]).addClass("hasPlant").attr({"data-plant": snap.val()["plant"], "data-ind": snap.val()["gridIndex"]});
				index++;
			});	


			$(".hasPlant").each(function(){
				//Hides the add plant button on given garden grid.
				var plantName = $(this).attr("data-plant");
				$(this).css({"background-image" : "url('css/img/"+plantName+".png')", "backgroundSize" : "cover"});
				$(this.firstChild).css({"display": "none", "visiblity": "hidden"});
			});

			$(".hasPlant").click(function(){
				if ($(this).hasClass("inspecting")){
					console.log("Here again");
					hideInspectOverlay();
				}else if ($(this).hasClass("hasPlant")){
					$(this).addClass("inspecting");
					var plantName = $(this).attr("data-plant");
					var plantInd = $(this).attr("data-ind");
					displayInspectOverlay();
					fetchDisplayInspectorInfo(plantInd, plantName);

				}
			});	
		});


		$("#gardenRow").css({"visibility": "visible", "display": "flex"});
	});
    
        $("#createGardenButton").css({"visibility": "hidden", "display": "none"});
        $("#moreButton").css({"visibility": "visible", "display": ""});
        $("#title").css({"visibility": "visible", "display": ""});
}

function on(box) {
	document.getElementById("plantOverlay").style.display = "block";
	document.getElementById("plantOverlay").style.visibility = "visible";
	$("#plantOverlay").removeClass("fadeOutLeft");
	$("#plantOverlay").addClass("fadeInLeft faster animated");

   $("#plantOverlay").attr("data-box", box);
}

function off() {
	$("#plantOverlay").addClass("fadeOutLeft");
	$("#plantOverlay").removeClass("fadeInLeft");
}

function displayInspectOverlay(){
	console.log("Show");
	document.getElementById("inspectPlantOverlay").style.display = "block";
	document.getElementById("inspectPlantOverlay").style.visibility = "visible";
	// $("#inspectPlantOverlay").addClass("animated fadeInRight faster");
	$("#inspectPlantOverlay").attr("class", "container-fluid animated faster fadeInRight");
	$(".inspecting").each(function(){
		$(this).removeClass("inspecting");
	});
}

function hideInspectOverlay(){
	console.log("Hide");
	$(".inspecting").each(function(){
		$(this).removeClass("inspecting");
	});
	// $("#inspectPlantOverlay").addClass("fadeOutRight");
	// $("#inspectPlantOverlay").removeClass("fadeInRght");
	$("#inspectPlantOverlay").attr("class", "container-fluid animated faster fadeOutRight");
}

$(document).ready(function() {
	ShowList("Plants");
	buildCreateAGarden();
	loadDone();
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
        var plantName = x;
		var newRow = $(document.createElement("div")).attr("class", "row text-center");
		var col = $(document.createElement("div")).attr("class", "col-8 mx-auto");
		var para = $(document.createElement("button")).attr({"class":"plant", "onclick":'addPlant("'+plantName+'")', "type":"button"});
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
			currentXp = 0;
			handleLevelUp(remainingExp, snap.val().expForLevel, snap.val().level);
		}

		var widthVal = (snap.val().exp / snap.val().expForLevel) * 100;
		xpActual.css("width", widthVal + "%");
	});
}

function addPlant(plantName) {
    off();
    var overlay = document.getElementById("plantOverlay");
    var box = overlay.dataset.box;
    var boxDiv = document.getElementsByClassName("gardenPlanter");
    boxDiv[box-1].style.backgroundImage = ("url('css/img/"+plantName+".png')");
    boxDiv[box-1].style.backgroundSize = "cover";
    var selectedBox = boxDiv[box-1];
	$(selectedBox).children(".addPlant").css({"display": "none", "visiblity": "hidden"});
	var index = (box -1);
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes();
	var dateTime = time + ' ' + date;


	var dbPlantRef = firebase.database().ref("Plants/" + plantName);
	dbPlantRef.once("value", function(snap){
		var waterInHours = snap.val()["timeToWater"];
		var pickInHours = snap.val()["timeToPick"];
		var now = new Date();
		var nextWaterDate = now.add(waterInHours).hours().toString(' MMMM d yyyy');
		var nextPickDate = now.add(pickInHours).hours().toString('MMMM d yyyy');
		firebase.database().ref("users/"+ globalUser.uid + "/plants/" + (box-1)).update({
    		"plant" : plantName,
    		"gridIndex" : index,
    		"dateToWater" : nextWaterDate,
    		"dateToPick" : nextPickDate
		});
	});
}

function addHours(date, hours){
	return new Date(date.getTime() + (hours * 60 * 60 * 1000));
}

function addExp(xpToAdd){
	var newXP = 0;
	var remainingExp = 0;
	var leveled = false;
	var user = globalUser;
		var ref = firebase.database().ref("users/" + user.uid + "/xpStats");
		ref.on("value", function(snap) {
			newXP = parseInt(snap.val().exp) + xpToAdd;
			if (newXP >=  snap.val().expForLevel){
				remainingExp =  snap.val().expForLevel - snap.val().exp;
				handleLevelUp(remainingExp, snap.val().expForLevel, snap.val().level);
				leveled = true;
			}
		});
			if (leveled == false){
				firebase.database().ref("users/" + user.uid + "/xpStats").update({
					exp: newXP
				});
			}
}

function handleLevelUp(remainingExp, expForLevel, currLevel){
	var expRemain = remainingExp;
	if (expRemain < 0){
		expRemain = 0;
	}
	var user = globalUser;
	var ref = firebase.database().ref("users/" + user.uid + "/xpStats");
	var factor = remainingExp / expForLevel;
	if (factor > 1){
		var resultLevel = (currLevel + Math.floor(factor));
		var remainder = Math.abs(expRemain - (factor * expForLevel));
		ref.update({
			level: resultLevel,
			exp: remainder
		}).then(function(){
			UpdateXPBar();
		});
		 

		// handleLevelUp(remainder, expForLevel, resultLevel);
	}else{
		var nextLevel = currLevel + 1;
		firebase.database().ref("users/"+user.uid +"/xpStats").update({
			level: nextLevel,
			exp: expRemain
		}).then(function(){
			UpdateXPBar();
		});
	};
}


function noGarden() {
    $("#moreButton").css({"visibility": "hidden", "display": "none"});
    $("#title").css({"visibility": "hidden", "display": "none"});
    $("#expContainer").css({"visibility": "hidden", "display": "none"});
    var noGarden = $(document.createElement("div")).attr("id", "noGarden");
    $("#pageContainer").append(noGarden);
    var noGardenMsg = $(document.createElement("h3")).attr("id","noGardenMsg");
    $("#noGarden").append(noGardenMsg);
    $("#noGardenMsg").text("Looks like you're new here. Let's get started by creating a garden!").css("font-weight", "bold");
    $('body').css({"background-image": "url('css/img/gridme.png')", "color": "black"});
}