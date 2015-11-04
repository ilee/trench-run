

THREE.MenuShader = {
		           
		vertexShader: [
		                "uniform float mType;",
		               	"vec3 gPos;",
		               	"varying vec2 texCoord;",
		               	
		                "void main(void) {",
		                	
		                	"texCoord.x = 0.5 * mod(mType, 2.0) + uv.s * 0.5;",
		                	"texCoord.y = 0.5 * floor(mType / 2.0) + uv.t * 0.5;",
		                	"gPos = position;",
		                	"vec4 mvPosition = modelViewMatrix * vec4( gPos, 1.0 );",
		               		"gl_Position = projectionMatrix * mvPosition;",
		                "}"
  		].join("\n"),
  		
  		fragmentShader: [
  		                 "uniform sampler2D texture_menu;",
  		                 "varying vec2 texCoord;",	
  		                 
  		                 "void main(void) {",
  		                 
  		                 	"vec4 diffuse_color = texture2D(texture_menu, vec2(texCoord.s, texCoord.t));",  
  		                 	"vec4 color = diffuse_color;",
							"gl_FragColor = color;",
							
						"}"
		].join("\n")
};
	