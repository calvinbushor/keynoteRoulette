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

    $scope.theme = 'default';

    imageStorage.get().success(function(images) {
      $scope.images = images;
    });
  })
  .controller('PresentationCtrl', function ($scope, $routeParams) {
    $('body').addClass('presentation');

    $scope.theme = $routeParams.theme || 'default';

    $scope.$on('$destroy', function () {
      $('body').removeClass('presentation');
    });
  });
