$('#createGardenButton').click(function(){
	$('#createGardenButton').fadeOut("slow",function(){
		var testArray = [
			[1, 2],
			[3, 4],
			[5, 6]
		];
		var description = "A test array";
		firebase.database().ref("users/" + user.uid).update({
			testArray:testArray, 
		});
	});

});