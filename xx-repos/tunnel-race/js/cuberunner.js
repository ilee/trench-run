var scene;
var camera;
var renderer;
var viewportHeight

var mobile;
var tube;

var tileW;
var tileH;

var tube_angle;
var tube_speed;
var tube_z_offset;
var tube_rot_speed;
var tube_angle_offset;

var basic_speed; 
var current_speed; // fps corrected speed

// Pre-calculated values
var a_180 = Math.PI;
var a_360 = 2 * Math.PI;
var a_15 = Math.PI / 12;
var a_30 = Math.PI / 6;

var device;
var gameState;
var cdfc; // Cube distance from (tube-)center 
var cdfc_default;
var range;
var stage;
var level;
var score;
var highscore;
var lives;
var keep_mode;
var mode;
var crash;
var transition;
var tubeTrail;
var rowSize;
var maxCubes;
var cubeRepeat;
var cubeSequence;
var startTrack;
var fpsTime; // time to calculate frames per second
var pTime; // past time since last rendering
var ticks; // timer for releasing new cubes
var fog_near, fog_far;

var fpsCF; // FPS correction factor
var tfs;
var fps;
var startTime, endTime, refreshTime;
var cubeSequence;
var cube_offset_x, cube_offset_y;

// Score top-left
var digit = [	{object:null, v:-1.0, track:0, color:0, shader:null},
	          	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null},
	         	{object:null, v:-1.0, track:0, color:0, shader:null}
             ];

var myCube = {object:null, v:-1.0, track:0, type:0, color:0, shader:null};

var cube = [	
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
            	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null},
             	{object:null, v:-1.0, track:0, tY:0, color:0, shader:null}
            ];

var cubeColorValues = [
                       {x: 1.0, y: 0.6, z: 0.8}, 		// pastel red
                       {x: 0.6, y: 1.0, z: 0.8}, 		// pastel green
                       {x: 0.6, y: 0.8, z: 1.0}, 		// pastel blue

                       {x: 0.75, y: 0.75, z: 0.75}, 	// light gray
                       {x: 0.5, y: 0.5, z: 0.5}, 		// gray
                       {x: 0.25, y: 0.25, z: 0.25}, 	// dark gray
                       
                       {x: 1.0, y: 0.0, z: 0.0},   		// fast cube red
                       {x: 0.0, y: 1.0, z: 0.0},  	 	// fast cube green
                       {x: 1.0, y: 0.5, z: 0.0},   		// fast cube orange
                       
                       {x: 1.0, y: 0.0, z: 0.0},   		// barrier red
                       {x: 0.0, y: 1.0, z: 0.0},   		// barrier green
                       {x: 1.0, y: 0.5, z: 0.0},   		// cuboid yellow
                       
                       {x: 0.0, y: 1.0, z: 1.0}   		// standard cyan
                       
                       ];

const PC_FPS = 60;
const MOBILE_FPS = 40;
//const TARGET_REFRESH_TIME = 25;

const UNDEFINED_VALUE = -99;

const MOBILE_iOS = 2;

const TUBE_TILES_L = 24;
const TUBE_TILES_R = 12;
const TUBE_RADIUS = 1;
const CUBE_COLOR_FAST = 6;
const CAMERA_OFFSET = -0.5;

const MENU_OFFSET_Z = -0.1; 
const DIGIT_SIZE = 0.01;

const MODE_PORTRAIT = -1;
const MODE_DEMO = 0;
const MODE_GAME = 1;
const MODE_PAUSE = 2;
const MODE_INFO = 3;
const MODE_GAME_OVER = 4;

const STAGES = 8;
const STAGE_TIME = 30000;

const DEVICE_TOUCH = 0;
const DEVICE_MOUSE = 1;

const STAGE_COLOR_CUBES_1 = 0;
const STAGE_RED_FAST_CUBES = 1;
const STAGE_STONY_CUBES = 2;
const STAGE_ORANGE_LONG_CUBES = 3;
const STAGE_COLOR_CUBES_2 = 4;
const STAGE_ROW_CUBES = 5;
const STAGE_COLOR_CUBES_3 = 6;
const STAGE_BARRIER = 7;

function init(level, stage) {
	
	this.stage = stage;
	this.level = level;
	
	pTime = new Date().getTime();
	tTime = new Date().getTime();
	fpsTime = new Date().getTime();
	transition = -1;
	tube_z_offset = (tileH * TUBE_TILES_L) / 2;
	keep_mode = UNDEFINED_VALUE;
	
	if (mode == MODE_GAME)
	{
		scene.add(myCube.object);
		scene.remove(bScreen);
		scene.remove(button_music);
		scene.remove(button_info);
		scene.remove(button_start);
		
		if (mobile > 0)
			scene.remove(button_fullscreen);
		
		scene.remove(title);
		scene.remove(info);
		score = 0;
		
		for (i = 0; i< digit.length; i++)
		{
			digit[i].object.position.x = DIGIT_SIZE * 10 * (-Math.tan((fov / 360) * Math.PI) * rFrustum + (i + 1) * 0.1);
			digit[i].object.position.y = DIGIT_SIZE * 10 * (Math.tan((fov / 360) * Math.PI) - 0.1) + CAMERA_OFFSET;
			digit[i].shader.uniforms.digit.value = 0.0;
			digit[i].shader.uniforms.digitColor.value.y = 1.0;
			
			if (highscore == 0)
				scene.add(digit[i].object);
		}
	}
	
	else
	{
		scene.add(button_music);
		scene.add(button_info);
		scene.add(button_start);
		
		if (mobile > 0)
		{
			scene.add(button_fullscreen);
			BASIC_FPS = MOBILE_FPS;
		}
		
		else
			BASIC_FPS = PC_FPS;
		
		scene.add(bScreen);
		score = highscore;
		scene.remove(myCube.object);
		
		if (mode == MODE_INFO)
			scene.add(info);
		
		else
		{
			scene.add(title);
			
			for (i = 0; i< digit.length; i++)
			{
				digit[i].object.position.x = DIGIT_SIZE * (-3.5 + i);
				digit[i].object.position.y = CAMERA_OFFSET;
				digit[i].shader.uniforms.digitColor.value.y = 0.0;
				
				if (highscore > 0)
					scene.add(digit[i].object);
			}
		}
	}
	
	lives = 3;
	ticks = 0;
	fpsCF = 1;
	rowSize = UNDEFINED_VALUE;
	cubeSequence = 0;
	startTrack = UNDEFINED_VALUE;
	
	// Tube
	tube.rotation.y = 0.0;
	tube_rot_speed = 0.0;
	tube.position.z = - tube_z_offset;
	tube_angle = 0;
	tube_angle_offset = a_15;
	
	cdfc_default = Math.cos(Math.PI / TUBE_TILES_R) - tileW / 2;
	
	prepareStage();
}


