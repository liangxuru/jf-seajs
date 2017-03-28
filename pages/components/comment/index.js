// 评论
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css"),
        score = require('../score/index');
    // 注册组件，传入一个扩展的构造器
    var comment = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
            "score": score
        },
        data:function(){
            return {
                items:[{
                    // Week: '今天',
                    // Price: 39.0,
                    // Date: '12/12',
                    // Residue: 200
                }]
            };
        }
    });
    module.exports = comment;
});