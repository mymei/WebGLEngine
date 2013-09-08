function finalize(source) {
	var ret = source;
	if (source.constructorName) {
		ret = $.extend(new (eval(source.constructorName))(), source);
	}
	if (ret instanceof Object) {
		for (var k in ret) {
			if (ret[k] instanceof Array) {
				for (var i = 0; i < ret[k].length; i ++) {
					ret[k][i] = finalize(ret[k][i]);
				}
			} else {
				ret[k] = finalize(ret[k]);
			}
		}
	}
	return ret;
}

function ImportedBase() {
	this.constructorName = this.constructor.name;
}

function collectObject(obj, array) {
	for (var k in obj) {
		var tmp = obj[k];
		if (tmp instanceof Array) {
			collectObject(tmp, array);
		} else if (tmp instanceof Object) {
			if (array.indexOf(tmp) == -1) {
				array.push(tmp);
				obj[k] = {GUID:array.length-1};
				collectObject(tmp, array);
			} else {
				obj[k] = {GUID:array.indexOf(tmp)};
			}
		}
	}
}

function linkObject(obj, array) {
	for (var k in obj) {
		var tmp = obj[k];
		if (tmp instanceof Array) {
			linkObject(tmp, array);
		} else if (tmp instanceof Object) {
			if (tmp.GUID != undefined) {
				obj[k] = array[tmp.GUID];
				linkObject(obj[k],array)
			}
		}
	}
}