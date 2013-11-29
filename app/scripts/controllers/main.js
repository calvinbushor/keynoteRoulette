'use strict';

angular.module('boostrapszApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });

    $http.get('/api/images').success(function(images) {
      $scope.images = images;
    });
  });
