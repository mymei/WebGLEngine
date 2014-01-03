function Camera() {
	Node.call(this);
	this.projection = mat4.create();
}

Camera.prototype = new Node();
Camera.prototype.setPerspective = function(fov, ratio, near, far) {
	mat4.perspective(this.projection, fov, ratio, near, far);	
}