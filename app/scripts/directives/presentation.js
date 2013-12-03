'use strict';

angular.module('boostrapszApp')
  .directive('presentation', [
    'imageStorage',
    function(imageStorage){
      return {
        restrict: 'E',
        link: function(scope, element){
          imageStorage.get().success(function(images) {
            var container = $("<article>");

            container.append($("<section>hi</section>"));

            images.forEach(function (image) {
              container.append($("<section><img src=\"" + image.path + "\"></section>"));
            });

            element[0].outerHTML = container.html();

            Reveal.initialize({
              width: '100%',
              height: '100%',
              controls: true,
              touch: true,
              history: false
            });
          });
        }
      }
    }]);
