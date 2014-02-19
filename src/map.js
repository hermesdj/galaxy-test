'use strict';
angular.module('hyperdrive', ['ngAnimate',
	'hyperdrive.starmap'
]);
angular.module('hyperdrive.starmap', [
	'monospaced.mousewheel'
]);

Date.prototype.getDOY = function()
{
	var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((this - onejan) / 86400000);
};

angular.module('hyperdrive.starmap').controller('MapController', function($scope, $window)
{
	$scope.mapLevel = 3;
	$scope.zoomLevel = 1;
	$scope.zoomPosition = {x: 0, y: 0};
	$scope.debug = true;
	
	$scope.center = {x: $window.innerWidth / 2, y: $window.innerHeight / 2};
	
	var increments = 10;
	
	$scope.zoom = function($event, $data){
		$scope.zoomLevel += $data;
		$scope.zoomPosition = {x: $event.clientX, y: $event.clientY};
		if($scope.zoomLevel <= 0){
			if($scope.mapLevel <= 1){
				$scope.zoomLevel = 1;
			}else{
				$scope.zoomLevel = increments;
				$scope.mapLevel -= 1;
			}
		}
		if($scope.zoomLevel > increments){
			if($scope.mapLevel >= 4){
				$scope.zoomLevel = increments;
			}else{
				$scope.zoomLevel = 1;
				$scope.mapLevel += 1;
			}
		}
		if($scope.mapLevel <= 1){
			$scope.mapLevel = 1;
		}
		if($scope.mapLevel >= 4){
			$scope.mainZoomLebel = 4;
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
				}
			]
		}
	};
});

angular.module('hyperdrive.starmap').directive('starSystem', function($interval, $document)
{
	return {
		restrict: 'EA',
		templateUrl: 'templates/starmap/star-system.html',
		replace: true,
		scope: {
			zoomLevel: '=',
			system: '=',
			center: '=',
			date: '='
		},
		link: function($scope, $element, $attrs)
		{
			$scope.options = {
				drawOrbits: true,
				drawPlanets: true,
				drawMoons: true,
				drawMoonsOrbits: true,
				orbitsColor: 'white'
			};
			
			$scope.date = new Date();
			$scope.doy = $scope.date.getDOY();
			$scope.d = $scope.doy;
			var startX = $scope.center.x;
			var startY = $scope.center.y;
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
			
			$scope.getScale = function(){
				return $scope.zoomLevel;
			};
			
			/**
			 * x, y are the position of the system on the screen. z is the zoom
			 * level
			 */
			$scope.x = startX;
			$scope.y = startY;
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