/*! galaxy - v0.1.0 - 2014-02-13
 * https://github.com/hermesdj/galaxy
 * Copyright (c) Jeremy Dallard <dallardj@gmail.com> 2014 Licensed  
 */
angular.module("galaxy", ['monospaced.mousewheel']);

Date.prototype.getDOY = function() {
	var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((this - onejan) / 86400000);
};

angular.module('galaxy').controller('TestController', function($scope){
	$scope.options = {
			drawOrbits : true,
			drawPlanets : true,
			drawMoons : true,
			drawMoonsOrbits : true,
			zoom: {
				min: 0.20,
				max: 7,
				current: 1
			}
		};
	$scope.system = {
			star: {
				name: "Sol",
				radius: 20,
				color: 'yellow',
				orbits: [ 
							{name: "Mercury",distance: 58,period: 88,color: 'maroon',size: 2, startAngle: 1.5},
							{name: "Venus",distance: 108,period: 224,color: 'purple',size: 7, startAngle: 1},
							{name: "Earth",distance: 149,color: "blue",size: 5,period: 365, startAngle: 0.7,
								orbits:[{name: "Moon",distance: 6.38,period: 27.32,color: 'gray',size: 1, startAngle: 1}]
							}, 
							{name: "Mars",distance: 227,color: "red",size: 3,period: 686, startAngle: 3,
								orbits: [{name: "Phobos", distance: 4.09, size: 0.3, period: 0.32, startAngle: 2},
								        {name: "Deimos", distance: 5.23, size: 0.6, period: 1.26, startAngle: 0.7}]
							},
							{name: "Jupiter",distance: 778,period: 4332,color: 'orange',size: 15, startAngle: 2},
							{name: "Saturn",distance: 1429,color: 'midnightblue',period: 10759,size: 10, startAngle: 0.7},
							{name: "Uranus",distance: 2870,period: 30685,size: 5,color: 'black', startAngle: 5.7},
							{name: "Neptune", distance: 4504, period: 60190, size: 4, color: 'lightseagreen', startAngle: 1.3},
							{name: "Pluto", distance: 5913, period: 90550, size: 1, color: 'lightgreen', startAngle: 1.8}
						]
			}
	};
});

angular.module('galaxy').directive('galaxySystem', function($interval, $document){
	return {
		restrict: 'EA',
		templateUrl : 'templates/system.html',
		replace: true,
		link: function($scope, $element, $attrs){			
			$scope.date = new Date();
			$scope.doy = $scope.date.getDOY();
			$scope.d = $scope.doy;
			
			var startX = 300;
			var startY = 300;
			
			$scope.mousedown = function(event){
				event.preventDefault();
				startX = event.pageX - $scope.x;
				startY = event.pageY - $scope.y;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			};
			function mouseup(event){
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			};
			function mousemove(event){
				var dy = event.pageY - startY;
				var dx = event.pageX - startX;
				$scope.move(dx, dy);
			};
			$scope.move = function(dx, dy){
				$scope.y = dy;
				$scope.x = dx;
			};
			
			$scope.zoom = function($delta){
				$scope.pZ = $scope.z;
				if($delta < 0){
					if($scope.z <= $scope.options.zoom.min){return;}
					if($scope.z <= 1){
						$scope.z *= 0.5;
					}else{
						$scope.z += $delta;
					}
				}else{
					if($scope.z >= $scope.options.zoom.max){return;}
					if($scope.z <= 1){
						$scope.z *= 2;
					}else{
						$scope.z += $delta;
					}
				}
			};
			
			/**
			 * x, y are the position of the system on the screen. z is the zoom level
			 */
			$scope.x = startX;
			$scope.y = startY;
			$scope.z = 1;
			$scope.pZ = 1;
			
			function calculateOrbitalSpeed(orbit){
				orbit.orbitalSpeed = Math.round((36000 / orbit.period)) / 100;
				if(orbit.orbits){
					for(key in orbit.orbits){
						calculateOrbitalSpeed(orbit.orbits[key]);
					}
				}
			}
			
			for(key in $scope.system.star.orbits){
				calculateOrbitalSpeed($scope.system.star.orbits[key]);
			}

			function update() {
				var x = 1;
				$scope.d += x;
				$scope.date.setDate($scope.date.getDate() + x);				
			}

			$scope.stop = $interval(update, 100);
			
			$scope.current= null;
			$scope.select = function(planet){
				$scope.current = planet;
			};
			
			$scope.pause = function(){
				if(angular.isDefined($scope.stop)){
					$interval.cancel($scope.stop);
					$scope.stop = undefined;
				}else{
					$scope.stop = $interval(update, 100);
				}
			};
			
			$scope.$on('$destroy', function(){
				if(angular.isDefined($scope.stop)){
					$interval.cancel($scope.stop);
					$scope.stop = undefined;
				}
			});
			
			$scope.getRotation = function(planet){
				return ($scope.d * planet.orbitalSpeed) + planet.startAngle;
			};
		}
	};
});


angular.module('galaxy').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/system.html',
    "<svg height=\"100%\" width=\"100%\" msd-wheel=\"zoom($delta)\" ng-mousedown=\"mousedown($event)\" class=\"stellar-system-drawing\"><clippath><rect x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"></clippath><g ng-attr-transform=\"translate({{x}}, {{y}}) scale({{z}})\"><g><circle ng-click=\"select(system.star)\" ng-attr-cx=\"0\" ng-attr-cy=\"0\" ng-attr-r=\"{{system.star.radius}}\" ng-attr-stroke=\"black\" ng-attr-stroke-width=\"1\" ng-attr-fill=\"{{system.star.color}}\"></circle><text x=\"0\" y=\"0\" fill=\"black\" font-size=\"15\">{{system.star.name}}</text></g><g><g ng-repeat=\"planet in system.star.orbits\" class=\"planet-group\" ng-attr-transform=\"rotate({{getRotation(planet)}})\"><circle class=\"orbit planet-orbit\" ng-show=\"options.drawOrbits\" cx=\"0\" cy=\"0\" ng-attr-r=\"{{planet.distance}}\" stroke=\"black\" stroke-width=\".5\" fill=\"none\"></circle><g ng-show=\"options.drawPlanets\" ng-attr-transform=\"translate({{planet.distance}}, 0)\"><circle ng-click=\"select(planet)\" class=\"stellar-object planet-circle\" ng-attr-cx=\"0\" ng-attr-cy=\"0\" ng-attr-r=\"{{planet.size}}\" ng-attr-fill=\"{{planet.color}}\"></circle><g ng-repeat=\"moon in planet.orbits\" ng-attr-transform=\"rotate({{getRotation(moon)}})\"><circle class=\"orbit moon-orbit\" ng-show=\"options.drawMoonsOrbits\" cx=\"0\" cy=\"0\" ng-attr-r=\"{{moon.distance}}\" stroke=\"black\" stroke-width=\".2\" fill=\"none\"></circle><g class=\"moon\" ng-attr-transform=\"translate({{moon.distance}}, 0)\"><circle class=\"stellar-object moon-circle\" ng-show=\"options.drawMoons\" ng-attr-cx=\"0\" ng-attr-cy=\"0\" ng-attr-r=\"{{moon.size}}\" ng-attr-fill=\"{{moon.color}}\"></circle></g></g></g></g></g></g></svg>"
  );

}]);
