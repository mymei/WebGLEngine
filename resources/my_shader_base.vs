<script type="x-shader/x-vertex">
	attribute vec3 aVertex; vec4 getPos() { return vec4(aVertex, 1); }
	uniform mat4 uModelView;
	uniform mat4 uProjection;
	varying vec4 vPosition;
	varying vec3 vColor;
	varying vec3 vNormal;
	varying vec2 vTexCoord;
	void main(void) {
		vPosition = uModelView * getPos();
		gl_Position = uProjection * vPosition;
		vNormal = mat3(uModelView) * getNormal();
		vColor = vec3(1, getTexCoord().x, getTexCoord().y);
		vTexCoord = getTexCoord();
	}
</script>