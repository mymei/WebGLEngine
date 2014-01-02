var $ = require("jquery");
var fs = require('fs');

eval(fs.readFileSync('src/common/serialization.js', 'utf8'));

eval(fs.readFileSync('src/collada_parser/common.js', 'utf8'));
eval(fs.readFileSync('src/collada_parser/animation.js', 'utf8'));

eval(fs.readFileSync('lib/msgpack.js', 'utf8'));
eval(fs.readFileSync('lib/gl-matrix.js', 'utf8'));

var geometry = {}

fs.readFile(process.argv[2], 'utf8', function(error, data) {
	var asset = new Animation(data);
	var test = MessagePack.pack(JSON.parse(JSON.stringify(asset)));
	fs.writeFile(process.argv[3], test, 'utf8', function(error) {
		fs.readFile(process.argv[3], 'utf8', function(error, data) {
			// console.log(data);
			console.log(finalize(MessagePack.unpack(data)));
		})
	})
})