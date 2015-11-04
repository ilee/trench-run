

THREE.TubeShader = {
		                          			
		vertexShader: [
		               	"uniform float sFactor;",
		               	"uniform float tFactor;",
		               	"uniform float curving;",
		               	
		                "varying vec3 gPos;",
		                "varying vec2 texCoord;",	
		                "varying vec3 vecPos;",
		                
		                "void main(void) {",
		                
		               			"texCoord.x = uv.s * sFactor;",
		               			"texCoord.y = uv.t * tFactor;",
		               			"gPos = position;",
		               			"vecPos = (modelMatrix * vec4(position, 1.0 )).xyz;",
		               			"if (vecPos.z < -6.0)",
               						"gPos.z += ((-6.0 - vecPos.z)/curving)*(-6.0 - vecPos.z);",
		               			"vec4 mvPosition = modelViewMatrix * vec4( gPos, 1.0 );",
		               			"gl_Position = projectionMatrix * mvPosition;",
		               			
		                "}"
		                
  		].join("\n"),
  		
  		fragmentShader: [
  		                "uniform sampler2D texture;",
  		                "uniform float track[12];",
  		                "uniform float pz[12];",
  		                "uniform vec3 cubeColor[12];",
  		                "uniform vec3 tubeColor;",
  		                "varying vec2 texCoord;",	
  		                
  		                THREE.ShaderChunk[ "fog_pars_fragment" ],
  		                
  		                "void main(void) {",
  		              
	                 		"vec4 diffuse_color = texture2D(texture, vec2(texCoord.x, texCoord.y));",  
	                 		"vec4 color = diffuse_color;",
	                 		
	                 		"for (int i = 0; i < 12; i++)",
	                 		"{",
	                 			"if ((pz[i] >= 0.0) && (texCoord.x >= track[i]) && (texCoord.x < track[i] + 1.0) && (texCoord.y > pz[i]))",
	                 			"{",
	                 				"color.x *= cubeColor[i].x;",
	                 				"color.y *= cubeColor[i].y;",
	                 				"color.z *= cubeColor[i].z;",
	                 				"break;",
	                 			"}",
	                 			
	                 		"}",
	                 		
	                 		"if (color == diffuse_color)",
	                 		"{",
	                 			"color.x *= tubeColor.x;",
	                 			"color.y *= tubeColor.y;",
	                 			"color.z *= tubeColor.z;",
             				"}",
             				
	                 		"gl_FragColor = color;",
  		                 	
  		                 	THREE.ShaderChunk[ "fog_fragment" ],
						"}"
  		                 		
		].join("\n")
};
	