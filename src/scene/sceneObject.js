SWE.SceneObject = function(fs, mesh) {
	SWE.Node.call(this);
	this.de = new ColladaElement(fs, mesh);
}

SWE.SceneObject.prototype = new SWE.Node();
SWE.SceneObject.prototype.draw = function(camera, time) {

	if (this.de) {
		if (this.currentAnim) {
			if (!this.currentAnim.isLooping && this.currentAnim.data.time < time - this.currentAnim.startTime) {
				this.currentAnim = undefined;
			} else {
				this.de.scene.applyAnimation(this.currentAnim.data, time, this.currentAnim.startTime);
			}
		}
		this.de.draw(gl, camera.matrixWorld, camera.projection, this.matrixWorld);
	}
	SWE.Node.prototype.draw.call(this, camera, time);
}

SWE.SceneObject.prototype.triggerAnimation = function(animation, time, isLooping) {
	if (animation) {
		this.currentAnim = {
			startTime : time,
			data : animation,
			isLooping : isLooping
		}
	}
}