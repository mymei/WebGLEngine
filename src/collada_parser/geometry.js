function Geometry(geometryXML) {
	ImportedBase.call(this);
	if (arguments.length == 0) {
		return;
	}
	var self = this;
	self.meshes = [];
	$("mesh", geometryXML).each(function(){self.meshes.push(new Mesh(this))});
	this.cookMeshes();
}

Geometry.prototype = new ImportedBase();

Geometry.prototype.constructor = Geometry;

Geometry.prototype.cookMeshes = function() {
	var self = this;
	self.meshes.forEach(function(mesh) {
		for (var key in mesh.meshData.sources) {
			mesh.meshData.sources[key].array = undefined;
		}
		mesh.meshData.cookBuffers();
	})
	self.skinWeights && self.skinWeights.cookBuffer(self.meshes);
}

Geometry.prototype.clearCookedData = function() {
	this.meshes.forEach(function(mesh) {
		mesh.meshData.clearCookedData();
	});
}