function ColladaElement(material, asset) {
	DrawingElement.call(this, material);
	this.asset = asset;
	$.extend(true, this.scene, asset.scene);
}

ColladaElement.prototype = new DrawingElement();

ColladaElement.prototype.constructor = ColladaElement;

ColladaElement.prototype.getGRI = function(key) {
	var GRI = DrawingElement.prototype.getGRI.call(this, key);
	if (!GRI) {
		this.asset.GRIcached = this.asset.GRIcached || {};
		GRI = this.GRI[key] = this.asset.GRIcached[key];
		if (!GRI) {
			var node = this.scene.nodes[key];
			if ('controller_url' in node) {
				var url = node.controller_url.slice(1);
				var skin = this.asset.controller.skins[url];
				this.asset.GRIcached[key] = webglCore.createSkinGRI(skin, this.asset.geometry[skin.source]);
			} else if ('geometry_url' in node) {
				var url = node.geometry_url.slice(1);
				this.asset.GRIcached[key] = webglCore.createGRI(this.asset.geometry[url]);
			}
			GRI = this.GRI[key] = this.asset.GRIcached[key];
		}
	}
	return GRI;
}