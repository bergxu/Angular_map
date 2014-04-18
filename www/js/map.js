var app = angular.module('app', ['google-maps']);
app.controller("appCtrl",function($scope, $http){
	google.maps.visualRefresh = true;

	var resize = function(){
		console.log(" window onresize ");
		var height = window.innerHeight - 200;
		$(".angular-google-map-container").css("height", height+"px");
	};

	resize();
	window.onresize = resize;

	$scope.onMarkerClicked = function (marker) {
		marker.showWindow = !marker.showWindow;
		$scope.$apply();
	};

	angular.extend($scope, {
		map: {
			control: {},
			version: 'uknown',
			showTraffic: false,
			showBicycling: false,
			showWeather: false,
			showHeat: false,
			center: {
				latitude: 45,
				longitude: -73
			},
			options: {
				streetViewControl: true,
				panControl: false,
				maxZoom: 20,
				minZoom: 1
			},
			zoom: 3,
			dragging: false,
			bounds: {},
			currentMarker: {
				show: false,
				showWindow: false,
			},
			targetMarker: {
				show: false,
				showWindow: false
			},
			markers: [
				{
					icon: 'test/assets/images/blue_marker.png',
					latitude: 45,
					longitude: -74,
					showWindow: false,
					name: 'Marker 1'
				},
				{
				icon: 'test/assets/images/blue_marker.png',
					latitude: 15,
					longitude: 30,
					showWindow: false,
					name: 'Marker 2'
				},
				{
					icon: 'test/assets/images/blue_marker.png',
					latitude: 37,
					longitude: -122,
					showWindow: false,
					name: 'Plane'
				}
			],
			infoWindowWithCustomClass: {
				options: {
					boxClass: 'custom-info-window'
				}
			}
		},
		toggleColor: function (color) {
			return color == 'red' ? '#6060FB' : 'red';
		}
	});

	var gotoLocation = function (lat, lon) {
		if ($scope.map.center.latitude != lat || $scope.center.longitude != lon) {
			$scope.map.center = {
				latitude: lat, 
				longitude: lon
			};
			$scope.map.zoom = 3;
			$scope.$apply();
		}
	};
		
	$scope.gotoCurrentLocation= function(){
		navigator.geolocation.getCurrentPosition(function (position) {
			var c = position.coords;

	    		$scope.map.currentMarker.latitude = c.latitude;
	    		$scope.map.currentMarker.longitude = c.longitude;
	    		$scope.map.currentMarker.name = 'currentMarker';
	    		$scope.map.currentMarker.show = true;

			gotoLocation(c.latitude, c.longitude);
	    });
	};

	$scope.gotoCurrentLocation();

	$scope.search = '';
	$scope.distance = 0;

	var searchLocation = function(callback){
		if ($scope.search && $scope.search.length > 0) {
	        	if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
	        	this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
	            	if (status == google.maps.GeocoderStatus.OK) {
	                	var loc = results[0].geometry.location;
	                	callback({
	            			latitude: loc.lat(),
	        	        		longitude: loc.lng()
	                	});
	            	} else {
	                	alert("Sorry, this search produced no results.");
	            	}
	        	});
	    	}
	};

	$scope.geoCode = function(){
    		var slCb = function(searchedLatlng){
    			$scope.map.targetMarker.latitude = searchedLatlng.latitude;
    			$scope.map.targetMarker.longitude = searchedLatlng.longitude;
    			$scope.map.targetMarker.name = 'targetMarker';
    			$scope.map.targetMarker.show = true;
    			gotoLocation($scope.map.targetMarker.latitude, $scope.map.targetMarker.longitude);
    		}; 
		if($scope.distance > 0){
		    	getData();
		    	searchLocation(slCb);
	    	} else if ($scope.distance == 0){
    			searchLocation(slCb);
	    	}
	};

	var setBounds = function(bounds, latitude, longitude) {
	    	if(bounds.northeast.latitude === 0 && 
	        	bounds.southwest.latitude === 0 &&
	        	bounds.northeast.longitude === 0 &&
	        	bounds.southwest.longitude === 0) {
	        	bounds.northeast.latitude = latitude;
	        	bounds.southwest.latitude = latitude;
	        	bounds.northeast.longitude = longitude;
	        	bounds.southwest.longitude = longitude;
	    	}
	    	if(latitude > bounds.northeast.latitude){
	        	bounds.northeast.latitude = latitude;
	    	} else if (latitude < bounds.southwest.latitude) {
	        	bounds.southwest.latitude = latitude;
	    	}

	    	if(longitude > bounds.northeast.longitude){
	        	bounds.northeast.longitude = longitude;
	    	} else if (longitude < bounds.southwest.longitude) {
	        	bounds.southwest.longitude = longitude;
	    	}   
	};

	var getData = function(){
    		var myData = {
         		'accountId' : '001L000000PKm8x',
              'lat': '31.110447',
              'lng': '121.374097',
              'distanceUnit': 'km',
              'distance': '50000'
         	};
        
        	$http({
         		url: 'https://dev-saf-holland.cs8.force.com/services/apexrest/listNearbyAccounts/v1/',
            	method: 'POST',
            	data : JSON.stringify(myData),
            	headers: {'Content-Type': 'application/json; charset=utf-8'}
        	}).success(function(datas){
        		if(datas.length <= 0){
        			alert('none account');
        			return;
        		}
        		console.log('length = ' + datas.length);
            	$scope.map.markers = [];
            	/*$scope.map.bounds = {
                	northeast: {
                    	latitude : 0,
                    	longitude: 0
                	},
                	southwest: {
                    	latitude : 0,
                    	longitude: 0
                	}
            	};*/
            	/*angular.forEach(datas,function(data){
            		console.log("Latitude__s = " + data.Location__Latitude__s);
                	var markerObj = {
                    	title: data.name,
                    	icon: 'assets/images/blue_marker.png',
                    	latitude: data.Location__Latitude__s,
                    	longitude: data.Location__Longitude__s,
                    	showWindow: false,
                    	// list info
                    	name: data.Name,
                    	address: 'china',
                    	phone: '10086'
                	};
                	$scope.map.markers.push(markerObj);
                	//setBounds($scope.map.bounds, markerObj.latitude, markerObj.longitude);
            	});*/
            	//setBounds($scope.map.bounds, $scope.map.currentMarker.latitude, $scope.map.currentMarker.longitude);
            	//$scope.$apply();
            	/*if(!$scope.$$phase) {
	            	$scope.$apply();
			}*/
			setTimeout(function(){
				console.log('setTimeout ok!');
	            	$scope.$apply();
			}, 1000);
        	}).error(function(){
            	alert('get Date error');
        	});
    	};
	
	$scope.mapClick = function(){
		$("#clickMap").addClass("bottomBtnClick").removeClass("bottomBtnUnclick");
		$("#clickList").addClass("bottomBtnUnclick").removeClass("bottomBtnClick");
	};

	$scope.listClick = function(){
		$("#clickMap").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
		$("#clickList").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
	};

	$scope.metadata = {
			picklists : {
				distance : [0,5,10,15,20,25,30,35,40,45,50]
			} 
	}
});