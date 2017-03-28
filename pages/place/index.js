// 场地
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
        sportTypes = require("../../lib/sportTypeEnum"),
    	cssCompare = require("compire-css");

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        data: function(){
            return {
                sportTypes: [],
                accountName: ''
            }
        },
        ready: function(){
            this.sportTypes = sportTypes;
        	this.accountName = this.$route.query.accountName;
        }
    });

    module.exports = VueComponent;
});