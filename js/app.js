$(document).ready(function () {
	getVideoObjects();
	getPlaylist(9875415);
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

	//music controls
	$(".music-pause-play").on("click", function () {
		musicPauseAndPlay();
	})
	$(".music-next").on("click", function () {
		scNextStream();
	})

	//adds padding to the map after the map finishes loading and gets its stupid dimensions
	$("#myMap").css("padding", "1%");

	//Toggles mute when the mute button is hit. Also adds the mute class to the button, which gets evaluated every time a new song loads
	$(".volume").on("click", function () {
		toggleMute();
	})

	$(".nav-items li").on("click", function () {
		selectedNav($(this));
		activePage($(this));
		animatePageDown($(this));
	})

	//When the location nav is clicked for the first time, add the Map to the UI
	// and then, with a callback function, update the location
	$(".location-nav").one("click", function () {
		addMapToUI(videoPosition, function () {
			hasMapsBeenCalled = true;
			updatesLocation(videoPosition);
		});
	})

	//every 5 minutes will pull any new instagram videos and push them to myVideoObjects array
	setInterval(function () {
		getNewestVideoObjects();
	}, 300000);
});

var videoPosition = 0;
function nextVideo () {
	videoPosition++;
	// addVideoToUI(videoPosition);
	addMetadataToUI(videoPosition);
	updatesLocation(videoPosition);
	switchHiddenToActive();
	addHiddenVideo(videoPosition + 1);
	toPauseButton();
	$('.prev').css("pointer-events", "auto");
	if (videoPosition == myVideoObjects.length - 2) {
		getMoreVideoObjects();
	}
}

function prevVideo () {
	videoPosition--;
	addVideoToUI(videoPosition);
	addMetadataToUI(videoPosition);
	updatesLocation(videoPosition);
	$(".video-hidden").remove();
	addHiddenVideo(videoPosition + 1);
	toPauseButton();
	if (videoPosition == 0) {
		$('.prev').css("pointer-events", "none");
	}
}

function pauseAndPlay () {
	if ($(".video-active video").get(0).paused) {
		toPauseButton();
		$(".video-active video").get(0).play();
	} else {
		toPlayButton();
		$("video").get(0).pause();
	}
}

function insertHiddenVideo () {
	$(".video-active").hide();
	$(".video-hidden").show();
	$(".video-hidden video").get(0).play();
	$('.video-active').remove();
	$(".video-hidden").removeClass(".video-hidden").addClass(".video-active");
}

function toPauseButton () {
	$(".pause-play i").removeClass("fa-play").addClass("fa-pause");
}

function toPlayButton () {
	$(".pause-play i").removeClass("fa-pause").addClass("fa-play");
}

