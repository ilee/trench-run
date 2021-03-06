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
var titleDirection = new THREE.Vector3(0, 0.1, -0.1);
var crawlDirection = new THREE.Vector3(0, 0.1, -0.01);
var titletextMesh = new THREE.Mesh();
var crawltextMesh = new THREE.Mesh();
// Player movement vector
var xwingVector = new THREE.Vector3(0, 0, 1);

// Level graphics
var trench = new THREE.Mesh();
var trenchDirection = new THREE.Vector3(-4, 0, 0);

var raycaster, objects = [];

var keyState = {};
var sphere;

var player, otherPlayer, playerId, moveSpeed, turnSpeed;
var laserContainer;
var laser0Mesh,laser1Mesh;

var loader;
var xwing;
var moon;

var playerData;

var video, videoImage, videoImageContext, videoTexture;

var otherPlayers = [], otherPlayersId = [];
  

/*************************************************************
Primary World
*************************************************************/

var loadWorld = function() {

	init();
	animate();

	function init() {

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
		var VIEW_ANGLE = 45, 
			ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
			NEAR = 0.1, 
			FAR = 20000;
		
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// Set and add camera to scene. Position is x, y, z. Overriden by update function for this app
		camera.position.set(0,0,0);
		scene.add(camera);
		// .lookAt is overriden by Orbitcontrols, so modify controls.target to change where camera is pointed instead.
		// camera.lookAt(scene.position);

		/* 
		* Renderers
		* We need an element on the page to draw our game onto, so define rendered and 
		* assign it to an element with ID of container. Three.js has two primary types of 
		* renderers - CanvasRenderer (2D canvas context) and WebGLRenderer (WebGL context)
		*/
		if ( Detector.webgl )
			// renderer = new THREE.WebGLRenderer( {antialias:true} );
			renderer = new THREE.WebGLRenderer( { alpha: true} );
		else
			renderer = new THREE.CanvasRenderer(); 

		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		raycaster = new THREE.Raycaster();

		element = renderer.domElement;
		container = document.getElementById('container');
		container.appendChild(element);

        /********************************************************
        / Events
        /********************************************************/
        // document.addEventListener('click', onMouseClick, false );
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseout', onMouseOut, false);
        document.addEventListener('keydown', onKeyDown, false );
        document.addEventListener('keyup', onKeyUp, false );
        // window.addEventListener( 'resize', onWindowResize, false );

		// Pass renderer through stereo effect view (2 eyes)
		effect = new THREE.StereoEffect(renderer);

		/*
		* Camera Controls - moved to createPlayer
		* Controls for moving the camera around using the mouse or touch events are defined
		* here. We pass in our camera and the DOM element which we'll be attaching our 
		* event listeners to. Panning and Zooming are off as is.
		*/
		// controls = new THREE.OrbitControls(camera, element);
		// controls.target.set(
		//   camera.position.x,
		//   camera.position.y,
		//   camera.position.z
		// );
		// controls.noPan = false;
		// controls.noZoom = false;

		/*
		* DeviceOrientation
		* Set up our device event listener that will allow us to track the motion of the 
		* phone in our Google Cardboard device. This uses the imported JS module from above.
		*/
		// window.addEventListener('deviceorientation', setOrientationControls, true);

		/*
		* setOrientationControls
		* Function to attach to the event listener. The event listener returns three values 
		* when it has found a compatible device - alpha, beta, and gamma
		* We check for alpha value at the start of our function to ensure event data is 
		* coming through as expected
		*/
		// function setOrientationControls(e) {
		// 	if (!e.alpha) {
		// 		return;
		// 	}
		// 	// Re-assign controls to phone device orientation control, if presents
		// 	controls = new THREE.DeviceOrientationControls(camera, true);
		// 	controls.connect();
		// 	controls.update();
		// 	// Remove address bar for mobile devices
		// 	element.addEventListener('click', fullscreen, true);
		// 	// Remove device orientation listener
		// 	window.removeEventListener('deviceorientation', setOrientationControls, true);
		// }
		
		// fog must be added to scene before first render
		// scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

		// Helpers
		enableStats();
		// axisHelper();

		// Draw scene elements
		drawLighting();
		drawLightingHelper();
		// drawFloor();
		drawSky();
		// openingText();
		// crawlText();
		// drawTrench();
		drawReticule(); // nice-to-have after
		drawMovie();
		
	}

    /********************************************************
    / Functions for player inputs
    /********************************************************/
    function onMouseClick(){
        // intersects = calculateIntersects( event );

        // if ( intersects.length > 0 ){
        //     //If object is intersected by mouse pointer, do something
        //     if (intersects[0].object == sphere){
        //         alert("This is a sphere!");
        //     }
        // }
		console.log("Camera - x: " + camera.position.x + " y: " + camera.position.y + " z: " + camera.position.z);
		console.log("Scene - x: " + scene.position.x + " y: " + scene.position.y + " z: " + scene.position.z);
    }
    function onMouseDown(){

    }
    function onMouseUp(){

    }
    function onMouseMove(){

    }
    function onMouseOut(){

    }
    function onKeyDown( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = true;

    }
    function onKeyUp( event ){

        //event = event || window.event;

        keyState[event.keyCode || event.which] = false;

    }
    function calculateIntersects( event ){

        //Determine objects intersected by raycaster
        event.preventDefault();

        var vector = new THREE.Vector3();
        vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        vector.unproject( camera );

        raycaster.ray.set( camera.position, vector.sub( camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( objects );

        return intersects;
    }

    function drawMovie()
    {
        // create the video element
        video = document.createElement( 'video' );
        // video.id = 'video';
        // video.type = ' video/ogg; codecs="theora, vorbis" ';
        video.src = "videos/swars-trimmed.mp4";
        video.load(); // must call after setting/changing source
        // video.play();
        
        videoImage = document.createElement( 'canvas' );
        videoImage.width = 1280;
        videoImage.height = 720;

        videoImageContext = videoImage.getContext( '2d' );
        // background color if no video present
        videoImageContext.fillStyle = '#000000';
        videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

        videoTexture = new THREE.Texture( videoImage );
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        
        var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
        // the geometry on which the movie will be displayed;
        // movie image will be scaled to fit these dimensions.
        var movieGeometry = new THREE.PlaneGeometry( 430, 240, 1, 1 );
        var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
        movieScreen.position.set(0,0,-100);

        scene.add(movieScreen);
        objects.push(movieScreen);

        // camera.position.set(0,150,300);
        // camera.lookAt(movieScreen.position);
    }

	function drawReticule()
	{
		var node = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' )
		node.setAttribute( 'stroke', 'black' );
		node.setAttribute( 'fill', 'white' );
		node.setAttribute( 'r', '600' ); // radius

		var reticule = new THREE.SVGObject( node.cloneNode() );
		reticule.position.x = 0;
		reticule.position.y = 0;
		reticule.position.z = 1000;
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
		// var lightScene = new THREE.PointLight(0xffffff);
		// lightScene.position.set(0, 150, 100);
		// scene.add(lightScene);
		// // More straight down
		var light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(-500, 1500, -500);
		// console.log(light.position);awe
		scene.add( light );

		// var ambientLight = new THREE.AmbientLight(0x111111);
		// scene.add(ambientLight);

		// Brighter directional light - simulate Sun
		var dirLight = new THREE.DirectionalLight( 0xFFFF66, 10 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set( 500, 20, -1000 );
		dirLight.position.multiplyScalar( 50 );
		scene.add( dirLight );
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

		// Directional light - sun object
		var dirlightbulb = new THREE.Mesh( 
			new THREE.SphereGeometry( 50, 32, 16 ), 
			new THREE.MeshLambertMaterial( { color: 0xffaa00 } )
		);
		scene.add( dirlightbulb );
		dirlightbulb.position.set(2000, 200, -5000);

		var spriteMaterial = new THREE.SpriteMaterial( 
		{ 
			map: new THREE.ImageUtils.loadTexture( 'textures/glow.png' ), 
			color: 0xffaa00, transparent: false, blending: THREE.AdditiveBlending
		});
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(200, 200, 1.0);
		dirlightbulb.add(sprite);

		// Blue sun
		var dirlightbulb2 = new THREE.Mesh( 
			new THREE.SphereGeometry( 50, 32, 16 ), 
			new THREE.MeshLambertMaterial( { color: 0x000084 } )
		);
		scene.add( dirlightbulb2 );
		dirlightbulb2.position.set(1000, -200, -1000);

		var spriteMaterial = new THREE.SpriteMaterial( 
		{ 
			map: new THREE.ImageUtils.loadTexture( 'textures/glow.png' ), 
			color: 0x000084, transparent: false, blending: THREE.AdditiveBlending
		});
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(200, 200, 1.0);
		dirlightbulb2.add(sprite);

		// Death Star
		var sphereGeom =  new THREE.SphereGeometry( 800, 32, 16 ); 
		var moonTexture = THREE.ImageUtils.loadTexture( 'textures/deathstar.jpg' );
		var moonMaterial = new THREE.MeshLambertMaterial( { map: moonTexture } );
		moon = new THREE.Mesh( sphereGeom.clone(), moonMaterial );
		moon.position.set( -1500, -100, -3000);
		scene.add( moon );
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
		var skyGeometry = new THREE.BoxGeometry( 20000, 20000, 20000, 1, 1, 1 );
		// CubeGeometry renamed to BoxGeometry
		// var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
		// BackSide: render faces from inside of the cube, instead of from outside (default).
		// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );

		var materialArray = [];

		for (var i = 0; i < 6; i++) {
			console.log("drawing sky "+ i);
			// var texture = THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix, {}, function() {
			// 	console.log('texture loaded');
			// }, 
			var texture = THREE.ImageUtils.loadTexture( 'textures/stars-hires.png', {}, function() {
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
		var textGeom = new THREE.TextGeometry( "ENJOY THE MOVIE!", 
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
		
		titletextMesh.position.set( -0.5 * textWidth, 20, 0 );
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
		// Add vector to title text to fade away
		titletextMesh.position.add(titleDirection);
		// Add vector to crawl text
		crawltextMesh.position.add(crawlDirection);
		// Add vector to trench
		trench.position.add(trenchDirection);

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
		effect.setSize( width, height );
	}

	function update(dt) {
		var delta = clock.getDelta();
		var width = container.offsetWidth;
		var height = container.offsetHeight;

        if ( player ){

        	// Hacky vector
        	// player.position.z-=0.2;

            updateCameraPosition();

            checkKeyStates();

            // camera.lookAt( player.position );

            // controls.update(dt);
        }

		resize();
		renderer.setSize( width, height );
		effect.setSize( width, height );
		camera.updateProjectionMatrix();
		stats.update();
	}

	function render(dt) {
		var SPEED = 0.01;

        // Check if video is ready
        if( video ) {
	        if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
	        {
	            videoImageContext.drawImage( video, 0, 0 );
	            if ( videoTexture ) 
	                videoTexture.needsUpdate = true;
	        }
        }

        if( moon ) {
        	moon.rotation.y -= SPEED*0.02;
        }

        renderer.render( scene, camera );
		// effect.render( scene, camera ); // 3D dual screen effect
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
}; // end LoadWorld()

var createPlayer = function(data){

    playerData = data;

    loader = new THREE.ColladaLoader();
    loader.load( "textures/model/xwingrealistic.dae", function( collada ) {
    	console.log("xwing loaded!");
    	player = collada.scene;

		player.scale.x = player.scale.y = player.scale.z = 2;
		// player.updateMatrix();

		player.rotation.set(Math.PI / 2 , Math.PI , 0);

		player.position.x = data.x;
		player.position.y = data.y;
		player.position.z = data.z;

		playerId = data.playerId;
		moveSpeed = data.speed;
		turnSpeed = data.turnSpeed;

		updateCameraPosition();

		/*
		* Camera Controls
		* Controls for moving the camera around using the mouse or touch events are defined
		* here. We pass in our camera and the DOM element which we'll be attaching our 
		* event listeners to. Panning and Zooming are off as is.
		*/
		controls = new THREE.OrbitControls(camera, element);
		controls.target.set(
		  player.position.x,
		  player.position.y,
		  player.position.z
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
			// Re-assign controls to phone device orientation control, if presents
			controls = new THREE.DeviceOrientationControls(camera, true);
			controls.connect();
			controls.update();
			// Remove address bar for mobile devices
			element.addEventListener('click', fullscreen, true);
			// Remove device orientation listener
			window.removeEventListener('deviceorientation', setOrientationControls, true);
		}

		objects.push( player );
		scene.add( player );
		// camera.lookAt( player.position );
    });
};

var updateCameraPosition = function(){

    camera.position.x = player.position.x + 0;
    camera.position.y = player.position.y + 7;
    camera.position.z = player.position.z + 35;

};

var updatePlayerPosition = function(data){

    var somePlayer = playerForId(data.playerId);

    somePlayer.position.x = data.x;
    somePlayer.position.y = data.y;
    somePlayer.position.z = data.z;

    somePlayer.rotation.x = data.r_x;
    somePlayer.rotation.y = data.r_y;
    somePlayer.rotation.z = data.r_z;

};

var updatePlayerData = function(){
    playerData.x = player.position.x;
    playerData.y = player.position.y;
    playerData.z = player.position.z;

    // Keep rotation values sane
    if(player.rotation.x > Math.PI) {
    	player.rotation.x = -Math.PI;
    	playerData.r_x = player.rotation.x;
    }
    else if(player.rotation.x < -Math.PI) {
    	player.rotation.x = Math.PI;
    	playerData.r_x = player.rotation.x;
    }
    else {
    	playerData.r_x = player.rotation.x;
    }

    if(player.rotation.y > Math.PI) {
    	player.rotation.y = -Math.PI;
    	playerData.r_y = player.rotation.y;
    }
    else if(player.rotation.y < -Math.PI) {
    	player.rotation.y = Math.PI;
    	playerData.r_y = player.rotation.y;
    }
    else {
    	playerData.r_y = player.rotation.y;
    }

    if(player.rotation.z > Math.PI) {
    	player.rotation.z = -Math.PI;
    	playerData.r_z = player.rotation.z;
    }
	else if(player.rotation.z < -Math.PI) {
    	player.rotation.z = Math.PI;
    	playerData.r_z = player.rotation.z;
    }
    else {
    	playerData.r_z = player.rotation.z;
    }

};
var checkKeyStates = function(){

	// up arrow or 'w' - move forward
    if (keyState[38] || keyState[87]) {

    	// rotate up
    	// player.rotation.x += turnSpeed*.1;

        //facing upwards
    	if((player.rotation.y < -Math.PI / 2) || (player.rotation.y > Math.PI / 2)){
    		console.log("facing up!");
        	player.position.y += Math.abs(moveSpeed * Math.cos(player.rotation.y)); // height`
    	}
    	else if ((player.rotation.y < Math.PI / 2) && (player.rotation.y >= 0)){
    		console.log("facing down!");
        	player.position.y -= moveSpeed * Math.cos(player.rotation.y); // height
    	} else {
    		player.position.y -= moveSpeed * Math.cos(player.rotation.y); // height
    	}
    	player.position.x += moveSpeed * Math.sin(player.rotation.y); // width
    	// Auto-movement
        player.position.z -= moveSpeed; // depth
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    // down arrow or 's' - move backward
    if (keyState[40] || keyState[83]) {
        
        // rotate down
        // player.rotation.x -= turnSpeed*.1;

        //facing upwards
    	if((player.rotation.y < -Math.PI / 2) || (player.rotation.y > Math.PI / 2)){
    		console.log("facing up!");
        	player.position.y -= Math.abs(moveSpeed * Math.cos(player.rotation.y)); // height`
    	}
    	else if ((player.rotation.y < Math.PI / 2) && (player.rotation.y >= 0)){
    		console.log("facing down!");
        	player.position.y += moveSpeed * Math.cos(player.rotation.y); // height
    	} else {
    		player.position.y += moveSpeed * Math.cos(player.rotation.y); // height
    	}
    	player.position.x += moveSpeed * Math.sin(player.rotation.y); // width

    	player.position.z -= moveSpeed; // depth

        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    // left arrow or 'a' - strafe left
    if (keyState[37] || keyState[65]) {
        
        player.position.x += moveSpeed * Math.cos(player.rotation.y);
        player.position.y += moveSpeed * Math.cos(player.rotation.z);
        player.rotation.z += turnSpeed * 0.1;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    // right arrow or 'd' - strafe right
    if (keyState[39] || keyState[68]) {
        
        player.position.x -= moveSpeed * Math.cos(player.rotation.y);
        player.position.y -= moveSpeed * Math.cos(player.rotation.z);
        
        player.rotation.z -= turnSpeed * 0.1;

        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    // 'q' - rotate left
    if (keyState[81]) {
        
        player.rotation.y += turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    // 'e' - rotate right
    if (keyState[69]) {
       
        player.rotation.y -= turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }

    // Video controls
    // 'o' - rewind
    if (keyState[79]) {
    	video.currentTime = 0;
    }
    // 'p' - play
    if (keyState[80]) {
    	video.play();
    }
    // '[' - pause
    if (keyState[219]) {
    	video.pause();
    }
    // ']' - stop
    if (keyState[221]) {
    	video.pause();
		video.currentTime = 0;
    }

};

var addOtherPlayer = function(data){
    // var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    // var cube_material = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: false});
    // var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    // otherPlayer.position.x = data.x;
    // otherPlayer.position.y = data.y;
    // otherPlayer.position.z = data.z;

    // otherPlayersId.push( data.playerId );
    // otherPlayers.push( otherPlayer );
    // objects.push( otherPlayer );
    // scene.add( otherPlayer );

    loader.load( "textures/xwing.dae", function( collada ) {
    	console.log("xwing loaded!");
    	otherPlayer = collada.scene;

		otherPlayer.scale.x = otherPlayer.scale.y = otherPlayer.scale.z = 1;

		// otherPlayer.rotation.set(Math.PI*1.5, Math.PI*2, Math.PI / 2);
		otherPlayer.rotation.set(Math.PI / 2 , Math.PI , 0);
		// otherPlayer.rotation.set(0, 0, 0);

		otherPlayer.position.x = data.x;
		otherPlayer.position.y = data.y;
		otherPlayer.position.z = data.z;

	    otherPlayersId.push( data.playerId );
	    otherPlayers.push( otherPlayer );

		objects.push( otherPlayer );
		scene.add( otherPlayer );
    });

};

var removeOtherPlayer = function(data){

    scene.remove( playerForId(data.playerId) );

};

var playerForId = function(id){
    var index;
    for (var i = 0; i < otherPlayersId.length; i++){
        if (otherPlayersId[i] == id){
            index = i;
            break;
        }
    }
    return otherPlayers[index];
};
