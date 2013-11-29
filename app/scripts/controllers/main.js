'use strict';

angular.module('boostrapszApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/images').success(function(images) {
      $scope.images = images;
    });
  });