function initializeContent () {
	addVideoToUI(0);
	addMetadataToUI(0);
	addHiddenVideo(1);
	console.log("content initialized");
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

//when called in the setInterval, will get the newest instagram videos and check for any new ones
// Then, will push the new ones to the array
function getNewestVideoObjects () {
	$.ajax({
		url: "https://api.instagram.com/v1/tags/hyperlapse/media/recent?client_id=425a6039c8274956bc10387bba3597e8",
		dataType: "jsonp",
		type: "GET",
		data: {
			count: 33
		}
	})
	.done(function (result) {
		var returnedObjects = result.data;
		var videosToCompare = [];
		for (i = 0; i < returnedObjects.length; i++) {
			if (returnedObjects[i].type == "video") {
				videosToCompare.push(returnedObjects[i]);
			}
		}
		var newestVideos = comparesVideoArrays(videosToCompare, myVideoObjects);
		console.log("newestVideos: ");
		console.log(newestVideos);
		console.log("newestVideos length is: " + newestVideos.length);
		insertNewVideos(newestVideos);
	})
	.fail(function (error) {
		console.log("failure!");
		console.log(error);
	});
}

//given two arrays, it grabs the IDs from each array, compares them for uniques,
// and then returns a new array of just the new video objects
function comparesVideoArrays (newArray, mainArray) {
	var newArrayIDs = getVideoIDs(newArray);
	var mainArrayIDs = getVideoIDs(mainArray);
	var uniqueIDs = _.difference(newArrayIDs, mainArrayIDs);
	var uniqueVideos = [];
	for (i = 0; i < uniqueIDs.length; i++) {
		for (j = 0; j < newArray.length; j++) {
			if (uniqueIDs[i] == newArray[j].id) {
				uniqueVideos.push(newArray[j]);
			}
		}
	}
	return uniqueVideos;
}

//given an array a video objects, create a new array of just the video IDs for comparison
function getVideoIDs (videoArray) {
	var idArray = [];
	for (i = 0; i < videoArray.length; i++) {
		var id = videoArray[i].id;
		idArray.push(id);
	}
	return idArray;
}

//inserts newest videos a few postitions after the user's current videoPosition
function insertNewVideos (newestVideos) {
	console.log("myVideoObjects length before:" + myVideoObjects.length)
	// just a couple positions after the current video to avoid any weird bugs
	var insertPosition = videoPosition + 2;
	if (newestVideos.length > 0) {
		for (i = 0; i < newestVideos.length; i++) {
			myVideoObjects.splice(insertPosition, 0, newestVideos[i]);
			insertPosition++;
		}
	}
	console.log("myVideoObjects length after:" + myVideoObjects.length)
}

function continuousVideo () {
	// var v = document.getElementById('video-active').getElementsByTagName("video")[0];
	var v = document.querySelector(".video-active video");
	v.addEventListener("ended", function() { 
		console.log('Ended listener added');
		nextVideo();
	}, true);
}

//When called, adds a new video to the UI, at position i in the myVideoObjects array
function addVideoToUI (i) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log(videoLink);
	$(".video-active").empty();
	$(".video-active").append('<video height="100%" width="100%" autoplay muted><source src="' + videoLink + '" type="video/mp4"></video>');
	continuousVideo();
};

//Adds the next video to the UI but hidden behind the active video
function addHiddenVideo (i) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log("hidden video link: " + videoLink);
	$(".video-box").append('<div class="video-hidden"><video height="100%" width="100%" muted><source src="' + videoLink + '" type="video/mp4"></video></div>')
}

//Switches hidden video to active video and gets rid of the current active video
function switchHiddenToActive () {
	$(".video-active").hide();
	$(".video-hidden").show();
	$(".video-hidden video").get(0).play();
	$('.video-active').remove();
	$(".video-hidden").removeClass("video-hidden").addClass("video-active");
	continuousVideo();
}

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
};

