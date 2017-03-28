// 下单成功
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
    	cssCompare = require("compire-css");

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
        	return {
        		orderCode: '',
                accountName: ''
        	}
        },
        ready: function(){
            this.orderCode = this.$route.query.orderCode;
            this.accountName = this.$route.query.accountName;
        },
        methods: {
            close: function(){
                history.back();
            }
        }
    });

    module.exports = VueComponent;
});