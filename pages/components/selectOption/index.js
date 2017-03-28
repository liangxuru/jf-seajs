define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var options = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items", "current"],
        methods: {
        	closeCover: function(){
        		this.$dispatch("closeCover");
        	},
            select: function(item){
                this.current = item;
            },
            submit: function(){
                this.closeCover();
                this.$dispatch("selectOption", this.current);
            }
        }
    });

    module.exports = options;
});