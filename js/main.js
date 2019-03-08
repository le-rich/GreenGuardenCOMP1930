
//WHen the create a garden is clicked, fade out and display a garden creator.
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
	var gardenArr = [];
	$(".selected").each(function(){
		gardenArr.push($(this).data("pos"));
	});

	var description = "A test array";
		firebase.database().ref("users/" + "testUser").update({
		testArray:gardenArr
	});
}