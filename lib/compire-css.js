// 转化css
define(function (require,exports,module) {
	module.exports = function(css){	
		return '<style type="text/css">{{styl}}</style>'.replace("{{styl}}", css);
	}
});