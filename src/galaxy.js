/**
 * http://nineplanets.org/data.html#0
 */

angular.module("galaxy", []);

Date.prototype.getDOY = function() {
	var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((this - onejan) / 86400000);
};

angular.module("galaxy").controller(
		"SystemController",
		function($scope, $interval) {
			$scope.center = {
				name : "Sol",
				radius : 20,
				color : "yellow"
			};

			$scope.date = new Date();
			$scope.doy = $scope.date.getDOY();
			$scope.d = $scope.doy;

			$scope.options = {
				drawOrbits : true,
				drawPlanets : true,
				drawMoons : true,
				drawMoonsOrbits : true
			};

			$scope.planets = [ 
				{name: "Mercury",distance: 58,period: 88,color: 'maroon',size: 2},
				{name: "Venus",distance: 108,period: 224,color: 'purple',size: 7},
				{name: "Earth",distance: 149,color: "blue",size: 5,period: 365,
					moons:[{name: "Moon",distance: 6.38,period: 27.32,color: 'gray',size: 1}]
				}, 
				{name: "Mars",distance: 227,color: "red",size: 3,period: 686,
					moons: [{name: "Phobos", distance: 4.09, size: 0.3, period: 0.32},
					        {name: "Deimos", distance: 5.23, size: 0.6, period: 1.26}]
				},
				{name: "Jupiter",distance: 778,period: 4332,color: 'orange',size: 15},
				{name: "Saturn",distance: 1429,color: 'midnightblue',period: 10759,size: 10},
				{name: "Uranus",distance: 2870,period: 30685,size: 5,color: 'black'},
				{name: "Neptune", distance: 4504, period: 60190, size: 4, color: 'lightseagreen'},
				{name: "Pluto", distance: 5913, period: 90550, size: 1, color: 'lightgreen'}
			];
			
			for(key in $scope.planets){
				$scope.planets[key].orbitalSpeed = (2 * Math.PI) / $scope.planets[key].period;
				for(m in $scope.planets[key].moons){
					$scope.planets[key].moons[m].orbitalSpeed = (2 * Math.PI) / $scope.planets[key].moons[m].period;
				}
			}
			
			$scope.getCx = function(planet) {
				return planet.distance * Math.cos($scope.d * planet.orbitalSpeed);
			};

			$scope.getCy = function(planet) {
				return planet.distance * Math.sin($scope.d * planet.orbitalSpeed);
			};

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
			
			$scope.z = 1;
			$scope.zoom = function(value){
				$scope.z *= value;
			}
			
			$scope.pause = function(){
				if(angular.isDefined($scope.stop)){
					$interval.cancel($scope.stop);
					$scope.stop = undefined;
				}else{
					$scope.stop = $interval(update, 100);
				}
			}
		});