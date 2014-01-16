function PlaneElement(ps_url) {
	DrawingElement.call(this, ps_url);

	var vertices = []
	for (var x = 0; x < 10; x ++) {
		for (var y = 0; y < 10; y ++) {
			vertices.push(x * 100 - 500);
			vertices.push(y * 100 - 500);
			vertices.push(Math.random() * 100);
		}
	}

	this.vertexBuffer = [{
		size : 12,
		buffer : webglCore.createFloatBuffer(gl, new Float32Array(vertices)),
		attrs : {
			aVertex : {
				offset : 0,
				stride : 3
			}
			// ,
			// aNormal : {
			// 	offset : 12,
			// 	size: 3
			// }
		}
	}];
	var indices = []
	for (var x = 0; x < 9; x ++) {
		for (var y = 0; y < 9; y ++) {
			var a = x + y * 10, b = x + (y + 1) * 10, c = x + 1 + (y + 1) * 10, d = x + 1 + y * 10;
			indices.push(a);
			indices.push(b);
			indices.push(c);
			indices.push(a);
			indices.push(c);
			indices.push(d);
		}
	}
	this.polygons = [{ibo:webglCore.createIndexBuffer(gl, indices), num:indices.length}];
}

PlaneElement.prototype = new DrawingElement();

PlaneElement.prototype.constructor = ColladaElement;

PlaneElement.prototype.draw = function(gl, camera_trans, trm) {
	var self = this;
	self.uniforms = self.uniforms || {};
	var out = mat4.create();
	mat4.multiply(out, camera_trans, trm);
	self.uniforms.uModelView = out;
	self.uniforms.uProjection = getProjMatrix();

	self.drawPolygon(gl, 'resources/my_shader_base.vs', self.ps_url, self.uniforms, self.polygons[0], self.vertexBuffer);
}

function getPlaneGRI(patch, size) {
	var GRI = {uniforms:{}, vbs:{}, vs_url:'resources/my_shader_base.vs'};
	var patchSize = size / patch;
	var vertices = [];
	for (var x = 0; x < patch + 1; x ++) {
		for (var y = 0; y < patch + 1; y ++) {
			vertices.push((x - patch / 2) * patchSize);
			vertices.push((y - patch / 2) * patchSize);
			vertices.push(0);
			vertices.push(x / patch);
			vertices.push(y / patch);
		}
	}
	var indices = []
	for (var x = 0; x < patch; x ++) {
		for (var y = 0; y < patch; y ++) {
			var a = x + y * (patch + 1), b = x + (y + 1) * (patch + 1), c = x + 1 + (y + 1) * (patch + 1), d = x + 1 + y * (patch + 1);
			indices.push(a);
			indices.push(b);
			indices.push(c);
			indices.push(a);
			indices.push(c);
			indices.push(d);
		}
	}

	GRI.elm = [{
		bufferKey : '1',
		ibo:webglCore.createIndexBuffer(gl, indices),
		num:indices.length
	}];
	GRI.vbs['1'] = [{
		size : 20,
		buffer : webglCore.createFloatBuffer(gl, new Float32Array(vertices)),
		attrs : {
			aVertex : {
				offset : 0,
				stride : 3
			},
			aTexCoord : {
				offset : 12,
				stride : 2
			}
		}
	}];

	return GRI;
}