function pause(set) {
	
	if (set == true)
	{
		if (keep_mode == UNDEFINED_VALUE)
			keep_mode = mode;
		
		mode = MODE_PAUSE;
	}
	
	else if (keep_mode != UNDEFINED_VALUE)
	{
		mode = keep_mode;
		keep_mode = UNDEFINED_VALUE;
	}
	//alert("Mode: " + mode);
}

function quitGame() {
	
	mode = MODE_DEMO;
	title.material = title_material;
	highscore = Math.max(score, highscore);
	localStorage.setItem("Record", highscore.toString());
	init(0, 0);
	
	// -------------------- Advertising --------------------
	if (mobile > 0)
	{
		//window.location.href = "http://ad.leadboltmobile.net/show_app_wall?section_id=851332947";
		// window.location.href = "https://offers.appnext.com/appwall/online/AW2/index.html?android_id=af4c468e-6ba7-4af1-85c7-3e8a3de1a36b&ios_id=c4517e0b-d1c3-4106-a4c5-0c023dd6fd92&cnt=5&postback_parameter=&wall_title="; 
	}
	// -----------------------------------------------------
}


// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------
// function prepareStage(): 
// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------

function prepareStage() {
	
	if (stage > 7)
	{
		stage = 0;
		level += 1;
	}
	
	if (stage == STAGE_ROW_CUBES)
		maxCubes = cube.length;
	
	else
		maxCubes = 12;
	
	basic_speed = 0.1 + level * 0.01; // based on BASIC_FPS
	cdfc = cdfc_default;// Math.cos(Math.PI / TUBE_TILES_R) - tileW / 2;
	cubeRepeat = 5;
	crash = UNDEFINED_VALUE;
	
	for (i = 0; i < cube.length; i++)
	{
		cube[i].v = -1.0;
		tube_uniforms.pz.value[i] = cube[i].v;
		scene.remove(cube[i].object);
	}
	
	if (stage % 2 == 0)
	{
		tube_uniforms.tubeColor.value.x = 1.0;
		tube_uniforms.tubeColor.value.y = 1.0;
		tube_uniforms.tubeColor.value.z = 1.0;
		
		if (stage != 2)
			tubeTrail = true;
		
		else
			tubeTrail = false;
	}
	
	else
	{
		tube_uniforms.tubeColor.value.x = 0.25;
		tube_uniforms.tubeColor.value.y = 0.25;
		tube_uniforms.tubeColor.value.z = 0.25;
		
		tubeTrail = false;
	}
	
	switch (stage)
	{
		case STAGE_RED_FAST_CUBES:
			cubeRepeat = 3;
			break;
	
		case STAGE_STONY_CUBES:
			cdfc += (tileW + 0.05);
			break;
	
		case STAGE_ORANGE_LONG_CUBES:
			cdfc = 0.0;
			break;
			
		case STAGE_ROW_CUBES:
			basic_speed *= 2;
			break;
			
		case STAGE_BARRIER:
			basic_speed *= 1.2;
			cdfc += (tileW / 2);
			break;
	}
	
	tube_speed = basic_speed;	
	current_speed = basic_speed;
	ticks = 0;
}


// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------
// function nextStage(): 
// ----------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------

function nextStage() {
	
	switch (stage)
	{
	
		case 0:
		case 2:
		case 4:
		case 6:
		
			if (transition == -1)
			{
				if (pTime - tTime >= STAGE_TIME)
					transition = 1;
					
				else
					tube_speed = basic_speed + 0.01 * Math.floor((pTime - tTime) / 3000);
			}
			
			else if ((transition == 1) && (getCubeOnTrack(-1) == false))
			{
				tube_uniforms.tubeColor.value.x = Math.max(tube_uniforms.tubeColor.value.x - 0.01, 0.25);
				tube_uniforms.tubeColor.value.y = Math.max(tube_uniforms.tubeColor.value.y - 0.01, 0.25);
				tube_uniforms.tubeColor.value.z = Math.max(tube_uniforms.tubeColor.value.z - 0.01, 0.25);
				
				tube_speed = Math.max(basic_speed, tube_speed - 0.01);
				
				if (tube_uniforms.tubeColor.value.x == 0.25)
				{
					transition = -1;
					stage += 1;
					tTime = pTime;
					prepareStage();
				}
			}
			
			break;
			
			
		case 1:
		case 3:
		case 5:
		case 7:
			
			if ((transition == -1) && (pTime - tTime >= STAGE_TIME))
				transition = 1;
			
			else if ((transition == 1) && (getCubeOnTrack(-1) == false))
			{
				tube_uniforms.tubeColor.value.x = Math.min(tube_uniforms.tubeColor.value.x + 0.01, 1.0);
				tube_uniforms.tubeColor.value.y = Math.min(tube_uniforms.tubeColor.value.y + 0.01, 1.0);
				tube_uniforms.tubeColor.value.z = Math.min(tube_uniforms.tubeColor.value.z + 0.01, 1.0);
				
				tube_speed = Math.max(basic_speed, tube_speed - 0.01);
				
				if (tube_uniforms.tubeColor.value.x == 1.0)
				{
					transition = -1;
					stage += 1;
					tTime = pTime;
					prepareStage();
				}
			}
			
			break;
			
	}
}



//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//function getCubeOnTrack(): 
//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

function getCubeOnTrack(track) {
	
	if (track >= 0)
	{
		for (j = 0; j < maxCubes; j++)
		{
			if ((cube[j].v != -1.0) && (cube[j].track == track))
				return true;
		}
	}
	
	else
	{
		for (j = 0; j < maxCubes; j++)
		{
			if (cube[j].v != -1.0) 
				return true;
		}
	}
	
	return false;
}



