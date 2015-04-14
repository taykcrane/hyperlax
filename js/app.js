$(document).ready(function () {
	getVideoObjects();
	getPlaylist(405726);
	//When the next button is hit, move to the next video in the videoObjects array
	$(".next").on("click", function () {
		nextVideo();
	});
	$(".pause-play").on("click", function () {
		pauseAndPlay();
	})
	$(".prev").on("click", function () {
		prevVideo();
	})
});

var videoPosition = 0;
function nextVideo () {
	videoPosition++;
	addVideoToUI(videoPosition);
	addMetadataToUI(videoPosition);
	toPauseButton();
	$('.prev').prop("disabled", false);
	if (videoPosition == myVideoObjects.length - 2) {
		getMoreVideoObjects();
	}
}

function prevVideo () {
	videoPosition--;
	addVideoToUI(videoPosition);
	addMetadataToUI(videoPosition);
	toPauseButton();
	if (videoPosition == 0) {
		$('.prev').prop("disabled", true);
	}
}

function pauseAndPlay () {
	if ($("video").get(0).paused) {
		toPauseButton();
		$("video").get(0).play();
	} else {
		toPlayButton();
		$("video").get(0).pause();
	}
}

function toPauseButton () {
	$(".pause-play i").removeClass("fa-play").addClass("fa-pause");
}

function toPlayButton () {
	$(".pause-play i").removeClass("fa-pause").addClass("fa-play");
}

var myMap = new Datamap({
	element: document.getElementById('myMap'),
	height: null,
	fills: {
		defaultFill: "#fff",
		"bubbleFill": "red",
	},
	geographyConfig: {
		popupOnHover: false,
		highlightOnHover: false,
		borderColor: "#000",
	},
	data: {
		"bubbleFill": {fillKey: "bubbleFill"},
	}
})
var myBubble = [];

function initializeContent () {
	addVideoToUI(0);
	addMetadataToUI(0);
	console.log("content initialized");
}

function continuousVideo () {
	var v = document.getElementsByTagName("video")[0];
	console.log('video: ', v);
	v.addEventListener("ended", function() { 
		console.log('Ended listener added');
		nextVideo();
	}, true);
}

//Makes an AJAX call to Instagram and GETs the 20 most recent video objects with #hyperlapse
//Stores these objects in the myVideoObjects array
var myVideoObjects = [];
var callbackURL = "";
function getVideoObjects () {
	$.ajax({
		url: "https://api.instagram.com/v1/tags/hyperlapse/media/recent?client_id=425a6039c8274956bc10387bba3597e8",
		dataType: "jsonp",
		type: "GET",
		data: {
			count: 33
		}
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
		initializeContent();
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
	$(".video").append('<video height="100%" width="100%" autoplay muted><source src="' + videoLink + '" type="video/mp4"></video>');
	continuousVideo();
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
		myBubble = [];
		myMap.bubbles(myBubble);
		$(".location").text("Mystery location!");
	} else {
		var lat = myVideoObjects[i].location.latitude;
		var lng = myVideoObjects[i].location.longitude;
		position = lat + "," + lng;
		console.log(position);
		reverseGeocode(position);
		myBubble = [{
			radius: 10,
			latitude: lat,
			longitude: lng,
			fillKey: "bubbleFill",
			borderColor: "#000",
			borderWidth: 1,
		}];
		myMap.bubbles(myBubble);
	}

	//adds the video count and total number of videos
};

//This function gets called when adding Metadata to the UI, and takes the longitude and latitude
// of a video and converts it to an address: locality, administrative_level_1, country
function reverseGeocode (position) {
	loadGoogleResults(position, function (result) {
		console.log(result);
		$(".location").text(getAddressString(result));
	});
}

function getAddressString (result) {
	var fullAddress = result.results[0].formatted_address;
	var addressParts = [];
	addressParts.push(getResultEntryOfType(result, "locality"));
	addressParts.push(getResultEntryOfType(result, "sublocality_level_1"));
	addressParts.push(getResultEntryOfType(result, "administrative_area_level_1"));
	addressParts.push(getResultEntryOfType(result, "country"));
	addressParts = _.compact(addressParts);
	var strippedAddress = addressParts.join(", ");
	return strippedAddress;
}

function loadGoogleResults (position, callback) {
	$.ajax({url: "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position})
	 .done(callback)
	 .fail(function (error) {
		console.log("error!");
		console.log(error);
	});
}

function getResultEntryOfType (result, type) {
	var addressComponents = result.results[0].address_components;
	for (i = 0; i < addressComponents.length; i++) {
		if (addressComponents[i].types[0] == type) {
			return addressComponents[i].long_name;
		}
	}
}

//SOUNDCLOUD API
// 405726
var soundcloudTracks = [];
function getPlaylist (playlistID, callback) {
	$.ajax({
		url: "http://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=0e790e28fcdf924f78f80375ad74fcb8",
		dataType: "jsonp",
		type: "GET",
	})
	.done(function (result) {
		console.log(result);
		soundcloudTracks = result.tracks;
		initializePlaylist();
	})
	.fail(function (error) {
		console.log("error: " + error);
	})
}

// function initializePlaylist () {
// 	SC.initialize({
// 	  client_id: '0e790e28fcdf924f78f80375ad74fcb8'
// 	});
// 	SC.stream("/tracks/" + soundcloudTracks[0].id, function (sound) {
// 		sound.play();
// 	})
// }









