//Change Title Bar to User Name's Garden
firebase.auth().onAuthStateChanged(function(user){
    var ref = firebase.database().ref("users/" + user.uid);
    ref.on("value", function(snap) {
		//use stringify to convert JSON value to printable string
		var stringName = JSON.stringify(snap.val().name);
        stringName = stringName.substring(1, stringName.length -1);

        var userName = document.getElementById("title");
        userName.innerHTML =  stringName+ "'s Garden";
    });
});


//When the create a garden is clicked, fade out and display a garden creator.
$('#createGardenButton').click(function(){
	$('#createGardenButton').fadeOut("slow",function(){
		$("#contentRow").css({"visibility": "visible", "display": "flex"});
		buildCreateAGarden();
	});
});


//Creates a 5 x 5 Garden Grid
//TODO: Make this accept arbitrary sized array.
function buildCreateAGarden(){
	for (var x = 0; x < 5; x++){
		var newRow = "<div id=" + "row" + (x + 1) + " class=\"btn-group\">";
		$("#btn-container").append(newRow);
		var appendedRow = $("#row" + (x + 1));
		for (var y = 0; y < 5; y++){
			var newButton = "<button class=\"gardenBtn\" data-pos=\"[" + y + "," + x +"]\">1</button>"
			$("#row" + (x + 1)).append(newButton);
		}
	}

	//When a garden Button is clicked, add the class selected to that button.
	$('.gardenBtn').click(function(){
		$(this).toggleClass("selected");
	});
}


$('#doneBtn').click(function(){
	buildGrid();
});


function buildGrid(){
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			var gardenArr = [];
			$(".selected").each(function(){
				gardenArr.push($(this).data("pos"));
			});
			var created = true;
			firebase.database().ref("users/"+user.uid).update({
				gardenGrid:gardenArr,
				gardenCreated: created
			});
		}
	});

  $("#contentRow").fadeOut("fast", function(){
    //Things after fadeout.
    $("#gardenRow").css({"visibility": "visible", "display": "flex"});
  });
}
