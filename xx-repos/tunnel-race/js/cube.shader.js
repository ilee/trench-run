

THREE.CubeShader = {
		           
		vertexShader: [
		               
		                "uniform float cubeRot;",
		                "uniform float curving;",
		                "uniform float sX;",
		                "uniform float sY;",
		                "uniform float tY;",
		                
		                "varying vec3 gPos;",
		                "varying vec2 texCoord;",	
		                "varying vec3 vecPos;",
		                
		                "void main(void) {",
		                
	               			"texCoord.x = uv.s;",
	               			"texCoord.y = uv.t;",
	               			"gPos = position;",
	               			
	               			"if (sX != 1.0)",
               					"gPos.x *= sX;",
               				
	               			"if (sY != 1.0)",
	               				"gPos.y *= sY;",
	               				
	               			"if (tY != 0.0)",	
	               				"gPos.y += tY;",
	               				
	               			"vecPos = (modelMatrix * vec4(gPos, 1.0 )).xyz;",
	               			"if (vecPos.z < -6.0)",
	               			"{",
       							"gPos.x -= (((-6.0 - vecPos.z)/curving) * (-6.0 - vecPos.z) * cos(cubeRot));",
       							"gPos.y += (((-6.0 - vecPos.z)/curving) * (-6.0 - vecPos.z) * sin(cubeRot));",
       							
       						"}",
	               			"vec4 mvPosition = modelViewMatrix * vec4( gPos, 1.0 );",
	               			"gl_Position = projectionMatrix * mvPosition;",
	               			
		                "}"
  		].join("\n"),
  		
  		fragmentShader: [
  		                 
  		                "uniform vec4 cubeColor;",
  		                "uniform sampler2D texture;",
  		                "varying vec2 texCoord;",	
  		                THREE.ShaderChunk[ "fog_pars_fragment" ],
  		                
  		                "void main(void) {",
  		                 		"vec4 diffuse_crate = texture2D(texture, vec2(texCoord.s, texCoord.t));",  
  		                 		"vec4 color = diffuse_crate;",
  		                 		"color.x *= cubeColor.x;",
  		                 		"color.y *= cubeColor.y;",
  		                 		"color.z *= cubeColor.z;",
  		                 		"color.w *= cubeColor.w;",
								"gl_FragColor = color;",
								THREE.ShaderChunk[ "fog_fragment" ],
						"}"
		].join("\n")
};
	