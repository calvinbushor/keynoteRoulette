'use strict';

angular.module('boostrapszApp')
  .factory('imageStorage', function ($http) {
    return {
      get: function (limit) {
        var route = limit ? 'api/images?limit=' + limit : 'api/images';
        return $http.get(route).success(function(images) {
          return images;
        });
      }
    };
  });
