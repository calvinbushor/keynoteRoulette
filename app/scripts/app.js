'use strict';

angular.module('boostrapszApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'wu.masonry'])
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
      .when('/presentation/:theme/:limit', {
        templateUrl: 'views/presentation.html',
        controller: 'PresentationCtrl'
      })
      .when('/upload', {
        templateUrl: 'views/upload.html',
        controller: 'UploadCtrl'
      })
      .when('/upload-auth', {
        templateUrl: 'views/upload-auth.html',
        controller: 'UploadAuthCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