//This function adds the map and location to the UI
//It gets called the first time the location tab is clicked
var myBubble = [];
var myMap;
//This variable allows the updatesLocation function to run only
//after the map has been loaded.
var hasMapsBeenCalled = false;
function addMapToUI (i, callback) {
	myMap = new Datamap({
		element: document.getElementById('myMap'),
		height: null,
		fills: {
			defaultFill: "#999",
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
	console.log("map added to UI!");
	callback();
}

//This function updates the map bubble and the location text
function updatesLocation (i) {
	if (hasMapsBeenCalled) {
		$(".location-text").empty();
		var position = "";
		if (myVideoObjects[i].location == null) {
			position = null;
			myBubble = [];
			myMap.bubbles(myBubble);
			$(".location-text").text("Mystery location!");
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
	}
}

//This function gets called when adding Metadata to the UI, and takes the longitude and latitude
// of a video and converts it to an address: locality, administrative_level_1, country
function reverseGeocode (position) {
	loadGoogleResults(position, function (result) {
		console.log(result);
		$(".location-text").text(getAddressString(result));
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
// 9875415
var soundcloudTracks = [];
var currentSound = "";
var songPosition = 0;
function getPlaylist (playlistID) {
	$.ajax({
		url: "http://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=0e790e28fcdf924f78f80375ad74fcb8",
		dataType: "json",
		type: "GET",
	})
	.done(function (result) {
		console.log(result);
		soundcloudTracks = result.tracks;
		shuffle(soundcloudTracks);
		initializePlaylist();
	})
	.fail(function (error) {
		console.log("error: " + error);
	})
}

function shuffle (o) {
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function scStream (songPosition) {
	SC.stream("/tracks/" + soundcloudTracks[songPosition].id, function (sound) {
		currentSound = sound;
		checkMute();
		currentSound.play({
			onfinish: function () {
				scNextStream();
			}
		});
	})
}

function scStopStream () {
	currentSound.stop();
}

function scTogglePause () {
	currentSound.togglePause();
}

function musicPauseAndPlay () {
	if (currentSound.paused) {
		scTogglePause();
		toMusicPauseButton();
		//uses Pause JS library to resume the songProgress animation
		$(".music-text-bg").resume();
	} else {
		scTogglePause();
		toMusicPlayButton();
		//uses Pause JS library to pause the songProgress animation
		$(".music-text-bg").pause();
	}
}

function toMusicPauseButton () {
	$(".music-pause-play i").removeClass("fa-play").addClass("fa-pause");
}

function toMusicPlayButton () {
	$(".music-pause-play i").removeClass("fa-pause").addClass("fa-play");
}

function scNextStream () {
	if (songPosition < soundcloudTracks.length - 1) {
		scStopStream();
		songPosition++;
		scStream(songPosition);
		addSongMetadataToUI(songPosition);
		toMusicPauseButton();
	} else {
		scStopStream();
		songPosition = 0;
		scStream(songPosition);
		addSongMetadataToUI(songPosition);
		toMusicPauseButton();
	}
}

function initializePlaylist () {
	SC.initialize({
	  client_id: '0e790e28fcdf924f78f80375ad74fcb8'
	});
	scStream(0);
	addSongMetadataToUI(0);
}

function addSongMetadataToUI (i) {
	var songTitle = soundcloudTracks[i].title;
	$(".title").text(songTitle);

	var uploader = soundcloudTracks[i].user.username;
	$(".uploader").text("Uploaded by: " + uploader);

	var sourceLink = soundcloudTracks[i].permalink_url;
	$(".sc-logo").attr("href", sourceLink);


	// Resets the songProgress bar
	$(".music-text-bg").finish();
	$(".music-text-bg").css("background-position", "100% 0%");
	// Calls the songProgress method to start tracking progress
	songProgress(i);
}

function songProgress (i) {
	var songTime = soundcloudTracks[i].duration; //time in milliseconds
	$(".music-text-bg").animate({
		"background-position": "0%"
	}, songTime, "linear");
}

function toggleMute () {
	currentSound.toggleMute();
	$(".volume").toggleClass("muted");
	if ($(".volume i").hasClass("fa-volume-up")) {
		$(".volume i").removeClass("fa-volume-up").addClass("fa-volume-off");
	} else {
		$(".volume i").removeClass("fa-volume-off").addClass("fa-volume-up");
	}
}

function checkMute () {
	var volumeButton = $(".volume")
	if (volumeButton.hasClass("muted")) {
		currentSound.mute();
	}
}



//A bunch of functions related to the UI

//This function adds a class "selected" to the nav tab that has been selected
function selectedNav (navClicked) {
	$(".nav-items .selected").removeClass("selected");
	$(navClicked).addClass("selected");
}

//This funtion returns the pageClass for a given nav element that was clicked
function navToPageClass (navClicked) {
	var pageClass = "";
	if (navClicked.hasClass("home-nav")) {
		pageClass = ".home-page";
		console.log("home-nav was selected");
	} else if (navClicked.hasClass("location-nav")) {
		pageClass = ".location-page";
		console.log("location-nav was selected");
	} else if (navClicked.hasClass("music-nav")) {
		pageClass = ".music-page";
		console.log("music-nav was selected");
	} else if (navClicked.hasClass("about-nav")) {
		pageClass = ".about-page";
		console.log("about-nav was selected");
	}
	return pageClass;
}

//this function displays the correct page that was selected in the nav by toggling
//the active-page class

function activePage (navClicked) {
	var pageClass = navToPageClass(navClicked);
	// This resets the work done by the animatePageDown() function
	$(".active-page .content-animation").css("top", "-100%");

	$(".active-page").removeClass("active-page");
	$(pageClass).addClass("active-page");
}

//When called, slides the content from a tab into view. Within the activePage function,
//The slide gets reset to the top
function animatePageDown (navClicked) {
	var pageClass = navToPageClass(navClicked);
	$(pageClass + " .content-animation").animate({
		"top": "0"
	}, 1000, "easeOutBounce");
}
