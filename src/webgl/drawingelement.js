function DrawingElement(ps_url) {
	this.ps_url = ps_url;
}

DrawingElement.prototype.drawPolygon = function(gl, vs_url, ps_url, uniforms, poly, vertexBuffers) {
	webglCore.initProgram(gl, vs_url, ps_url, vertexBuffers);
	webglCore.setUniforms(gl, uniforms);
	webglCore.setAttrs(gl, vertexBuffers);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, poly.ibo);
	gl.drawElements(gl.TRIANGLES, poly.num, gl.UNSIGNED_SHORT, 0);
}

function getProjMatrix() {	
	var projMatrix = mat4.create();
	mat4.perspective(projMatrix, 3.14 / 180 * 60, canvas.width / canvas.height, 0.1, 1000);
	return projMatrix;
}