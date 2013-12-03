'use strict';

angular.module('boostrapszApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/presentation', {
        templateUrl: 'views/presentation.html',
        controller: 'PresentationCtrl'
      })
      .when('/presentation/:theme', {
        templateUrl: 'views/presentation.html',
        controller: 'PresentationCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
