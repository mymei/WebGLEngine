// Node class
function Scene(xml) {
	ImportedBase.call(this);
	var self = this;
	self.nodes = {};
	$("visual_scene node", xml).each(function() {
		var id = $(this).attr('sid');
		self.nodes[id] = {
			parent_id : $(this).parent('node').attr('sid'),
			controller_url : $(this).children('instance_controller').attr('url'),
			geometry_url : $(this).children('instance_geometry').attr('url'),
			transforms:[]
		}
		$(this).children('rotate,translate,matrix').each(function(i) {
			self.nodes[id].transforms.push({type:this.nodeName.toLowerCase(), sid:$(this).attr('sid'), vector:parseArray($(this)).map(parseFloat)});
		})
	})
}

Scene.prototype = new ImportedBase();

Scene.prototype.constructor = Scene;

Scene.prototype.getLocalTransform = function(name) {
	var mvMatrix = mat4.identity(new Array(16));
	this.nodes[name].transforms.forEach(function(transform) {
		switch (transform.type) {
			case 'translate' : {
				mat4.translate(mvMatrix, transform.vector);
				break;
			}
			case 'rotate' : {
				mat4.rotate(mvMatrix, transform.vector[3], transform.vector.slice(0, 3));
				break;
			}
			case 'matrix' : {
				mat4.transpose(transform.vector, mvMatrix);
				break;
				// mat4.multiply(mat4.transpose(transform.vector), mvMatrix, mvMatrix);
			}
		}
	})
	return mvMatrix;
}

Scene.prototype.setLocalTransform = function(target, value) {
	var tmp = target.split('/');
	var name = tmp[0];
	tmp = tmp[1].split('.');
	var transformName = tmp[0];
	var mapKey = tmp[1].toLowerCase();
	var rotateMap = {x:0, y:1, z:2, angle:3};
	var translateMap = {x:0, y:1, z:2};
	this.nodes[name].transforms.forEach(function(transform) {
		if (transform.sid == transformName) {
			switch (transform.type) {
				case 'translate': {
					transform.vector[translateMap[mapKey]] = value;
					break;
				}
				case 'rotate': {
					transform.vector[rotateMap[mapKey]] = value;
					break;
				}
			}
		}
	})
}

Scene.prototype.getJointTransform = function(name) {
	var parent = this.nodes[name].parent_id;
	var out = mat4.create(this.getLocalTransform(name));
	while (parent) {
		mat4.multiply(this.getLocalTransform(parent), out, out);
		parent = this.nodes[parent].parent_id;
	}
	return out;
}

Scene.prototype.applyAnimation = function(animation, time, startTime) {
	var self = this;
	$.each(animation.anims, function(k, v) {
		v.channels.forEach(function(channel) {
			self.setLocalTransform(channel.target, getAnimValue(channel.input, channel.output, animation.getAnimTime(time, startTime)));
		})
	})
}