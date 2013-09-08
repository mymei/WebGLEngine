function Buffer(stride) {
	ImportedBase.call(this);
	if (arguments.length == 0) {
		return;
	}
	this.size = 0;
	this.data = {};
	this.stride = stride;
}

Buffer.prototype = new ImportedBase();

Buffer.prototype.constructor = Buffer;

Buffer.prototype.cookBuffer = function() {
	var self = this;
	if (!self.array) {
		self.array = new Array(self.size * self.stride);
		self.indexMap = [];
		$.each(self.data, function(k, v) {
			var offset = v.index * self.stride;
			v.array.forEach(function(x) { self.array[offset++] = x; });
			self.indexMap[v.map] = self.indexMap[v.map] || [];
			self.indexMap[v.map].push(v.index);
		})
	}
	self.data = undefined;
}

Buffer.prototype.getFloatArray = function() {
	return new Float32Array(this.array);
}