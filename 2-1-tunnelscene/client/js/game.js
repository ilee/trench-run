// 'use strict';

/*************************************************************
Trench Run World
Handles music, star background, scrolling text
*************************************************************/

var loadWorld = function() {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	/*************************************************************
	GLOBAL VARS
	*************************************************************/
	var scene,
		camera, 
		renderer,
		element,
		container,
		effect,
		controls,
		stats;
	var svgRenderer;
	var keyboard = new THREEx.KeyboardState();
	// Keep track of time between each render
	var clock = new THREE.Clock();

	// Text vectors
	var TITLE_VECTOR = new THREE.Vector3(0, 0.1, -1);
	var CRAWL_VECTOR = new THREE.Vector3(0, 0.1, -0.01);
	var titletextMesh = new THREE.Mesh();
	var crawltextMesh = new THREE.Mesh();

	// Level graphics
	var trench = new THREE.Mesh();
	var TRENCH_VECTOR = new THREE.Vector3(-4, 0, 0);
	var numOfTrench = 4;
	var trenchArray = [];
	var trenchLength = 7600;

	init();
	animate();

	function init() 
	{

		// HTML Container and Primary three.js Scene elements
		scene = new THREE.Scene();

		/*
		* Create Camera
		* PerspectiveCamera takes following parameters:
		* 1. fov - vertical field of view for the camera, set to 90 here
		* 2. aspect - aspect ratio for camera, commonly set to width/height of viewport
		* 3/4. near/far - any objects between these values are rendered, think of as horizon
		*/
		// var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
		var SCREEN_WIDTH = window.innerWidth, 
			SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 90, 
			ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
			NEAR = 0.1, 
			FAR = 20000;
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// Set and add camera to scene. Position is x, y, z
		camera.position.set(0, 50, 100);
		scene.add(camera);
		// .lookAt is overriden by Orbitcontrols, so modify controls.target to change where camera is pointed instead.
		camera.lookAt(scene.position);

		/* 
		* Renderers
		* We need an element on the page to draw our game onto, so define rendered and 
		* assign it to an element with ID of container. Three.js has two primary types of 
		* renderers - CanvasRenderer (2D canvas context) and WebGLRenderer (WebGL context)
		*/
		if ( Detector.webgl )
		  renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
		  renderer = new THREE.CanvasRenderer(); 

		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		element = renderer.domElement;
		container = document.getElementById('mainview');
		container.appendChild(element);

		// For SVG objects
		// svgRenderer = new THREE.SVGRenderer();
		// svgRenderer.setClearColor( 0xf0f0f0 );
		// svgRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		// svgRenderer.setQuality( 'low' );
		// container.appendChild( svgRenderer.domElement );

		// Pass renderer through stereo effect view (2 eyes)
		effect = new THREE.StereoEffect(renderer);

		/*
		* Camera Controls
		* Controls for moving the camera around using the mouse or touch events are defined
		* here. We pass in our camera and the DOM element which we'll be attaching our 
		* event listeners to. Panning and Zooming are off as is.
		*/
		controls = new THREE.OrbitControls(camera, element);
		controls.target.set(
		  camera.position.x,
		  camera.position.y + 0.5,
		  camera.position.z - 100
		);
		// controls.noPan = false;
		// controls.noZoom = false;

		/*
		* DeviceOrientation
		* Set up our device event listener that will allow us to track the motion of the 
		* phone in our Google Cardboard device. This uses the imported JS module from above.
		*/
		window.addEventListener('deviceorientation', setOrientationControls, true);

		/*
		* setOrientationControls
		* Function to attach to the event listener. The event listener returns three values 
		* when it has found a compatible device - alpha, beta, and gamma
		* We check for alpha value at the start of our function to ensure event data is 
		* coming through as expected
		*/
		function setOrientationControls(e) {
			if (!e.alpha) {
				return;
			}
			// Re-assign controls to phone device orientation control, if present
			controls = new THREE.DeviceOrientationControls(camera, true);
			controls.connect();
			controls.update();
			// Remove address bar for mobile devices
			element.addEventListener('click', fullscreen, false);
			// Remove device orientation listener
			window.removeEventListener('deviceorientation', setOrientationControls, true);
		}
		
		// fog must be added to scene before first render
		// scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

		// Stats helper
		enableStats();

		// Axis helper
		// axisHelper();

		// Draw scene elements
		drawLighting();
		drawLightingHelper();
		// drawFloor();
		drawSky();
		openingText();
		crawlText();
		// drawTrench();
		// drawReticule(); // nice-to-have after
		
	}

	function drawReticule()
	{
		var node = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' )
		node.setAttribute( 'stroke', 'black' );
		node.setAttribute( 'fill', 'white' );
		node.setAttribute( 'r', '60' ); // radius

		var reticule = new THREE.SVGObject( node.cloneNode() );
		reticule.position.x = 100;
		reticule.position.y = 800;
		reticule.position.z = -100;
		scene.add( reticule );
	}

	function drawLighting()
	{
		/*
		* Lighting
		* Trench Run scene had light coming from NW corner, overshadowed canyon, light on 
		* right hand wall
		*/
		// Kinda at an angle
		var lightScene = new THREE.PointLight(0xffffff);
		lightScene.position.set(0, 150, 100);
		scene.add(lightScene);
		// More straight down
		var light = new THREE.PointLight(0x999999, 2, 100);
		light.position.set(0, 150, 100);
		scene.add(light);
	}

	function drawLightingHelper()
	{
		/*
		* Light in the sky object/texture
		*/
		// var lightbulb = new THREE.Mesh( 
		// 	new THREE.SphereGeometry( 10, 16, 8 ), 
		// 	new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
		// );
		// scene.add( lightbulb );
		// lightbulb.position.set(0, 150, 100);
		// console.log(light.position);
		// console.log(lightbulb.position);
	}

	function drawFloor()
	{
		/*
		* Floor Texture
		* Replace this with trench model
		*/
		var floorTexture = new THREE.ImageUtils.loadTexture( "textures/checkerboard.jpg" );
		floorTexture.wrapS = THREE.RepeatWrapping;
		floorTexture.wrapT = THREE.RepeatWrapping;
		// Sets the size of texture
		floorTexture.repeat.set( 10, 10 );
		// DoubleSide: render texture on both sides of mesh
		// Texture types are: (1) Basic (2) Lambert - darker (3) Phong - Smoother looking
		var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		// var floorMaterialL = new THREE.MeshLambertMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		// var floorMaterialP = new THREE.MeshPhongMaterial( { map: floorTexture, side: THREE.DoubleSide } );
		floorMaterial.minFilter = THREE.LinearFilter;

		var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.position.y = -0.5;
		floor.rotation.x = Math.PI / 2;
		console.log("drawing floor");
		scene.add(floor);
	}

	function drawSky()
	{
		/*
		* Space Texture
		*/
		var imagePrefix = "textures/stars-";
		var directions  = ["xneg","xneg","xneg","xneg","xneg","xneg"];
		var imageSuffix = ".jpg";
		var skyGeometry = new THREE.BoxGeometry( 5000, 5000, 5000, 1, 1, 1 );
		// CubeGeometry renamed to BoxGeometry
		// var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
		// BackSide: render faces from inside of the cube, instead of from outside (default).
		// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );

		var materialArray = [];

		for (var i = 0; i < 6; i++) {
			console.log("drawing sky "+ i);
			var texture = THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix, {}, function() {
				console.log('texture loaded');
			}, 
			function() {
				alert('error loading texture');
			});

			materialArray.push( new THREE.MeshBasicMaterial({
				map: texture,
				side: THREE.BackSide
			}));
		}
			
		var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
		var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
		scene.add(skyBox);

		// Particles (stars)
		// var geometry = new THREE.Geometry();

		// for (var i = 0; i < 1000; i++) {
		// 	var vector = new THREE.Vector3( (Math.random() * 10000) - 5000, (Math.random() * 400) - 400, (Math.random() * 20000) - 10000 );
		// 	geometry.vertices.push( vector );
		// }

		// var particleImage = THREE.ImageUtils.loadTexture( "textures/star.png" );
		// var particleMaterial = new THREE.ParticleBasicMaterial( { size: 48, map: particleImage, opacity: 1.0, transparent: false, depthTest: true, blending: THREE.NormalBlending } );

		// particles = new THREE.ParticleSystem( geometry, particleMaterial );

		// particles.position.z = -12000;
		// particles.position.y = 2000;

		// scene.add( particles );
	}

	function openingText() 
	{
	  	/*
		* Title Text
		*/
		var materialFront = new THREE.MeshBasicMaterial( { color: 0x000000 } );
		var materialSide = new THREE.MeshBasicMaterial( { color: 0xF4E544 } );
		var materialArray = [ materialFront, materialSide ];
		var textGeom = new THREE.TextGeometry( "DOJO WARS", 
		{
			size: 30, height: 4, curveSegments: 4,
			font: "droid sans", weight: "bold", style: "normal",
			bevelThickness: 1, bevelSize: 2, bevelEnabled: true,
			material: 0, extrudeMaterial: 1
		});
		// font: helvetiker, gentilis, droid sans, droid serif, optimer
		// weight: normal, bold
		
		var textMaterial = new THREE.MeshFaceMaterial(materialArray);
		titletextMesh = new THREE.Mesh(textGeom, textMaterial );
		
		textGeom.computeBoundingBox();
		var textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
		
		titletextMesh.position.set( -0.5 * textWidth, 20, 100 );
		titletextMesh.rotation.x = 0;
		scene.add(titletextMesh);
		
		// playTitleMusic();
		// addCrawlText();
	}

	function crawlText()
	{
		var text = ["It is a period of civil war.","Rebel ninjas, striking from a ","hidden base, have won their ","first victory against the evil ","Pirate Empire.","","During the battle, rebel spies ","managed to steal secret plans ","to the Empire’s ultimate weapon, ","the DEATH STARRRR, an armored ","space station with enough power ","to destroy an entire planet.","","Analysis of the plans have ","revealed a weakness in the ","exhaust port system. Though ","you must navigate through the ","ship’s defenses to deliver the ","fatal blow..."];
		var canvas1 = document.createElement('canvas');
		// canvas1.setAttribute('height', 600);
		var context1 = canvas1.getContext('2d');
		context1.font = "Bold 10px Arial";
		context1.fillStyle = "rgba(244,229,68,0.95)";

		for(var i = 0; i < text.length; i++){
			context1.fillText(text[i], 0, i*10, 200);
		}
	    
		// canvas contents will be used for a texture
		var texture1 = new THREE.Texture(canvas1) 
		texture1.needsUpdate = true;
	      
	    var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
	    material1.transparent = true;

	    crawltextMesh = new THREE.Mesh(
	        new THREE.PlaneGeometry(canvas1.width, canvas1.height),
	        material1
	      );
		crawltextMesh.position.set(75,-250,10);
		scene.add( crawltextMesh );
	}

	function drawTrench()
	{
		var jsonLoader = new THREE.JSONLoader();
		jsonLoader.load( "models/small-trench.js", addModelToScene );
		// addModelToScene function is called back after model has loaded
		
		// Note: if imported model appears too dark,
		//   add an ambient light in this file
		//   and increase values in model's exported .js file
		//    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
		var ambientLight = new THREE.AmbientLight(0x111111);
		scene.add(ambientLight);
	}

	function addModelToScene( geometry, materials ) 
	{
		// var material = new THREE.MeshFaceMaterial( materials );
		var material = new THREE.MeshPhongMaterial( { color: 0x111111, ambient: 0x222222, specular: 0x000000, shininess: 100, shading: THREE.SmoothShading } );

		// Custom trench code
		for (var i=0; i<numOfTrench; ++i ) {

			var mesh = new THREE.Mesh( geometry, material );

			var scale = 200;
			mesh.scale.set(scale,scale*1.6,scale*1.6);
			mesh.position.set(0,0,(-i*trenchLength)-(trenchLength/2));
			mesh.rotation.set(0,Math.PI/2,0);

			mesh.castShadow = false;
			mesh.receiveShadow = true;

			scene.addChild(mesh);
			trenchArray.push(mesh);
		}

		// trench = new THREE.Mesh( geometry, material );
		trench.scale.set(2,2,2);
		scene.add( trench );

	}

	/*
	* Axis helper
	*/
	function axisHelper()
	{
		var axes = new THREE.AxisHelper(100);
		scene.add( axes );
	}

	/*
	* Stats - display stats
	*/
	function enableStats()
	{
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );
	}

	// Set title music theme and play
	function playTitleMusic()
	{
		var sound = new Howl({
			urls: ['music/opening-theme.mp3']
		}).play();
	}

	/*
	* Animate function
	* We want everything to move and refresh on each frame. 
	*/
	function animate() {
		var elapsedSeconds = clock.getElapsedTime();
		// Add vector to title text to fade away
		titletextMesh.position.add(TITLE_VECTOR);
		// Add vector to crawl text
		crawltextMesh.position.add(CRAWL_VECTOR);
		// Add vector to trench
		trench.position.add(TRENCH_VECTOR);
		// Set animate() to run against next animation frame
		requestAnimationFrame(animate);
		// Renders the scene each time
		render();
		// Keeps renderer, camera object, and controls matching the browser viewport size
		update();
	}

	function resize() {
		var width = container.offsetWidth;
		var height = container.offsetHeight;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
		// svgRenderer.setSize( width, height );
		effect.setSize( width, height );
	}

	function update(dt) {
		var delta = clock.getDelta();

		if ( keyboard.pressed("z") ) 
		{	  
			// do something
		}
		// console.log(titletextMesh.position);
		// console.log(clock.getElapsedTime());
		resize();
		camera.updateProjectionMatrix();
		controls.update(dt);
		stats.update();
		run(delta);
	}

	function render(dt) {
		effect.render( scene, camera );

		/*
		// I will need code like below to dynamically move the level OR I should move the model??
		// var time = Date.now() * 0.0002;

		// camera.position.x = Math.sin( time ) * 500;
		// camera.position.z = Math.cos( time ) * 500;
		// camera.lookAt( scene.position );

		// group.rotation.x += 0.01;

		// scene.updateMatrixWorld();
		*/
	}

	function run( delta ) {
		// if (isDead) {
		// 	return;
		// }

		// trenches
		for (var i=0; i<trenchArray.length; ++i ) {

			var mesh = trenchArray[i]
			mesh.position.z += speed;

			if (mesh.position.z > camera.position.z+trenchLength/2) {
				mesh.position.z -= ((numOfTrench)*trenchLength);

				if (obstacleArray.length < 4) {
					spawnNewObstacle();
				}
			}
		}

		// obstacles
		// for (var i=0; i<obstacleArray.length; ++i ) {

		// 	var type = obstacleArray[i].type;
		// 	var mesh = obstacleArray[i].mesh;
		// 	mesh.position.z += speed;

		// 	// respawn / remove
		// 	if (mesh.position.z > camera.position.z+trenchLength/2) {
		// 		mesh.visible = false;
		// 		var shifted = obstacleArray.shift();
		// 		obstaclePool.push(shifted);
		// 		spawnNewObstacle();
		// 	}

		// 	// collision
		// 	if (xwing && time > deadTimer+2000) {
		// 		var difz = xwing.position.z-mesh.position.z;

		// 		if (difz < 170 && difz > -170) {
		// 			var dify = xwing.position.y-mesh.position.y;
		// 			var difx = xwing.position.x-mesh.position.x;
					
		// 			if (type == 0) {
		// 				// horizontal bar
		// 				if (!sideWays.state && dify < 210 && dify > -210) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (sideWays.state && dify < 370 && dify > -370) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 			}

		// 			if (type == 1) {
		// 				// vertical bar
		// 				if (!sideWays.state && difx < 370 && difx > -370) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (sideWays.state && difx < 210 && difx > -210) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 			}

		// 			if (type == 2) {
		// 				// 1/4 hole down
		// 				if (!sideWays.state && mesh.rotation.y == 0 && (xwing.position.y > -240 || xwing.position.x > -210)) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (!sideWays.state && mesh.rotation.y == Math.PI && (xwing.position.y > -240 || xwing.position.x < 210)) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (sideWays.state) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 			}

		// 			if (type == 3) {
		// 				// 1/4 hole up
		// 				if (!sideWays.state && mesh.rotation.y == 0 && (xwing.position.y < 220 || xwing.position.x > -210)) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (!sideWays.state && mesh.rotation.y == Math.PI && (xwing.position.y < 220 || xwing.position.x < 210)) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 				if (sideWays.state) {
		// 					explode();
		// 					isDead = true;
		// 					return;
		// 				}
		// 			}

		// 		}

		// 	}
		// }

		// // key control
		// if (leftIsDown) mouseXpercent -= 0.003*delta;
		// if (rightIsDown) mouseXpercent += 0.003*delta;
		// if (upIsDown) mouseYpercent -= 0.0025*delta;
		// if (downIsDown) mouseYpercent += 0.0025*delta;

		// if (mouseXpercent < -1) mouseXpercent = -1;
		// if (mouseXpercent > 1) mouseXpercent = 1;
		// if (mouseYpercent < -1) mouseYpercent = -1;
		// if (mouseYpercent > 1) mouseYpercent = 1;


		// // xwing
		// if (!xwing) {
		// 	return;
		// }

		// var optimalDivider = delta/16;

		// var smoothing = Math.max(8, (12/optimalDivider) )

		// var tox = mouseXpercent*380;
		// var toy = -(mouseYpercent*350)+30;
		
		// if (sideWays.state) {
		// 	tox = mouseXpercent*480;
		// 	toy = -(mouseYpercent*250)+30;
		// }

		// var difx = (tox-xwing.position.x)/smoothing;
		// var dify = (toy-xwing.position.y)/smoothing;

		// xwing.position.x += difx;
		// xwing.position.y += dify;

		// difx = Math.min(difx,10);
		// difx = Math.max(difx,-10);
		// dify = Math.min(dify,10);
		// dify = Math.max(dify,-10);

		// xwing.rotation.x = dify/40;
		// xwing.rotation.y = -(difx/40);

		// xwing.rotation.z = -(difx/40);

		// xwing.rotation.z += sideWays.rotation;

		// // thrust
		// var opacity = (Math.abs(difx)+Math.abs(dify))/8;
		// opacity = Math.min(opacity,1);
		// opacity = Math.max(opacity,0.3);

		// var noise = Math.random()*0.5;
		// opacity += noise;

		// if (!ship.visible) {
		// 	opacity = 0;
		// }

		// thrust0.opacity = opacity;
		// thrust1.opacity = opacity;
		// thrust2.opacity = opacity;
		// thrust3.opacity = opacity;

		// // blink
		// if (time < deadTimer+2000) {
		// 	ship.visible = true;
		// 	if (time < deadTimer+600) {
		// 		ship.visible = false;
		// 	}
			
		// 	if (time < deadTimer+800 && time > deadTimer+700) {
		// 		ship.visible = false;
		// 	}
		// 	if (time < deadTimer+1100 && time > deadTimer+1000) {
		// 		ship.visible = false;
		// 	}
		// 	if (time < deadTimer+1400 && time > deadTimer+1300) {
		// 		ship.visible = false;
		// 	}

		// }

		// // lasers
		// // if ((mouseDown || ctrlIsDown) && time > deadTimer+1500) {
		// // 	fire();
		// // }

		// // camera
		// var tox = xwing.position.x;
		// var toy = xwing.position.y+50;

		// var difx = (tox-camera.position.x)/(smoothing*2)

		// camera.position.x += difx;
		// camera.position.y += (toy-camera.position.y)/(smoothing*2);

		// camera.up.x = -(difx/100);
	}



	function fullscreen() {
		if (container.requestFullscreen) {
		  container.requestFullscreen();
		} else if (container.msRequestFullscreen) {
		  container.msRequestFullscreen();
		} else if (container.mozRequestFullScreen) {
		  container.mozRequestFullScreen();
		} else if (container.webkitRequestFullscreen) {
		  container.webkitRequestFullscreen();
		}
	}

	function getURL(url, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
		  if (xmlhttp.readyState == 4) {
			 if (xmlhttp.status == 200){
				 callback(JSON.parse(xmlhttp.responseText));
			 }
			 else {
				 console.log('We had an error, status code: ', xmlhttp.status);
			 }
		  }
		}
		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	}
}(); // end LoadWorld()

