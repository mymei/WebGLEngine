SWE.Camera = function() {
	SWE.Node.call(this);
	this.projection = mat4.create();
}

SWE.Camera.prototype = new SWE.Node();
SWE.Camera.prototype.setPerspective = function(fov, ratio, near, far) {
	mat4.perspective(this.projection, fov, ratio, near, far);	
}