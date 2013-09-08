function parseArray(el) {
	var strvals = el.text().replace(/^\s\s*/, "").replace(/\s\s*$/, "");
	return strvals.split(/\s+/);
}

function getInput(el, base) {
	var target = $(el.attr("source"), base);
	var target_input = $("input", target);
	while (target_input[0]) {
		var name = target_input.attr("source");
		target = $(name, base);
		target_input = $("input", target);
	}
	return target;
}

function getInputArray(semantic, arrayType, xml, base) {
	var text = $(arrayType, getInput($("input[semantic="+semantic+"]", xml), base)).text();
	var array = text.replace(/^\s\s*/, "").replace(/\s\s*$/, "").split(/\s+/);
	if (arrayType == "float_array") {
		array = array.map(parseFloat);
	}
	return array;
}