// 搜索框
define(function (require,exports,module) {
	var sTpl = require('./index.html'),
        css = require("./css.html"),
        cssCompare = require("compire-css");

    var search = Vue.extend({
        template: cssCompare(css) + sTpl,
        props: ["queryText"],
        data: function(){
            return {
                keyword: ""
            }
        },
        methods: {
            choose: function(item){
                item.AStatus = item.AStatus===1?2:1;//1:选择 3:未选
                this.$dispatch("choose", item, item.AStatus==1);
            },
            search: function(){
                this.$dispatch("search", this.keyword);
            }
        }
    });

    module.exports = search;
});