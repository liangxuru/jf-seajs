// 日历
define(function (require,exports,module) {
	var sTpl = require('./calendarB.html'),
    	css = require("./csscalendarB.html"),
    	cssCompare = require("compire-css");
	
    var calendar = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["items", "current"],
        methods: {
            select: function(value){
                this.current = value;
                this.$dispatch("selected", value ,this.items[value].ADate.formatDate('yyyy-MM-dd'));
            }
        }
    });

    module.exports = calendar;
});