function action() {
	
	if (crash > 0)
	{
		crash--;
		
		if (crash == 5)
			scene.remove(rScreen);
		
		if (crash == 0)
			crash = UNDEFINED_VALUE;
	}
	
	// -------------------- Tube --------------------
	tube_angle += tube_rot_speed;
	
	if (tube_angle >= a_360)
		tube_angle -= a_360;
	
	else if (tube_angle < 0)
		tube_angle += a_360;
	
	tube.rotation.x = Math.PI / 2; 
  	tube.rotation.y += tube_rot_speed;
	tube.position.z += current_speed;
	
	
	// -------------------- Tube replacement --------------------
	if (tube.position.z >= -tube_z_offset + tileH)
  	{	
  		tube.position.z -= tileH;
  		
  		for (i = 0; i < maxCubes; i++)
  		{
  			if (cube[i].v >= 0.0)
  			{
  				cube[i].v += 1;
  				tube_uniforms.pz.value[i] = cube[i].v;
  			}
  		}
  		
  		if (transition == -1)
  		{	
//  			if (mode == MODE_GAME)
//  			{
//  				myCube.shader.uniforms.tY.value = 0.3;
//  				alert("myCube: " + myCube.object.position.y);
//  			}
  			
	  		// New cubes
	  		if ((ticks > 0) && (ticks%cubeRepeat == 0))
	  		{
	  			for (i = 0; i < maxCubes; i++)
	  			{
	  				if (cube[i].v == -1.0)
	  				{
	  					do {cube[i].track = Math.floor(maxCubes * Math.random())} // FEHLER!!!
	  					while (getCubeOnTrack(cube[i].track) == true);
	  					
	  					var cc = 0;
	  					cube[i].v = 0.0;
		  				//cube[i].tY = 0.0;
	  					cube[i].shader.uniforms.sX.value = 1.0;
	  					cube[i].shader.uniforms.sY.value = 1.0;
	  					cube[i].shader.uniforms.tY.value = 0.0;
	  					cube[i].shader.uniforms.cubeColor.value.w = 1.0;
	  					
	  					switch (stage)
	  					{
	  						case 0:
	  						case 4:
	  						case 6:
	  							cc = Math.floor(3 * Math.random());
	  							
	  							if (stage != 0)
	  							{
	  								var typeOfCube = Math.floor(4 * Math.random()); 
	  								
	  								if (rowSize == UNDEFINED_VALUE)
	  								{
	  									cubeRepeat = 5;
	  									
		  								if (typeOfCube == 0)
		  								{
		  									cube[i].shader.uniforms.sY.value = 2.0 / tileW;
		  									cube[i].tY = cdfc;
		  									cube[i].shader.uniforms.tY.value = cube[i].tY;
		  									cc = 11;
		  								}
		  								
		  								else if ((stage == 6) && (typeOfCube == 1))
		  								{
		  									rowSize = 4;
		  									cubeRepeat = 1;
		  								}
	  								}
	  								
	  								if (rowSize != UNDEFINED_VALUE)
	  								{
	  									cc = 12;
	  									
		  								if (cubeSequence == 0)
			  								startTrack = cube[i].track;
			  							
			  							else if ((cubeSequence > 0) && (cubeSequence < rowSize))
			  							{
			  								if (startTrack % 2 == 0)
			  									cube[i].track = (startTrack + cubeSequence) % 12;
			  								
			  								else
			  									cube[i].track = (12 + startTrack - cubeSequence) % 12;
			  							}
			  							
			  							cubeSequence++;
			  							
			  							if (cubeSequence == rowSize)
			  							{
			  								cubeSequence = 0;
			  								cubeRepeat = ticks + 5;
			  								rowSize = UNDEFINED_VALUE;
			  							}
			  							
			  							else
			  								cubeRepeat = 1;
	  								}
	  							}
	  							
	  							break;
	  						
	  							
	  						case 1:
	  							cc = CUBE_COLOR_FAST;
	  							break;
	  							
	  							
	  						case STAGE_STONY_CUBES:
	  							cc = 3 + Math.floor(3 * Math.random());
	  							cube[i].tY = 0.02;
	  							break;
	  							
	  						case 3:
	  							cube[i].shader.uniforms.sY.value = 2.0 / tileW;
	  							cc = 8;
	  							cube[i].shader.uniforms.cubeColor.value.w = 0.0;
	  							break;
	  						
	  						case STAGE_ROW_CUBES:
	  							
	  							cc = 12;
	  							
	  							if (rowSize == UNDEFINED_VALUE)
	  								rowSize = 4 + 2 * Math.floor(3 * Math.random());
	  							
	  							if (cubeSequence == 0)
	  								startTrack = cube[i].track;
	  							
	  							else if ((cubeSequence > 0) && (cubeSequence < rowSize))
	  							{
	  								if (startTrack % 2 == 0)
	  									cube[i].track = (startTrack + cubeSequence) % 12;
	  								
	  								else
	  									cube[i].track = (12 + startTrack - cubeSequence) % 12;
	  							}
	  							
	  							cubeSequence++;
	  							
	  							if (cubeSequence == rowSize)
	  							{
	  								cubeSequence = 0;
	  								cubeRepeat = ticks + 10;
	  								rowSize = UNDEFINED_VALUE;
	  							}
	  							
	  							else
	  								cubeRepeat = 1;
	  								
	  							break;
	  							
	  							
	  						case 7:
	  							
	  							tubeTrail = false;
	  							cc = 10;
	  							
	  							if (ticks%(cubeRepeat << 1) == 0)
	  							{
	  								cube[i].shader.uniforms.sX.value = 2.0 / tileW;
	  								cube[i].shader.uniforms.sY.value = 2.0 / tileW;
	  								cube[i].shader.uniforms.cubeColor.value.w = 0.5;
	  								startTrack = cube[i].track;
	  							}
	  							
	  							else
	  							{
	  								cc = 7;
	  								if ((startTrack != UNDEFINED_VALUE) && (ticks > 50))
	  								{
	  									cube[i].shader.uniforms.tY.value = tileW / 2;
	  									cube[i].track = (startTrack + 4 + Math.floor(5 * Math.random())) % 12;
	  								}
	  								
	  								else
	  									cube[i].v = -1.0;
	  							}
	  							
	  							break;
	  					}
	  					
	  					
	  					cube[i].color = cc;
	  					
	  					cube[i].shader.uniforms.cubeColor.value.x = cubeColorValues[cc].x;
	  					cube[i].shader.uniforms.cubeColor.value.y = cubeColorValues[cc].y;
	  					cube[i].shader.uniforms.cubeColor.value.z = cubeColorValues[cc].z;
	  					
	  					tube_uniforms.cubeColor.value[i].x = cubeColorValues[cc].x;
	  					tube_uniforms.cubeColor.value[i].y = cubeColorValues[cc].y;
	  					tube_uniforms.cubeColor.value[i].z = cubeColorValues[cc].z;
	  					
	  					//cube[i].object.position.z = -tileH * TUBE_TILES_L + (tileH / 2);
	  					cube[i].object.position.z = tube.position.z - tileH * (TUBE_TILES_L / 2) + (tileH / 2) - current_speed;
	  					cube[i].object.rotation.z = tube_angle_offset + cube[i].track * a_30;
	  					cube[i].shader.uniforms.cubeRot.value = cube[i].object.rotation.z - (Math.PI / 2);
	  					cube[i].object.rotation.z += tube_angle;
	  					

	  					if (tubeTrail == true)
	  					{
	  						if (cube[i].color != 11)
	  							tube_uniforms.track.value[i] = cube[i].track;
	  						
	  						else
	  							tube_uniforms.track.value[i] = -1.0;
	  					}
	  					
	  					else
	  						tube_uniforms.track.value[i] = -1.0; 
	  							
	  					tube_uniforms.pz.value[i] = cube[i].v;
	  					cube[i].object.rotation.z -= tube_rot_speed;
	  					scene.add(cube[i].object);
	  					
	  					break;
	  				}
	  			}
	  		}
  		}
  		
  		ticks++;
  	}

	
	// -------------------- Cubes --------------------
	for (i = 0; i < maxCubes; i++)
	{
		if ((cube[i].v >= 0.0) && (cube[i].v <= TUBE_TILES_L))
		{
			cube[i].object.rotation.z += tube_rot_speed;
			cube[i].object.translateY(-cdfc);
			cube[i].object.translateZ(current_speed);	
			
			// double speed for STAGE_RED_FAST_CUBES and STAGE_ROW_CUBES
			if ((cube[i].color == 6) || (cube[i].color == 7)) 
				cube[i].object.translateZ(current_speed);
			
			if (stage == STAGE_STONY_CUBES) 
			{
				
				if ((cube[i].color == 3) && (cube[i].v > 7.0))
				{
					cube[i].shader.uniforms.tY.value = Math.min(cube[i].shader.uniforms.tY.value + cube[i].tY, tileW);
				}	
				else if ((cube[i].color == 4) && (cube[i].v > 8.0))
					cube[i].shader.uniforms.tY.value = Math.min(cube[i].shader.uniforms.tY.value + cube[i].tY, tileW);
			
				else if ((cube[i].color == 5) && (cube[i].v > 9.0))
					cube[i].shader.uniforms.tY.value = Math.min(cube[i].shader.uniforms.tY.value + cube[i].tY, tileW);
				
				cube[i].object.translateY(tileW + 0.05);
			}
			
			else if (stage == 3)
			{
				if (cube[i].v > 8.0)
					cube[i].shader.uniforms.cubeColor.value.w = Math.min(1.0, cube[i].shader.uniforms.cubeColor.value.w + 0.05);
			}
			
			var crash_test = 1;
			
			if (cdfc == 0.0)
			{
				cube[i].object.translateY(-cdfc_default);
				crash_test = 2;
			}
			
			// -------------------- check crash --------------------
			
			for (c = 0; c < crash_test; c++)
			{
				if (c == 1)
					cube[i].object.translateY(2 * cdfc_default);
					
				if (crash == UNDEFINED_VALUE)
				{
					
					if (	mode == MODE_GAME
						&&	cube[i].object.position.z + (tileW / 2) > myCube.object.position.z - (tileW / 4)
						&&  (cube[i].object.position.z <= myCube.object.position.z)
						&& 	(((cube[i].shader.uniforms.sX.value > 2.0) && (Math.abs(cube[i].object.position.y - myCube.object.position.y) < 1))
						||	((Math.abs(cube[i].object.position.x - myCube.object.position.x) < 0.75 * tileW)
							&&  (Math.abs(cube[i].object.position.y - myCube.object.position.y) < 0.75 * tileW))))
					{
						playAudio(1);
						lives --;
						cube[i].v = TUBE_TILES_L << 1;
						scene.add(rScreen);
						crash = 10;
						
						if (lives == 0) // GAME OVER
						{
							mode = MODE_GAME_OVER;
							pauseAudio(true);
							setTimeout(function() {
								title.material = fail_material;
								scene.add(bScreen);
								scene.add(title);	
							}, 200);
							
							setTimeout(function() {quitGame();}, 2000);
						}
					}
				} // if
			} // for
			
		}
		
		else if (cube[i].v > TUBE_TILES_L)
		{
			cube[i].v = -1.0;
			tube_uniforms.pz.value[i] = cube[i].v;
			scene.remove(cube[i].object);
		}
		
		if ((mode != MODE_GAME) && (cube[i].v > TUBE_TILES_L - 3))
			cube[i].v = TUBE_TILES_L << 1;
	}
	
	
	// -------------------- check progress/end of stage --------------------
	if (mode == MODE_GAME)
		nextStage();
	
	
	
	
	// -------------------- Score --------------------
	
	if (mode == MODE_GAME)
		score += 1;
	
	var kScore = score;

	for (i = 7; i >= 0; i--)
	{
		digit[i].shader.uniforms.digit.value = (kScore % 10);
		kScore = Math.floor(kScore / 10);
		
		if (kScore == 0)
			break;
	}
}

