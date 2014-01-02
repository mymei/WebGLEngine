function Skin(xml) {
	ImportedBase.call(this);
	var self = this;
	if (xml) {
		var skin = $(xml);

		var joint = $('joints', skin);
		var joint_names = getInputArray('JOINT', 'Name_array', joint, skin);
		var bind_values = getInputArray('INV_BIND_MATRIX', 'float_array', joint, skin);
		self.source = skin.attr('source').slice(1);
		self.joints = joint_names.map(function(x){var tmp = bind_values.splice(0, 16); return{name:x, bind:tmp};});
		self.bindPose = parseArray($('bind_shape_matrix', skin)).map(parseFloat);
		self.weightArray = [];

		var no = parseInt($("vertex_weights", skin).attr("count"));
		var vcount = parseArray($("vertex_weights>vcount", skin));
		var v = parseArray($("vertex_weights>v", skin));
		var weight_values = getInputArray('WEIGHT', 'float_array', $('vertex_weights', skin), skin);
		var anchor = 0;
		for (var i = 0; i < no; i ++) {
			var weights = [];
			for (var j = 0; j < vcount[i]; j ++) {
				weights.push({index:v[anchor++], weight:weight_values[v[anchor++]]});
			}
			weights = weights.sort(function(a, b){return b.weight - a.weight;})
			self.weightArray.push(weights);
		}
	}
}

Skin.prototype = new ImportedBase();

Skin.prototype.constructor = Skin;

Skin.prototype.cookWeightBuffer = function(geometry) {
	var self = this;
	self.cookedBuffer = self.cookedsBuffer || {};
	geometry.meshes.forEach(function(mesh) {
		for (var key in mesh.meshData.buffers) {
			if (!self.cookedBuffer[key]) {
				var buffer = mesh.meshData.buffers[key];
				self.cookedBuffer[key] = new Array(8 * buffer.size);
				for (var i = 0; i < self.weightArray.length; i ++) {
					if (buffer.indexMap[i]) {
						buffer.indexMap[i].forEach(function(x) {
							for (var j = 0; j < 4; j ++) {
								var weight = self.weightArray[i][j];
								if (weight) {
									self.cookedBuffer[key][8 * x + j] = parseFloat(weight.index);
									self.cookedBuffer[key][8 * x + j + 4] = weight.weight;
								} else {
									self.cookedBuffer[key][8 * x + j] = 0;
									self.cookedBuffer[key][8 * x + j + 4] = 0;
								}
							}
						})
					}
				}
				buffer.indexMap = undefined;
			}
		}
	})
	self.weightArray = undefined;
}

Skin.prototype.getFloatArray = function(key) {
	return new Float32Array(this.cookedBuffer[key]);
}