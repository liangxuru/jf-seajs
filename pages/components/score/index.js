// 打分插件
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var score = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["value"]
    });

    module.exports = score;
});