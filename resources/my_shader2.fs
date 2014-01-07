<script type="x-shader/x-fragment">
	#ifdef GL_ES
	precision mediump float;
	#endif
	uniform sampler2D uTexture;
	varying vec2 vTexCoord;
	varying vec4 vPosition;
	varying vec3 vNormal;
	varying vec3 vColor;
	void main(void) {
		vec3 normal = normalize(vNormal);
		float ambient = 0.4;
		vec3 lightDir = normalize(vec3(0, 5000, 0) - vPosition.xyz);
		float diffuse = max(dot(normal, lightDir), 0.0);
		vec4 texColor = texture2D(uTexture, vec2(vTexCoord.x, 1.0 - vTexCoord.y));
		vec3 color = texColor.rgb * (ambient + diffuse);
		//vec3 color = vColor * (ambient + diffuse);
		gl_FragColor = vec4(color, 1.0);
	}
</script>