var render = function () { 
	
//	setTimeout(function() {requestAnimationFrame(render);}, 20);
	
//	if (mobile == MOBILE_iOS)
//		setTimeout(function() {render();}, 40);
		
//	else
		requestAnimationFrame(render);
	
	var now = new Date().getTime();
	
	if (mode != MODE_PAUSE)
	{
//		if (now - pTime >= 40)	
//		{
			action();
			pTime = now;
		
			
			
			
			for (i = 0; i < maxCubes; i++)
			{
				if (cube[i].v >= 0)
				{
					if (cdfc == 0.0)
						cube[i].object.translateY(-cdfc_default);
					
					else if (stage == STAGE_STONY_CUBES)
						cube[i].object.translateY(-tileW - 0.05);
				}
			}
			redraws ++;
			renderer.render(scene, camera);
			
			// -------------------- Undo cube center translation --------------------
			for (i = 0; i < maxCubes; i++)
			{
				if (cube[i].v >= 0)
					cube[i].object.translateY(cdfc);
			}
//		}
		
		// -------------------- FPS calculation and refreshTIme correction --------------------
		if (now - fpsTime >= 1000)
		{
			fpsTime = now;
			fps = redraws;
//			if (redraws > TARGET_FPS)
//				refreshTime += 2;
			
//			else if (redraws < TARGET_FPS)
//				refreshTime = Math.max(refreshTime - 2, 10);
			
			redraws = 0;
			fpsCF = BASIC_FPS / fps;
			current_speed = tube_speed * fpsCF;
			
//			basic_speed = (0.1 + level * 0.01) * fpsCF;
//			tube_speed = basic_speed;
		}
	}
}; 
  		

