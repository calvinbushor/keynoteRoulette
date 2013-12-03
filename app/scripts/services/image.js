'use strict';

angular.module('boostrapszApp')
  .factory('imageStorage', function ($http) {
    return {
      get: function () {
        return $http.get('api/images').success(function(images) {
          return images;
        });
      }
    };
  });
