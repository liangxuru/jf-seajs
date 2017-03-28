//时间选择控件
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var selecttime = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["vertical", "horizontal"],
        data: function(){
            return {
                memberId: getCurrentData().userData.memID
            }
        },
        methods: {
            choose: function(item){
                item.AStatus = item.AStatus===1?2:1;//1:选择 3:未选
                this.$dispatch("choose", item, item.AStatus==1);
            }

        }
    });

    module.exports = selecttime;
});