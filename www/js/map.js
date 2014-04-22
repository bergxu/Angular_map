var app = angular.module('app', ['google-maps']);
app.controller("appCtrl",function($rootScope, $scope, $http, $timeout){
	google.maps.visualRefresh = true;

	var resize = function(){
		console.log(" window onresize ");
		var height = window.innerHeight - 145;
		$(".angular-google-map-container").css("height", height+"px");
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
				icon: 'test/assets/images/blue_marker.png',
				show: false,
				showWindow: false,
				name:"currentMarker"
			},
			targetMarker: {
				show: false,
				showWindow: false
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

	var gotoLocation = function (lat, lon, flag) {
		if(typeof flag === 'undefined') flag = true;
		if (flag && ($scope.map.center.latitude != lat || $scope.map.center.longitude != lon)) {
			$scope.map.center = {
				latitude: lat, 
				longitude: lon
			};
			$scope.map.zoom = 14;
			$scope.$apply();
		}
	};

	var geoCodeToAddress = function(callback){
		var latlng = new google.maps.LatLng($scope.getDataLocation.latitude, $scope.getDataLocation.longitude)
		if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({ 'latLng': latlng }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
            	if($scope.ctrCheck){
            		$scope.myCurrentLocation = results[0].formatted_address;
            	}
            	$scope.locationText = results[0].formatted_address;

            	if(callback) callback();
            } else {
                alert("Sorry, this search produced no results.");
            }
        });
	};
	
		
	$scope.gotoCurrentLocation= function(){
		navigator.geolocation.getCurrentPosition(function (position) {
			var c = position.coords;

			$scope.map.currentMarker.latitude = c.latitude;
    		$scope.map.currentMarker.longitude = c.longitude;
    		$scope.map.currentMarker.name = 'currentMarker';
    		$scope.map.currentMarker.show = true;      					

    		//$scope.$apply();
    		$scope.getDataLocation.latitude = c.latitude;
    		$scope.getDataLocation.longitude = c.longitude;


    		geoCodeToAddress(function(){
    			$scope.$apply();
    		});

			gotoLocation(c.latitude, c.longitude);
	    });
	};

	$scope.gotoCurrentLocation();

	$scope.search = '';
	$scope.distance = 0;
	$scope.getDataLocation = {
		latitude: 0,
		longitude: 0
	};
	$scope.ctrCheck = true;

	$scope.myScroll = new IScroll('#maplistArea');


	var searchLocation = function(callback){
		if($scope.ctrCheck){
			$scope.search = $scope.myCurrentLocation;
		}else{
			$scope.search = $scope.findSearch;
		}
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

		collapseTools();
		var targetShow;
		if(!$scope.ctrCheck){
			$scope.map.searchLocation = $scope.map.targetMarker;
			targetShow = true;
		}else{
			$scope.map.searchLocation = $scope.map.currentMarker;
			targetShow = false;
		}
		var slCb = function(searchedLatlng){
			$scope.map.searchLocation.latitude = searchedLatlng.latitude;
			$scope.map.searchLocation.longitude = searchedLatlng.longitude;
			$scope.map.searchLocation.name = 'targetMarker';
			$scope.map.searchLocation.show = true;
			$scope.map.targetMarker.show=targetShow;

			$scope.getDataLocation.latitude = searchedLatlng.latitude;
    		$scope.getDataLocation.longitude = searchedLatlng.longitude;

    		geoCodeToAddress(function(){
    			$scope.$apply();
    		});
    		if ($scope.distance == 0) {
    			$scope.map.markers = [];
    		}else{
    			setBounds($scope.map.bounds, $scope.map.searchLocation.latitude, $scope.map.searchLocation.longitude);
    		}
    		
			gotoLocation($scope.map.searchLocation.latitude, $scope.map.searchLocation.longitude, $scope.distance == 0);
		}; 
		if($scope.distance > 0){
			startLoad();
			spinner.spin(document.getElementById("mapArea"));
	    	getData();
	    	searchLocation(slCb);
    	} else if ($scope.distance == 0){
			searchLocation(slCb);
    	}

    	$(".navbar-fixed-bottom").css("bottom","0px");
	};

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

	var getData = function(flag, cb){
		if( typeof flag === "undefined") flag = true;
		var myData = {
     		'accountId' : '001L000000PKhEv',
          	'lat': $scope.getDataLocation.latitude + '',
          	'lng': $scope.getDataLocation.longitude + '',
          	'distanceUnit': 'km',
          	'distance': $scope.distance + ""
     	};
 
    	if (!flag) {
    		return; 	
    	}
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
        	setBounds($scope.map.bounds, $scope.map.currentMarker.latitude, $scope.map.currentMarker.longitude);
        	$scope.myScroll.refresh();
			//$scope.map.control.refresh();
			//$scope.$apply();
			spinner.stop();
		if(cb) { cb($scope.map.markers, $scope.map.bounds); }
    	}).error(function(){
        	alert('get Date error');
    	});
	};
	
	$scope.mapClick = function(){
		$("#clickMap").addClass("bottomBtnClick").removeClass("bottomBtnUnclick");
		$("#clickList").addClass("bottomBtnUnclick").removeClass("bottomBtnClick");
	};

	$scope.listClick = function(){
		setTimeout(function(){$scope.myScroll.refresh();},1000);		
		$("#clickMap").removeClass("bottomBtnClick").addClass("bottomBtnUnclick");
		$("#clickList").removeClass("bottomBtnUnclick").addClass("bottomBtnClick");
	};

	$scope.makeCollapse = function(){
		collapseTools();
	};

	$scope.exchangePostion = function(){
		$scope.ctrCheck = !$scope.ctrCheck;
	};

	var collapseTools = function(){
		if($("#menuTool").hasClass("in")){
			$("#iconId").find("img").attr("src","img/arrowed_down.png");
        }else if($("#menuTool").hasClass("collapse")){        
            $("#iconId").find("img").attr("src","img/arrowed_up.png");
        }
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
				distance : [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,500]
			} 
	}
});