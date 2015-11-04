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

var raycaster, objects = [];

var keyState = {};
var sphere;

var player, playerId, moveSpeed, turnSpeed;

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
		var VIEW_ANGLE = 90, 
			ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, 
			NEAR = 0.1, 
			FAR = 20000;
		
		camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		// Set and add camera to scene. Position is x, y, z
		camera.position.set(0,0,0);
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
        document.addEventListener('click', onMouseClick, false );
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
		* Camera Controls
		* Controls for moving the camera around using the mouse or touch events are defined
		* here. We pass in our camera and the DOM element which we'll be attaching our 
		* event listeners to. Panning and Zooming are off as is.
		*/
		controls = new THREE.OrbitControls(camera, element);
		controls.target.set(
		  camera.position.x,
		  camera.position.y,
		  camera.position.z
		);
		controls.noPan = false;
		controls.noZoom = false;

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
		// drawLighting();
		// drawLightingHelper();
		// drawFloor();
		drawSky();
		// openingText();
		// crawlText();
		// drawTrench();
		// drawReticule(); // nice-to-have after
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
        video.play();
        
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
        var movieGeometry = new THREE.PlaneGeometry( 128, 72, 1, 1 );
        var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
        movieScreen.position.set(0,0,0);

        scene.add(movieScreen);
        objects.push(movieScreen);

        camera.position.set(0,150,300);
        camera.lookAt(movieScreen.position);
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
		console.log(light.position);
		scene.add(light);
	}

	function drawLightingHelper()
	{
		/*
		* Light in the sky object/texture
		*/
		var lightbulb = new THREE.Mesh( 
			new THREE.SphereGeometry( 10, 16, 8 ), 
			new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
		);
		scene.add( lightbulb );
		lightbulb.position.set(0, 150, 100);
		console.log(lightbulb.position);
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

            // updateCameraPosition();

            checkKeyStates();

            // camera.lookAt( player.position );
        }

		// console.log(clock.getElapsedTime());
		// console.log("Camera - x: " + camera.position.x + " y: " + camera.position.y + " z: " + camera.position.z);
		// console.log("Scene - x: " + scene.position.x + " y: " + scene.position.y + " z: " + scene.position.z);
		// resize();
		renderer.setSize( width, height );
		effect.setSize( width, height );
		camera.updateProjectionMatrix();
		controls.update(dt);
		stats.update();
	}

	function render(dt) {

        // Check if video is ready
        if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
        {
            videoImageContext.drawImage( video, 0, 0 );
            if ( videoTexture ) 
                videoTexture.needsUpdate = true;
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

    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: false});
    player = new THREE.Mesh(cube_geometry, cube_material);

    player.rotation.set(0,0,0);

    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;

    playerId = data.playerId;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;

    updateCameraPosition();

    objects.push( player );
    scene.add( player );

    // camera.lookAt( player.position );
};

var updateCameraPosition = function(){

    camera.position.x = player.position.x + 50 * Math.sin( player.rotation.x );
    camera.position.y = player.position.y + 50 * Math.sin( player.rotation.y );
    camera.position.z = player.position.z + 50 * Math.cos( player.rotation.z );

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

    playerData.r_x = player.rotation.x;
    playerData.r_y = player.rotation.y;
    playerData.r_z = player.rotation.z;

};
var checkKeyStates = function(){

    if (keyState[38] || keyState[87]) {
        // up arrow or 'w' - move forward
        player.position.x -= moveSpeed * Math.sin(player.rotation.y);
        player.position.z -= moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[40] || keyState[83]) {
        // down arrow or 's' - move backward
        player.position.x += moveSpeed * Math.sin(player.rotation.y);
        player.position.z += moveSpeed * Math.cos(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[37] || keyState[65]) {
        // left arrow or 'a' - rotate left
        player.rotation.y += turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[39] || keyState[68]) {
        // right arrow or 'd' - rotate right
        player.rotation.y -= turnSpeed;
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[81]) {
        // 'q' - strafe left
        player.position.x -= moveSpeed * Math.cos(player.rotation.y);
        player.position.z += moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }
    if (keyState[69]) {
        // 'e' - strage right
        player.position.x += moveSpeed * Math.cos(player.rotation.y);
        player.position.z -= moveSpeed * Math.sin(player.rotation.y);
        updatePlayerData();
        socket.emit('updatePosition', playerData);
    }

};

var addOtherPlayer = function(data){
    var cube_geometry = new THREE.BoxGeometry(data.sizeX, data.sizeY, data.sizeZ);
    var cube_material = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: false});
    var otherPlayer = new THREE.Mesh(cube_geometry, cube_material);

    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;

    otherPlayersId.push( data.playerId );
    otherPlayers.push( otherPlayer );
    objects.push( otherPlayer );
    scene.add( otherPlayer );

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
