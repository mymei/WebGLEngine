function DrawingElement(material) {
	this.material = material;
	this.scene = new Scene;
	this.GRI = {};
}

DrawingElement.prototype.drawPolygon = function(gl, vs_url, material, uniforms, poly, vertexBuffers) {
	webglCore.initProgram(gl, vs_url, material.ps_url, vertexBuffers);
	webglCore.setUniforms(gl, uniforms);
	webglCore.setUniforms(gl, material.uniforms);
	webglCore.setAttrs(gl, vertexBuffers);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, poly.ibo);
	gl.drawElements(gl.TRIANGLES, poly.num, gl.UNSIGNED_SHORT, 0);
}

DrawingElement.prototype.getGRI = function(key) {
	return this.GRI[key];
}

DrawingElement.prototype.updateMaterial = function() {
	if (!this.material.uniforms) {
		this.material.uniforms = {};
	}
	this.material.uniforms.uTexture = webglCore.getTexture(this.material.texture_url);
}

DrawingElement.prototype.updateGRITransform = function(GRI, local_trans, camera_trans, camera_proj) {
	if (GRI) {
		var trm = mat4.create();
		mat4.multiply(trm, trm, local_trans);
		var inv = mat4.invert(mat4.create(), camera_trans);
		GRI.uniforms.uModelView = mat4.multiply(trm, inv, trm);
		GRI.uniforms.uProjection = camera_proj;
	}
}

DrawingElement.prototype.updateBoneTransform = function(GRI, scene) {
	if (GRI) {
		if ('skin' in GRI) {
			var trm_array = [];
			GRI.skin.joints.forEach(function(joint) {
				var id = scene.getIdFromSid(joint.name);
				trm_array.push(scene.getWorldTransform(id));
			})
			var boneTransform = new Float32Array(trm_array.length * 16);
			$.each(trm_array, function(k, v){boneTransform.set(v, k * 16)});
			GRI.uniforms.uBoneTransform = boneTransform;
		}
	}
}

DrawingElement.prototype.draw = function(gl, camera_trans, camera_proj, trm) {
	var self = this;
	self.updateMaterial();
	for (var k in self.scene.nodes) {
		var local_trans = self.scene.getLocalTransform(k);
		mat4.multiply(local_trans, trm, local_trans);
		var GRI = self.getGRI(k);
		if (GRI) {
			self.updateGRITransform(GRI, local_trans, camera_trans, camera_proj);
			self.updateBoneTransform(GRI, self.scene);
			GRI.elm.forEach(function(p, index) {
				self.drawPolygon(gl, GRI.vs_url, self.material, GRI.uniforms, p, GRI.vbs[p.bufferKey]);
			})
		}
	}
}