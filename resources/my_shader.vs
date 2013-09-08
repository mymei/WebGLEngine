<script type="x-shader/x-vertex">
	attribute vec3 aVertex;
	vec4 getPos() { return vec4(aVertex, 1); }
			attribute vec3 aNormal; vec3 getNormal() { return aNormal; }
			attribute vec2 aTexCoord; vec2 getTexCoord() { return aTexCoord; }
	uniform mat4 uModelView;
	uniform mat4 uProjection;
	varying vec4 vPosition;
	varying vec3 vColor;
	varying vec3 vNormal;
	void main(void) {
		vPosition = uModelView * getPos();
		gl_Position = uProjection * vPosition;
		vNormal = mat3(uModelView) * getNormal();
		// vColor = aVertex.xyz * 0.5 + 0.5;
		vColor = vec3(1, 0, 0);
	}
</script>