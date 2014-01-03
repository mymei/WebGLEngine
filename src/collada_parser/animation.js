function Animation(xml) {
	ImportedBase.call(this);
	var self = this;
	self.anims = {};
	self.time = 0;
	$("library_animations > animation", xml).each(function() {
		if ($(this).parent('animation').length == 0) {
			var anim = self.anims[$(this).attr('id')] = {channels:[]};
			var base = this;
			$('channel', this).each(function() {
				var source = $(this).attr('source');
				var channel = {
					target : $(this).attr('target'),
					input : getInputArray('INPUT', 'float_array', $(source, base), base),
					output : getInputArray('OUTPUT', 'float_array', $(source, base), base)
				};			
				self.time = Math.max(self.time, channel.input[channel.input.length-1]);
				anim.channels.push(channel);
			})
		}
	})
}
Animation.prototype = new ImportedBase();

Animation.prototype.constructor = Animation;

Animation.prototype.getAnimTime = function(currTime, startTime){
	return (((currTime - startTime) / this.time) % 1) * this.time;
}

function lerp(a, b, ratio) {
	if (Array.isArray(a)) {
		if (a.length == 16) {
			var rotq_a = quat.fromMat3(quat.create(), mat3.fromMat4(mat3.create(), a));
			var rotq_b = quat.fromMat3(quat.create(), mat3.fromMat4(mat3.create(), b));
			quat.slerp(rotq_a, rotq_b, rotq_a, ratio);
			var rotm = mat3.fromQuat(mat3.create(), rotq_a);

			a = a.map(function(item, index){
				return item * ratio + b[index] * (1 - ratio);
			});
			a[0] = rotm[0];
			a[1] = rotm[1];
			a[2] = rotm[2];
			a[4] = rotm[3];
			a[5] = rotm[4];
			a[6] = rotm[5];
			a[8] = rotm[6];
			a[9] = rotm[7];
			a[10] = rotm[8];
		} else {
			a = a.map(function(item, index){
				return item * ratio + b[index] * (1 - ratio);
			})
		}
	}
	return a;
}

function getAnimVector(timeKey, valueKey, time) {
	var max_t = timeKey[timeKey.length - 1];
	var min_t = timeKey[0];
	timeKey.forEach(function(x) { 
		if (x < time) min_t = Math.max(min_t, x);
		if (x > time) max_t = Math.min(max_t, x);
	})
	var ratio = 1;
	if (max_t > min_t) {
		ratio = (time - min_t) / (max_t - min_t);
	} else {
		ratio = 1;
	}
	var stride = valueKey.length / timeKey.length;
	var min_value = valueKey.slice(stride * timeKey.indexOf(min_t), stride * timeKey.indexOf(min_t) + stride);
	var max_value = valueKey.slice(stride * timeKey.indexOf(max_t), stride * timeKey.indexOf(max_t) + stride);
	return lerp(max_value, min_value, ratio);
}