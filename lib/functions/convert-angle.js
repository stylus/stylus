module.exports = function convertAngle(value, unitName) {
	var factors = {
		"rad" : 1,
		"deg" : 180 / Math.PI,
		"turn": 0.5 / Math.PI,
		"grad": 200 / Math.PI
	}
	return value * factors[unitName];
}
