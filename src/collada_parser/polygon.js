function Polygon(poly, buffers, mesh) {
	var self = this;
	self.inputs = [];
	var el = $("input", poly).each(function() {
		self.inputs.push({semantic:this.getAttribute('semantic'), source:buffers.sources[getInput($(this), mesh).attr("id")]});
	});

	this.indices = [];
	if (poly) {
		var stride = self.inputs.length;
		var tmpIndices = [];
		$("p", poly).each(function(){ parseArray($(this)).forEach(function(val){tmpIndices.push(parseInt(val));}); });
		var vcount = parseArray($("vcount", poly)).map(parseFloat);
		var indices = this.indices;
		var anchor = 0;
		var not = parseInt(poly.getAttribute("count"));
		for (var i = 0; i < not; i ++) {
			var nov = vcount[i] || 3;
			for (var j=1;j < nov-1;j++) {
				indices.push(buffers.getBufferPiece(self.inputs, tmpIndices.slice(anchor + stride * 0, anchor + stride * 0 + stride)).index);
				indices.push(buffers.getBufferPiece(self.inputs, tmpIndices.slice(anchor + stride * j, anchor + stride * j + stride)).index);
				indices.push(buffers.getBufferPiece(self.inputs, tmpIndices.slice(anchor + stride * (j + 1), anchor + stride * (j + 1) + stride)).index);
			}
			anchor += nov * stride;
		}
	}
}