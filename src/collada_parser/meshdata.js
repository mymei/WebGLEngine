function MeshData(sources) {
	ImportedBase.call(this);
	if (arguments.length == 0) {
		return;
	}
	var self = this;
	this.buffers = {};
	this.sources = sources;
	this.stride = 0;
	this.sources && $.each(this.sources, function(k, v) {
		self.stride += v.stride;
	});
}

MeshData.prototype = new ImportedBase();

MeshData.prototype.constructor = MeshData;

MeshData.prototype.cookBuffers = function() {
	for (var key in this.buffers) {
		this.buffers[key].cookBuffer();
	}
}

MeshData.prototype.clearCookedData = function() {
	for (var key in this.buffers) {
		this.buffers[key].indexMap = undefined;
	}
}

MeshData.prototype.getBufferKey = function(inputs) {
	return inputs.map(function(input){return input.source.id;}).toString();
}

MeshData.prototype.getBuffer = function(inputs) {
	var bufferKey = this.getBufferKey(inputs);
	if (!this.buffers[bufferKey]) {
		var stride = 0;
		inputs.forEach(function(input){ stride += input.source.stride; });
		this.buffers[bufferKey] = new Buffer(stride);
	}
	return this.buffers[this.getBufferKey(inputs)];
}

MeshData.prototype.getBufferPiece = function(inputs, piece) {
	var buffer = this.getBuffer(inputs);
	var key = piece.toString();
	if (!buffer.data[key]) {
		buffer.data[key] = {index:buffer.size++, map:piece[0], array:[]};
		var stride = piece.length;
		for (var j = 0; j < stride; j ++) {
			var source = inputs[j].source;
			for (var k = 0; k < source.stride; k ++) {
				buffer.data[key].array.push(source.array[source.stride * piece[j] + k]);
			}
		}
	}
	return buffer.data[key];
}