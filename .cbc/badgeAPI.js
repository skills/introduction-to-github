var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var computingBootCampId = '0YOSWoQPQO-ehX8P3o7ZFw';
var githubBadgeEntityID = 'MnrvOXV8QpC2VOYcgVTOlQ';

//Program starts here
var username = process.argv[2];
var password = process.argv[3];
var userEmail = process.argv[4];

//Check to make sure there are contents for each arguments
if (username.localeCompare('') == 0 || password.localeCompare('') == 0 || userEmail.localeCompare('') == 0) {
    throw "Error: Missing argument";
}

var accessToken = getAuthenticationToken(username, password);
issueAssertionToTestUser(computingBootCampId, githubBadgeEntityID, userEmail, accessToken);


//This function can be used to get an authentication token to make requests with the server for the Computing Boot Camp
function getAuthenticationToken(username, password) {
    var url = "https://api.badgr.io/o/token";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    var data = "username=" + username + "&password=" + password;

    xhr.send(data);

    if (xhr.status != 200) {
        throw "Error: Invalid Credentials for the BYU Computing BootCamp - Please contact the BYU Computing BootCamp \
through the Support section on the README.md for help"
    }
    var accessToken = JSON.parse(xhr.responseText).access_token;
    return accessToken;
}

//This function uses a refresh Token to make a certain authToken reusable again to make requests with the server.
//If you have a refresh token but not the corresponding authToken that goes with it, you'll have to get a new
//authentication token.
function refreshStoredAuthToken() {
    var url = "https://api.badgr.io/o/token";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    var data = "grant_type=refresh_token&refresh_token=" + refreshToken;

    xhr.send(data);
    return JSON.parse(xhr.responseText);
}

//This function will take an authToken and get the issuerInformation tied to that account
function getIssuerInformation(authToken) {
    var url = "https://api.badgr.io/v2/issuers";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);

    xhr.setRequestHeader("Authorization", "Bearer " + authToken);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    xhr.send();

    return JSON.parse(xhr.responseText);
}

//This function will take an authToken and issuerID and return the badgeClass information for that Issuer
function getBadgeClassInformation(issuerEntityID) {
    var url = "https://api.badgr.io/v2/issuers/" + issuerEntityID + "/badgeclasses";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);

    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    xhr.send();

    return JSON.parse(xhr.responseText);
}

//This function will take an authToken, issuerId and badgeID and issue a badge to the person with the information provided.
function issueAssertionToTestUser(issuerEntityID, badgeEntityID, userEmail, accessToken) { //Assertion is another name for Badge
    //Issue the Assertion that we want to
    var url = "https://api.badgr.io/v2/issuers/" + issuerEntityID + "/assertions";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, false);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }
    };

    var data = {
        "badgeclass": badgeEntityID,
        "recipient": {
            "identity": userEmail,
            "hashed": false,
            "type": "email",
        },
        "notify": true,
    };
    var dataString = JSON.stringify(data);

    xhr.send(dataString);

    if (xhr.status != 201) throw "Error: Invalid Email Address - Please put a valid email address into email.txt on your \
Forked Repository";
    else console.log("Success! github Badge has been issued to" + userEmail);
    //return JSON.parse(xhr.responseText);
}