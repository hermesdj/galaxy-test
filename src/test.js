angular.module('galaxy').controller('GalaxyGeneratorController', function($scope)
{
	function subdivise(size, x, y, width, height)
	{
		var result = [];
		for ( var i = 0; i < size; i++)
		{
			var line = [];
			for ( var j = 0; j < size; j++)
			{
				var w = width / size, h = height / size;
				var dx = i * w, dy = j * h;
				line.push({
					dx: dx,
					dy: dy,
					width: w,
					height: h
				});
			}
			result.push(line);
		}
		return result;
	}
	function highlight(ctx, s, options)
	{
		var imgData = ctx.getImageData(s.dx, s.dy, s.width, s.height);
		var count = 0;
		for ( var k = 0; k < imgData.data.length; k += 4)
		{
			count += imgData.data[k] * 3;
		}
		count = Math.ceil(count / imgData.data.length);
		for ( var i in options)
		{
			var o = options[i];
			if (count >= o.min && count <= o.max)
			{
				s.level = i;
			}
		}
	}
	function draw(ctx, zones, options)
	{
		for ( var i = 0; i < zones.length; i++)
		{
			var line = zones[i];
			for ( var j = 0; j < line.length; j++)
			{
				var zone = line[j];
				if (options[zone.level] !== undefined)
				{
					ctx.fillStyle = options[zone.level].color;
					ctx.fillRect(zone.dx, zone.dy, zone.width, zone.height);
				}
			}
		}
	}
	$scope.q = 400;
	var c = document.getElementById('canvas');
	var ctx = c.getContext('2d');
	var img = document.getElementById('milky');
	c.width = img.width;
	c.height = img.height;
	$scope.options = [
		{
			min: 30,
			max: 70,
			color: '#00162D'
		},{
			min: 70,
			max: 90,
			color: '#002B56'
		},{
			min: 90,
			max: 105,
			color: '#033E82'
		},{
			min: 105,
			max: 125,
			color: '#0353AA'
		},{
			min: 125,
			max: 255,
			color: '#116ABC'
		}
	];
	var result = document.getElementById('result');
	var ctx2 = result.getContext('2d');
	result.width = c.width;
	result.height = c.height;
	$scope.analyse = function()
	{
		var start = new Date().getTime();
		img = Pixastic.process(img, 'desaturate', {
			average: true
		});
		$scope.time = new Date().getTime() - start;
		ctx.clearRect(0, 0, c.width, c.height);
		ctx.drawImage(img, 0, 0, c.width, c.height);
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.strokeStyle = 'white';
		ctx.fillStyle = 'white';
		var subs = subdivise($scope.q, 0, 0, c.width, c.height, true);
		for ( var i in subs)
		{
			var sub = subs[i];
			for ( var j in sub)
			{
				var zone = sub[j];
				highlight(ctx, zone, $scope.options, false);
			}
		}
		Pixastic.revert(img);
		ctx2.fillStyle = 'black';
		ctx2.fillRect(0, 0, c.width, c.height);
		ctx2.globalAlpha = 1;
		draw(ctx2, subs, $scope.options);
		$scope.time = new Date().getTime() - start;
	};
	$scope.analyse();
});