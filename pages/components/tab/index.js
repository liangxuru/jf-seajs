// tab插件
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var tabs = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items", "current"],
        data: function(){
        	return {
                width: 0
        	}
        },
        methods: {
        	select: function(value){
        		this.current = value;
        		this.$dispatch("select", value);
        	}
        },
        ready: function(){
            this.current = this.current || 0;
            this.width = $(window).width()/this.items.length + 'px';
        }
    });

    module.exports = tabs;
});