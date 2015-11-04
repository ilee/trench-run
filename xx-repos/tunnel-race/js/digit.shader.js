

THREE.DigitShader = {
		           
		vertexShader: [
		                "uniform float digit;",
		               	"varying vec3 gPos;",
		               	"varying vec2 texCoord;",
		               	
		                "void main(void) {",
		                	
		                	"texCoord.x = mod(digit, 4.0) * 0.25 + uv.s * 0.25;",
		                	"texCoord.y = 0.75 - 0.25 * floor(digit / 4.0) + uv.t * 0.25;",
		                	"gPos = position;",
		               		
		                	"vec4 mvPosition = modelViewMatrix * vec4( gPos, 1.0 );",
		               		"gl_Position = projectionMatrix * mvPosition;",
		                "}"
  		].join("\n"),
  		
  		fragmentShader: [
  		                 "uniform sampler2D texture_digit;",
  		                 "uniform vec4 digitColor;",
  		                 "varying vec2 texCoord;",	
  		                 
  		                 "void main(void) {",
  		                 
  		                 	"vec4 diffuse_color = texture2D(texture_digit, vec2(texCoord.s, texCoord.t));",  
  		                 	"vec4 color = diffuse_color;",
  		                 	"color.x *= digitColor.x;",
		                 	"color.y *= digitColor.y;",
		                 	"color.z *= digitColor.z;",
							"gl_FragColor = color;",
							
						"}"
		].join("\n")
};
	