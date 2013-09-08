function Primitive(de, trm) {
	this.de = de;
	this.trm = trm;
}

function draw(primitive, camera_trans, time) {
	primitive.de.scene.applyAnimation(primitive.de.asset.animation, time);
	primitive.de.draw(gl, camera_trans, primitive.trm);
}