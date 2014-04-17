'use strict';

angular.module('angular-google-maps-example', ['google-maps']).controller('controller', function ($scope, $timeout, $log, $http) {
    // Enable the new Google Maps visuals until it gets enabled by default.
    // See http://googlegeodevelopers.blogspot.ca/2013/05/a-fresh-new-look-for-maps-api-for-all.html
    google.maps.visualRefresh = true;

    /*var versionUrl = window.location.host === 'rawgithub.com' ? 'http://rawgithub.com/nlaplante/angular-google-maps/master/package.json' : '/package.json';

    $http.get(versionUrl).success(function (data) {
        if (!data)
            console.error('no version object found!!');
        $scope.version = data.version;
    });*/

    var resize = function(){
        console.log(" window onresize ");
        var height = window.innerHeight;
        $(".angular-google-map-container").css("height", height+"px");
    };

    resize();
    window.onresize = resize();

    var onMarkerClicked = function (marker) {
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
            markers: [
                {
                    icon: 'assets/images/blue_marker.png',
                    latitude: 45,
                    longitude: -74,
                    showWindow: false,
                    title: 'Marker 2'
                },
                {
                    icon: 'assets/images/blue_marker.png',
                    latitude: 15,
                    longitude: 30,
                    showWindow: false,
                    title: 'Marker 2'
                },
                {
                    icon: 'assets/images/blue_marker.png',
                    latitude: 37,
                    longitude: -122,
                    showWindow: false,
                    title: 'Plane'
                }
            ],
            infoWindowWithCustomClass: {
                options: {
                    boxClass: 'custom-info-window'
                },
            }
        },
        toggleColor: function (color) {
            return color == 'red' ? '#6060FB' : 'red';
        }

    });

    _.each($scope.map.markers, function (marker) {
        marker.closeClick = function () {
            marker.showWindow = false;
            $scope.$apply();
        };
        marker.onClicked = function () {
            onMarkerClicked(marker);
        };
    });

    $scope.removeMarkers = function () {
        $log.info('Clearing markers. They should disappear from the map now');
        $scope.map.markers.length = 0;
        $scope.map.clickedMarker = null;
        $scope.searchLocationMarker = null;
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

    $scope.getData = function(){
        var myData = {
                'accountId' : '001L000000PKm8x',
                'lat': '31.110447',
                'lng': '121.374097',
                'distanceUnit': 'km',
                'distance': '50'
            };
        
        $http({
            url: 'https://dev-saf-holland.cs8.force.com/services/apexrest/listNearbyAccounts/v1/',
            method: 'POST',
            data : JSON.stringify(myData),
            headers: {'Content-Type': 'application/json; charset=utf-8'}
        }).success(function(datas){
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
            };
            angular.forEach(datas,function(data){
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
                setBounds($scope.map.bounds, markerObj.latitude, markerObj.longitude);
            });
            $scope.$apply();
        }).error(function(){
            alert('get Date error');
        });
    };

    $scope.searchLocationMarker = {
        coords: {
            latitude: 40.1451,
            longitude: -99.6680
        },
        options: { draggable: true },
        events: {
            dragend: function (marker, eventName, args) {
                $log.log('marker dragend');
                $log.log(marker.getPosition().lat());
                $log.log(marker.getPosition().lng());
            }
        }
    };

    $scope.onMarkerClicked = onMarkerClicked;
});
