/**
 * http://nineplanets.org/data.html#0
 */
'use strict';
angular.module("galaxy", [
	'monospaced.mousewheel'
]);
Date.prototype.getDOY = function()
{
	var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((this - onejan) / 86400000);
};
angular.module('galaxy').controller('TestController', function($scope)
{
	$scope.options = {
		drawOrbits: true,
		drawPlanets: true,
		drawMoons: true,
		drawMoonsOrbits: true,
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
				{
					name: "Mercury",
					distance: 58,
					period: 88,
					color: 'maroon',
					size: 2,
					startAngle: 1.5
				},{
					name: "Venus",
					distance: 108,
					period: 224,
					color: 'purple',
					size: 7,
					startAngle: 1
				},{
					name: "Earth",
					distance: 149,
					color: "blue",
					size: 5,
					period: 365,
					startAngle: 0.7,
					orbits: [
						{
							name: "Moon",
							distance: 6.38,
							period: 27.32,
							color: 'gray',
							size: 1,
							startAngle: 1
						}
					]
				},{
					name: "Mars",
					distance: 227,
					color: "red",
					size: 3,
					period: 686,
					startAngle: 3,
					orbits: [
						{
							name: "Phobos",
							distance: 4.09,
							size: 0.3,
							period: 0.32,
							startAngle: 2
						},{
							name: "Deimos",
							distance: 5.23,
							size: 0.6,
							period: 1.26,
							startAngle: 0.7
						}
					]
				},{
					name: "Jupiter",
					distance: 778,
					period: 4332,
					color: 'orange',
					size: 15,
					startAngle: 2
				},{
					name: "Saturn",
					distance: 1429,
					color: 'midnightblue',
					period: 10759,
					size: 10,
					startAngle: 0.7
				},{
					name: "Uranus",
					distance: 2870,
					period: 30685,
					size: 5,
					color: 'black',
					startAngle: 5.7
				},{
					name: "Neptune",
					distance: 4504,
					period: 60190,
					size: 4,
					color: 'lightseagreen',
					startAngle: 1.3
				},{
					name: "Pluto",
					distance: 5913,
					period: 90550,
					size: 1,
					color: 'lightgreen',
					startAngle: 1.8
				}
			]
		}
	};
});
angular.module('galaxy').directive('galaxySystem', function($interval, $document)
{
	return {
		restrict: 'EA',
		templateUrl: 'templates/system.html',
		replace: true,
		link: function($scope, $element, $attrs)
		{
			$scope.date = new Date();
			$scope.doy = $scope.date.getDOY();
			$scope.d = $scope.doy;
			var startX = 500;
			var startY = 400;
			$scope.mousedown = function(event)
			{
				event.preventDefault();
				startX = event.pageX - $scope.x;
				startY = event.pageY - $scope.y;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			};
			function mouseup(event)
			{
				$document.unbind('mousemove', mousemove);
				$document.unbind('mouseup', mouseup);
			}
			function mousemove(event)
			{
				var dy = event.pageY - startY;
				var dx = event.pageX - startX;
				$scope.move(dx, dy);
			}
			$scope.move = function(dx, dy)
			{
				$scope.y = dy;
				$scope.x = dx;
			};
			$scope.zoom = function($event, $delta)
			{
				// console.log($event);
				// TODO : Lot of changes ^^
				if ($delta < 0)
				{
					if ($scope.z <= $scope.options.zoom.min)
					{
						return;
					}
					if ($scope.z <= 1)
					{
						$scope.z *= 0.5;
					}
					else
					{
						$scope.z += $delta;
					}
				}
				else
				{
					if ($scope.z >= $scope.options.zoom.max)
					{
						return;
					}
					if ($scope.z <= 1)
					{
						$scope.z *= 2;
					}
					else
					{
						$scope.z += $delta;
					}
				}
			};
			/**
			 * x, y are the position of the system on the screen. z is the zoom
			 * level
			 */
			$scope.x = startX;
			$scope.y = startY;
			$scope.z = 1;
			function calculateOrbitalSpeed(orbit)
			{
				orbit.orbitalSpeed = Math.round((36000 / orbit.period)) / 100;
				if (orbit.orbits)
				{
					for ( var key in orbit.orbits)
					{
						calculateOrbitalSpeed(orbit.orbits[key]);
					};
				};
			}
			for ( var key in $scope.system.star.orbits)
			{
				calculateOrbitalSpeed($scope.system.star.orbits[key]);
			}
			function update()
			{
				var x = 1;
				$scope.d += x;
				$scope.date.setDate($scope.date.getDate() + x);
			}
			$scope.stop = $interval(update, 100);
			$scope.current = null;
			$scope.select = function(planet)
			{
				$scope.current = planet;
			};
			$scope.pause = function()
			{
				if (angular.isDefined($scope.stop))
				{
					$interval.cancel($scope.stop);
					$scope.stop = undefined;
				}
				else
				{
					$scope.stop = $interval(update, 100);
				}
			};
			$scope.$on('$destroy', function()
			{
				if (angular.isDefined($scope.stop))
				{
					$interval.cancel($scope.stop);
					$scope.stop = undefined;
				}
			});
			$scope.getRotation = function(planet)
			{
				return ($scope.d * planet.orbitalSpeed) + planet.startAngle;
			};
		}
	};
});

