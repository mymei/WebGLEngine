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


function createPackedObject(url) {
	var obj;
	$.ajax({async:false, url:url, dataType:'text', success:function(data){
		obj = finalize(MessagePack.unpack(data));
	}});
	return obj;
}

function createPackedBinary(url) {
	var obj;
	var oReq = new XMLHttpRequest();
	oReq.open("GET", url, false);
	oReq.responseType = "arraybuffer";

	oReq.onload = function (oEvent) {
		var arrayBuffer = oReq.response;
		if (arrayBuffer) {
			var byteArray = new Uint8Array(arrayBuffer);
			var mergedText = "";
			for (var i = 0; i < byteArray.length; i ++) {
				mergedText += String.fromCharCode(byteArray[i]);
			}
			obj = finalize(MessagePack.unpack(mergedText));
		}
	};

	oReq.send(null);
	return obj;
}