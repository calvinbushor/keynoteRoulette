'use strict';

angular.module('boostrapszApp')
  .controller('MainCtrl', function ($scope, imageStorage) {
    $scope.themes = [
      'beige',
      'blood',
      'default',
      'moon',
      'night',
      'serif',
      'simple',
      'sky',
      'solarized'
    ];

    $scope.limits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    $scope.theme = 'default';
    $scope.limit = 5;

    imageStorage.get(100).success(function(images) {
      $scope.images = images;
    });
  })
  .controller('PresentationCtrl', function ($scope, $routeParams, imageStorage) {
    $('body').addClass('presentation');

    imageStorage.getRandom($routeParams.limit || null).success(function(images) {
      $scope.images = images;
    });

    $scope.theme = $routeParams.theme || 'default';

    $scope.$on('$destroy', function () {
      $('body').removeClass('presentation');
    });
  });
