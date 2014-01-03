function Node() {
	this.parent = undefined;
	this.children = [];
	this.objects = [];
	this.position = vec3.create();
	this.quaternion = quat.create();
	this.scale = vec3.fromValues(1, 1, 1);
	this.matrix = mat4.create();
	this.matrixWorld = mat4.create();
}

Node.prototype.add = function(child) {
	if (child.parent != undefined) {
		child.parent.remove(child);
	}
	this.children.push(child);
	child.parent = this;
}

Node.prototype.remove = function(child) {
	var index = this.children.indexOf(child);
	if (index != -1) {
		child.parent = undefined;
		this.children.splice(index, 1);
	}
}

Node.prototype.updateMatrix = function() {
	mat4.fromRotationTranslation(this.matrix, this.quaternion, this.position);
	mat4.scale(this.matrix, this.matrix, this.scale);
	this.matrixWorldInvalidated = true;
}

Node.prototype.updateMatrixWorld = function(force) {
	if (this.matrixWorldInvalidated || force) {
		this.matrixWorldInvalidated = false;
		force = true;
		if (this.parent == undefined) {
			mat4.copy(this.matrixWorld, this.matrix);
		} else {
			mat4.multiply(this.matrixWorld, this.matrix, this.parent.matrixWorld);
		}
	}

	for (var i = 0; i < this.children.length; i ++) {
		this.children[i].updateMatrixWorld(force);
	}
}

Node.prototype.applyMatrix = function(matrix) {
	var sx = vec3.length(vec3.set(this.scale, matrix[0], matrix[1], matrix[2]));
	var sy = vec3.length(vec3.set(this.scale, matrix[4], matrix[5], matrix[6]));
	var sz = vec3.length(vec3.set(this.scale, matrix[8], matrix[9], matrix[10]));
	mat4.scale(matrix, matrix, vec3.set(this.scale, 1/sx, 1/sy, 1/sz));
	vec3.set(this.scale, sx, sy, sz);
	vec3.set(this.position, matrix[12], matrix[13], matrix[14]);
	quat.fromMat3(this.quaternion, mat3.fromMat4(mat3.create(), matrix));
}

Node.prototype.draw = function(camera, time) {
	for (var i = 0; i < this.children.length; i ++) {
		this.children[i].draw(camera, time);
	}
}