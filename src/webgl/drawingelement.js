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