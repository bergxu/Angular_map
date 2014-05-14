'use strict';

var app = angular.module('app', ['ngRoute', 'appControllers']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/home', {
            templateUrl: 'templates/home.html',
            controller: 'mapCtrl'
        }).
        when('/map', {
            templateUrl: 'templates/map.html',
            controller: 'mapCtrl'
        }).
        when('/map/:accountId', {
            templateUrl: 'templates/detail.html'
        }).
        otherwise({
            redirectTo: '/home'
        });
    }
]);

