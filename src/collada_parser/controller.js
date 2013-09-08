function Controller(xml) {
	ImportedBase.call(this);
	var self = this;
	self.skins = {};
	$("library_controllers controller", xml).each(function() {
		var skin = $('skin', this);
		if (skin) {
			self.skins[$(this).attr('id')] = new Skin(skin[0]);
		}
	});
}

Controller.prototype = new ImportedBase();

Controller.prototype.constructor = Controller;

Controller.prototype.getSkinFromSource = function(source) {
	for (var key in this.skins) {
		if (this.skins[key].source == source) {
			return this.skins[key];
		}
	}
}