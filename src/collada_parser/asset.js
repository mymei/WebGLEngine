function Asset(xml) {
	var self = this;
	self.geometry = {}
	var skinXML = {}	

	$("geometry", xml).each(function(){
		self.geometry[$(this).attr('id')] = new Geometry(this);
	})	
	self.scene = new Scene;
	self.scene.importFromCollada(xml);
	self.controller = new Controller(xml);
	for (var key in self.geometry) {
		var skin = self.controller.getSkinFromSource(key);
		if (skin) {
			skin.cookWeightBuffer(self.geometry[key]);
		}
	}
	// self.animation = new Animation(xml);
}

function createAsset(url) {
	var asset;
	$.ajax({async:false, url:url,success:function(data){
		asset = new Asset(data);
	},dataType:'xml'});
	return asset;
}