function navigate(x, y) {
	
//	if (parseInt(sessionStorage.getItem("Gamestate"), 10) == 1)
//	{
		// Audio-Button
		if (Math.sqrt(	Math.pow(	x - (	(window.innerWidth >> 1) - (	(button_size * 1.5 * window.innerWidth) / (2 * r_3D_2D * rFrustum)	)	), 2) +
						Math.pow(	y - (	(viewportHeight >> 1) + (	(button_size * viewportHeight) / (2 * r_3D_2D)	)	), 2)	) <= viewportHeight * (button_size / (4 * r_3D_2D)))
		{
			isAudio = !isAudio;
			
			if (isAudio == true)
				music_shader.uniforms.mType.value = 1.0;
			
			else
				music_shader.uniforms.mType.value = 0.0;
		}
		
		// Start-Button
		else if (Math.sqrt(	Math.pow(	x - (window.innerWidth >> 1), 2) +
							Math.pow(	y - (	(viewportHeight >> 1) + (	(button_size * viewportHeight) / (2 * r_3D_2D)	)	), 2)	) <= viewportHeight * (button_size / (4 * r_3D_2D)))
		{
			mode = MODE_GAME;
			playAudio(0);
			init(0, 0);
		}	
		
		// Info-Button
		else if (Math.sqrt(	Math.pow(	x - (	(window.innerWidth >> 1) + (	(button_size * 1.5 * window.innerWidth) / (2 * r_3D_2D * rFrustum)	)	), 2) +
							Math.pow(	y - (	(viewportHeight >> 1) + (	(button_size * viewportHeight) / (2 * r_3D_2D)	)	), 2)	) <= viewportHeight * (button_size / (4 * r_3D_2D)))
		{	
			if (mode == MODE_DEMO)
			{
				for (i = 0; i < digit.length; i++)
					scene.remove(digit[i].object);
				
				scene.remove(title);
				scene.add(info);
				mode = MODE_INFO;
			}
			
			else if (mode == MODE_INFO)
			{
				if (highscore > 0)
				{
					for (i = 0; i < digit.length; i++)
						scene.add(digit[i].object);
				}
				
				scene.remove(info);
				scene.add(title);
				mode = MODE_DEMO;
			}
		}
		
		// Fullscreen-Button
		else if ((x >= window.innerWidth - (0.25 / rFrustum) * window.innerWidth) && (y >= 0.75 * viewportHeight))
		{ 
			if (mobile > 0)
				toggleFullScreen();
		}
		
//		else
//		{
//			window.scrollTo(0, 1);
//			canvas.parentNode.removeChild(canvas);
//			document.body.appendChild( renderer.domElement );
//			render();
//		}
//	}
	
//	else if (parseInt(sessionStorage.getItem("Gamestate"), 10) == 0)
//	{
//		sessionStorage.setItem("Gamestate", "1");
//		document.body.appendChild( renderer.domElement );
//		render();
//		localStorage.setItem("Gamestate", "1");
//		window.location.href = "http://ad.leadboltmobile.net/show_app_wall?section_id=851332947";
//		canvas.parentNode.removeChild(canvas);	
//	}
};

function handleMotionEvent(event) {

	if (mode == MODE_GAME)
	{
		var y = event.accelerationIncludingGravity.y;

	    if (y > 0)
	    	tube_rot_speed = Math.max(y * -0.1, -0.4);
	    
	    else
	    	tube_rot_speed = Math.min(y * -0.1, 0.4);
	    
	    if (mobile == MOBILE_iOS) // iOS
	    {
	    	tube_rot_speed *= -0.75;
	    }
	}
};

function initVisibilityChange() {
	
	if (typeof document.webkitHidden !== "undefined") {
	      hidden = "webkitHidden";
	      visibilityChange = "webkitvisibilitychange";
	    } else if (typeof document.mozHidden !== "undefined") {
	      hidden = "mozHidden";
	      visibilityChange = "mozvisibilitychange";
	    } else if (typeof document.msHidden !== "undefined") {
	      hidden = "msHidden";
	      visibilityChange = "msvisibilitychange";
	    } else if (typeof document.hidden !== "undefined") { 
		  hidden = "hidden";
		  visibilityChange = "visibilitychange";
	    }
}

function toggleFullScreen() {
	
	var docElm = document.documentElement;
	
	if (docElm.requestFullscreen) {
	docElm.requestFullscreen();
	}
	else if (docElm.mozRequestFullScreen) {
	docElm.mozRequestFullScreen();
	}
	else if (docElm.webkitRequestFullScreen) {
	docElm.webkitRequestFullScreen();
	}
	else if (docElm.msRequestFullscreen) {
	docElm.msRequestFullscreen();
	}
	
	if (tfs != -1)
		tfs = 1;
	
	setTimeout(function() 
	{
		if (tfs == 1)
			alert("Your browser doesn't support fullscreen mode!");
		
		else
			tfs = -1;
	}, 500);
	
}

