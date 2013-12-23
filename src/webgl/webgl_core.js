webglCore = (function() {

	"use strict";

	function createShaderObject(gl, shaderType, source) {
		var shader = gl.createShader(shaderType);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw gl.getShaderInfoLog(shader);
		}
		return shader
	}

	function createProgramObject(gl, vs, fs) {
		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw gl.getProgramInfoLog(program);
		}
		return program;
	}

	function createFloatBuffer(gl, data) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		return buffer;
	}

	function createIndexBuffer(gl, data) {
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
		return buffer;
	}

	function createTextureObject(gl, image) {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	var images = [];
	for (var i = 0; i < 32; i ++) {
		images.push({index:i});
	}
	function getTexture(image_url) {
		var image;
		for (var i in images) {
			if (images[i].url == image_url) {
				image = images[i];
				images.push(images.splice(i, 1)[0]);
				break;
			}
		}

		if (!image) {
			image = images.shift();
			image.url = image_url;
			images.push(image);
			var img = new Image();
			img.addEventListener('load', function() {
				image.texture = createTextureObject(gl, img);
			})
			img.src = image_url;
		} else {
			if (image.texture) {
				gl.activeTexture(gl.TEXTURE0 + image.index);
				gl.bindTexture(gl.TEXTURE_2D, image.texture);
			}
		}

		return image.index;
	}

	function createGRI(geometry) {
		var mesh = geometry.meshes[0],
			GRI = {uniforms:{}, vbs:{}, vs_url:'resources/my_shader_base.vs'},
			map = {VERTEX:'aVertex',NORMAL:'aNormal',TEXCOORD:'aTexCoord'};

		GRI.elm = mesh.polygons.map(function(p){
			var bufferKey = mesh.meshData.getBufferKey(p.inputs);

			if (!GRI.vbs[bufferKey]) {

				var data = mesh.meshData.getBuffer(p.inputs),
					buffer = {buffer:createFloatBuffer(gl, data.getFloatArray()), size:data.stride*4, attrs:{}},
					offset = 0;
				p.inputs.forEach(function(input) {
					buffer.attrs[map[input.semantic]] = {stride:input.source.stride, offset:offset};
					offset += input.source.stride * 4;
				});
				GRI.vbs[bufferKey] = [];
				GRI.vbs[bufferKey].push(buffer);
			}
			return {bufferKey:bufferKey, 
				ibo:createIndexBuffer(gl, p.indices), num:p.indices.length};
		});
		return GRI;
	}

	function createSkinGRI(skin, geometry) {
		var GRI = createGRI(geometry);
		GRI.vs_url = 'resources/my_shader_skin_base.vs';
		GRI.skin = skin;
		GRI.uniforms.uBindPose = mat4.create();
		mat4.transpose(GRI.uniforms.uBindPose, skin.bindPose);
		GRI.uniforms.uBoneBind = new Float32Array(skin.joints.length * 16);
		$.each(skin.joints,function(k, v){GRI.uniforms.uBoneBind.set(v.bind, k * 16)});

		for (var key in GRI.vbs) {

			GRI.vbs[key].push({
				buffer : createFloatBuffer(gl, skin.getFloatArray(key)),
				size : 32,
				attrs : {
					aBoneIndices : {
						stride : 4,
						offset : 0
					},
					aBoneWeights : {
						stride : 4,
						offset : 16
					}
				}
			});
		}		
		return GRI;
	}

	var attr_map = {
		aNormal : { 
			on:"attribute vec3 aNormal; vec3 getNormal() { return aNormal; }", 
			off:"vec3 getNormal() { return vec3(1, 0, 0);}"
		},
		aTexCoord : {
			on:"attribute vec2 aTexCoord; vec2 getTexCoord() { return aTexCoord; }",
			off:"vec2 getTexCoord() { return vec2(1, 0); }"
		}
	}
	var programObjCache = {};
	var uniformCache = {};
	function getProgramKey(vs_url, ps_url, attrs) {
		attrs = attrs.filter(function(attr){return attr_map[attr];})
		return vs_url+'|'+ps_url+'|'+(attrs?attrs.join():'');
	}
	function getProgram(gl, vs_url, ps_url, attrs) {
		var key = getProgramKey(vs_url, ps_url, attrs), programObj = programObjCache[key];
		if (!programObj) {
			var vs_prefix = "";
			for (var attr in attr_map) {
				if (attrs.indexOf(attr) == -1) {
					vs_prefix += attr_map[attr].off;
				} else {
					vs_prefix += attr_map[attr].on;
				}
			}
			var vs_source = null,
			fs_source = null;
			$.ajax({
				async: false,
				url: vs_url,
				success: function (data) {
					vs_source = vs_prefix + $(data).html();
				},
				dataType: 'html'
			});

			$.ajax({
				async: false,
				url: ps_url,
				success: function (data) {
					fs_source = $(data).html();
				},
				dataType: 'html'
			});

			var vshader = createShaderObject(gl, gl.VERTEX_SHADER, vs_source),
			fshader = createShaderObject(gl, gl.FRAGMENT_SHADER, fs_source);

			var program = createProgramObject(gl, vshader, fshader);
			gl.useProgram(program);
			var attribute = {}
			var pattern = /attribute\s+(\w+)\s+(\w+)\s*;/g;
			do {
				var test = pattern.exec(vs_source);
				if (test) {
					attribute[test[2]] = {type:test[1], loc:gl.getAttribLocation(program, test[2])};
				}
			} while(test);
			var uniform = {}
			var pattern = /uniform\s+(\w+)\s+(\w+)\s*(\[\s*.+\s*\])*\s*;/g;
			do {
				var test = pattern.exec(vs_source);
				if (test) {
					uniform[test[2]] = {type:test[1], loc:gl.getUniformLocation(program, test[2])};
				}
			} while(test);
			do {
				var test = pattern.exec(fs_source);
				if (test) {
					uniform[test[2]] = {type:test[1], loc:gl.getUniformLocation(program, test[2])};
				}
			} while(test);
			programObj = programObjCache[key] = {program:program, attribute:attribute, uniform:uniform};
		}
		return programObj;
	}

	var currentProgramObj;
	var currentUniforms;
	function initProgram(gl, vs_url, ps_url, buffers) {
		var attrs = [];
		buffers.forEach(function(buffer) {
			attrs = attrs.concat(Object.keys(buffer.attrs));
		})
		var programObj = getProgram(gl, vs_url, ps_url, attrs);
		if (currentProgramObj != programObj) {
			currentProgramObj = programObj;
			var key = getProgramKey(vs_url, ps_url, attrs);
			uniformCache[key] = uniformCache[key] || {};
			currentUniforms = uniformCache[key];
			gl.useProgram(programObj.program);
			$.each(programObj.attribute, function(k, v) {
				if (v.loc != -1)
					gl.enableVertexAttribArray(v.loc);
			})
		}
		return programObj;
	}

	function compare(a, b) {
		var ret = false
		if (a && b && a.length == b.length) {
			ret = true;
			for (var i = 0; i < a.length; i ++) {
				if (a[i] != b[i]) {
					ret = false;
					break;
				}
			}
		}
		return ret;
	}

	function setUniforms(gl, uniforms) {
		$.each(uniforms, function(name, value) {
			if (currentProgramObj.uniform[name]) {
				// console.log(mat4.str(value));
				if (!currentUniforms[name] || !compare(currentUniforms[name], value)) {
					switch(currentProgramObj.uniform[name].type) {
						case 'mat4' :
						gl.uniformMatrix4fv(currentProgramObj.uniform[name].loc, false, value);
						break;
						case 'vec4' :
						gl.uniform4fv(currentProgramObj.uniform[name].loc, value);
						break;
						case 'sampler2D' :
						gl.uniform1i(currentProgramObj.uniform[name].loc, value);
						break;
					}
					currentUniforms[name] = value;
				}	
			}
		});
	}

	function setAttrs(gl, vertexBuffers) {
		vertexBuffers.forEach(function(vertexBuffer) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.buffer);
			for (var name in vertexBuffer.attrs) {
				var attr = vertexBuffer.attrs[name];
				var attrProg = currentProgramObj.attribute[name];
				if (attrProg && attrProg.loc != -1) {
					gl.vertexAttribPointer(attrProg.loc, attr.stride, gl.FLOAT, false, vertexBuffer.size, attr.offset);
				}
			}
		})
	}

	return {
		createGRI : createGRI,
		createSkinGRI : createSkinGRI,
		setUniforms : setUniforms,
		setAttrs : setAttrs,
		initProgram : initProgram,
		getTexture : getTexture,
		createFloatBuffer : createFloatBuffer,
		createIndexBuffer : createIndexBuffer,
		createTextureObject : createTextureObject,
		getCurrentProgramObj : function() { return currentProgramObj; }
	}
})();

function getTransform(pos, rot, scale) {
	var mvMatrix = mat4.identity(mat4.create());
	mat4.translate(mvMatrix, mvMatrix, pos);
	mat4.rotate(mvMatrix, mvMatrix, rot[0], rot.slice(1));
	mat4.scale(mvMatrix, mvMatrix, scale);
	return mvMatrix;
}