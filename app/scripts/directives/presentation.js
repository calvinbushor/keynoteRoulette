'use strict';

function GetGoal() {}

GetGoal.prototype.noun = function() {
  var noun, wordsToChooseFrom = [
    'business',
    'game',
    'startup',
    'product',
    'toy',
    'sports equipment',
    'candy',
    'pillow',
    'building',
    'skate park',
    'computer program',
    'haircut'
  ];

  noun = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];

  return noun;
}

GetGoal.prototype.generate = function() {
  var goal, that = this;

  goal = 'Sell the idea of a new <b style="color: yellow; text-shadow: 1px 1px 2px #000;">' + that.noun() + '</b> using the images provided. Use arrows to navigate.';

  return goal;
}

angular.module('boostrapszApp')
  .directive('presentation', [
    'imageStorage',
    function(imageStorage){
      return {
        restrict: 'E',
        link: function(scope, element){
          scope.$watch('images', function() {
            // there is a better way
            if (scope.images) {
              var container = $("<article>");

              var goal = new GetGoal();

              container.append($("<section><h1>Your Objective:</h1><br><p style='margin: 0 auto; width: 70%;'>" + goal.generate() + "</p></section>"));

              scope.images.forEach(function (image) {
                container.append($("<section><img src=\"" + image.path + "\"></section>"));
              });

              container.append($("<section><a class='force_reload' href='/'>Home</a></section>"));

              element[0].outerHTML = container.html();

              Reveal.initialize({
                width: '100%',
                height: '100%',
                controls: true,
                touch: true,
                history: false
              });
            }
          });
        }
      }
    }]);
