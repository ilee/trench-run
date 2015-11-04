'use strict';

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

/* Custom global vars */
// Text vectors
var titleDirection = new THREE.Vector3(0, 0.1, -1);
var crawlDirection = new THREE.Vector3(0, 0.1, -0.01);
var titletextMesh = new THREE.Mesh();
var crawltextMesh = new THREE.Mesh();

// Level graphics
var trench = new THREE.Mesh();
var trenchDirection = new THREE.Vector3(-4, 0, 0);

// Loader
manager = new THREE.LoadingManager();
 
manager.onProgress = function (item, loaded, total) {
    console.log(item, loaded, total);
};
manager.onLoad = function () {
    console.log('all items loaded');
};
manager.onError = function () {
    console.log('there has been an error');
};
  

/*************************************************************
Primary World
*************************************************************/

// // And here we go....
var loadWorld = function() {

	init();
	animate();

	function $( id ) {
		return document.getElementById( id );
	}

	function init() {

		// HTML Container and Primary three.js Scene elements
		scene = new THREE.Scene();

		// Create load scene
		var loadScene = createLoadScene();
		camera = loadScene.camera;
		scene = loadScene.scene;

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		renderer.domElement.style.position = "relative";
		container.appendChild( renderer.domElement );

		renderer.gammaInput = true;
		renderer.gammaOutput = true;

		enableStats();

		var callbackProgress = function( progress, result ) {

			var bar = 250,
				total = progress.totalModels + progress.totalTextures,
				loaded = progress.loadedModels + progress.loadedTextures;

			if ( total )
				bar = Math.floor( bar * loaded / total );

			$( "bar" ).style.width = bar + "px";

		};

		var callbackFinished = function ( result ) {

			loaded = result;

			$( "message" ).style.display = "none";
			$( "progressbar" ).style.display = "none";

			result.scene.traverse( function ( object ) {

				if ( object.userData.rotating === true ) {

					rotatingObjects.push( object );

				}

				if ( object instanceof THREE.MorphAnimMesh ) {

					morphAnimatedObjects.push( object );

				}

				if ( object instanceof THREE.SkinnedMesh ) {

					if ( object.geometry.animation ) {

						var animation = new THREE.Animation( object, object.geometry.animation );
						animation.play();

					}

				}

			} );

			//

			$( "progress" ).style.display = "none";

			camera = loaded.currentCamera;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			scene = loaded.scene;

		};

		$( "progress" ).style.display = "block";

		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

		var loader = new THREE.SceneLoader();

		loader.callbackProgress = callbackProgress;

		loader.load( "js/test_scene.js", callbackFinished );

		window.addEventListener( 'resize', onWindowResize, false );




		// /*
		// * Create Camera
		// * PerspectiveCamera takes following parameters:
		// * 1. fov - vertical field of view for the camera, set to 90 here
		// * 2. aspect - aspect ratio for camera, commonly set to width/height of viewport
		// * 3/4. near/far - any objects between these values are rendered, think of as horizon
		// */
		// // var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
		// var SCREEN_WIDTH = window.innerWidth, 
		// 	SCREEN_HEIGHT = window.innerHeight;
		// var VIEW_ANGLE = 90, 
		// 	ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
		// 	NEAR = 0.1, 
		// 	FAR = 20000;
		
		// // camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// // // Set and add camera to scene. Position is x, y, z
		// // camera.position.set(0, 50, 100);
		// // scene.add(camera);
		// // // .lookAt is overriden by Orbitcontrols, so modify controls.target to change where camera is pointed instead.
		// // camera.lookAt(scene.position);

		// /* 
		// * Renderers
		// * We need an element on the page to draw our game onto, so define rendered and 
		// * assign it to an element with ID of container. Three.js has two primary types of 
		// * renderers - CanvasRenderer (2D canvas context) and WebGLRenderer (WebGL context)
		// */
		// if ( Detector.webgl )
		//   renderer = new THREE.WebGLRenderer( {antialias:true} );
		// else
		//   renderer = new THREE.CanvasRenderer(); 

		// renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		// element = renderer.domElement;
		// container = document.getElementById('container');
		// container.appendChild(element);

		// // For SVG objects
		// // svgRenderer = new THREE.SVGRenderer();
		// // svgRenderer.setClearColor( 0xf0f0f0 );
		// // svgRenderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
		// // svgRenderer.setQuality( 'low' );
		// // container.appendChild( svgRenderer.domElement );

		// // Pass renderer through stereo effect view (2 eyes)
		// effect = new THREE.StereoEffect(renderer);

		
		// * Camera Controls
		// * Controls for moving the camera around using the mouse or touch events are defined
		// * here. We pass in our camera and the DOM element which we'll be attaching our 
		// * event listeners to. Panning and Zooming are off as is.
		
		// controls = new THREE.OrbitControls(camera, element);
		// controls.target.set(
		//   camera.position.x,
		//   camera.position.y + 0.5,
		//   camera.position.z - 100
		// );
		// // controls.noPan = false;
		// // controls.noZoom = false;

		// /*
		// * DeviceOrientation
		// * Set up our device event listener that will allow us to track the motion of the 
		// * phone in our Google Cardboard device. This uses the imported JS module from above.
		// */
		// window.addEventListener('deviceorientation', setOrientationControls, true);

		// /*
		// * setOrientationControls
		// * Function to attach to the event listener. The event listener returns three values 
		// * when it has found a compatible device - alpha, beta, and gamma
		// * We check for alpha value at the start of our function to ensure event data is 
		// * coming through as expected
		// */
		// function setOrientationControls(e) {
		// 	if (!e.alpha) {
		// 		return;
		// 	}
		// 	// Re-assign controls to phone device orientation control, if present
		// 	controls = new THREE.DeviceOrientationControls(camera, true);
		// 	controls.connect();
		// 	controls.update();
		// 	// Remove address bar for mobile devices
		// 	element.addEventListener('click', fullscreen, false);
		// 	// Remove device orientation listener
		// 	window.removeEventListener('deviceorientation', setOrientationControls, true);
		// }
		
		// // fog must be added to scene before first render
		// // scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

		// // Stats helper
		// enableStats();

		// // Axis helper
		// // axisHelper();

		// // Draw scene elements
		// drawLighting();
		// drawLightingHelper();
		// // drawFloor();
		// drawSky();
		// openingText();
		// crawlText();
		// // drawTrench();
		// // drawReticule(); // nice-to-have after
		
	}

	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function onDocumentMouseMove( event ) {

		mouseX = ( event.clientX - windowHalfX );
		mouseY = ( event.clientY - windowHalfY );

	}

	function createLoadScene() {

		var result = {
			scene:  new THREE.Scene(),
			camera: new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 1000 )
		};

		result.camera.position.z = 100;
		result.scene.add( result.camera );

		var object, geometry, material, light, count = 500, range = 200;

		material = new THREE.MeshLambertMaterial( { color:0xffffff } );
		geometry = new THREE.BoxGeometry( 5, 5, 5 );

		for( var i = 0; i < count; i++ ) {

			object = new THREE.Mesh( geometry, material );

			object.position.x = ( Math.random() - 0.5 ) * range;
			object.position.y = ( Math.random() - 0.5 ) * range;
			object.position.z = ( Math.random() - 0.5 ) * range;

			object.rotation.x = Math.random() * 6;
			object.rotation.y = Math.random() * 6;
			object.rotation.z = Math.random() * 6;

			object.matrixAutoUpdate = false;
			object.updateMatrix();

			result.scene.add( object );

		}

		result.scene.matrixAutoUpdate = false;

		light = new THREE.PointLight( 0xffffff );
		result.scene.add( light );

		light = new THREE.DirectionalLight( 0x111111 );
		light.position.x = 1;
		result.scene.add( light );

		return result;
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
		var floorTexture = new THREE.ImageUtils.loadTexture( "../../textures/checkerboard.jpg" );
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
		var imagePrefix = "../../textures/stars-";
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
		jsonLoader.load( "../models/trench.js", addModelToScene );
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
		var material = new THREE.MeshFaceMaterial( materials );
		trench = new THREE.Mesh( geometry, material );
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
		// titletextMesh.position.add(titleDirection);
		// Add vector to crawl text
		// crawltextMesh.position.add(crawlDirection);
		// Add vector to trench
		// trench.position.add(trenchDirection);
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
};

loadWorld();