$(document).ready(function () {
	getVideoObjects();

	//When the next button is hit, move to the next video in the videoObjects array
	$(".next").on("click", function () {
		videoPosition++;
		addVideoToUI(videoPosition);
		addMetadataToUI(videoPosition);
		$('.prev').prop("disabled", false);
		if (videoPosition == myVideoObjects.length - 2) {
			getMoreVideoObjects();
		}
	});
	$(".prev").on("click", function () {
		videoPosition--;
		addVideoToUI(videoPosition);
		addMetadataToUI(videoPosition);
		if (videoPosition == 0) {
			$('.prev').prop("disabled", true);
		}
	})
});

var videoPosition = 0;
function updateVideoPosition () {
	$(".videoNum").text(videoPosition + 1);
	$(".totalVideos span").text(myVideoObjects.length)
}

//Makes an AJAX call to Instagram and GETs the 20 most recent video objects with #hyperlapse
//Stores these objects in the myVideoObjects array
var myVideoObjects = [];
var callbackURL = "";
function getVideoObjects () {
	$.ajax({
		url: "https://api.instagram.com/v1/tags/hyperlapse/media/recent?count=33&client_id=425a6039c8274956bc10387bba3597e8",
		dataType: "jsonp",
		type: "GET",
	})
	.done(function (result) {
		console.log("success!");
		console.log(result);
		var returnedObjects = result.data;
		for (i = 0; i < returnedObjects.length; i++) {
			if (returnedObjects[i].type == "video") {
				myVideoObjects.push(returnedObjects[i]);
			}
		}
		console.log(myVideoObjects);
		addVideoToUI(0);
		addMetadataToUI(0);
		callbackURL = result.pagination.next_url;
		console.log("callback URL: " + callbackURL);
	})
	.fail(function (error) {
		console.log("failure!");
		console.log(error);
	});
};


//When called, will add more videos to the myVideoObjects array
function getMoreVideoObjects () {
	$.ajax({
		url: callbackURL,
		dataType: "jsonp",
		type: "GET",
	})
	.done(function (result) {
		console.log("success!");
		console.log(result);
		var returnedObjects = result.data;
		for (i = 0; i < returnedObjects.length; i++) {
			if (returnedObjects[i].type == "video") {
				myVideoObjects.push(returnedObjects[i]);
			}
		}
		console.log(myVideoObjects);
		callbackURL = result.pagination.next_url;
		console.log("callback URL: " + callbackURL);
	})
	.fail(function (error) {
		console.log("failure!");
		console.log(error);
	});
}


//When called, adds a new video to the UI, at position i in the myVideoObjects array
function addVideoToUI (i) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log(videoLink);
	$(".video").empty();
	$(".video").append('<video height="100%" width="100%" autoplay controls muted><source src="' + videoLink + '" type="video/mp4"></video>');
};

//When called, adds all the relevant metadata to the UI, at position i in the myVideoObjects array
function addMetadataToUI (i) {
	//adds the video's caption
	var fullCaption = myVideoObjects[i].caption.text;
	var caption = fullCaption.substring(0, 170);
	if (fullCaption.length >= 170) {
		caption += "...";
	}
	$(".caption p").empty();
	$(".caption p").text(caption);

	//adds the username
	var username = myVideoObjects[i].user.username;
	$(".credit").empty();
	$(".credit").html('Taken by <a href="#" target="_blank">@' + username + '</a>');

	//adds a link to the user's profile
	var profileLink = "http://instagram.com/" + username;
	$(".credit a").attr("href", profileLink);

	// adds the unit of time since the video was uploaded
	var unixTime = myVideoObjects[i].created_time * 1000;
	var timeAgo = moment(unixTime).fromNow();
	$(".timestamp").empty();
	$(".timestamp").text(timeAgo);

	//adds the location
	$(".location").empty();
	var position = "";
	if (myVideoObjects[i].location == null) {
		position = null;
	} else {
		var lat = myVideoObjects[i].location.latitude;
		var lng = myVideoObjects[i].location.longitude;
		position = lat + "," + lng;
		console.log(position);
		reverseGeocode(position);
	}

	//adds the video count and total number of videos
	updateVideoPosition();
};

//This function gets called when adding Metadata to the UI, and takes the longitude and latitude
// of a video and converts it to an address: locality, administrative_level_1, country
function reverseGeocode (position) {
	$.ajax({
		url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position,
	}).done(function (result) {
		console.log(result);
		var fullAddress = result.results[0].formatted_address;
		var addressComponents = result.results[0].address_components
		var strippedAddress = "";
		for (i = 0; i < addressComponents.length; i++) {
			if (addressComponents[i].types[0] == "locality" || addressComponents[i].types[0] == "sublocality_level_1") {
				strippedAddress += addressComponents[i].long_name;
			} else if (addressComponents[i].types[0] == "administrative_area_level_1") {
				strippedAddress += ", " + addressComponents[i].long_name;
			} else if (addressComponents[i].types[0] == "country") {
				strippedAddress += ", " + addressComponents[i].long_name;
			}
		}
		$(".location").text(strippedAddress);
	}).fail(function (error) {
		console.log("error!");
		console.log(error);
	})
	
}

// var map = new Datamap({
// 	element: document.getElementById('myMap')
// });










