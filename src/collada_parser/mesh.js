function Mesh(meshXML) {
	ImportedBase.call(this);
	if (arguments.length == 0) {
		return;
	}
	var polygons = [];
	$("polylist", meshXML).each(function(){polygons.push(this);});
	$("polygons", meshXML).each(function(){polygons.push(this);});
	$("triangles", meshXML).each(function(){polygons.push(this);});

	var sources = {};
	$("source", meshXML).each(function(index){
		var stride = parseInt($("technique_common>accessor",this).attr("stride"));
		sources[this.getAttribute('id')]={id:index,stride:stride,array:parseArray($('float_array', this)).map(parseFloat)}
	});

	this.meshData = new MeshData(sources);
	var meshData = this.meshData;
	this.polygons = polygons.map(function(poly) {
		return new Polygon(poly, meshData, meshXML);
	});
}

Mesh.prototype = new ImportedBase();

Mesh.prototype.constructor = Mesh;