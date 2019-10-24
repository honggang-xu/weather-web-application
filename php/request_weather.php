<?php
	$latitude = $_GET["latitude"];
	$longitude = $_GET["longitude"];
	//define the url
	$url = "https://api.openweathermap.org/data/2.5/weather?lat=". $latitude . "&lon=" . $longitude. "&APPID=850ebef0bf95cda837a15fd3e5d1e306&units=metric&mode=xml";
	//initialise the connection for the given URL
	$process = curl_init($url);
	//configure the connection
	curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
	//make the request and get the response
  	$return = curl_exec($process);
  	//return as XML
	$xml=simplexml_load_string($return) or die("Error: Cannot create object");
	header('Content-type: text/xml');
    echo $xml->asXML();
    //close the connection
  	curl_close($process);