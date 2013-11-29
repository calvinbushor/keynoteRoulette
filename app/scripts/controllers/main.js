'use strict';

angular.module('boostrapszApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/images?tags=fast').success(function(images) {
      $scope.images = images;
    });
  });
