'use strict';

angular.module('boostrapszApp')
  .factory('imageStorage', function ($http) {
    return {
      get: function (limit) {
        var route = limit ? 'api/images?limit=' + limit : 'api/images';
        return $http.get(route).success(function(images) {
          return images;
        });
      },
      getRandom: function (limit) {
        limit = limit ? limit : 5;

        var route = 'api/images?limit=' + limit + '&newest=true';
        return $http.get(route).success(function(images) {
          return images;
        });
      }
    };
  });
