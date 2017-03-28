define(function (require,exports,module) {
	var sTpl = require('./index.html');
    // 注册组件，传入一个扩展的构造器
    var loading = Vue.extend({
        template: sTpl
    });
    module.exports = loading;
});