function setPerspective() {
	
	fov = 75;
	rFrustum = window.innerWidth / viewportHeight;
	
	// --------------------------------------------------------------------------------------------
  	// Frustum depending parameters. Must be renewed on resize
  	// --------------------------------------------------------------------------------------------
	camera = new THREE.PerspectiveCamera( fov, rFrustum, 0.1, 20 );
	camera.position.z = 0.0;
	camera.position.y = CAMERA_OFFSET;
	r_3D_2D = Math.tan(Math.PI * fov / 360) * Math.abs(MENU_OFFSET_Z);
	button_size = r_3D_2D * 0.5 * Math.min(1.0, rFrustum);
	renderer.setSize( window.innerWidth, viewportHeight );

	if (tfs == 1)
		tfs = -1;
		
}



// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------
// renewGraphics(resize) : updates all graphics depending on frustum
//------------------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------------------

function renewGraphics(resize) {
	
	if (mode != MODE_GAME)
	{
		if (resize)
		{
			scene.remove(button_music);
			scene.remove(button_info);
			scene.remove(button_start);
			scene.remove(button_fullscreen);
			scene.remove(title);
			scene.remove(info);
		}
		
		var title_geometry = new THREE.PlaneGeometry( 0.12 * rFrustum, 0.015 * rFrustum );
		var info_geometry = new THREE.PlaneGeometry( 0.09 * rFrustum, 0.05 * rFrustum );
		var button_geometry = new THREE.PlaneGeometry(button_size, button_size, 1, 1);
		
		button_music = new THREE.Mesh(button_geometry, music_shader);
		button_info = new THREE.Mesh(button_geometry, info_shader);
		button_start = new THREE.Mesh(button_geometry, start_shader);
		button_fullscreen = new THREE.Mesh(button_geometry, ADbutton_shader);
		
		button_music.position.x = -button_size * 1.5;
		button_music.position.y = CAMERA_OFFSET - button_size;
		button_music.position.z = MENU_OFFSET_Z;
		
		button_start.position.y = CAMERA_OFFSET - button_size;
		button_start.position.z = MENU_OFFSET_Z;
		
		button_info.position.x = button_size * 1.5;
		button_info.position.y = CAMERA_OFFSET - button_size;
		button_info.position.z = MENU_OFFSET_Z;
		
//		button_fullscreen.scale.set(0.5, 0.5, 0.5);
		button_fullscreen.position.y = CAMERA_OFFSET - (button_size * 2) + (button_size / 2);
		button_fullscreen.position.x = (button_size * 2) * rFrustum - (button_size / 2);
//		button_fullscreen.position.x = (button_fullscreen.position.y - CAMERA_OFFSET) * -rFrustum;
		button_fullscreen.position.z = MENU_OFFSET_Z;
		
		title_material = new THREE.MeshBasicMaterial( {map: titleTexture, transparent: true, side: THREE.DoubleSide} ); 
		fail_material = new THREE.MeshBasicMaterial( {map: failTexture, transparent: true, side: THREE.DoubleSide} ); 
		title = new THREE.Mesh( title_geometry, title_material );
		title.position.z = MENU_OFFSET_Z;
		title.position.y = CAMERA_OFFSET + button_size;
		
		
		var info_material = new THREE.MeshBasicMaterial( {map: infoTexture, transparent: true, side: THREE.DoubleSide} ); 
		info = new THREE.Mesh( info_geometry, info_material );
		info.position.z = MENU_OFFSET_Z;
		info.position.y = CAMERA_OFFSET + button_size;
	}
}




