// index.js
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        sportTypes = require("../../../lib/sportTypeEnum"),
        cssCompare = require("compire-css");

    var tabs = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items"],
        data: function(){
        	return {
        		sportTypes: [],
                current: 0
        	}
        },
        methods: {
        	select: function(item, index){
                this.current = index;
        		this.$dispatch("selectSportType", item);
        	}
        },
        ready: function(){
            this.sportTypes = sportTypes;
        }
    });

    module.exports = tabs;
});