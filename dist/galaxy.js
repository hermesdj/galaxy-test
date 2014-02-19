/*! galaxy - v0.1.0 - 2014-02-19
 * https://github.com/hermesdj/galaxy
 * Copyright (c) Jeremy Dallard <dallardj@gmail.com> 2014 Licensed  
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


'use strict';
angular.module('hyperdrive', [
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
		templateUrl: 'templates/system.html',
		replace: true,
		scope: {
			zoomLevel: '=',
			system: '=',
			center: '='
		},
		link: function($scope, $element, $attrs)
		{
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
var Pixastic=(function(){function addEvent(el,event,handler){if(el.addEventListener)
el.addEventListener(event,handler,false);else if(el.attachEvent)
el.attachEvent("on"+event,handler);}
function onready(handler){var handlerDone=false;var execHandler=function(){if(!handlerDone){handlerDone=true;handler();}}
document.write("<"+"script defer src=\"//:\" id=\"__onload_ie_pixastic__\"></"+"script>");var script=document.getElementById("__onload_ie_pixastic__");script.onreadystatechange=function(){if(script.readyState=="complete"){script.parentNode.removeChild(script);execHandler();}}
if(document.addEventListener)
document.addEventListener("DOMContentLoaded",execHandler,false);addEvent(window,"load",execHandler);}
function init(){var imgEls=getElementsByClass("pixastic",null,"img");var canvasEls=getElementsByClass("pixastic",null,"canvas");var elements=imgEls.concat(canvasEls);for(var i=0;i<elements.length;i++){(function(){var el=elements[i];var actions=[];var classes=el.className.split(" ");for(var c=0;c<classes.length;c++){var cls=classes[c];if(cls.substring(0,9)=="pixastic-"){var actionName=cls.substring(9);if(actionName!="")
actions.push(actionName);}}
if(actions.length){if(el.tagName.toLowerCase()=="img"){var dataImg=new Image();dataImg.src=el.src;if(dataImg.complete){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null);if(res)
el=res;}}else{dataImg.onload=function(){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null)
if(res)
el=res;}}}}else{setTimeout(function(){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null);if(res)
el=res;}},1);}}})();}}
if(typeof pixastic_parseonload!="undefined"&&pixastic_parseonload)
onready(init);function getElementsByClass(searchClass,node,tag){var classElements=new Array();if(node==null)
node=document;if(tag==null)
tag='*';var els=node.getElementsByTagName(tag);var elsLen=els.length;var pattern=new RegExp("(^|\\s)"+searchClass+"(\\s|$)");for(i=0,j=0;i<elsLen;i++){if(pattern.test(els[i].className)){classElements[j]=els[i];j++;}}
return classElements;}
var debugElement;function writeDebug(text,level){if(!Pixastic.debug)return;try{switch(level){case"warn":console.warn("Pixastic:",text);break;case"error":console.error("Pixastic:",text);break;default:console.log("Pixastic:",text);}}catch(e){}
if(!debugElement){}}
var hasCanvas=(function(){var c=document.createElement("canvas");var val=false;try{val=!!((typeof c.getContext=="function")&&c.getContext("2d"));}catch(e){}
return function(){return val;}})();var hasCanvasImageData=(function(){var c=document.createElement("canvas");var val=false;var ctx;try{if(typeof c.getContext=="function"&&(ctx=c.getContext("2d"))){val=(typeof ctx.getImageData=="function");}}catch(e){}
return function(){return val;}})();var hasGlobalAlpha=(function(){var hasAlpha=false;var red=document.createElement("canvas");if(hasCanvas()&&hasCanvasImageData()){red.width=red.height=1;var redctx=red.getContext("2d");redctx.fillStyle="rgb(255,0,0)";redctx.fillRect(0,0,1,1);var blue=document.createElement("canvas");blue.width=blue.height=1;var bluectx=blue.getContext("2d");bluectx.fillStyle="rgb(0,0,255)";bluectx.fillRect(0,0,1,1);redctx.globalAlpha=0.5;redctx.drawImage(blue,0,0);var reddata=redctx.getImageData(0,0,1,1).data;hasAlpha=(reddata[2]!=255);}
return function(){return hasAlpha;}})();return{parseOnLoad:false,debug:false,applyAction:function(img,dataImg,actionName,options){options=options||{};var imageIsCanvas=(img.tagName.toLowerCase()=="canvas");if(imageIsCanvas&&Pixastic.Client.isIE()){if(Pixastic.debug)writeDebug("Tried to process a canvas element but browser is IE.");return false;}
var canvas,ctx;var hasOutputCanvas=false;if(Pixastic.Client.hasCanvas()){hasOutputCanvas=!!options.resultCanvas;canvas=options.resultCanvas||document.createElement("canvas");ctx=canvas.getContext("2d");}
var w=img.offsetWidth;var h=img.offsetHeight;if(imageIsCanvas){w=img.width;h=img.height;}
if(w==0||h==0){if(img.parentNode==null){var oldpos=img.style.position;var oldleft=img.style.left;img.style.position="absolute";img.style.left="-9999px";document.body.appendChild(img);w=img.offsetWidth;h=img.offsetHeight;document.body.removeChild(img);img.style.position=oldpos;img.style.left=oldleft;}else{if(Pixastic.debug)writeDebug("Image has 0 width and/or height.");return;}}
if(actionName.indexOf("(")>-1){var tmp=actionName;actionName=tmp.substr(0,tmp.indexOf("("));var arg=tmp.match(/\((.*?)\)/);if(arg[1]){arg=arg[1].split(";");for(var a=0;a<arg.length;a++){thisArg=arg[a].split("=");if(thisArg.length==2){if(thisArg[0]=="rect"){var rectVal=thisArg[1].split(",");options[thisArg[0]]={left:parseInt(rectVal[0],10)||0,top:parseInt(rectVal[1],10)||0,width:parseInt(rectVal[2],10)||0,height:parseInt(rectVal[3],10)||0}}else{options[thisArg[0]]=thisArg[1];}}}}}
if(!options.rect){options.rect={left:0,top:0,width:w,height:h};}else{options.rect.left=Math.round(options.rect.left);options.rect.top=Math.round(options.rect.top);options.rect.width=Math.round(options.rect.width);options.rect.height=Math.round(options.rect.height);}
var validAction=false;if(Pixastic.Actions[actionName]&&typeof Pixastic.Actions[actionName].process=="function"){validAction=true;}
if(!validAction){if(Pixastic.debug)writeDebug("Invalid action \""+actionName+"\". Maybe file not included?");return false;}
if(!Pixastic.Actions[actionName].checkSupport()){if(Pixastic.debug)writeDebug("Action \""+actionName+"\" not supported by this browser.");return false;}
if(Pixastic.Client.hasCanvas()){if(canvas!==img){canvas.width=w;canvas.height=h;}
if(!hasOutputCanvas){canvas.style.width=w+"px";canvas.style.height=h+"px";}
ctx.drawImage(dataImg,0,0,w,h);if(!img.__pixastic_org_image){canvas.__pixastic_org_image=img;canvas.__pixastic_org_width=w;canvas.__pixastic_org_height=h;}else{canvas.__pixastic_org_image=img.__pixastic_org_image;canvas.__pixastic_org_width=img.__pixastic_org_width;canvas.__pixastic_org_height=img.__pixastic_org_height;}}else if(Pixastic.Client.isIE()&&typeof img.__pixastic_org_style=="undefined"){img.__pixastic_org_style=img.style.cssText;}
var params={image:img,canvas:canvas,width:w,height:h,useData:true,options:options}
var res=Pixastic.Actions[actionName].process(params);if(!res){return false;}
if(Pixastic.Client.hasCanvas()){if(params.useData){if(Pixastic.Client.hasCanvasImageData()){canvas.getContext("2d").putImageData(params.canvasData,options.rect.left,options.rect.top);canvas.getContext("2d").fillRect(0,0,0,0);}}
if(!options.leaveDOM){canvas.title=img.title;canvas.imgsrc=img.imgsrc;if(!imageIsCanvas)canvas.alt=img.alt;if(!imageIsCanvas)canvas.imgsrc=img.src;canvas.className=img.className;canvas.style.cssText=img.style.cssText;canvas.name=img.name;canvas.tabIndex=img.tabIndex;canvas.id=img.id;if(img.parentNode&&img.parentNode.replaceChild){img.parentNode.replaceChild(canvas,img);}}
options.resultCanvas=canvas;return canvas;}
return img;},prepareData:function(params,getCopy){var ctx=params.canvas.getContext("2d");var rect=params.options.rect;var dataDesc=ctx.getImageData(rect.left,rect.top,rect.width,rect.height);var data=dataDesc.data;if(!getCopy)params.canvasData=dataDesc;return data;},process:function(img,actionName,options,callback){if(img.tagName.toLowerCase()=="img"){var dataImg=new Image();dataImg.src=img.src;if(dataImg.complete){var res=Pixastic.applyAction(img,dataImg,actionName,options);if(callback)callback(res);return res;}else{dataImg.onload=function(){var res=Pixastic.applyAction(img,dataImg,actionName,options)
if(callback)callback(res);}}}
if(img.tagName.toLowerCase()=="canvas"){var res=Pixastic.applyAction(img,img,actionName,options);if(callback)callback(res);return res;}},revert:function(img){if(Pixastic.Client.hasCanvas()){if(img.tagName.toLowerCase()=="canvas"&&img.__pixastic_org_image){img.width=img.__pixastic_org_width;img.height=img.__pixastic_org_height;img.getContext("2d").drawImage(img.__pixastic_org_image,0,0);if(img.parentNode&&img.parentNode.replaceChild){img.parentNode.replaceChild(img.__pixastic_org_image,img);}
return img;}}else if(Pixastic.Client.isIE()){if(typeof img.__pixastic_org_style!="undefined")
img.style.cssText=img.__pixastic_org_style;}},Client:{hasCanvas:hasCanvas,hasCanvasImageData:hasCanvasImageData,hasGlobalAlpha:hasGlobalAlpha,isIE:function(){return!!document.all&&!!window.attachEvent&&!window.opera;}},Actions:{}}})();Pixastic.Actions.desaturate={process:function(params){var useAverage=!!(params.options.average&&params.options.average!="false");if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var w=rect.width;var h=rect.height;var p=w*h;var pix=p*4,pix1,pix2;if(useAverage){while(p--)
data[pix-=4]=data[pix1=pix+1]=data[pix2=pix+2]=(data[pix]+data[pix1]+data[pix2])/3}else{while(p--)
data[pix-=4]=data[pix1=pix+1]=data[pix2=pix+2]=(data[pix]*0.3+data[pix1]*0.59+data[pix2]*0.11);}
return true;}else if(Pixastic.Client.isIE()){params.image.style.filter+=" gray";return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvasImageData()||Pixastic.Client.isIE());}}
Pixastic.Actions.histogram={process:function(params){var average=!!(params.options.average&&params.options.average!="false");var paint=!!(params.options.paint&&params.options.paint!="false");var color=params.options.color||"rgba(255,255,255,0.5)";var values=[];if(typeof params.options.returnValue!="object"){params.options.returnValue={values:[]};}
var returnValue=params.options.returnValue;if(typeof returnValue.values!="array"){returnValue.values=[];}
values=returnValue.values;if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);params.useData=false;for(var i=0;i<256;i++){values[i]=0;}
var rect=params.options.rect;var p=rect.width*rect.height;var pix=p*4,pix1=pix+1,pix2=pix+2,pix3=pix+3;var round=Math.round;if(average){while(p--){values[round((data[pix-=4]+data[pix+1]+data[pix+2])/3)]++;}}else{while(p--){values[round(data[pix-=4]*0.3+data[pix+1]*0.59+data[pix+2]*0.11)]++;}}
if(paint){var maxValue=0;for(var i=0;i<256;i++){if(values[i]>maxValue){maxValue=values[i];}}
var heightScale=params.height/maxValue;var widthScale=params.width/256;var ctx=params.canvas.getContext("2d");ctx.fillStyle=color;for(var i=0;i<256;i++){ctx.fillRect(i*widthScale,params.height-heightScale*values[i],widthScale,values[i]*heightScale);}}
returnValue.values=values;return true;}},checkSupport:function(){return Pixastic.Client.hasCanvasImageData();}}
Pixastic.Actions.laplace={process:function(params){var strength=1.0;var invert=!!(params.options.invert&&params.options.invert!="false");var contrast=parseFloat(params.options.edgeStrength)||0;var greyLevel=parseInt(params.options.greyLevel)||0;contrast=-contrast;if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var dataCopy=Pixastic.prepareData(params,true)
var kernel=[[-1,-1,-1],[-1,8,-1],[-1,-1,-1]];var weight=1/8;var rect=params.options.rect;var w=rect.width;var h=rect.height;var w4=w*4;var y=h;do{var offsetY=(y-1)*w4;var nextY=(y==h)?y-1:y;var prevY=(y==1)?0:y-2;var offsetYPrev=prevY*w*4;var offsetYNext=nextY*w*4;var x=w;do{var offset=offsetY+(x*4-4);var offsetPrev=offsetYPrev+((x==1)?0:x-2)*4;var offsetNext=offsetYNext+((x==w)?x-1:x)*4;var r=((-dataCopy[offsetPrev-4]
-dataCopy[offsetPrev]
-dataCopy[offsetPrev+4]
-dataCopy[offset-4]
-dataCopy[offset+4]
-dataCopy[offsetNext-4]
-dataCopy[offsetNext]
-dataCopy[offsetNext+4])
+dataCopy[offset]*8)*weight;var g=((-dataCopy[offsetPrev-3]
-dataCopy[offsetPrev+1]
-dataCopy[offsetPrev+5]
-dataCopy[offset-3]
-dataCopy[offset+5]
-dataCopy[offsetNext-3]
-dataCopy[offsetNext+1]
-dataCopy[offsetNext+5])
+dataCopy[offset+1]*8)*weight;var b=((-dataCopy[offsetPrev-2]
-dataCopy[offsetPrev+2]
-dataCopy[offsetPrev+6]
-dataCopy[offset-2]
-dataCopy[offset+6]
-dataCopy[offsetNext-2]
-dataCopy[offsetNext+2]
-dataCopy[offsetNext+6])
+dataCopy[offset+2]*8)*weight;var brightness=((r+g+b)/3)+greyLevel;if(contrast!=0){if(brightness>127){brightness+=((brightness+1)-128)*contrast;}else if(brightness<127){brightness-=(brightness+1)*contrast;}}
if(invert){brightness=255-brightness;}
if(brightness<0)brightness=0;if(brightness>255)brightness=255;data[offset]=data[offset+1]=data[offset+2]=brightness;}while(--x);}while(--y);return true;}},checkSupport:function(){return Pixastic.Client.hasCanvasImageData();}}
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