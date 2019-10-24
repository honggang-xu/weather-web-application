<?php
$latitude = $_GET["latitude"];
$longitude = $_GET["longitude"];

//define the url
$request = "https://api.sunrise-sunset.org/json?lat=" . $latitude . "&lng=" . $longitude;

//initialise the connection for the given URL
$connection = curl_init($request);
//configure the connection
curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);
//make the request and get the response
$response = curl_exec($connection);
//close the connection
curl_close($connection);
//return the response
echo $response;
?>