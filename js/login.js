function loadDone(){
	myVar = setTimeout(showPage, 1200);
}

function showPage(){
	$("#overlayLoad").slideUp("fast");
	$("#allContainer").css({"display": "block"});
}