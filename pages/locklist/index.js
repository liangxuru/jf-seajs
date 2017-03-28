
// 订单列表
define(function (require,exports,module) {
    var sTpl = require("./index.html"),
    	css = require("./css.html"),
        orderService = require('../../service/order'),
    	cssCompare = require("compire-css"),
        message = require('../../lib/message'),
        loading = require('../components/loading/index');

    var VueComponent = Vue.extend({
        template: cssCompare(css) + sTpl,
        components: {
            "loading": loading
        },
        data: function(){
            return {
                current: 0,
                resource: [],
                imgServer: __imgServer,
                accountName: getLocalData("currentAN"),
                loading: false,
                hasData: true
            };
        },
        ready: function(){
            this.getOrderList();
        },
        methods: {
            getOrderList: function(){
                orderService.GetLockList({
                    memID: getCurrentData().userData.memID
                }).then(function(data){
                    this.resource = data;
                    if(!data.length){
                        this.$set('hasData',false);
                    }
                }.bind(this));
            },
            overtime: function(endtime){
                var endtime = new Date(endtime);
                if(endtime< new Date()){
                    return true;
                }else{
                    return false;
                }
            }
        }
    });

    module.exports = VueComponent;
});