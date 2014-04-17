var app = angular.module('app', ['google-maps']);
app.controller("appCtrl",function($scope, $http){
	$scope.loc = {
        latitude: 0,
        longitude: 0
	};
	
	$scope.myMarkers =[{
        latitude: 0,
        longitude: 0
     }];
	
	$scope.zoom =0;
	
	$scope.mapList = [];
	
	
	$scope.gotoCurrentLocation= function(){
		navigator.geolocation.getCurrentPosition(function (position) {
	        var c = position.coords;
	        $scope.myMarkers =[{
        		latitude: c.latitude, 
    	        longitude: c.longitude
	    	}];
	        $scope.gotoLocation(c.latitude, c.longitude);
	    	$scope.$apply();
	    });
	};
	
	$scope.gotoCurrentLocation();
	 
	$scope.gotoLocation = function (lat, lon) {
        if ($scope.lat != lat || $scope.lon != lon) {
            $scope.loc = {
            		latitude: lat, 
        	        longitude: lon
    	    	};
	    	$scope.zoom =14;
            $scope.$apply();
        }
    };
	
	$scope.search = "";
	$scope.geoCode = function(){
		if($scope.distance > 0){
	    	var cb = function(markersArray){
	    		$scope.myMarkers = markersArray;
	    		var slCb = function(searchedLatlng){
	    			$scope.myMarkers.push(searchedLatlng);
	    			$scope.gotoLocation($scope.loc.latitude, $scope.loc.longitude);
	    		}; 
	    		$scope.searchLocation(slCb);
	    	};
	    	$scope.getData(cb);
	    }else if($scope.distance == 0){
	    	var slCb = function(searchedLatlng){
	    		$scope.myMarkers=[];
	    		var latlng={
    				latitude: searchedLatlng.latitude, 
        	        longitude: searchedLatlng.longitude
	    		}
	    		$scope.myMarkers.push(latlng);
    			$scope.gotoLocation(searchedLatlng.latitude, searchedLatlng.longitude);
    		}; 
    		$scope.searchLocation(slCb);
	    }
	};
	
	$scope.searchLocation = function(callback){
		if ($scope.search && $scope.search.length > 0) {
	        if (!this.geocoder) this.geocoder = new google.maps.Geocoder();
	        this.geocoder.geocode({ 'address': $scope.search }, function (results, status) {
	            if (status == google.maps.GeocoderStatus.OK) {
	                var loc = results[0].geometry.location;
	                $scope.loc ={
	            		latitude: loc.lat(),
	        	        longitude: loc.lng()
	                }
	                callback($scope.loc);
	            } else {
	                alert("Sorry, this search produced no results.");
	            }
	        });
	    }
	};
	
	$scope.onMarkerClicked = function (marker) {
        marker.showWindow = true;
        $scope.$apply();
    };
	
	$scope.getData = function(callback){
		$scope.myMarkers = [];
		var myData = {
		        "accountId" : "001L000000PKm8x",
		        "lat": "31.110447",
		        "lng": "121.374097",
		        "distanceUnit": "km",
		        "distance": "50000"
		    };
		
		$http({
			url: "https://dev-saf-holland.cs8.force.com/services/apexrest/listNearbyAccounts/v1/",
			method: "POST",
			data : JSON.stringify(myData),
			headers: {'Content-Type': 'application/json; charset=utf-8'}
		}).success(function(datas){
			angular.forEach(datas,function(data){
				var dataObj = {
					"name" : data.Name,
					"address"  : "china",
					"phone"  : "10086"
				};
				$scope.mapList.push(dataObj);
				var markerObj = {
						latitude: data.Location__Latitude__s,
				        longitude: data.Location__Longitude__s
				}
				$scope.myMarkers.push(markerObj);
			});
			callback($scope.myMarkers);
			
		}).error(function(data){
			alert("no");
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
	$scope.distance = 0;
	$scope.metadata = {
			picklists : {
				distance : [0,5,10,15,20,25,30,35,40,45,50]
			} 
	}
	 
	 
	 
});