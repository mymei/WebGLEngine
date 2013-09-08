function ColladaElement(ps_url, asset) {
	DrawingElement.call(this, ps_url);
	this.asset = asset;
	this.scene = {};
	$.extend(true, this.scene, asset.scene);
}

ColladaElement.prototype = new DrawingElement();

ColladaElement.prototype.constructor = ColladaElement;

ColladaElement.prototype.getGRI = function(key) {
	var self = this;
	var node = self.scene.nodes[key];
	self.GRI = self.GRI || {};
	if ('controller_url' in node) {
		if (!self.GRI[key]) {
			var url = node.controller_url.slice(1);
			var skin = self.asset.controller.skins[url];
			self.GRI[key] = webglCore.createSkinGRI(skin, self.asset.geometry[skin.source]);
		}
	} else if ('geometry_url' in node) {
		if (!self.GRI[key]) {
			var url = node.geometry_url.slice(1);
			self.GRI[key] = webglCore.createGRI(self.asset.geometry[url]);
		}
	}
	return self.GRI[key];
}

ColladaElement.prototype.updateGRI = function(key, trm) {
	var self = this;
	var GRI = self.GRI[key];
	if (GRI) {
		if ('skin' in GRI) {
			GRI.uniforms.uTexture = webglCore.getTexture('images/tarsier.png');
			var trm_array = [];
			GRI.skin.joints.forEach(function(joint) {
				trm_array.push(self.scene.getJointTransform(joint.name));
			})
			var boneTransform = new Float32Array(trm_array.length * 16);
			$.each(trm_array, function(k, v){boneTransform.set(v, k * 16)});
			GRI.uniforms.uBoneTransform = boneTransform;
		} else {
			GRI.uniforms.uTexture = webglCore.getTexture('images/page.png');
			var trm2 = self.scene.getLocalTransform(key);
			mat4.multiply(trm, trm2, trm);
		}
		GRI.uniforms.uModelView = trm;
		var projMatrix = mat4.create();
		mat4.perspective(60, canvas.width / canvas.height, 0.1, 1000, projMatrix);
		GRI.uniforms.uProjection = projMatrix;
	}
}

ColladaElement.prototype.draw = function(gl, camera_trans, trm) {
	var self = this;
	var out = mat4.create();
	mat4.multiply(camera_trans, trm, out);

	for (var k in self.scene.nodes) {
		var GRI = self.getGRI(k);
		if (GRI) {
			self.updateGRI(k, out);
			GRI.elm.forEach(function(p, index) {
				self.drawPolygon(gl, GRI.vs_url, self.ps_url, GRI.uniforms, p, GRI.vbs[p.bufferKey]);
			})
		}
	}
}