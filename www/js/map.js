  document.addEventListener('deviceready', function () {
  	angular.bootstrap(document, ['app']);
  },false);

var app = angular.module('app', ['google-maps']);
app.controller("appCtrl",function($rootScope, $scope, $http, $timeout){
	google.maps.visualRefresh = true;

	var resize = function(){
		console.log(" window onresize ");
		var height = window.innerHeight - 145;
		var alertHeight = window.innerHeight/2;
		$scope.bottomHeight = window.innerHeight - 80;
		$("#mapAlert").css("top", alertHeight +"px");
		$(".markerContent").css("top", alertHeight +"px");
		$(".b").css("top", alertHeight +"px");
		$(".angular-google-map-container").css("height", height+"px");
		$("#maplistArea").css("height", height+"px");
	};

	resize();
	window.onresize = resize;

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
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
				icon: 'img/blue_marker.png',
				show: false,
				showWindow: false,
				name:"currentMarker"
			},
			targetMarker: {
				icon: 'img/green_marker.png',
				show: false
			},
			accountMarker: {
				icon: 'img/red_marker.png'
				
			},
			markers: [],
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

	//set the target location to the center
	var gotoLocation = function (lat, lon, flag) {
		if(typeof flag === 'undefined') flag = true;
		if (flag && ($scope.map.center.latitude != lat || $scope.map.center.longitude != lon)) {
			$scope.map.center = {
				latitude: lat, 
				longitude: lon
			};
			$scope.map.zoom = 14;
		}
	};

	//geo code latlng to address
	var geoCodeToAddress = function(latlng, callback){
		var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            		$scope.myCurrentLocation = results[0].formatted_address;
            	if(callback) callback();
            } else {
                alert("Sorry, this search produced no results.");
            }
        });
	};
	
	//go to current location		
	$scope.gotoCurrentLocation= function(){

		navigator.geolocation.getCurrentPosition(function (position) {
			var c = position.coords;
			$scope.map.currentMarker.latitude = c.latitude;
    		$scope.map.currentMarker.longitude = c.longitude;
    		$scope.map.currentMarker.name = 'currentMarker';
    		$scope.map.currentMarker.show = true;      					

    		$scope.getDataLocation.latitude = c.latitude;
    		$scope.getDataLocation.longitude = c.longitude;
    		var latlng = new google.maps.LatLng(c.latitude, c.longitude);
    		$scope.myLatLng = {
    			lat: c.latitude,
    			lng: c.longitude
    		};
    		// geo code latlng to address
    		// to get current address
    		geoCodeToAddress(latlng, function(){
    			$scope.$apply();
    		});

			gotoLocation(c.latitude, c.longitude);
	    });
	};

	$scope.gotoCurrentLocation();
	$scope.search = '';
	$scope.getDataLocation = {
		latitude: 0,
		longitude: 0
	};
	$scope.isHaveData = false;
	$scope.showWindow = false;
	$scope.topBarDisabled = false;

	//$scope.myScroll = new IScroll('#maplistArea');

	//geo code address to latlng
	var geoCodeToLatLng = function(callback){
		if ($scope.search && $scope.search.length > 0) {
	        	var geocoder = new google.maps.Geocoder();
	        	geocoder.geocode({ 'address': $scope.search }, function (results, status) {
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

	//searche button click
	$scope.clickSearch = function(){
		collapseTools();
		startLoading();
		
		var cb = function(searchedLatlng){
			if($scope.search === $scope.myCurrentLocation){
				$scope.map.markers = [];
				$scope.map.targetMarker.show = false;

				gotoLocation($scope.myLatLng.lat, $scope.myLatLng.lng);
			}else{
				$scope.map.targetMarker.latitude = searchedLatlng.latitude;
				$scope.map.targetMarker.longitude = searchedLatlng.longitude;
				$scope.map.targetMarker.name = 'targetMarker';
				$scope.map.targetMarker.show = false;

				$scope.getDataLocation.latitude = searchedLatlng.latitude;
	    		$scope.getDataLocation.longitude = searchedLatlng.longitude;

				gotoLocation($scope.map.targetMarker.latitude, $scope.map.targetMarker.longitude);
			}
			getData();
		};
		geoCodeToLatLng(cb);

		$(".navbar-fixed-bottom").css("top", $scope.bottomHeight+"px");
	};

	var getData = function(){
		var myData = {
     		'accountId' : '001L000000PKhEv',
          	'lat': $scope.getDataLocation.latitude + '',
          	'lng': $scope.getDataLocation.longitude + '',
          	'distanceUnit': 'km',
          	'distance': parseDistance($scope.metadata.distance)
     	};
    	
    	$http({
     		url: 'https://dev-saf-holland.cs8.force.com/services/apexrest/listNearbyAccounts/v1/',
        	method: 'POST',
        	data : JSON.stringify(myData),
        	headers: {'Content-Type': 'application/json; charset=utf-8'}
    	}).success(function(datas){
        	if(datas.length <= 0){
        		$scope.isHaveData = false;
        		stopLoading();
        		alertShow("Not Found......");
    			return;
    		}
    		$scope.isHaveData = true;
			$scope.map.markers = [];
        	$scope.map.bounds = {
            	northeast: {
                	latitude : 0,
                	longitude: 0
            	},
            	southwest: {
                	latitude : 0,
                	longitude: 0
            	} 
            }

            setBounds($scope.map.bounds, $scope.getDataLocation.latitude, $scope.getDataLocation.longitude);
	    	angular.forEach(datas,function(data){
            	var markerObj = {
					latitude: data.geopointe__Geocode__r.Geolocation__Latitude__s,
        			longitude: data.geopointe__Geocode__r.Geolocation__Longitude__s,
                	showWindow: false,
                	name: data.Name,
                	phone: data.Phone,
                	street: data.geopointe__Geocode__r.geopointe__Street__c,
                	city : data.geopointe__Geocode__r.geopointe__City__c,
                	country: data.geopointe__Geocode__r.geopointe__Country__c
            	};
            	$scope.map.markers.push(markerObj);
            	setBounds($scope.map.bounds, markerObj.latitude, markerObj.longitude);
        	});
        	
        	//$scope.myScroll.refresh();
			stopLoading();
    	}).error(function(){
    		$scope.isHaveData = false;
    		stopLoading();
        	alertShow('get Date error');
    	});
	};

	//set all the markers bounds to fit the screen
	var setBounds = function(bounds, latitude, longitude) {
	    	if((bounds.northeast.latitude === 0 || bounds.northeast.latitude === undefined) && 
	        	(bounds.southwest.latitude === 0 || bounds.southwest.latitude === undefined) &&
	        	(bounds.northeast.longitude === 0 || bounds.northeast.longitude === undefined) &&
	        	(bounds.southwest.longitude === 0 || bounds.southwest.longitude === undefined)) {
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
	
	var alertShow = function(showText){
		$scope.alertText = showText;
		$("#mapAlert").fadeIn(800);
    	setTimeout(function(){
    		$("#mapAlert").fadeOut(800);
    	},2000);    	
	};

	var markerContentShow = function( name, phone, street, city, country){
		$scope.markerName = name;
		$scope.markerPhone = phone;
		$scope.markerStreet = street;
		$scope.markerCity = city;
		$scope.markerCountry = country;
		$(".b").fadeOut(40);
		$(".markerContent").fadeOut(40);

		$(".b").fadeIn(400);
		$(".markerContent").fadeIn(400);
		// setTimeout(function(){
		// 	$(".b").fadeOut(400);
		// 	$(".markerContent").fadeOut(400);
		// },5000);
	};


	$scope.mapClick = function(){
		if(!$("#clickMap").hasClass("active")){
			setTimeout(function(){$("#mapAlert").fadeOut(200);}, 800);
			$("#clickMap").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
			$("#clickList").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
			$("#mapListAlert").fadeOut(400);
		}
		
	};

	$scope.listClick = function(){	
		if(!$("#clickList").hasClass("active")){
			$("#loadDiv").fadeOut(200);	

			$("#clickMap").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
			$("#clickList").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
			if(!$scope.isHaveData){
				setTimeout(function(){
					$("#mapListAlert").fadeIn(400);
				},500);
			}
		}
	};

	$scope.alertClick = function(){
		$("#mapListAlert").fadeOut(400);
	};

	$scope.makeCollapse = function(){
		collapseTools();
	};

	$scope.exchangePostion = function(){
		$scope.search = $scope.myCurrentLocation;
		$scope.getDataLocation.latitude = $scope.myLatLng.lat;
		$scope.getDataLocation.longitude = $scope.myLatLng.lng;
	};

	$scope.onMarkerClicked = function (marker) {
			$scope.map.center = {};
			$scope.map.center = {
				latitude: marker.latitude, 
				longitude: marker.longitude
			};
		setTimeout(function(){$("#markerClickBlock").fadeIn(200);},500);
		markerContentShow(marker.name, marker.phone, marker.street, marker.city, marker.country);
		$scope.$apply();
	};

	$scope.blockClick = function(){
		$("#markerClickBlock").fadeOut(200);
		$(".b").fadeOut(200);
		$(".markerContent").fadeOut(200);
	};

	var collapseTools = function(){
		if($("#menuTool").hasClass("in")){
			$("#iconId").find("img").attr("src","img/arrowed_down.png");
        }else if($("#menuTool").hasClass("collapse")){        
            $("#iconId").find("img").attr("src","img/arrowed_up.png");
        }
	};

	var parseDistance = function(str){
		return str.substring(0,3).trim();
	};

	var startLoading = function(){
		$scope.topBarDisabled = true;
		startLoad();
		$("#loadDiv").fadeIn(400);
		spinner.spin(document.getElementById("loadDiv"));
	};

	var stopLoading = function(){
		$scope.topBarDisabled = false;
		spinner.stop();
		$("#loadDiv").fadeOut(400);

	};

	var startLoad = function(target){
        var opts = {  
          lines: 13,   
          length: 20,  
          width: 10, 
          radius: 30, 
          corners: 1,  
          rotate: 0, 
          direction: 1,  
          color: "#000",   
          speed: 1, 
          trail: 60,  
          shadow: false,   
          hwaccel: false,   
          className: "spinner", 
          zIndex: 2e9, 
          top: "auto", 
          left: "auto" 
        };   
        spinner = new Spinner(opts); 
    }

	$scope.metadata = {
			picklists : {
				distance : [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,500]
			},
			distance : "20 km"
	}

});