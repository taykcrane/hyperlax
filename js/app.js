$(document).ready(function () {
	//Determines if browser is unsupported
	testBrowsers();

	//Sets up the videos and the music, respectively
	getVideoObjects();
	getPlaylist(9875415, true);
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

	//When user hovers over the video, display the location
	$(".video-box").on("mouseenter", function () {
		locationTextMouseEnter();
	})

	$(".video-box").on("mouseleave", function () {
		locationTextMouseLeave();
	})	

	//music controls
	$(".music-pause-play").on("click", function () {
		musicPauseAndPlay();
	})
	$(".music-next").on("click", function () {
		scNextStream();
	})

	//Toggles mute when the mute button is hit. Also adds the mute class to the button, which gets evaluated every time a new song loads
	$(".volume").on("click", function () {
		toggleMute();
	})

	//When a nav button is clicked, animate the appropriate page down
	$(".nav-items li").on("click", function () {
		selectedNav($(this));
		activePage($(this));
		animatePageDown($(this));
	})
	//Sets the home page to already be displayed (skipping the animation)
	$(".active-page .content-animation").css("top", "0%");

	//When the location nav is clicked for the first time, add the Map to the UI
	// and then, with a callback function, update the location
	$(".location-nav").one("click", function () {
		addMapToUI(videoPosition, function () {
			hasMapsBeenCalled = true;
			updatesLocationText(videoPosition);
			updatesLocationMap(videoPosition);
		});
		//Will truncate the caption text to a maximum of 3 lines
		$('.caption p').trunk8({
			lines: 3
		});
	})

	//When the HIT ME button is clicked, the video and music begins
	$(".hit-me").on("click", function () {
		$(".video-box").css("pointer-events", "all");
		$(".music-pause-play").css("pointer-events", "all");
		$(".music-next").css("pointer-events", "all");
		pauseAndPlay();
		musicPauseAndPlay();
		$(".start").fadeOut(1000, function () {
			$(".dark-mode").fadeIn(1000);
			$(".social-share").fadeIn(1000);
		});
		$(".start").css("pointer-events", "none");
		$(".location-nav, .music-nav, .about-nav").css("color", "inherit");
		$(".location-nav, .music-nav, .about-nav").css("pointer-events", "all");
	});

	//When the "play without music?" link is clicked, only play the video
	$(".start p span").on("click", function () {
		$(".video-box").css("pointer-events", "all");
		$(".music-pause-play").css("pointer-events", "all");
		$(".music-next").css("pointer-events", "all");
		pauseAndPlay();
		$(".start").fadeOut(1000, function () {
			$(".dark-mode").fadeIn(1000);
			$(".social-share").fadeIn(1000);
		});
		$(".start").css("pointer-events", "none");
		$(".location-nav, .music-nav, .about-nav").css("color", "inherit");
		$(".location-nav, .music-nav, .about-nav").css("pointer-events", "all");
	});

	//When the social share buttons are hovered over,
	//change the text of the CTA
	// $(".social-popup").on("mouseenter mouseleave", function () {
	// 	$(".social-share p").text("this is a test");
	// 	console.log("hover enabled");
	// })

	//When dark mode is clicked, hide the flexitem (content)
	$(".dark-mode i").on("click", function () {
		toggleDarkMode();
	})

	$(".lightbulb").on("click", function () {
		toggleDarkMode();
	})

	//When the expand button is clicked, asks user if app can enter fullscreen
	$(".expand").on("click", function () {
		toggleFullscreen();
	})

	//When the location toggle is turned off, stop displaying the location on top of the video
	$(".onoffswitch-label").on("click", function () {
		$(".location-overlay").toggle();
	})

	//Makes sure that if ESC key is hit to exit fullscreen, everything behaves as expected
	//Also does the same for the windows F11 key
	$(document).keyup(function (e) {
		var keycodeEsc = 27;
		var keycodeF11 = 122;
		if (e.keyCode == keycodeEsc || e.keyCode == keycodeF11) {
			console.log("esc key was hit");
			collapseVideo();
		}
	})

	document.addEventListener("mozfullscreenchange", function () {
	    if (document.mozFullScreen) {
	    	console.log("firefox entered fullscreen mode");
	    } else {
	    	collapseVideo();
	    	console.log("firefox exited fullscreen mode");
	    }
	}, false);

	document.addEventListener("webkitfullscreenchange", function () {
	    if (document.webkitIsFullScreen) {
	    	console.log("chrome entered fullscreen mode");
	    } else {
	    	collapseVideo();
	    	console.log("chrome exited fullscreen mode");
	    }
	}, false);

	document.addEventListener("msfullscreenchange", function () {
	    if (document.msFullscreenElement) {
	    	console.log("MS entered fullscreen mode");
	    } else {
	    	collapseVideo();
	    	console.log("MS exited fullscreen mode");
	    }
	}, false);

	//Will get the playlist ID from the playlist that was clicked in the UI and begin
	//playing the new playlist
	$(".playlist-choices li").on("click", function () {
		var chosenPlaylist = $(this).attr("id");
		switchPlaylist(chosenPlaylist);
		$(".playlist-choices .selected").removeClass("selected");
		$(this).addClass("selected");
	})

	//Will truncate the caption text to a maximum of 3 lines
	$('.caption p').trunk8({
		lines: 3
	});

	//When a share icon is clicked, open the appropriate share box
	$(".social-popup").on("click", function(e) {
	  	e.preventDefault();
		socialPopup($(this).attr("href"), 570, 612);
	})

	//Every 100ms, check to see if the songs and videos have finished loading so play can begin
	var intervalID = setInterval(function () {
		if (videosLoaded & songsLoaded) {
			console.log("videos and songs loaded!");
			clearInterval(intervalID);
			$(".spinner-container").fadeOut(500, function () {
				$(".start").fadeIn(500);
			})
		} else {
			// console.log("videos and songs not loaded");
		}
	}, 100);

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
	updatesLocationText(videoPosition);
	updatesLocationMap(videoPosition);
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
	updatesLocationText(videoPosition);
	updatesLocationMap(videoPosition);
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
		console.log("video is playing!");
	} else {
		toPlayButton();
		$(".video-active video").get(0).pause();
		console.log("video has been paused!");
	}
}

