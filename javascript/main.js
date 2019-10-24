var latitude;
var longitude;
var townName;
//an array to store the towns searched
var listTown = new Array();

//set up leafleat map
var mymap = L.map('mapid').setView([-37.787621, 175.281319], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    //enter access token
    accessToken: ''
}).addTo(mymap);

//get the town user entered
function getTownName() {
	var flag = true;
	var townObj;
	
	//if the input is empty
	if (document.getElementById('townName').value == "")
	{
		alert("Please enter a town.");
		return;
	}
	else
	{
		//get the input
		townName = document.getElementById('townName').value;
	}
	//check if the town user entered is already in the array
	for (var town of listTown)
	{
		if (town.getName().toLowerCase() == townName.toLowerCase())
		{
			//if the town is in the array, set the flag to false
			flag = false;
			townObj = town;
		}
	}
	//if the town is not in the array, issue an api request to mapquest
	if (flag)
	{
		//Fetch requests used for to request geocoding data in JSON format
		var urlGeo = 'https://www.mapquestapi.com/geocoding/v1/address?key=m5uOl802afIgc045RyWAWod2fa9nKCsM&location=' + townName + ',NZ';
		fetch(urlGeo)
		.then(response => response.json())
		.then(json => displayMap(json));
	}
	//else use the town object as parameter to function call for updating page
	else
	{
		displayMapObj(townObj);
	}
	document.getElementById('townName').value = "";
}

//display the town on the map and request for sunrise,sunset and weather info
function displayMap(para) {
	//check the property of the return data, if it is not a city or state, show error message
	if (para.results[0].locations[0].geocodeQuality != "CITY" && para.results[0].locations[0].geocodeQuality != "STATE")
	{
		alert("Invalid town name.");
		return;
	}
	//get the latitude and longitude from the returned JSON object
	latitude = para.results[0].locations[0].latLng.lat;
	longitude = para.results[0].locations[0].latLng.lng;
	//set the map
	mymap.setView([latitude, longitude], 13);
	//construct the town object for the current town
	var townCurrent = new Town(townName, latitude, longitude);
	//add the town object to the array
	listTown.push(townCurrent);
	//function to update the search results for towns
	updateTowns(townCurrent);
	//function to update the sun
	getSun(townCurrent);
	//function to update the weather
	getWeather(townCurrent);

}

//display the town on the map using town object
function displayMapObj(para) {
	//get the latitude and longitude from the town object
	latitude = para.getLatitude();
	longitude = para.getLongitude();
	//set the map
	mymap.setView([latitude, longitude], 13);
	//construct the town object for the current town
	var townCurrent = new Town(townName, latitude, longitude);
	//set the global variable townName to this town
	townName = para.getName();
	//function to update the sun
	getSun(townCurrent);
	//function to update the weather
	getWeather(townCurrent);

}

//AJAX and cURL requests used to request weather information in XML format
function getWeather(para) {
	var request = new XMLHttpRequest();
	var url = "php/request_weather.php?latitude=" + para.getLatitude()
	+ "&longitude=" + para.getLongitude();
	request.open("GET", url);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			if (request.status == 200) {
				var result = request.responseXML;
				displayWeather(result);
			}
			//if request is not successful, show error message
			else
			{
				var label = document.getElementById("weather");
				label.innerHTML = "Failed to get the weather information";
			}
		}
	}
	request.send();
}

function displayWeather(para) {
	if (para != null)
	{
		var label = document.getElementById("weather");
		//get the weather and temperature from the XML
		var weather = para.getElementsByTagName("weather")[0];
		var temp = para.getElementsByTagName("temperature")[0];
		label.innerHTML = "Current weather is " + weather.getAttribute("value") + ", min temperature is " + temp.getAttribute("min")
		+ "°C, max temperature is " + temp.getAttribute("max") + "°C";
	}
	//if the returned data is null, show error message
	else
	{
		var label = document.getElementById("weather");
		label.innerHTML = "Failed to get the weather information";
	}
	
}

//Fetch and cURL requests used to request and retrieve Sunset/Sunrise information in JSON format
function getSun(para) {
	fetch("php/request_sun.php?latitude=" + para.getLatitude() + "&longitude=" + para.getLongitude())
	.then(response => response.json())
	.then(json => displaySun(json));
}

//display the sunrise and sunset info
function displaySun(para) {
	var sun = document.getElementById("sun");
	sun.innerHTML = townName + " currently: Sun rises at: " + para.results.sunrise.substring(0, 8)
	+ "AM" + " and sun sets at: " + para.results.sunset.substring(0, 8) + "PM";
}

//function to update the search results for towns
function updateTowns(para) {
	//display the search results label
	var searchLabel = document.getElementById("search");
	searchLabel.style.visibility = "visible";
	//create list element
	var node = document.createElement("li");
	//node.townObj = para;
	var textnode = document.createTextNode(para.getName());
	node.appendChild(textnode);
	node.onclick = function() {
		//update the map
		displayMapObj(para);
		//update the sun
		getWeather(para)
		//update the weather
		getSun(para);
	}
	//node.classList.add("inline-block");
	searchLabel.appendChild(node);
}

//town object
function Town(name, latitude, longitude) {
	var _name = name;
	var _latitude = latitude;
	var _longitude = longitude;

	this.getName = function() {
		return _name;
	}

	this.getLatitude = function() {
		return _latitude;
	}

	this.getLongitude = function() {
		return _longitude;
	}
}
