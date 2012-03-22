var lastfm_token;
var session_token;

var song = null;
var artist = null;
var api_key = "62be1c8445c92c28e5b36f548c069f69";
var api_secret = "371780d53d282c42b3e50229df3df313";

console.log('Pandora HTML 5 scrobbler loaded.');

check_for_authentication();

document.addEventListener("DOMSubtreeModified", function (event) {
    //console.log("AJAX event");
    //console.log(event);
    // Check for song update
    if (event.srcElement.className == 'playerBarSong') {
        song = event.srcElement.innerText;
    }

    // Check for artist update
    if (event.srcElement.className == 'playerBarArtist') {
        artist = fix_artist_name(event.srcElement.innerText);
    }

    // Check to see if we have found a valid artist and song, also make sure it wasn't recently found
    if ((song && artist) && (localStorage['existingTrack'] != artist + " - " + song)) {
        console.log("Found: " + artist + " - " + song);
        localStorage['existingTrack'] = artist + " - " + song;

        // Scrobble
        scrobble(artist, song, localStorage["lastfm-session-token"]);

        song = null;
        artist = null;
    } else if ((song && artist) && localStorage['existingTrack'] == artist + " - " + song) {
        // We found a song in progress so don't scrobble it twice
        console.log("Found existing track, skipping");
        song = null;
        artist = null;
    }
});

// fixes the artists name so that it correctly matches the one in last.fm.
// from "Lastname, Name" to "Name Lastname"
function fix_artist_name(name) {
    var artist = name.trim(), parts = artist.split(',');
    // modify only if there is a single comma
    if (parts.length === 2) {
        return parts[1].trim() + ' ' + parts[0].trim();
    }
    return name;
}

function get_authenticated() {
    var method = 'POST';
    var callback = chrome.extension.getURL("authenticate.html");
    var url = 'http://www.last.fm/api/auth/?api_key=' + api_key + "&cb=" + callback;

    javascript: window.open(url);
}


function check_for_authentication() {
    chrome.extension.sendRequest({
        method: "getSession"
    }, function (token) {
        localStorage["lastfm-session-token"] = token;
        console.log("Reieved session: " + token);
    });

    //console.log(token);
    if (!localStorage["lastfm-session-token"]) {
        window.localStorage.removeItem("lastfm-session-token");
        window.localStorage.removeItem("lastfm_token");

        get_authenticated();
        console.log("No authentication token.  Resolving that.");
    } else {
        console.log("Found authentication token.  Moving on.");

        //setInterval("checkForChange()",1000);
        lastfm_token = localStorage["lastfm_token"];
        lastfm_session_token = localStorage["lastfm-session-token"];
    }
}

function scrobble(artist, track, session) {
    console.log("Sending scrobble request");

    chrome.extension.sendRequest({
        method: "scrobbleTrack",
        artist: artist,
        track: track,
        session_token: session
    });

}