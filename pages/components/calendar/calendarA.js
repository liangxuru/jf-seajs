// 日历
define(function (require,exports,module) {
	var sTpl = require('./calendarA.html'),
    	css = require("./csscalendarA.html"),
    	cssCompare = require("compire-css");

	var calendar = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items"],
        data: function(){
        	return {
        		current: 0
        	}
        },
        methods: {
            select: function(){}
        }
    });
    module.exports = calendar;
});
