var fs = require("fs");
var exports = module.exports = {};

exports.getAll = function () {
	return JSON.parse(fs.readFileSync('data.json', 'utf8'));
};
