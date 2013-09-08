var $ = require("jquery");
var fs = require('fs');

eval(fs.readFileSync('scripts/serialization.js', 'utf8'));
eval(fs.readFileSync('scripts/collada_parser.js', 'utf8'));
eval(fs.readFileSync('scripts/msgpack.js', 'utf8'));
eval(fs.readFileSync('scripts/glMatrix-0.9.5.min.js', 'utf8'));

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
