$(document).ready(function () {
	getVideoObjects();
});

//Makes an AJAX call to Instagram and GETs the 20 most recent video objects with #hyperlapse
//Stores these objects in the myVideoObjects array
var myVideoObjects = [];
function getVideoObjects () {
	$.ajax({
		url: "https://api.instagram.com/v1/tags/hyperlapse/media/recent?client_id=425a6039c8274956bc10387bba3597e8",
		dataType: "jsonp",
		type: "GET",
	})
	.done(function (result) {
		console.log("success!");
		console.log(result);
		myVideoObjects = result.data;
		console.log(myVideoObjects);
		addVideoToUI(0);
		addMetadataToUI(0);
	})
	.fail(function (error) {
		console.log("failure!");
		console.log(error);
	});
};


//When called, adds a new video to the UI, at position i in the myVideoObjects array
function addVideoToUI (i) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log(videoLink);
	$(".video").empty();
	$(".video").append('<video height="640" width="640" autoplay controls><source src="' + videoLink + '" type="video/mp4"></video>');
};

//When called, adds all the relevant metadata to the UI, at position i in the myVideoObjects array
function addMetadataToUI (i) {
	var caption = myVideoObjects[i].caption.text;
	console.log("caption: " + caption);
	$(".caption").text(caption);

	var username = myVideoObjects[i].user.username;
	$(".credit a").text("@" + username);

	var profileLink = "http://instagram.com/" + username;
	$(".credit a").attr("href", profileLink);

	var unixTime = myVideoObjects[i].created_time * 1000;
	var timeAgo = moment(unixTime).fromNow();
	$(".timestamp").text(timeAgo);
};















