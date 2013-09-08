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

Animation.prototype.getAnimTime = function(currTime, starTime){
	return (((currTime - startTime) / this.time) % 1) * this.time;
}

function getAnimValue(timeKey, valueKey, time) {
	var max_t = timeKey[timeKey.length - 1];
	var min_t = timeKey[0];
	timeKey.forEach(function(x) { 
		if (x < time) min_t = Math.max(min_t, x);
		if (x > time) max_t = Math.min(max_t, x);
	})
	var min_value = valueKey[timeKey.indexOf(min_t)];
	var max_value = valueKey[timeKey.indexOf(max_t)];
	var ratio = 1;
	if (max_t > min_t) {
		ratio = (time - min_t) / (max_t - min_t);
	} else {
		ratio = 1;
	}
	return max_value * ratio + min_value * (1 - ratio);
}