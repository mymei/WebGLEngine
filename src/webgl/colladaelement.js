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

ColladaElement.prototype.updateGRITransform = function(GRI, local_trans, camera_trans, camera_proj) {
	if (GRI) {
		var trm = mat4.create();
		GRI.uniforms.uTexture = webglCore.getTexture('images/page.png');
		mat4.multiply(trm, trm, local_trans);
		GRI.uniforms.uModelView = mat4.multiply(trm, camera_trans, trm);
		GRI.uniforms.uProjection = camera_proj;
	}
}

ColladaElement.prototype.updateBoneTransform = function(GRI, scene) {
	if (GRI) {
		if ('skin' in GRI) {
			GRI.uniforms.uTexture = webglCore.getTexture('images/tarsier.png');
			var trm_array = [];
			GRI.skin.joints.forEach(function(joint) {
				trm_array.push(scene.getWorldTransform(joint.name));
			})
			var boneTransform = new Float32Array(trm_array.length * 16);
			$.each(trm_array, function(k, v){boneTransform.set(v, k * 16)});
			GRI.uniforms.uBoneTransform = boneTransform;
		}
	}
}

ColladaElement.prototype.draw = function(gl, camera_trans, camera_proj, trm) {
	var self = this;
	for (var k in self.scene.nodes) {
		var local_trans = self.scene.getLocalTransform(k);
		mat4.multiply(local_trans, trm, local_trans);
		var GRI = self.getGRI(k);
		if (GRI) {
			self.updateGRITransform(GRI, local_trans, camera_trans, camera_proj);
			self.updateBoneTransform(GRI, self.scene);
			GRI.elm.forEach(function(p, index) {
				self.drawPolygon(gl, GRI.vs_url, self.ps_url, GRI.uniforms, p, GRI.vbs[p.bufferKey]);
			})
		}
	}
}