window.onload = function() {
	
  	
	// --------------------------------------------------------------------------------------------
  	// Startscreen
  	// --------------------------------------------------------------------------------------------
	
//	if ((sessionStorage.getItem("Gamestate") === null) || (sessionStorage.getItem("Gamestate") == "0")) 
//	{
//		sessionStorage.setItem("Gamestate", "0");
//		
//		canvas = document.getElementById("canvas");
//		ctx = canvas.getContext("2d");
//		canvas.width = window.innerWidth;
//		canvas.height = 360;//window.innerHeight;
//		ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
//		ctx.fillRect(0, 0, canvas.width, canvas.height);
//		
//		startscreen_img = new Image();
//	    startscreen_img.src = 'textures/starttext.png';
//	    startscreen_img.onload = function() {
//	    	ctx.drawImage(startscreen_img, 0, 0, 336, 28, (canvas.width - 336) >> 1, (canvas.height - 28) >> 1, 336, 28);
//	    	setTimeout(function() {ctx.drawImage(startscreen_img, 0, 28, 336, 28, (canvas.width - 336) >> 1, (canvas.height - 28) >> 1, 336, 28);}, 2000);   	
//	    };
//	}
  	
	initVisibilityChange();

  	
  	// --------------------------------------------------------------------------------------------
  	// EventListeners for hiding screen
  	// --------------------------------------------------------------------------------------------
	
  	document.addEventListener(visibilityChange, function() {

  		if (document[hidden])
  		{
  			pauseAudio(false);
  			pause(true);
  		}
  		
  		else
  	    {
  			playAudio(0);
  			pause(false);
  	    }
  	}, false);
  	
  	
  	// --------------------------------------------------------------------------------------------
  	// EventListeners for phone
  	// --------------------------------------------------------------------------------------------
  	
	window.addEventListener("devicemotion", handleMotionEvent, true);
  	window.addEventListener("orientationchange", function (e) {}, false);
  	
  	window.addEventListener("resize", function (e) {
  		
  		viewportHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
  		
  		if ((window.innerWidth < window.innerHeight) && (mobile > 0))
  		{
  			pause(true);
  			document.body.removeChild( renderer.domElement );
  		}
  		
  		else
 		{
  			if (mode == MODE_PORTRAIT)
  			{
  				mode = MODE_DEMO;
  				setPerspective();
  				renewGraphics(true);
  				init(0, 0);
  				renderer.setClearColor(0x000000, 1);  	
  			  	document.body.appendChild( renderer.domElement );
  				render();
  			}
  			
  			else
  			{
  				document.body.appendChild( renderer.domElement );
				setPerspective();
				pause(false);
				
				if (mode != MODE_GAME)
				{
					renewGraphics(true);
					init(0, 0);
				}
  			}
 		}
  		}, false);
  	
//  	window.onbeforeunload = function() {alert("Back-Button");};
  	
  	// --------------------------------------------------------------------------------------------
  	// EventListeners for touch
  	// --------------------------------------------------------------------------------------------
  	window.addEventListener("touchstart", function(event) 
  	{
  		if (mode != MODE_GAME)
  		{
	  		if (device == UNDEFINED_VALUE)
	  			device = DEVICE_TOUCH;
	  		
	  		if (device == DEVICE_TOUCH)
	  			navigate(event.touches[0].pageX, event.touches[0].pageY);
  		}
  		
  		
	}, false);
  	
//  	window.addEventListener("touchmove", function(event) 
//  	{
//  		event.preventDefault();
//  	}, false);
  	
  	// --------------------------------------------------------------------------------------------
  	// EventListeners for PC/mouse
  	// --------------------------------------------------------------------------------------------
  	window.addEventListener("mousedown", function(event) 
  	{
  		if (mode != MODE_GAME)
  		{
	  		if (device == UNDEFINED_VALUE)
	  			device = DEVICE_MOUSE;
	  		
	  		if (device == DEVICE_MOUSE)
	  			navigate(event.clientX, event.clientY);
  		}
  	}, false);

  	window.addEventListener("mousemove", function(mmEvent) 
  	{
  		if (mode == MODE_GAME)
  			tube_rot_speed = -(mmEvent.clientX - (window.innerWidth >> 1)) / ((window.innerWidth << 1));
  	}, false);
  
  	
  	
  	// --------------------------------------------------------------------------------------------
  	// Setup basic game and graphics parameters
  	// --------------------------------------------------------------------------------------------
  	
  	if (localStorage.getItem("Record") !== null)
    	highscore = parseInt(localStorage.getItem("Record"), 10);
  	
  	else
  		highscore = 0;
  	
	initAudio();
	
	device = UNDEFINED_VALUE;
	mode = MODE_PORTRAIT;
	viewportHeight = document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight;
	scene = new THREE.Scene();
	
	renderer = new THREE.WebGLRenderer();
	//renderer2D = new THREE.CanvasRenderer();
	setPerspective();
	
	tileW = 2 * Math.sin(Math.PI / TUBE_TILES_R);
  	tileH = tileW;
  	fog_far = tileH * TUBE_TILES_L;
  	fog_near = fog_far * 0.25;
  	scene.fog = new THREE.Fog( 0x000000, fog_near, fog_far );

  	var tube_geometry = new THREE.CylinderGeometry(TUBE_RADIUS, TUBE_RADIUS, tileH * TUBE_TILES_L, TUBE_TILES_R, TUBE_TILES_L, true);
	var cube_geometry = new THREE.BoxGeometry( tileW, tileW, tileH );
	var digit_geometry = new THREE.PlaneGeometry(DIGIT_SIZE, DIGIT_SIZE, 1, 1);
//	var button_geometry = new THREE.PlaneGeometry(button_size, button_size, 1, 1);
	var screen_geometry = new THREE.PlaneGeometry( 2, 2 );
//	var title_geometry = new THREE.PlaneGeometry( 0.12 * rFrustum, 0.015 * rFrustum );
//	var info_geometry = new THREE.PlaneGeometry( 0.09 * rFrustum, 0.05 * rFrustum );
	
	
	// Loading image data
	tileTexture = THREE.ImageUtils.loadTexture('textures/next.jpg');
	digitTexture = THREE.ImageUtils.loadTexture('textures/digits.png');
	buttonTexture = THREE.ImageUtils.loadTexture('textures/buttons.png');
	titleTexture = THREE.ImageUtils.loadTexture('textures/cuberunner.png');
	failTexture = THREE.ImageUtils.loadTexture('textures/gameover.png');
	switchTexture = THREE.ImageUtils.loadTexture('textures/switch.png');
	ADbuttonTexture = THREE.ImageUtils.loadTexture('textures/adbutton.png');
	
	if (mobile > 0)
		infoTexture = THREE.ImageUtils.loadTexture('textures/info_phone.png');
	
	else
		infoTexture = THREE.ImageUtils.loadTexture('textures/info.png');
		
  	// -------------------- Shader - Material --------------------
  
  	tube_shader = new THREE.ShaderMaterial( {
		vertexShader: THREE.TubeShader.vertexShader,
		fragmentShader: THREE.TubeShader.fragmentShader,
		fog: true
	});
  	
  	cube_shader = new THREE.ShaderMaterial( {
		vertexShader: THREE.CubeShader.vertexShader,
		fragmentShader: THREE.CubeShader.fragmentShader,
		fog : true
	});
  	
  	menu_shader = new THREE.ShaderMaterial( {
		vertexShader: THREE.MenuShader.vertexShader,
		fragmentShader: THREE.MenuShader.fragmentShader,
		depthWrite: false, 
		depthTest: false 
	});
  	
  	digit_shader = new THREE.ShaderMaterial( {
		vertexShader: THREE.DigitShader.vertexShader,
		fragmentShader: THREE.DigitShader.fragmentShader,
		depthWrite: false, 
		depthTest: false 
	});
  	
	tube_uniforms = {
		sFactor: 		{ type: "f", value: TUBE_TILES_R },
		tFactor: 		{ type: "f", value: TUBE_TILES_L },
		fogColor:    	{ type: "c", value: new THREE.Color( 0x000000 ) },
		fogNear:     	{ type: "f", value: fog_near },
		fogFar:      	{ type: "f", value: fog_far },
		curving: 		{ type: "f", value: 20.0 },
		track: 			{ type: "fv1", value: [-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0] },
		pz: 			{ type: "fv1", value: [-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0] },
		tubeColor:		{ type: "v3", value: new THREE.Vector4(1.0, 1.0, 1.0) },
		cubeColor:		{ type: "v3v", value: [	new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0),
												new THREE.Vector3(1.0, 1.0, 1.0)]
						},
		texture: 		{ type: "t", value: tileTexture }
	};
	
	tube_uniforms.texture.value.wrapS = THREE.Repeat;
	tube_uniforms.texture.value.wrapT = THREE.Repeat;
	//uniforms.texture.magFilter = THREE.NearestFilter;
	//uniforms.texture.minFilter = THREE.LinearMipMapLinearFilter;
	//uniforms.texture.needsUpdate = true;
	
	tube_shader.side = THREE.DoubleSide;
	tube_shader.uniforms = tube_uniforms;
	tube = new THREE.Mesh(tube_geometry, tube_shader);
	scene.add(tube);
	
	cube_shader.transparent = true;
	digit_shader.transparent = true;
	menu_shader.transparent = true;
	
	for (i = -1; i < cube.length; i++)
	{	
		cubeUniforms = {
			texture: 		{ type: "t", value: tileTexture },
			fogColor:    	{ type: "c" },
			curving: 		{ type: "f", value: 20.0 },
			sX:				{ type: "f", value: 1.0 },
			sY:				{ type: "f", value: 1.0 },
			tY:				{ type: "f", value: 0.0 },
			fogNear:     	{ type: "f" },
			fogFar:      	{ type: "f" },
			cubeRot: 		{ type: "f", value: 0.0 },
			cubeColor: 		{ type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) }
			
		};
		
		if (i == -1)
		{
			myCube.shader = cube_shader.clone();
			myCube.shader.uniforms = cubeUniforms;
			myCube.object = new THREE.Mesh(cube_geometry, myCube.shader);
		
			myCube.object.position.y = -0.8;
			myCube.object.position.z = -0.5;
			myCube.object.scale.set(0.5, 0.5, 0.5);
			myCube.shader.uniforms.cubeColor.value.z = 0.0;
			myCube.shader.uniforms.cubeColor.value.w = 0.75;
		}
		
		else
		{	
			cube[i].shader = cube_shader.clone();
			cube[i].shader.uniforms = cubeUniforms;
			cube[i].object = new THREE.Mesh(cube_geometry, cube[i].shader);
		}
	}