function toPauseButton () {
	$(".pause-play i").removeClass("fa-play").addClass("fa-pause");
}

function toPlayButton () {
	$(".pause-play i").removeClass("fa-pause").addClass("fa-play");
}


function expandVideo () {
	$(".video-box").css("margin", "0 auto");
	$(".video-box").css("left", "0");
	$(".lightbulb").css("pointer-events", "none");
	var elem = document.getElementById("vid-expand");
	if (elem.requestFullscreen) {
	elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) {
	elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
	elem.webkitRequestFullscreen();
	}
}

function collapseVideo () {
  $(".video-box").css("margin", "0");
  $(".lightbulb").css("pointer-events", "all");
  if (isDarkMode) {
  	toggleDarkMode();
  }
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

function toggleFullscreen () {
	if (
	    document.fullscreenElement ||
    	document.webkitFullscreenElement ||
    	document.mozFullScreenElement ||
    	document.msFullscreenElement
	) {
		collapseVideo();
	} else {
		expandVideo();
	}
}

//Adds the video to the UI, all the metadata, etc.
//Also pauses the first video via a callback function
var videosLoaded = false;
function initializeContent () {
	addVideoToUI(0, true);
	addMetadataToUI(0);
	updatesLocationText(0);
	addHiddenVideo(1);
	// sets videosLoaded to true, once the video is ready to be played
	videosLoaded = true;
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
		var returnedObjects = result.data;
		for (i = 0; i < returnedObjects.length; i++) {
			if (returnedObjects[i].type == "video") {
				myVideoObjects.push(returnedObjects[i]);
			}
		}
		console.log(myVideoObjects);
		initializeContent();
		callbackURL = result.pagination.next_url;
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
function addVideoToUI (i, onFirstVideoLoad) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log(videoLink);
	$(".video-active").empty();
	$(".video-active").append('<video height="100%" width="100%" autoplay muted><source src="' + videoLink + '" type="video/mp4"><p>this is a fallback message</p></video>');
	$(".video-active").after("<div class='video-bg'></div>")
	continuousVideo();
	if (onFirstVideoLoad) {
		$(".video-active video").one("play", function () {
			pauseAndPlay();
		})
	}
};

//Adds the next video to the UI but hidden behind the active video
function addHiddenVideo (i) {
	var videoLink = myVideoObjects[i].videos.standard_resolution.url;
	console.log("hidden video link: " + videoLink);
	$(".video-box").append('<div class="video-hidden"><video height="100%" width="100%" muted preload="auto"><source src="' + videoLink + '" type="video/mp4"></video></div>')
}

//Switches hidden video to active video and gets rid of the current active video
function switchHiddenToActive () {
	$(".video-active").hide();
	$(".video-bg").remove();
	$(".video-hidden video").get(0).play();
	$('.video-active').remove();
	$(".video-hidden").removeClass("video-hidden").addClass("video-active");
	$(".video-active").after("<div class='video-bg'></div>")
	continuousVideo();
}

//When called, adds all the relevant metadata to the UI, at position i in the myVideoObjects array
function addMetadataToUI (i) {
	//adds the video's caption and truncates to max 3 lines
	var caption = "";
	if (myVideoObjects[i].caption) {
		caption = myVideoObjects[i].caption.text;
	}
	$('.caption p').trunk8('update', caption);

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
//This variable allows the updatesLocationMap function to run only
//after the map has been loaded.
var hasMapsBeenCalled = false;
function addMapToUI (i, callback) {
	myMap = new Datamap({
		element: document.getElementById('myMap'),
		height: null,
		fills: {
			defaultFill: "#999",
			"bubbleFill": "#009fc7",
		},
		geographyConfig: {
			popupOnHover: false,
			highlightOnHover: false,
			borderColor: "#111",
		},
		data: {
			"bubbleFill": {fillKey: "bubbleFill"},
		},
		bubblesConfig: {
			borderWidth: 1,
        	borderColor: '#020F12',
        	popupOnHover: false,
        	fillOpacity: 0.75,
        	highlightOnHover: false,
        	highlightFillColor: '#020F12',
		}
	})
	callback();
}

//This function updates the map bubble and the location text
var geoPosition = "";
var lat;
var lng;
function updatesLocationText (i) {
	$(".location-overlay").finish();
	$(".location-overlay").css("opacity", "1");
	if (myVideoObjects[i].location == null || myVideoObjects[i].location.latitude == undefined || myVideoObjects[i].location.longitude == undefined) {
		geoPosition = null;
		$(".location-text").text("Mystery location!");
		$(".location-overlay").empty();
	} else {
		lat = myVideoObjects[i].location.latitude;
		lng = myVideoObjects[i].location.longitude;
		geoPosition = lat + "," + lng;
		console.log(geoPosition);
		reverseGeocode(geoPosition);
	}
	setTimeout(function () {
		$(".location-overlay").animate({
			"opacity": "0"
		}, 3000)
	}, 2000);
}

function updatesLocationMap (i) {
	if (hasMapsBeenCalled) {
		if (geoPosition === null) {
			myBubble = [];
			myMap.bubbles(myBubble);
		} else {
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

//When called, below two functions show or hide the location text overlayed
// on top of the video
function locationTextMouseEnter () {
	$(".location-overlay").stop();
	$(".location-overlay").animate({
		"opacity": "1"
	}, 150);
}

function locationTextMouseLeave () {
	$(".location-overlay").stop();
	$(".location-overlay").animate({
		"opacity": "0"
	}, 150);
}

//This function gets called when adding Metadata to the UI, and takes the longitude and latitude
// of a video and converts it to an address: locality, administrative_level_1, country
function reverseGeocode (position) {
	$(".location-text").empty();
	$(".location-overlay").empty();
	loadGoogleResults(position, function (result) {
		console.log(result);
		$(".location-text").text(getAddressString(result));
		$(".location-overlay").append('<p class="location-overlay-text">' + getAddressString(result) + '</p>')
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
function getPlaylist (playlistID, onFirstMusicLoad) {
	$.ajax({
		url: "http://api.soundcloud.com/playlists/" + playlistID + ".json?client_id=0e790e28fcdf924f78f80375ad74fcb8",
		dataType: "json",
		type: "GET",
	})
	.done(function (result) {
		console.log(result);
		soundcloudTracks = result.tracks;
		shuffle(soundcloudTracks);
		initializePlaylist(onFirstMusicLoad);
	})
	.fail(function (error) {
		console.log("error: " + error);
	})
}

function shuffle (o) {
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var songsLoaded = false;
function scStream (songPosition, onFirstMusicLoad) {
	SC.stream("/tracks/" + soundcloudTracks[songPosition].id, function (sound) {
		currentSound = sound;
		checkMute(); //checks to see if the music has already been muted
		currentSound.play({
			onfinish: function () {
				scNextStream();
			}
		});
		if (onFirstMusicLoad) {
			musicPauseAndPlay();
		}
		// sets songsLoaded to true once the song is ready to play
		songsLoaded = true;
	})
}

function scStopStream () {
	currentSound.stop();
}

function scTogglePause () {
	// currentSound.togglePause();
	currentSound.pause();
}

function musicPauseAndPlay () {
	if (currentSound.getState() == "paused") {
		currentSound.play();
		toMusicPauseButton();
		//uses Pause JS library to resume the songProgress animation
		$(".music-text-bg").resume();
	} else if (currentSound.getState() == "playing") {
		currentSound.pause();
		toMusicPlayButton();
		//uses Pause JS library to pause the songProgress animation
		$(".music-text-bg").pause();
	} else if (currentSound.getState() == "loading") {
		console.log("still fucking loading");
		setTimeout(function () {
			musicPauseAndPlay();
		}, 10)
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

function initializePlaylist (onFirstMusicLoad) {
	SC.initialize({
	  client_id: '0e790e28fcdf924f78f80375ad74fcb8'
	});
	scStream(0, onFirstMusicLoad);
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
	// currentSound.toggleMute();
	if (currentSound.getVolume() == 0) {
		currentSound.setVolume(1);
	} else {
		currentSound.setVolume(0);
	}
	$(".volume").toggleClass("muted");
	if ($(".volume i").hasClass("fa-volume-up")) {
		$(".volume i").removeClass("fa-volume-up").addClass("fa-volume-off");
	} else {
		$(".volume i").removeClass("fa-volume-off").addClass("fa-volume-up");
	}
	console.log("toggleMute executed");
}

function checkMute () {
	var volumeButton = $(".volume")
	if (volumeButton.hasClass("muted")) {
		currentSound.setVolume(0);
	}
}

//This function will switch the playlist to the one selected in the UI
function switchPlaylist (playlistID) {
	scStopStream();
	getPlaylist(playlistID);
	toMusicPauseButton();
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
		"top": "0%"
	}, 500, "easeOutCirc");
}

//Toggles the .flexitem when the lightbulb control is clicked
var isDarkMode = false;
function toggleDarkMode () {
	var halfWindowWith = $(window).width() / 2;
	var halfVideoWidth = $(".video-box").width() / 2;
	if (isDarkMode) {
		$(".video-box").animate({
			left: 0
		}, 300, function () {
			//because the stupid callback function isn't working properly
			setTimeout(function () {
				$(".flexitem").toggle("300");
				console.log("animation has finished");
			}, 300)
		})
		console.log("animation has started");
		isDarkMode = false;
	} else {
		$(".flexitem").toggle("300", function () {
			$(".video-box").animate({
				left: halfWindowWith - halfVideoWidth
			}, 300)
		});
		isDarkMode = true;
	}
}

function testBrowsers () {
	if ((bowser.msie && bowser.version < 11) || 
		(bowser.chrome && bowser.version < 32) || 
		(bowser.firefox && bowser.version < 35) ||
		(bowser.mobile) ||
		(bowser.tablet)) {
	  console.log("this is a non-supported device or browser");
	$(".overlay").toggle();
	} else {
		console.log("this IS supported");
	}
}

function socialPopup (url, width, height) {
	var left = (screen.width / 2) - (width / 2),
		top = (screen.height / 2) - (height / 2);
	
	window.open(
	    url,
	    "",
    	"menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left
  	);
}











