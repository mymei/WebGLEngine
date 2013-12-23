var $ = require("jquery");
var fs = require('fs');

eval(fs.readFileSync('src/common/serialization.js', 'utf8'));

eval(fs.readFileSync('src/collada_parser/common.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/scene.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/animation.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/skin.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/geometry.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/mesh.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/polygon.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/meshdata.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/buffer.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/controller.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/asset.js', 'utf8'));

eval(fs.readFileSync('lib/msgpack.js', 'utf8'));
eval(fs.readFileSync('lib/gl-matrix.js', 'utf8'));

var geometry = {}

fs.readFile(process.argv[2], 'utf8', function(error, data) {
	var asset = new Asset(data);
	var test = MessagePack.pack(JSON.parse(JSON.stringify(asset)));
	fs.writeFile(process.argv[3], test, 'utf8', function(error) {
		fs.readFile(process.argv[3], 'utf8', function(error, data) {
			// console.log(data);
			console.log(finalize(MessagePack.unpack(data)));
		})
	})
})

// fs.readFile('sphere.dae', 'utf8', function(error, data) {
// 	// console.log(data);
// 	console.log($("source", data).length);
// })

// var test = {test:1, test2:'here'}

// fs.writeFile('test.xml', JSON.stringify(test), function(err) {

// });
// $("<h1>test pass</h1>").appendTo("body");
// var test = $("body");
// // console.log(test.html());
// console.log($("h1", test).html());
