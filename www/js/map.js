'use strict';

var app = angular.module('app', ['google-maps']);
app.controller('appCtrl', function($rootScope, $scope, $http) {
	google.maps.visualRefresh = true;
	// init
	(function(){
		// UI parameters
		$scope.blockHeight = window.innerHeight;
		$scope.blockWidth = window.innerWidth;
		$scope.height = window.innerHeight - 145;
		$scope.windowWidth = window.innerWidth - 255;
		$scope.BottomWidth = (window.innerWidth - 10) / 2;
		$scope.marginWindowWidth = window.innerWidth - 10;
		$scope.alertHeight = window.innerHeight / 2;
		$scope.bottomHeight = window.innerHeight - 75;

		// data parameters
		$scope.search = '';
		$scope.getDataLocation = {
			latitude: 0,
			longitude: 0
		};
		$scope.metadata = {
			picklists: {
				distance: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 50000]
			},
			distance: '20 km'
		};

		// flags
		$scope.menuDown = true;
		//$scope.isHaveData = false;
		$scope.showWindow = false;
		$scope.menuFlag = false;
		$scope.clickParameter = '';
	})();

	var resize = function(onSizeFlag) {
		console.log(' window onresize ');
		//$scope.blockHeight = window.innerHeight;
		$scope.blockWidth = window.innerWidth;
		$scope.height = window.innerHeight - 145;
		$scope.windowWidth = window.innerWidth - 255;
		$scope.BottomWidth = (window.innerWidth - 10) / 2;
		$scope.marginWindowWidth = window.innerWidth - 10;
		$scope.alertHeight = window.innerHeight / 2;
		$scope.bottomHeight = window.innerHeight - 75;
		if (onSizeFlag) {
			$scope.$apply();
		}
		$('.angular-google-map-container').css('height', $scope.height + 'px');
		
	};

	resize(false);
	//moveTouchToOpen();
	window.onresize = function() {
		resize(true);
	};

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if (phase === '$apply' || phase === '$digest') {
			if (fn && (typeof(fn) === 'function')) {
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
				name: 'currentMarker'
			},
			targetMarker: {
				icon: 'img/green_marker.png',
				show: false
			},
			topServiceMarker: {
				icon: ''
			},
			serviceTwoMarker: {
				icon: ''
			},
			competenceMarker: {
				icon: ''
			},
			officialMarker: {
				icon: ''
			},
			markers: [],
			infoWindowWithCustomClass: {
				options: {
					boxClass: 'custom-info-window'
				}
			}
		},
		toggleColor: function(color) {
			return color === 'red' ? '#6060FB' : 'red';
		}
	});

	var refreshMap = function() {
		window.setTimeout(function() {
			$scope.map.control.refresh();
		}, 300);
	};

	var viewHelp = {
		createSpinner : function(){
			var opts = {
				lines: 13,
				length: 20,
				width: 10,
				radius: 30,
				corners: 1,
				rotate: 0,
				direction: 1,
				color: '#000',
				speed: 1,
				trail: 60,
				shadow: false,
				hwaccel: false,
				className: 'spinner',
				zIndex: 2e9,
				top: 'auto',
				left: 'auto'
			};
			if(!window.spinner)
				window.spinner = new Spinner(opts);			
		},
		startLoading : function() {
			this.createSpinner();
			$('#loadDiv').fadeIn(400);
			window.spinner.spin(document.getElementById('loadDiv'));
		},
		stopLoading : function() {
			window.spinner.stop();
			$('#loadDiv').fadeOut(400);
		},
		alertShow : function(showText) {
			$scope.alertText = showText;
			$('#mapAlert').fadeIn(800);
			setTimeout(function() {
				$('#mapAlert').fadeOut(800);
			}, 2000);
		},
		markerContentShow : function(name, phone, street, city, country) {
			$scope.markerName = name;
			$scope.markerPhone = phone;
			$scope.markerStreet = street;
			$scope.markerCity = city;
			$scope.markerCountry = country;
			$('.b').fadeOut(40);
			$('.markerContent').fadeOut(40);

			$('.b').fadeIn(400);
			$('.markerContent').fadeIn(400);
		},
		leftBodyShow : function() {
			$('#myself').animate({
				left: 250
			}, 500);
			$('#bottomBar').animate({
				left: 250
			}, 500);
			$('.tab-content').animate({
				left: 250
			}, 500);
			$('#menuTool').animate({
				left: 250
			}, 500);
			$('#menuBlocak').show();
			$('#menuBlocak').animate({
				left: 250
			}, 500);
			$('#bottomDiv').animate({
				left: 250
			}, 500);
			$('.leftMenu').show();
			$('#loadDiv').fadeOut(500);
			$('#mapAlert').fadeOut(500);
			$('.b').fadeOut(500);
			$('.markerContent').fadeOut(500);
			$('#markerClickBlock').fadeOut(500);
			setTimeout(function() {
				$('#maplistArea').css('position', 'fixed');
				$('#mapArea').css('position', 'fixed');
			}, 500);


			$scope.menuFlag = !$scope.menuFlag;
		},
		leftBodyHide : function() {
			$('#myself').animate({
				left: 0
			}, 500);
			$('#bottomBar').animate({
				left: 0
			}, 500);
			$('.tab-content').animate({
				left: 0
			}, 500);
			$('#menuTool').animate({
				left: 0
			}, 500);
			$('#bottomDiv').animate({
				left: 0
			}, 500);
			$('#menuBlocak').animate({
				left: 0
			}, 500);
			$('#menuBlocak').hide();
			setTimeout(function() {
				$('.leftMenu').hide();
			}, 500);

			if ($scope.map.markers.length > 0) {
				$('#maplistArea').css('position', '');
			}

			$scope.menuFlag = !$scope.menuFlag;
		}
	};

	var utility = {
		parseDistance : function(str) {
			return str.substring(0,str.length-3).trim();
		},
		spiltStr : function(str){
			return str.split('\"')[1];
		}
	};

	var mapUtility = {

		//set the target location to the center
		gotoLocation : function(lat, lon, flag) {
			if (typeof flag === 'undefined') flag = true;
			if (flag && ($scope.map.center.latitude !== lat || $scope.map.center.longitude !== lon)) {
				$scope.map.center = {
					latitude: lat,
					longitude: lon
				};
				$scope.map.zoom = 14;
			}
		},
		//geo code latlng to address
		geoCodeToAddress : function(latlng, callback) {
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({
				'latLng': latlng
			}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					$scope.myCurrentLocation = results[0].formatted_address;
					if (callback) callback();
				} else {
					alert('Sorry, this search produced no results.');
				}
			});
		},
		//geo code address to latlng
		geoCodeToLatLng : function(callback) {
			if ($scope.search && $scope.search.length > 0) {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({
					'address': $scope.search
				}, function(results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						var loc = results[0].geometry.location;
						callback({
							latitude: loc.lat(),
							longitude: loc.lng()
						});
					} else {
						alert('Sorry, this search produced no results.');
					}
				});
			}
		},
		//set all the markers bounds to fit the screen
		setBounds : function(bounds, latitude, longitude) {
			if ((bounds.northeast.latitude === 0 || bounds.northeast.latitude === undefined) &&
				(bounds.southwest.latitude === 0 || bounds.southwest.latitude === undefined) &&
				(bounds.northeast.longitude === 0 || bounds.northeast.longitude === undefined) &&
				(bounds.southwest.longitude === 0 || bounds.southwest.longitude === undefined)) {
				bounds.northeast.latitude = latitude;
				bounds.southwest.latitude = latitude;
				bounds.northeast.longitude = longitude;
				bounds.southwest.longitude = longitude;
			}
			if (latitude > bounds.northeast.latitude) {
				bounds.northeast.latitude = latitude;
			} else if (latitude < bounds.southwest.latitude) {
				bounds.southwest.latitude = latitude;
			}

			if (longitude > bounds.northeast.longitude) {
				bounds.northeast.longitude = longitude;
			} else if (longitude < bounds.southwest.longitude) {
				bounds.southwest.longitude = longitude;
			}
		},

		// get Data from salesforce
		getData: function() {
			var myData = {
				'accountId': '001L000000PKhEv',
				'lat': $scope.getDataLocation.latitude + '',
				'lng': $scope.getDataLocation.longitude + '',
				'distanceUnit': 'km',
				'distance': utility.parseDistance($scope.metadata.distance),
				//'distance': '50000',
				'industries' :$scope.clickParameter 
			};

			var onSuccess = function(datas) {
				if (datas.length <= 0) {
					//$scope.isHaveData = false;
					$('#maplistArea').css('position', 'fixed');
					viewHelp.stopLoading();
					viewHelp.alertShow('Not Found......');
					return;
				}
				$scope.safeApply(function() {
					$('#maplistArea').css('position', '');
					//$scope.isHaveData = true;
					$scope.map.markers = [];
					$scope.map.bounds = {
						northeast: {
							latitude: 0,
							longitude: 0
						},
						southwest: {
							latitude: 0,
							longitude: 0
						}
					};

					mapUtility.setBounds($scope.map.bounds, $scope.getDataLocation.latitude, $scope.getDataLocation.longitude);
					angular.forEach(datas, function(data) {
						var markerObj = {
							latitude: data.FN__Lat__c,
							longitude: data.FN__Lon__c,
							showWindow: false,
							name: data.Name,
							phone: data.Phone,
							street: data.Visit_Street__c,
							city: data.Visit_City__c,
							country: data.Visit_Country__c,
							zipcode:data.Visit_Zip_Code__c,
							state:data.Visit_State__c,
							emergencyCall : $scope.emergencyCall,
							website : data.Website,
							additionalName:data.Additional_Name__c,
							wptype : data.Workshop_Partsdealer_Type__c
							//accountMarkericon : 'img/green2_marker.png'

						};
						var wptType = data.Workshop_Partsdealer_Type__c;
						if($scope.clickParameter === 'Workshop'){
							if(wptType.indexOf('Top Service Partner') >= 0){
								markerObj.accountMarkericon = 'img/red_marker.png';
								
							}else if(wptType.indexOf('Service 24 Partner') >= 0){
								markerObj.accountMarkericon = 'img/green2_marker.png';
								
							}else if(wptType.indexOf('Competence') >= 0){
								markerObj.accountMarkericon = 'img/yellow_marker.png';								
							}
						}else{
							if(wptType.indexOf('Official Partsdealer') >= 0){
								markerObj.accountMarkericon = 'img/red_marker.png';
							}
						}

						
						$scope.map.markers.push(markerObj);
						mapUtility.setBounds($scope.map.bounds, markerObj.latitude, markerObj.longitude);
					});
				});
				viewHelp.stopLoading();
			};

			var onError = function() {
				//$scope.isHaveData = false;
				viewHelp.stopLoading();
				viewHelp.alertShow('get Date error');
			};
			if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
				$http({
					url: 'https://dev-saf-holland.cs8.force.com/services/apexrest/listNearbyAccounts/v1/',
					method: 'POST',
					data: JSON.stringify(myData),
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					}
				}).success(function(datas) {
					onSuccess(datas);
				}).error(function() {
					onError();
				});
			} else {
				window.getData(onError, onSuccess);
			}
		}

		
	};

	// get emergency call from salesforce
	$scope.getCurrentEmergencyCall = function() {
			$http({
				url: 'https://dev-saf-holland.cs8.force.com/services/apexrest/getEmergencyCallNumber/v1/',
				method: 'GET'
			}).success(function(result) {
				$scope.emergencyCall = utility.spiltStr(result);
			}).error(function() {
				console.log('emergencyCall error');
			});
	};

	//go to current location		
	$scope.gotoCurrentLocation = function() {

		navigator.geolocation.getCurrentPosition(function(position) {
			var c = position.coords;
			$scope.map.currentMarker.latitude = c.latitude;
			$scope.map.currentMarker.longitude = c.longitude;
			$scope.map.currentMarker.name = 'currentMarker';
			$scope.map.currentMarker.show = true;

			$scope.getDataLocation.latitude = c.latitude;
			$scope.getDataLocation.longitude = c.longitude;
			$scope.curentLat = $scope.getDataLocation.latitude;
			$scope.currentLng = $scope.getDataLocation.longitude;

			var latlng = new google.maps.LatLng(c.latitude, c.longitude);
			$scope.myLatLng = {
				lat: c.latitude,
				lng: c.longitude
			};
			// geo code latlng to address
			// to get current address
			mapUtility.geoCodeToAddress(latlng, function() {
				$scope.$apply();
			});

			mapUtility.gotoLocation(c.latitude, c.longitude);
		});
	};
	$scope.getCurrentEmergencyCall();
	$scope.gotoCurrentLocation();

	$scope.workshopSearch = function(){
		$scope.clickParameter = 'Workshop';
	
		$('#menuView').fadeOut('200');
	};

	$scope.partsdealerSearch = function(){
		$scope.clickParameter = 'Partsdealer';

		$('#menuView').fadeOut('200');
	};

	$scope.websiteClick = function(){
		window.open('http://'+$scope.website , '_blank', 'EnableViewPortScale=yes');
               
	};

	//search button click
	$scope.clickSearch = function() {
		$scope.blockClick();
		$('#menuTool').animate({
			top: '-110px'
		}, 'fast', function() {
			$scope.menuDown = !$scope.menuDown;
		});
		viewHelp.startLoading();

		var cb = function(searchedLatlng) {
			if ($scope.search === $scope.myCurrentLocation) {
				$scope.map.markers = [];
				$scope.map.targetMarker.show = false;

				mapUtility.gotoLocation($scope.myLatLng.lat, $scope.myLatLng.lng);
			} else {
				$scope.map.targetMarker.latitude = searchedLatlng.latitude;
				$scope.map.targetMarker.longitude = searchedLatlng.longitude;
				$scope.map.targetMarker.name = 'targetMarker';
				$scope.map.targetMarker.show = false;

				$scope.getDataLocation.latitude = searchedLatlng.latitude;
				$scope.getDataLocation.longitude = searchedLatlng.longitude;
				$scope.curentLat = $scope.getDataLocation.latitude;
				$scope.currentLng = $scope.getDataLocation.longitude;

				mapUtility.gotoLocation($scope.map.targetMarker.latitude, $scope.map.targetMarker.longitude);
			}
			mapUtility.getData();
		};
		mapUtility.geoCodeToLatLng(cb);
	};

	$scope.menuShowClick = function() {
		$('#menuView').fadeIn(200);
		$scope.gotoCurrentLocation();
		$('#menuTool').animate({
			top: '70px'
		}, 'fast', function() {
			$scope.menuDown = true;
		});

		$scope.metadata.distance = '20 km';
		$('#searchInput').attr('value','');
		$scope.search = '';
		$scope.map.markers = [];

	};

	$scope.menuBlockClick = function() {
		refreshMap();
		if ($scope.menuFlag) {
			viewHelp.leftBodyHide();
		}
	};

	$scope.brandClick = function() {
		if ($scope.menuDown) {
			$('#menuTool').animate({
				top: '-110px'
			}, 'fast', function() {
				$scope.menuDown = !$scope.menuDown;
			});
		} else {
			$('#menuTool').animate({
				top: '70px'
			}, 'normal', function() {
				$scope.menuDown = !$scope.menuDown;
			});
		}
	};

	$scope.mapClick = function() {
		if ($('#clickMap').hasClass('bottomBtnUnclick')) {
			$('#clickMap').removeClass('bottomBtnUnclick').addClass('bottomBtnClick');
			$('#clickList').removeClass('bottomBtnClick').addClass('bottomBtnUnclick');
			setTimeout(function() {
				$('#loadDiv').fadeOut(20);
				$('#mapAlert').fadeOut(20);
			}, 500);
			refreshMap();
		}
	};

	$scope.listClick = function() {
		if ($('#clickList').hasClass('bottomBtnUnclick')) {
			$('#clickMap').removeClass('bottomBtnClick').addClass('bottomBtnUnclick');
			$('#clickList').removeClass('bottomBtnUnclick').addClass('bottomBtnClick');
			if ($scope.map.markers.length === 0) {
				viewHelp.alertShow('No Data');
			}
		}
	};

	$scope.exchangePostion = function() {
		$scope.search = $scope.myCurrentLocation;
		$('#searchInput').attr('value', $scope.myCurrentLocation);
		$scope.getDataLocation.latitude = $scope.myLatLng.lat;
		$scope.getDataLocation.longitude = $scope.myLatLng.lng;
	};

	$scope.onMarkerClicked = function(marker) {

		$('#detailView').fadeIn(400);
		$scope.accountName = marker.name;
		$scope.additionalName = marker.additionalName;
		var markerStreet = typeof(marker.street) === 'undefined' ? '' : marker.street;
		var markerCity = typeof(marker.city) === 'undefined' ? '' : marker.city;
		var markerZipcode = typeof(marker.zipcode) === 'undefined' ? '' : marker.zipcode;
		var markerState = typeof(marker.state) === 'undefined' ? '' : marker.state;
		var markerCountry = typeof(marker.country) === 'undefined' ? '' : marker.country;
		$scope.physicalAddress = markerStreet + ' ' + markerCity + ' ' + markerZipcode+ ' ' +markerState+ ' ' +markerCountry;

		$scope.phoneNumber = marker.phone;
		$scope.emergencyCallNumber = marker.emergencyCall;
		$scope.website = marker.website;
		$scope.wdType = marker.wptype;
		$scope.gpsData = marker.latitude +','+marker.longitude;
	};

	$scope.closeDetail = function(){
		$('#detailView').fadeOut(400);
	};

	$scope.blockClick = function() {
		$('#markerClickBlock').fadeOut(200);
		$('.b').fadeOut(200);
		$('.markerContent').fadeOut(200);
	};

	$scope.partDemandClick = function() {
		 window.open('https://portal.saf-axles.com/', '_blank', 'EnableViewPortScale=yes');
              
	};
});

(function(){
	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
		document.addEventListener('deviceready', function () {
			angular.bootstrap(document, ['app']);
			setTimeout(function() {
				navigator.splashscreen.hide();
			}, 500);
		},false);
	} else {
	  angular.bootstrap(document, ['app']); //this is the browser
	}
})();