//	alert("myCube: " + myCube.object.position.y);
//	myCube.object.position.y = -0.5;
//	alert("myCube: " + myCube.object.position.y);
//	myCube.shader.uniforms.tY.value = -0.6;
	
//	myCube.object.translateY(0.003);

	
	// -------------------- Digits --------------------
	
	for (i = 0; i < digit.length; i++)
	{
		digitUniforms = {
			texture_digit: 	{ type: "t", value: digitTexture },
			digit:			{ type: "f"},
			digitColor: 	{ type: "v4", value: new THREE.Vector4(1.0, 0.0, 0.0, 1.0) }
		};
		
		digit[i].shader = digit_shader.clone();
		digit[i].shader.uniforms = digitUniforms;
		digit[i].object = new THREE.Mesh(digit_geometry, digit[i].shader);
		
		digit[i].object.position.x = DIGIT_SIZE * (-3.5 + i);
		digit[i].object.position.y = CAMERA_OFFSET;
		digit[i].object.position.z = MENU_OFFSET_Z;
		digit[i].shader.uniforms.digit.value = 0.0;
	}
	
	
	// ------------------- Menu --------------------
 
	musicUniforms = {
			texture_menu: 	{ type: "t", value: buttonTexture },
			mType:			{ type: "f", value: 0.0 }		
	};
	
	infoUniforms = {
			texture_menu: 	{ type: "t", value: buttonTexture },
			mType:			{ type: "f", value: 2.0 }		
	};
	
	startUniforms = {
			texture_menu: 	{ type: "t", value: buttonTexture },
			mType:			{ type: "f", value: 3.0 }		
	};
	
	ADbuttonUniforms = {
			texture_menu: 	{ type: "t", value: ADbuttonTexture },
			mType:			{ type: "f", value: 1.0 }		
	};
	

	music_shader = menu_shader.clone(); 
	music_shader.uniforms = musicUniforms;
	info_shader = menu_shader.clone();
	info_shader.uniforms = infoUniforms;
	start_shader = menu_shader.clone();
	start_shader.uniforms = startUniforms;
	ADbutton_shader = menu_shader.clone();
	ADbutton_shader.uniforms = ADbuttonUniforms;
	
	renewGraphics(false);
	
	var black_material = new THREE.MeshBasicMaterial( {color: 0x000000, transparent: true, opacity: 0.8, side: THREE.DoubleSide} );
	var red_material = new THREE.MeshBasicMaterial( {color: 0xFFFF00, transparent: true, opacity: 0.8, side: THREE.DoubleSide} );
	var switch_material = new THREE.MeshBasicMaterial( {map: switchTexture, side: THREE.DoubleSide} );
	bScreen = new THREE.Mesh( screen_geometry, black_material );
	rScreen = new THREE.Mesh( screen_geometry, red_material );
	sScreen = new THREE.Mesh( screen_geometry, switch_material );
	bScreen.position.z = 2 * MENU_OFFSET_Z;
	rScreen.position.z = 2 * MENU_OFFSET_Z;
	sScreen.position.z = 8 * MENU_OFFSET_Z;
	
	if ((window.innerWidth < window.innerHeight) && (mobile > 0))
		return;
	
	else
		mode = MODE_DEMO;
	
//	window.requestAnimationFrame = 	window.requestAnimationFrame		|| 
//	window.webkitRequestAnimationFrame 	|| 
//	window.mozRequestAnimationFrame    	|| 
//	window.oRequestAnimationFrame      	|| 
//	window.msRequestAnimationFrame     	|| 
//	function(callback){window.setTimeout(callback, seqTime);}; 
	
	
	
//	alert("SIZE: " + window.innerHeight + ", " + document.documentElement.clientHeight + ", " + h);
	init(0, 0);
	renderer.setClearColor(0x000000, 1);  
	document.body.appendChild( renderer.domElement );
	redraws = 0;
	fps = UNDEFINED_VALUE;
//	refreshTime = TARGET_REFRESH_TIME;
//	alert("setInterval");
	
//	if (mobile == MOBILE_iOS) 
//		setInterval(function() {render();}, 40);
//	
//	else
	render();
	
};


